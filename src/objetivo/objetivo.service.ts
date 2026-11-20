import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CAMPANA_EN_CURSO,
  campanaEnCurso,
} from 'src/common/resultados/campana';
import { construirLibroExcel } from 'src/common/excel/libro-excel';
import { ObjetivoExportQueryDto } from './dto/objetivo-export-query.dto';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';
import { CreateObjetivoConDetallesDto } from './dto/create-objetivo-detalle.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CreateObjetivosMasivosDto } from './dto/create-objetivo-masivo.dto';
import { EvaluarObjetivoDto } from './dto/evaluar-objetivo.dto';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

@Injectable()
export class ObjetivoService {
  private readonly logger = new Logger(ObjetivoService.name);

  constructor(private prisma: PrismaService) {}

  // ======================================================
  // REGLAS DE CÁLCULO DE OBJETIVOS
  // ======================================================
  /**
   * Los pesos específicos de un objetivo reparten el 100 % de su nota: la
   * calificación final es `Σ (porcentajeLogrado × pesoEspecifico / 100)`. Si no
   * suman 100 el resultado no significa nada, y nadie lo estaba comprobando.
   */
  private validarPesos(
    detalles: { pesoEspecifico: number; descripcion?: string }[],
  ) {
    if (detalles.length === 0) return;

    const suma = detalles.reduce((acc, d) => acc + (d.pesoEspecifico ?? 0), 0);

    // Tolerancia por el redondeo de los decimales que llegan del formulario.
    if (Math.abs(suma - 100) > 0.01) {
      throw new BadRequestException(
        `Los pesos específicos deben sumar 100 %. Suman ${Math.round(suma * 100) / 100} %.`,
      );
    }
  }

  /**
   * Porcentaje logrado de un detalle.
   *
   * Es la misma fórmula que el formulario de evaluación muestra en pantalla,
   * pero calculada acá: antes el backend guardaba tal cual el número que
   * mandaba el cliente, así que editar la meta de un detalle ya calificado
   * dejaba un porcentaje que ya no correspondía a esa meta —y nada lo volvía a
   * calcular—. `null` en `metaAlcanzada` significa SIN EVALUAR y se respeta.
   *
   * En MANUAL no hay fórmula: el evaluador pone el porcentaje a mano.
   */
  private calcularPorcentajeLogrado(
    detalle: { tipoCalculo: string; metaObjetivo: number },
    metaAlcanzada: number | null | undefined,
    porcentajeManual?: number | null,
  ): number | null {
    if (metaAlcanzada === null || metaAlcanzada === undefined) return null;

    const redondear = (valor: number) => Math.round(valor * 100) / 100;

    if (detalle.tipoCalculo === 'ASCENDENTE') {
      if (detalle.metaObjetivo <= 0) return porcentajeManual ?? null;

      return redondear((metaAlcanzada / detalle.metaObjetivo) * 100);
    }

    if (detalle.tipoCalculo === 'DESCENDENTE') {
      // Meta alcanzada 0 en un objetivo descendente (ej. "cero accidentes")
      // es el mejor resultado posible, no una división por cero.
      if (metaAlcanzada <= 0) return 100;

      return redondear((detalle.metaObjetivo / metaAlcanzada) * 100);
    }

    return porcentajeManual ?? null;
  }

  // ======================================================
  // CAMPAÑA
  // ======================================================
  /**
   * Objetivos de la campaña en curso. Un objetivo pertenece a la campaña en
   * la que se creó; sin este filtro, al abrir un ciclo nuevo el jefe veía y
   * calificaba los del anterior mezclados con los nuevos.
   */
  private async whereCampanaVigente(): Promise<Prisma.ObjetivoWhereInput> {
    return { campana: { estado: CAMPANA_EN_CURSO } };
  }

