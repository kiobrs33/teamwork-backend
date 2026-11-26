import { normalizarUnidad } from './dto/unidades-medida';
import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
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
   * Textos recortados y unidad en mayúsculas: el `ValidationPipe` global no
   * transforma, así que el `@Transform` del DTO solo sirve para validar.
   */
  private normalizarDetalles<
    T extends {
      descripcion: string;
      descripcionIniciativa?: string | null;
      unidadMedida: string;
      tipoCalculo: string;
      metaObjetivo: number;
    },
  >(detalles: T[]): T[] {
    const limpios = detalles.map((d) => ({
      ...d,
      descripcion: String(d.descripcion ?? '').trim(),
      descripcionIniciativa:
        String(d.descripcionIniciativa ?? '').trim() || null,
      unidadMedida: String(normalizarUnidad(String(d.unidadMedida ?? ''))),
    }));
    // Con meta 0 un objetivo ascendente no tiene porcentaje posible
    // (alcanzado / 0): nunca se podía calificar.
    limpios.forEach((d, i) => {
      if (d.tipoCalculo === 'ASCENDENTE' && !(Number(d.metaObjetivo) > 0)) {
        throw new BadRequestException(
          `La meta del objetivo ${i + 1} debe ser mayor que 0 en un cálculo ascendente.`,
        );
      }
    });
    return limpios;
  }

  /**
   * Un trabajador tiene **una** ficha de objetivos por campaña (sus metas son
   * los detalles). Se podían crear varias y la tabla, que muestra una fila
   * por trabajador, enseñaba solo una; el resultado las mezclaba.
   */
  private async exigirSinFicha(
    tx: Pick<PrismaService, 'objetivo'>,
    idEmpleado: number,
    idCampanaEvaluacion: number,
  ) {
    const ya = await tx.objetivo.findFirst({
      where: { idEmpleado, idCampanaEvaluacion, estado: true },
      select: { idObjetivo: true },
    });
    if (ya) {
      throw new ConflictException(
        'Este trabajador ya tiene objetivos en la campaña en curso: edítelos en lugar de crear otros.',
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
      // Fórmula lineal, espejo de la ascendente: cada unidad por debajo de
      // la meta suma lo mismo y cada unidad por encima resta lo mismo.
      // Con meta 4: 0 → 200 %, 2 → 150 %, 4 → 100 %, 6 → 50 %, 8 o más → 0.
      // Antes era meta ÷ logrado: el 0 (sin división posible) quedaba fijo
      // en 100 % y valía MENOS que 1 (400 %), y cerca de cero los
      // porcentajes se disparaban (0,5 → 800 %) e inflaban la nota final.
      if (detalle.metaObjetivo <= 0) {
        // Meta 0 ("cero accidentes"): no hay porcentaje posible; se cumple o
        // no se cumple.
        return metaAlcanzada <= 0 ? 100 : 0;
      }
      return redondear(
        Math.max(0, (2 - metaAlcanzada / detalle.metaObjetivo) * 100),
      );
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
  /**
   * Los objetivos de la campaña en curso o, con `idCampanaEvaluacion`, los de
   * esa campaña (una cerrada se consulta así: sus objetivos no se borran al
   * cerrarla, solo dejan de ser "los de ahora").
   */
  async findAll(idEmpresaEmpleadora?: number, idCampanaEvaluacion?: number) {
    try {
      return await this.prisma.objetivo.findMany({
        where: {
          estado: true,
          ...(idCampanaEvaluacion
            ? { idCampanaEvaluacion }
            : await this.whereCampanaVigente()),
          ...(idEmpresaEmpleadora && { empleado: { idEmpresaEmpleadora } }),
        },
        orderBy: { fechaCreacion: 'desc' },
        include: {
          empleado: true,
          objetivoDetalles: {
            where: { estado: true },
            // Siempre en su orden: sin esto, tras un guardado la base los
            // devolvía en otro y el formulario quitaba el objetivo equivocado.
            orderBy: { secuencial: 'asc' },
          },
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

      // Desde el espacio de una empresa «Empresa» repetiría el mismo nombre
      // en cada fila: solo va si el archivo mezcla empresas.
      const variasEmpresas =
        !idEmpresa &&
        new Set(
          objetivos.map((o) => o.empleado?.empresaEmpleadora?.nombreEmpresa),
        ).size > 1;
      const columnaEmpresa = variasEmpresas
        ? [{ header: 'Empresa', key: 'empresa', width: 26 }]
        : [];
      return await construirLibroExcel([
        {
          nombre: 'Objetivos',
          columnas: [
            // Los títulos y líneas grises de la plantilla de importación:
            // este Excel se puede volver a importar tal cual.
            {
              header: 'Código de empleado',
              key: 'codigoEmpleado',
              tipo: 'texto',
              width: 18,
              breve: 'Del trabajador',
            },
            {
              header: 'Tipo de cálculo',
              key: 'tipoCalculo',
              width: 18,
              breve: 'ASCENDENTE, DESCENDENTE o MANUAL',
            },
            {
              header: 'Objetivo',
              key: 'descripcion',
              width: 40,
              breve: 'Un resultado medible',
            },
            {
              header: 'Iniciativa',
              key: 'descripcionIniciativa',
              width: 36,
              breve: 'Opcional',
            },
            {
              header: 'Unidad de medida',
              key: 'unidadMedida',
              width: 18,
              breve: 'Porcentaje, Días, Soles…',
            },
            {
              header: 'Peso (%)',
              key: 'pesoEspecifico',
              width: 12,
              breve: 'Suman 100 por trabajador',
            },
            {
              header: 'Meta a alcanzar',
              key: 'metaObjetivo',
              width: 16,
              breve: 'Número, en la unidad',
            },
            {
              header: 'Fecha límite',
              key: 'fechaCulminacion',
              tipo: 'fecha',
              width: 20,
              breve: 'dd/mm/aaaa',
            },
            { header: 'Trabajador', key: 'trabajador', width: 28 },
            { header: 'Documento', key: 'documento', tipo: 'texto' },
            ...columnaEmpresa,
            {
              header: 'Código del jefe',
              key: 'codigoEmpleadoJefe',
              tipo: 'texto',
            },
            { header: 'ID objetivo', key: 'idObjetivo' },
            // Vacío = sin calificar; 0 es una calificación real.
            {
              header: 'Valor logrado',
              key: 'metaAlcanzada',
              width: 14,
              breve: 'Vacío: sin calificar',
            },
            {
              header: 'Cumplimiento (%)',
              key: 'porcentajeLogrado',
              width: 16,
              breve: '100 = cumplió la meta',
            },
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
            {
              header: 'Código de empleado',
              key: 'codigoEmpleado',
              tipo: 'texto',
            },
            { header: 'Trabajador', key: 'trabajador', width: 28 },
            ...columnaEmpresa,
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
          objetivoDetalles: {
            where: { estado: true },
            // Siempre en su orden: sin esto, tras un guardado la base los
            // devolvía en otro y el formulario quitaba el objetivo equivocado.
            orderBy: { secuencial: 'asc' },
          },
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
            objetivoDetalles: {
              where: { estado: true },
              // Siempre en su orden: sin esto, tras un guardado la base los
              // devolvía en otro y el formulario quitaba el objetivo equivocado.
              orderBy: { secuencial: 'asc' },
            },
            empleado: true,
          },
        });
      }

      const detallesEnviados = this.normalizarDetalles(dto.objetivoDetalles);

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
          objetivoDetalles: {
            where: { estado: true },
            // Siempre en su orden: sin esto, tras un guardado la base los
            // devolvía en otro y el formulario quitaba el objetivo equivocado.
            orderBy: { secuencial: 'asc' },
          },
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
  async createConDetalles(
    user: AuthUser,
    entrada: CreateObjetivoConDetallesDto,
  ) {
    if (entrada.objetivoDetalles.length < 1)
      throw new BadRequestException('Debe enviar al menos un detalle.');
    const dto = {
      ...entrada,
      objetivoDetalles: this.normalizarDetalles(entrada.objetivoDetalles),
    };

    this.validarPesos(dto.objetivoDetalles);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const campana = await this.campanaDeEmpleado(tx, dto.idEmpleado);
        await this.exigirSinFicha(
          tx,
          dto.idEmpleado,
          campana.idCampanaEvaluacion,
        );
        const objetivo = await tx.objetivo.create({
          data: {
            idEmpleado: dto.idEmpleado,
            ...campana,
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
            objetivoDetalles: {
              where: { estado: true },
              // Siempre en su orden: sin esto, tras un guardado la base los
              // devolvía en otro y el formulario quitaba el objetivo equivocado.
              orderBy: { secuencial: 'asc' },
            },
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
  /**
   * Importación de objetivos, todo o nada. Revisa **todas** las fichas antes
   * de escribir y devuelve los problemas juntos con su índice (`[i] …`):
   * pesos que no suman 100, metas inválidas, código que no existe en la
   * empresa o repetido en el archivo. Quien **ya tiene** objetivos en la
   * campaña se omite (no se duplica su ficha): `{ count, omitidos }`.
   */
  async createMasivo(user: AuthUser, dto: CreateObjetivosMasivosDto) {
    if (!dto.objetivos?.length)
      throw new BadRequestException('Debe enviar un arreglo con objetivos.');

    const problemas: string[] = [];
    const vistos = new Set<string>();
    const fichas = dto.objetivos.map((item, i) => {
      const codigo = String(item.codigoEmpleado ?? '').trim();
      try {
        if (vistos.has(codigo.toLowerCase()))
          throw new BadRequestException(
            `El código ${codigo} se repite en el archivo: sus objetivos van juntos.`,
          );
        vistos.add(codigo.toLowerCase());
        // Las metas de ejemplo de la plantilla terminan en «(Ejemplo)»: el
        // front no las envía; si llegan, se rechazan con su motivo en vez
        // de «no hay un trabajador con ese código».
        if (
          (item.objetivoDetalles ?? []).some((d) =>
            /\(\s*ejemplo\s*\)\s*$/i.test(String(d?.descripcion ?? '')),
          )
        )
          throw new BadRequestException(
            'Tiene objetivos de ejemplo de la plantilla (terminan en «(Ejemplo)»): no se importan. Quítelos o escriba encima.',
          );
        const detalles = this.normalizarDetalles(item.objetivoDetalles ?? []);
        if (!detalles.length)
          throw new BadRequestException('No tiene ningún objetivo.');
        this.validarPesos(detalles);
        return { codigo, detalles };
      } catch (e) {
        problemas.push(
          `[${i}] ${codigo || 'Sin código'}: ${e instanceof HttpException ? e.message : String(e)}`,
        );
        return null;
      }
    });

    const empleados = await this.prisma.empleado.findMany({
      where: {
        idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
        codigoEmpleado: { in: fichas.filter(Boolean).map((f) => f!.codigo) },
        estado: true,
      },
      select: { idEmpleado: true, codigoEmpleado: true },
    });
    const porCodigo = new Map(empleados.map((e) => [e.codigoEmpleado, e]));
    fichas.forEach((f, i) => {
      if (f && !porCodigo.has(f.codigo))
        problemas.push(
          `[${i}] ${f.codigo}: no hay un trabajador activo con ese código en la empresa.`,
        );
    });
    if (problemas.length) {
      throw new BadRequestException({
        message: 'Revise los objetivos del archivo.',
        errors: problemas,
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      let count = 0;
      let omitidos = 0;
      for (const f of fichas) {
        const empleado = porCodigo.get(f!.codigo)!;
        const campana = await this.campanaDeEmpleado(tx, empleado.idEmpleado);
        const ya = await tx.objetivo.findFirst({
          where: {
            idEmpleado: empleado.idEmpleado,
            idCampanaEvaluacion: campana.idCampanaEvaluacion,
            estado: true,
          },
          select: { idObjetivo: true },
        });
        if (ya) {
          omitidos += 1;
          continue;
        }
        await tx.objetivo.create({
          data: {
            idEmpleado: empleado.idEmpleado,
            ...campana,
            creadoPorId: user.idUsuario,
            estado: true,
            objetivoDetalles: {
              create: f!.detalles.map((d, i) => ({
                secuencial: i + 1,
                tipoCalculo: d.tipoCalculo,
                descripcion: d.descripcion,
                descripcionIniciativa: d.descripcionIniciativa,
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
        count += 1;
      }
      return { count, omitidos };
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
        select: { codigoEmpleado: true, idEmpresaEmpleadora: true },
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
          idEmpresaEmpleadora: jefe.idEmpresaEmpleadora,
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
          objetivoDetalles: {
            where: { estado: true },
            // Siempre en su orden: sin esto, tras un guardado la base los
            // devolvía en otro y el formulario quitaba el objetivo equivocado.
            orderBy: { secuencial: 'asc' },
          },
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
            orderBy: { secuencial: 'asc' },
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
          objetivoDetalles: {
            where: { estado: true },
            // Siempre en su orden: sin esto, tras un guardado la base los
            // devolvía en otro y el formulario quitaba el objetivo equivocado.
            orderBy: { secuencial: 'asc' },
          },
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
              orderBy: { secuencial: 'asc' },
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

  /**
   * Las metas del propio trabajador en la campaña en curso, para que las
   * conozca y suba su evidencia. **Sin la calificación**: el resultado se
   * comunica en la retroalimentación.
   */
  /**
   * «Mis objetivos» del trabajador en la campaña en curso, **sin la
   * calificación** (la ve en la retroalimentación). Trae también de dónde
   * salen y en qué va el proceso: quién los registró y cuándo, quién los
   * califica (su jefe), los plazos y cuántos calificó ya (solo el número).
   */
  async misObjetivos(user: AuthUser) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: {
        idEmpleado: true,
        idEmpresaEmpleadora: true,
        codigoEmpleadoJefe: true,
      },
    });
    if (!yo) return { campana: null, idEmpleado: null, metas: [] };
    const campana = await campanaEnCurso(this.prisma, yo.idEmpresaEmpleadora);
    if (!campana)
      return { campana: null, idEmpleado: yo.idEmpleado, metas: [] };
    const [ficha, jefe] = await Promise.all([
      this.prisma.objetivo.findFirst({
        where: {
          idEmpleado: yo.idEmpleado,
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          estado: true,
        },
        select: {
          fechaCreacion: true,
          creadoPorId: true,
          objetivoDetalles: {
            where: { estado: true },
            orderBy: { secuencial: 'asc' },
            select: {
              idObjetivoDetalle: true,
              descripcion: true,
              descripcionIniciativa: true,
              tipoCalculo: true,
              unidadMedida: true,
              pesoEspecifico: true,
              metaObjetivo: true,
              fechaCulminacion: true,
              metaAlcanzada: true,
              porcentajeLogrado: true,
            },
          },
        },
      }),
      yo.codigoEmpleadoJefe
        ? this.prisma.empleado.findFirst({
            where: {
              codigoEmpleado: yo.codigoEmpleadoJefe,
              idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
            },
            select: { nombres: true, apellidos: true },
          })
        : null,
    ]);
    // Quién los registró: su jefe, RR. HH. (a mano o importando) o TeamWork.
    const autor = ficha
      ? await this.prisma.usuario.findUnique({
          where: { idUsuario: ficha.creadoPorId },
          select: {
            rol: true,
            nombreCompleto: true,
            empleado: { select: { nombres: true, apellidos: true } },
          },
        })
      : null;
    const nombreAutor = autor
      ? autor.empleado
        ? `${autor.empleado.nombres} ${autor.empleado.apellidos}`
        : autor.nombreCompleto
      : null;
    const detalles = ficha?.objetivoDetalles ?? [];
    return {
      campana: {
        nombre: campana.nombre,
        fijacionDesde: campana.fechaVigenciaInicioObjetivo,
        fijacionHasta: campana.fechaVigenciaFinObjetivo,
        calificacionDesde: campana.fechaVigenciaInicio,
        calificacionHasta: campana.fechaVigenciaFin,
      },
      idEmpleado: yo.idEmpleado,
      jefe: jefe ? `${jefe.nombres} ${jefe.apellidos}` : null,
      registro: ficha
        ? {
            fecha: ficha.fechaCreacion,
            por: nombreAutor,
            rol: autor?.rol ?? null,
          }
        : null,
      // Solo cuántos: la nota se comunica en la retroalimentación.
      calificados: detalles.filter(
        (d) => d.metaAlcanzada !== null || d.porcentajeLogrado !== null,
      ).length,
      // Sin el valor: solo si su jefe ya lo calificó.
      metas: detalles.map(({ metaAlcanzada, porcentajeLogrado, ...d }) => ({
        ...d,
        calificado: metaAlcanzada !== null || porcentajeLogrado !== null,
      })),
    };
  }
}