  /**
   * La campaña en curso de la empresa del trabajador, para sellar lo nuevo.
   * Sin campaña no se puede crear: el objetivo no aparecería en ninguna
   * pantalla ni reporte.
   */
  private async campanaDeEmpleado(
    tx: Pick<PrismaService, 'empleado' | 'campanaEvaluacion'>,
    idEmpleado: number,
  ) {
    const e = await tx.empleado.findUnique({
      where: { idEmpleado },
      select: { idEmpresaEmpleadora: true, codigoEmpleado: true },
    });
    const campana = e ? await campanaEnCurso(tx, e.idEmpresaEmpleadora) : null;
    if (!campana) {
      throw new BadRequestException(
        `La empresa del trabajador ${e?.codigoEmpleado ?? idEmpleado} no tiene una campaña de evaluación en curso.`,
      );
    }
    return {
      idCampanaEvaluacion: campana.idCampanaEvaluacion,
      // Heredado: solo las campañas migradas tienen "YYYY-MM".
      periodoEvaluacion: campana.periodoEvaluacion,
    };
  }

  // ======================================================
  // GET ALL
  // ======================================================
  async findAll() {
    try {
      return await this.prisma.objetivo.findMany({
        where: { estado: true, ...(await this.whereCampanaVigente()) },
        orderBy: { fechaCreacion: 'desc' },
        include: {
          empleado: true,
          objetivoDetalles: { where: { estado: true } },
        },
      });
    } catch (error) {
      this.logger.error('Error al obtener objetivos:', error);
      handlePrismaError(error, 'objetivos');
    }
  }

  // ======================================================
  // EXPORTAR A EXCEL
  // ======================================================
  /**
   * Hoja "Objetivos": una fila por detalle con las columnas de la carga
   * masiva (`codigoEmpleado`, `tipoCalculo`, ...), así que el archivo sirve de
   * base para volver a importar; a la derecha, lo que el importador no lleva
   * (trabajador, empresa y la calificación). Hoja "Retroalimentación": lo que
   * el jefe registró por objetivo, que no salía en ningún Excel.
   */
  async exportExcel(query: ObjetivoExportQueryDto) {
    try {
      const idEmpresa = query.idEmpresaEmpleadora
        ? Number(query.idEmpresaEmpleadora)
        : undefined;
      const search = query.search?.trim();

      const and: Prisma.ObjetivoWhereInput[] = [
        { estado: true },
        { empleado: { estado: true } },
        await this.whereCampanaVigente(),
      ];
      if (idEmpresa) and.push({ empleado: { idEmpresaEmpleadora: idEmpresa } });
      if (search) {
        for (const palabra of search.split(/\s+/)) {
          const c = { contains: palabra, mode: 'insensitive' as const };
          and.push({
            OR: [
              { empleado: { nombres: c } },
              { empleado: { apellidos: c } },
              { empleado: { codigoEmpleado: c } },
              { empleado: { documento: c } },
              { objetivoDetalles: { some: { estado: true, descripcion: c } } },
            ],
          });
        }
      }

      const objetivos = await this.prisma.objetivo.findMany({
        where: { AND: and },
        orderBy: [{ empleado: { apellidos: 'asc' } }, { idObjetivo: 'asc' }],
        include: {
          empleado: {
            select: {
              codigoEmpleado: true,
              nombres: true,
              apellidos: true,
              documento: true,
              codigoEmpleadoJefe: true,
              empresaEmpleadora: { select: { nombreEmpresa: true } },
            },
          },
          objetivoDetalles: {
            where: { estado: true },
            orderBy: { secuencial: 'asc' },
          },
          retroalimentacionDetalles: {
            where: { estado: true },
            orderBy: { idRetroalimentacionDetalle: 'asc' },
          },
        },
      });

      const trabajador = (o: (typeof objetivos)[number]) => ({
        codigoEmpleado: o.empleado.codigoEmpleado,
        trabajador: `${o.empleado.nombres} ${o.empleado.apellidos}`,
        documento: o.empleado.documento,
        empresa: o.empleado.empresaEmpleadora?.nombreEmpresa,
        codigoEmpleadoJefe: o.empleado.codigoEmpleadoJefe,
        idObjetivo: o.idObjetivo,
      });

      return await construirLibroExcel([
        {
          nombre: 'Objetivos',
          columnas: [
            { header: 'codigoEmpleado', key: 'codigoEmpleado', tipo: 'texto' },
            { header: 'tipoCalculo', key: 'tipoCalculo' },
            { header: 'descripcion', key: 'descripcion', width: 40 },
            { header: 'descripcionIniciativa', key: 'descripcionIniciativa', width: 36 },
            { header: 'unidadMedida', key: 'unidadMedida' },
            { header: 'pesoEspecifico', key: 'pesoEspecifico' },
            { header: 'metaObjetivo', key: 'metaObjetivo' },
            { header: 'fechaCulminacion', key: 'fechaCulminacion', tipo: 'fecha' },
            { header: 'Trabajador', key: 'trabajador', width: 28 },
            { header: 'Documento', key: 'documento', tipo: 'texto' },
            { header: 'Empresa', key: 'empresa', width: 26 },
            { header: 'Código del jefe', key: 'codigoEmpleadoJefe', tipo: 'texto' },
            { header: 'ID objetivo', key: 'idObjetivo' },
            // Vacío = sin calificar; 0 es una calificación real.
            { header: 'Meta alcanzada', key: 'metaAlcanzada' },
            { header: '% logrado', key: 'porcentajeLogrado' },
          ],
          filas: objetivos.flatMap((o) =>
            o.objetivoDetalles.map((d) => ({
              ...trabajador(o),
              tipoCalculo: d.tipoCalculo,
              descripcion: d.descripcion,
              descripcionIniciativa: d.descripcionIniciativa,
              unidadMedida: d.unidadMedida,
              pesoEspecifico: d.pesoEspecifico,
              metaObjetivo: d.metaObjetivo,
              fechaCulminacion: d.fechaCulminacion,
              metaAlcanzada: d.metaAlcanzada,
              porcentajeLogrado:
                d.porcentajeLogrado === null
                  ? null
                  : Math.round(d.porcentajeLogrado * 100) / 100,
            })),
          ),
        },
        {
          nombre: 'Retroalimentación',
          columnas: [
            { header: 'Código de empleado', key: 'codigoEmpleado', tipo: 'texto' },
            { header: 'Trabajador', key: 'trabajador', width: 28 },
            { header: 'Empresa', key: 'empresa', width: 26 },
            { header: 'ID objetivo', key: 'idObjetivo' },
            { header: 'Objetivo', key: 'descripcionObjetivo', width: 36 },
            { header: 'Actividad', key: 'descripcionActividad', width: 36 },
            { header: 'Fecha', key: 'descripcionFecha', width: 16 },
            { header: 'Estado', key: 'descripcionEstado', width: 16 },
          ],
          filas: objetivos.flatMap((o) =>
            o.retroalimentacionDetalles.map((r) => ({
              ...trabajador(o),
              descripcionObjetivo: r.descripcionObjetivo,
              descripcionActividad: r.descripcionActividad,
              descripcionFecha: r.descripcionFecha,
              descripcionEstado: r.descripcionEstado,
            })),
          ),
        },
      ]);
    } catch (error) {
      this.logger.error('Error al exportar objetivos:', error);
      handlePrismaError(error, 'objetivos');
    }
  }

  // ======================================================
  // GET ONE
  // ======================================================
  async findOne(id: number) {
    try {
      const objetivo = await this.prisma.objetivo.findFirst({
        where: { idObjetivo: id, estado: true },
        include: {
          empleado: true,
          objetivoDetalles: { where: { estado: true } },
        },
      });

      if (!objetivo)
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado.`);

      return objetivo;
    } catch (error) {
      this.logger.error(`Error al obtener objetivo ${id}:`, error);
      handlePrismaError(error, 'objetivos');
    }
  }

  // ======================================================
  // UPDATE OBJETIVO + DETALLES (CORREGIDO)
  // ======================================================
  async update(id: number, user: AuthUser, dto: UpdateObjetivoDto) {
    return await this.prisma.$transaction(async (tx) => {
      const objetivo = await tx.objetivo.findUnique({
        where: { idObjetivo: id },
      });

      if (!objetivo || !objetivo.estado)
        throw new NotFoundException('Objetivo no encontrado');

      await tx.objetivo.update({
        where: { idObjetivo: id },
        data: {
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });

      // --------------------------------------------------
      // Detalles: actualizar / crear / eliminar.
      //
      // NO se borran y recrean todos, porque eso destruiría `metaAlcanzada` y
      // `porcentajeLogrado` (que solo escribe el módulo de evaluaciones), y
      // además perdería los IDs y la auditoría en cada edición.
      //
      // `metaAlcanzada` no se toca nunca acá. `porcentajeLogrado` sí se
      // recalcula, porque depende de la meta y del tipo de cálculo que este
      // método sí puede cambiar.
      // --------------------------------------------------
      // Si el PATCH no trae detalles, no se tocan: omitir el campo no puede
      // significar "borrarlos todos".
      if (!dto.objetivoDetalles) {
        return await tx.objetivo.findUnique({
          where: { idObjetivo: id },
          include: {
            objetivoDetalles: { where: { estado: true } },
            empleado: true,
          },
        });
      }

      const detallesEnviados = dto.objetivoDetalles;

      this.validarPesos(detallesEnviados);

      const detallesActuales = await tx.objetivoDetalle.findMany({
        // Solo los vigentes: un detalle dado de baja no se "conserva" ni se
        // vuelve a actualizar porque el formulario reenvíe su id.
        where: { idObjetivo: id, estado: true },
        select: {
          idObjetivoDetalle: true,
          metaAlcanzada: true,
          porcentajeLogrado: true,
        },
      });

      const idsActuales = new Set(
        detallesActuales.map((d) => d.idObjetivoDetalle),
      );

      const idsConservados = new Set<number>();

      for (const [i, d] of detallesEnviados.entries()) {
        const campos = {
          secuencial: i + 1,
          tipoCalculo: d.tipoCalculo,
          descripcion: d.descripcion,
          descripcionIniciativa: d.descripcionIniciativa || null,
          unidadMedida: d.unidadMedida,
          pesoEspecifico: d.pesoEspecifico,
          metaObjetivo: d.metaObjetivo,
          fechaCulminacion: new Date(d.fechaCulminacion),
        };

        // Solo se reutiliza el id si pertenece a este objetivo.
        if (d.idObjetivoDetalle && idsActuales.has(d.idObjetivoDetalle)) {
          idsConservados.add(d.idObjetivoDetalle);

          const previo = detallesActuales.find(
            (actual) => actual.idObjetivoDetalle === d.idObjetivoDetalle,
          );

          await tx.objetivoDetalle.update({
            where: { idObjetivoDetalle: d.idObjetivoDetalle },
            data: {
              ...campos,
              // Cambiar la meta o el tipo de cálculo de un detalle YA
              // calificado dejaba el porcentaje logrado anterior, calculado
              // contra una meta que ya no existe. Se recalcula con la meta
              // alcanzada que ya estaba registrada; si no hay ninguna, sigue
              // sin evaluar.
              porcentajeLogrado: this.calcularPorcentajeLogrado(
                campos,
                previo?.metaAlcanzada,
                previo?.porcentajeLogrado,
              ),
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });

          continue;
        }

        await tx.objetivoDetalle.create({
          data: {
            ...campos,
            idObjetivo: id,
            // Un detalle nuevo nace sin calificar.
            metaAlcanzada: null,
            porcentajeLogrado: null,
            estado: true,
            creadoPorId: user.idUsuario,
            actualizadoPorId: user.idUsuario,
          },
        });
      }

      // Los que el usuario quitó del formulario se dan de baja.
      //
      // Antes era un `deleteMany`: quitar un detalle borraba físicamente la
      // calificación que el jefe ya le había puesto, sin rastro y contra la
      // convención de soft delete del resto del esquema.
      const idsEliminados = [...idsActuales].filter(
        (idDetalle) => !idsConservados.has(idDetalle),
      );

      if (idsEliminados.length > 0) {
        await tx.objetivoDetalle.updateMany({
          where: { idObjetivoDetalle: { in: idsEliminados } },
          data: {
            estado: false,
            actualizadoPorId: user.idUsuario,
            fechaModificacion: new Date(),
          },
        });
      }

      return await tx.objetivo.findUnique({
        where: { idObjetivo: id },
        include: {
          objetivoDetalles: { where: { estado: true } },
          empleado: true,
        },
      });
    });
  }

  // ======================================================
  // SOFT DELETE
  // ======================================================
  async remove(user: AuthUser, id: number) {
    try {
      const exist = await this.prisma.objetivo.findFirst({
        where: { idObjetivo: id },
      });

      if (!exist || !exist.estado)
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado.`);

      return await this.prisma.objetivo.update({
        where: { idObjetivo: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
          objetivoDetalles: {
            updateMany: {
              where: { idObjetivo: id },
              data: { estado: false },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error al eliminar objetivo ${id}:`, error);
      handlePrismaError(error, 'objetivos');
    }
  }

  // ======================================================
  // CREATE OBJETIVO + DETALLES
  // ======================================================
  async createConDetalles(user: AuthUser, dto: CreateObjetivoConDetallesDto) {
    if (dto.objetivoDetalles.length < 1)
      throw new BadRequestException('Debe enviar al menos un detalle.');

    this.validarPesos(dto.objetivoDetalles);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const objetivo = await tx.objetivo.create({
          data: {
            idEmpleado: dto.idEmpleado,
            ...(await this.campanaDeEmpleado(tx, dto.idEmpleado)),
            creadoPorId: user.idUsuario,
            estado: true,
            objetivoDetalles: {
              create: dto.objetivoDetalles.map((detalle, index) => ({
                secuencial: index + 1,
                tipoCalculo: detalle.tipoCalculo,
                descripcion: detalle.descripcion,
                descripcionIniciativa: detalle.descripcionIniciativa || null,
                unidadMedida: detalle.unidadMedida,
                pesoEspecifico: detalle.pesoEspecifico,
                metaObjetivo: detalle.metaObjetivo,
                // Nace sin calificar: solo evaluaciones escribe estos campos.
                metaAlcanzada: null,
                fechaCulminacion: new Date(detalle.fechaCulminacion), // ← FIX CLAVE
                porcentajeLogrado: null,
                estado: true,
                creadoPorId: user.idUsuario,
              })),
            },
          },
        });

        return await tx.objetivo.findUnique({
          where: { idObjetivo: objetivo.idObjetivo },
          include: {
            objetivoDetalles: { where: { estado: true } },
            empleado: true,
          },
        });
      });
    } catch (error) {
      this.logger.error('Error creando objetivo:', error);
      handlePrismaError(error, 'objetivos');
    }
  }

  // ======================================================
  // ⭐ CREAR OBJETIVOS MASIVOS (usando codigoEmpleado)
  // ======================================================
  async createMasivo(user: AuthUser, dto: CreateObjetivosMasivosDto) {
    if (!dto.objetivos?.length)
      throw new BadRequestException('Debe enviar un arreglo con objetivos.');

    return await this.prisma.$transaction(async (tx) => {
      const results: any[] = [];

      for (const item of dto.objetivos) {
        if (!item.objetivoDetalles?.length)
          throw new BadRequestException(
            `Debe enviar al menos un detalle para el código ${item.codigoEmpleado}`,
          );

        this.validarPesos(item.objetivoDetalles);

        const empleado = await tx.empleado.findFirst({
          where: { codigoEmpleado: item.codigoEmpleado },
        });

        if (!empleado)
          throw new NotFoundException(
            `Empleado ${item.codigoEmpleado} no existe`,
          );

        const objetivo = await tx.objetivo.create({
          data: {
            idEmpleado: empleado.idEmpleado,
            ...(await this.campanaDeEmpleado(tx, empleado.idEmpleado)),
            creadoPorId: user.idUsuario,
            estado: true,
            objetivoDetalles: {
              create: item.objetivoDetalles.map((d, i) => ({
                secuencial: i + 1,
                tipoCalculo: d.tipoCalculo,
                descripcion: d.descripcion,
                descripcionIniciativa: d.descripcionIniciativa || null,
                unidadMedida: d.unidadMedida,
                pesoEspecifico: d.pesoEspecifico,
                metaObjetivo: d.metaObjetivo,
                // Nace sin calificar: solo evaluaciones escribe estos campos.
                metaAlcanzada: null,
                fechaCulminacion: new Date(d.fechaCulminacion),
                porcentajeLogrado: null,
                estado: true,
                creadoPorId: user.idUsuario,
              })),
            },
          },
        });

        results.push(
          await tx.objetivo.findUnique({
            where: { idObjetivo: objetivo.idObjetivo },
            include: {
              empleado: true,
              objetivoDetalles: { where: { estado: true } },
            },
          }),
        );
      }

      return results;
    });
  }

  // ============================================================
  // GET ALL BY JEFE (OBJETIVOS DE SUBORDINADOS)
  // ============================================================
  async findAllByJefe(idEmpleadoJefe: number) {
    try {
      // 1. Validar que exista el jefe
      const jefe = await this.prisma.empleado.findUnique({
        where: { idEmpleado: idEmpleadoJefe, estado: true },
        select: { codigoEmpleado: true },
      });

      if (!jefe) {
        throw new NotFoundException(
          `El empleado jefe con ID ${idEmpleadoJefe} no existe.`,
        );
      }

      if (!jefe.codigoEmpleado) {
        throw new BadRequestException(
          `El empleado jefe con ID ${idEmpleadoJefe} no tiene un código de empleado válido.`,
        );
      }

      // 2. Obtener subordinados del jefe
      const subordinados = await this.prisma.empleado.findMany({
        where: {
          codigoEmpleadoJefe: jefe.codigoEmpleado,
          estado: true,
        },
        select: { idEmpleado: true },
      });

      if (subordinados.length == 0) {
        return [];
      }

      const subordinadosIds = subordinados.map((s) => s.idEmpleado);

      // Condificion para verificar si al menos hay 1 objetivo
      const totalObjetivos = await this.prisma.objetivo.count();
      if (totalObjetivos == 0) {
        return [];
      }

      // 3. Obtener objetivos de los subordinados
      return await this.prisma.objetivo.findMany({
        where: {
          estado: true,
          idEmpleado: { in: subordinadosIds },
          ...(await this.whereCampanaVigente()),
        },
        orderBy: { fechaCreacion: 'desc' },
        include: {
          empleado: true,
          objetivoDetalles: { where: { estado: true } },
        },
      });
    } catch (error) {
      this.logger.error('Error al obtener objetivos de subordinados:', error);
      handlePrismaError(error, 'objetivos');
    }
  }

  // ======================================================
  // ⭐ EVALUAR OBJETIVO DE SUBORDINADO
  // ======================================================
  async evaluarObjetivo(
    idObjetivo: number,
    user: AuthUser,
    dto: EvaluarObjetivoDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // --------------------------------------------------
      // 1. Obtener objetivo con empleado
      // --------------------------------------------------
      const objetivo = await tx.objetivo.findUnique({
        where: { idObjetivo },
        include: {
          empleado: {
            select: {
              idEmpleado: true,
              codigoEmpleado: true,
              codigoEmpleadoJefe: true,
            },
          },
          objetivoDetalles: {
            where: { estado: true },
          },
        },
      });

      if (!objetivo || !objetivo.estado)
        throw new NotFoundException('Objetivo no encontrado');

      // --------------------------------------------------
      // 2. Validar que el usuario sea JEFE directo
      // --------------------------------------------------
      const jefe = await tx.empleado.findUnique({
        where: { idUsuario: user.idUsuario },
        select: { codigoEmpleado: true },
      });

      if (!jefe) throw new BadRequestException('Jefe no válido');

      if (objetivo.empleado.codigoEmpleadoJefe !== jefe.codigoEmpleado)
        throw new BadRequestException(
          'No tiene permisos para evaluar este objetivo',
        );

      // --------------------------------------------------
      // 3. Validar detalles enviados
      // --------------------------------------------------
      if (!dto.detalles?.length)
        throw new BadRequestException('Debe enviar al menos un detalle');

      const detallesIds = objetivo.objetivoDetalles.map(
        (d) => d.idObjetivoDetalle,
      );

      // --------------------------------------------------
      // 4. Evaluar cada detalle
      // --------------------------------------------------
      for (const detalle of dto.detalles) {
        if (!detallesIds.includes(detalle.idObjetivoDetalle)) {
          throw new BadRequestException(
            `El detalle ${detalle.idObjetivoDetalle} no pertenece al objetivo`,
          );
        }

        const base = objetivo.objetivoDetalles.find(
          (d) => d.idObjetivoDetalle === detalle.idObjetivoDetalle,
        )!;

        // El porcentaje se calcula acá, no se acepta el que manda el cliente.
        // Guardarlo tal cual dejaba la nota a merced de lo que enviara el
        // navegador y, si después alguien editaba la meta del detalle, el
        // número persistido ya no correspondía a ninguna fórmula.
        // En MANUAL no hay fórmula posible, así que ahí sí manda el evaluador.
        const porcentajeLogrado = this.calcularPorcentajeLogrado(
          base,
          detalle.metaAlcanzada,
          detalle.porcentajeLogrado,
        );

        await tx.objetivoDetalle.update({
          where: { idObjetivoDetalle: detalle.idObjetivoDetalle },
          data: {
            metaAlcanzada: detalle.metaAlcanzada,
            porcentajeLogrado,
            actualizadoPorId: user.idUsuario,
            fechaModificacion: new Date(),
          },
        });
      }

      // --------------------------------------------------
      // 5. Retornar objetivo evaluado
      // --------------------------------------------------
      return await tx.objetivo.findUnique({
        where: { idObjetivo },
        include: {
          empleado: true,
          objetivoDetalles: { where: { estado: true } },
        },
      });
    });
  }

  async empleadosObjetivosEvaluadosPorEmpresa(idEmpresaEmpleadora: number) {
    const campana = await campanaEnCurso(this.prisma, idEmpresaEmpleadora);

    // 1️⃣ Obtener empleados con objetivos
    const empleados = await this.prisma.empleado.findMany({
      where: {
        idEmpresaEmpleadora,
        estado: true,
        codigoEmpleadoJefe: { not: null },
      },
      select: {
        idEmpleado: true,
        nombres: true,
        apellidos: true,
        codigoEmpleado: true,
        codigoEmpleadoJefe: true,

        objetivos: {
          where: {
            estado: true,
            idCampanaEvaluacion: campana?.idCampanaEvaluacion ?? -1,
          },
          select: {
            idObjetivo: true,
            objetivoDetalles: {
              where: { estado: true },
              select: {
                idObjetivoDetalle: true,
                descripcion: true,
                tipoCalculo: true,
                unidadMedida: true,
                pesoEspecifico: true,
                metaObjetivo: true,
                metaAlcanzada: true,
                porcentajeLogrado: true,
                fechaCulminacion: true,
              },
            },
          },
        },
      },
    });

    // 2️⃣ Mapa para resolver jefes por código
    const empleadosPorCodigo = new Map(
      empleados.map((e) => [e.codigoEmpleado, e]),
    );

    // 3️⃣ Construcción de respuesta final
    const empleadosEvaluados = empleados
      .filter((e) => e.objetivos.length > 0)
      .map((evaluado) => {
        const jefe = empleadosPorCodigo.get(evaluado.codigoEmpleadoJefe!);

        if (!jefe) return null;

        const objetivos = evaluado.objetivos.map((obj) => {
          const totalDetalles = obj.objetivoDetalles.length;

          const detallesEvaluados = obj.objetivoDetalles.filter(
            (d) => d.metaAlcanzada !== null || d.porcentajeLogrado !== null,
          ).length;

          let estadoEvaluacion = 'PENDIENTE';

          if (totalDetalles === 0) {
            estadoEvaluacion = 'SIN_DETALLES';
          } else if (detallesEvaluados === totalDetalles) {
            estadoEvaluacion = 'EVALUADO';
          } else if (detallesEvaluados > 0) {
            estadoEvaluacion = 'PARCIAL';
          }

          return {
            idObjetivo: obj.idObjetivo,
            estadoEvaluacion,
            resumen: {
              totalDetalles,
              detallesEvaluados,
              detallesPendientes: totalDetalles - detallesEvaluados,
            },
            detalles: obj.objetivoDetalles,
          };
        });

        return {
          evaluado: {
            idEmpleado: evaluado.idEmpleado,
            nombres: evaluado.nombres,
            apellidos: evaluado.apellidos,
            codigoEmpleado: evaluado.codigoEmpleado,
          },
          evaluador: {
            idEmpleado: jefe.idEmpleado,
            nombres: jefe.nombres,
            apellidos: jefe.apellidos,
            codigoEmpleado: jefe.codigoEmpleado,
            tipo: 'JEFE',
          },
          objetivos,
        };
      })
      .filter(Boolean);

    // 4️⃣ Respuesta final
    return {
      totalEmpleadosEvaluados: empleadosEvaluados.length,
      empleados: empleadosEvaluados,
    };
  }
}
