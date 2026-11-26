import { aplicarCabecera } from 'src/common/excel/estilo-excel';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUnidadOcupacionalEmpleadoraDto } from './dto/create-unidad-ocupacional-empleadora.dto';
import { UpdateUnidadOcupacionalEmpleadoraDto } from './dto/update-unidad-ocupacional-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { AsignarCompetenciasLoteDto } from './dto/asignar-competencias-a-unidad-ocupacional-empleadora.dto';
import { UnidadCompetenciaAsignacionDto } from './dto/create-unidad-competencia.dto';
import { Prisma } from '@prisma/client';
import { UnidadOcupacionalQueryDto } from './dto/unidad-ocupacional-query.dto';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

import * as ExcelJS from 'exceljs';

import {
  exigirNombreLibre,
  exigirSinTrabajadoresParaEliminar,
  exigirSinTrabajadoresParaMudar,
  filtrarImportacion,
  nombreLimpio,
} from 'src/common/estructura/estructura';

@Injectable()
export class UnidadOcupacionalEmpleadoraService {
  private readonly logger = new Logger(UnidadOcupacionalEmpleadoraService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateUnidadOcupacionalEmpleadoraDto) {
    try {
      const descripcion = nombreLimpio(dto.descripcion);
      await exigirNombreLibre(
        this.prisma,
        'unidad',
        Number(dto.idEmpresaEmpleadora),
        descripcion,
      );
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.create({
        data: {
          ...dto,
          descripcion,
          creadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return unidad;
    } catch (error) {
      console.error('Error al crear unidad ocupacional:', error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  // async findAll() {
  //   try {
  //     const unidades = await this.prisma.unidadOcupacionalEmpleadora.findMany({
  //       include: { empresaEmpleadora: true },
  //       where: { estado: true },
  //       orderBy: {
  //         fechaCreacion: 'desc',
  //       },
  //     });
  //     return unidades;
  //   } catch (error) {
  //     console.error('Error al obtener unidades ocupacionales:', error);
  //     throw new InternalServerErrorException(
  //       'No se pudieron obtener las unidades ocupacionales.',
  //     );
  //   }
  // }

  async findAll({
    page,
    limit,
    search,
    idUnidadOcupacionalEmpleadora,
    descripcion,
    ruc,
    nombreEmpresaEmpleadora,
    idEmpresaEmpleadora,
  }: UnidadOcupacionalQueryDto) {
    try {
      const where: Prisma.UnidadOcupacionalEmpleadoraWhereInput = {
        estado: true,

        // La empresa del selector del front (columna directa, no por nombre).
        ...(idEmpresaEmpleadora && {
          idEmpresaEmpleadora: Number(idEmpresaEmpleadora),
        }),

        ...(idUnidadOcupacionalEmpleadora && {
          idUnidadOcupacionalEmpleadora: Number(idUnidadOcupacionalEmpleadora),
        }),

        ...(descripcion && {
          descripcion: {
            contains: descripcion,
            mode: 'insensitive',
          },
        }),

        // Empresa y RUC van en un solo filtro de la relación: como dos spreads
        // de `empresaEmpleadora`, el segundo pisaba al primero.
        ...((nombreEmpresaEmpleadora || ruc) && {
          empresaEmpleadora: {
            ...(nombreEmpresaEmpleadora && {
              nombreEmpresa: {
                contains: nombreEmpresaEmpleadora,
                mode: 'insensitive' as const,
              },
            }),
            ...(ruc && {
              ruc: { contains: ruc, mode: 'insensitive' as const },
            }),
          },
        }),

        ...(search && {
          // Un número busca por ID o en el nombre, no en el RUC de la empresa
          // (el de SEAL tiene un 6 y coincidían todas).
          OR: /^\d+$/.test(String(search).trim())
            ? [
                {
                  idUnidadOcupacionalEmpleadora: Number(String(search).trim()),
                },
                { descripcion: { contains: String(search).trim() } },
              ]
            : [
                {
                  descripcion: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  empresaEmpleadora: {
                    nombreEmpresa: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  empresaEmpleadora: {
                    ruc: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
        }),
      };

      const include: Prisma.UnidadOcupacionalEmpleadoraInclude = {
        empresaEmpleadora: true,
        // Trabajadores vigentes (no cesados): cuántos se verían afectados.
        _count: {
          select: { empleados: { where: { situacion: { not: 'CESADO' } } } },
        },
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.unidadOcupacionalEmpleadora.findMany({
          where,
          include,
          orderBy: { fechaCreacion: 'desc' },
        });

        return {
          data,
          meta: {
            total: data.length,
            page: 1,
            limit: 0,
            totalPages: 1,
          },
        };
      }

      const safeLimit = Math.min(Number(limit) || 10, 100);
      const safePage = Math.max(Number(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;

      const [total, data] = await Promise.all([
        this.prisma.unidadOcupacionalEmpleadora.count({ where }),
        this.prisma.unidadOcupacionalEmpleadora.findMany({
          where,
          skip,
          take: safeLimit,
          include,
          orderBy: { fechaCreacion: 'desc' },
        }),
      ]);

      return {
        data,
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      this.logger.error('Error al obtener las unidades ocupacionales:', error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  async findOne(id: number) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!unidad) {
        throw new NotFoundException('Grupo ocupacional no encontrado');
      }

      return unidad;
    } catch (error) {
      console.error('Error al obtener la unidad ocupacional:', error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  async update(
    user: AuthUser,
    id: number,
    dto: UpdateUnidadOcupacionalEmpleadoraDto,
  ) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id, estado: true },
      });

      if (!unidad) {
        throw new NotFoundException('Grupo ocupacional no encontrado');
      }

      // Las reglas se miran sobre cómo queda el registro, no sobre lo que llega.
      const idEmpresa =
        dto.idEmpresaEmpleadora !== undefined
          ? Number(dto.idEmpresaEmpleadora)
          : unidad.idEmpresaEmpleadora;
      if (idEmpresa !== unidad.idEmpresaEmpleadora)
        await exigirSinTrabajadoresParaMudar(this.prisma, 'unidad', id);
      const descripcion =
        dto.descripcion !== undefined
          ? nombreLimpio(dto.descripcion)
          : unidad.descripcion;
      await exigirNombreLibre(
        this.prisma,
        'unidad',
        idEmpresa,
        descripcion,
        id,
      );

      const updatedUnidad =
        await this.prisma.unidadOcupacionalEmpleadora.update({
          where: { idUnidadOcupacionalEmpleadora: id },
          data: {
            ...dto,
            descripcion,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
          },
          include: { empresaEmpleadora: true },
        });
      return updatedUnidad;
    } catch (error) {
      console.error('Error al actualizar la unidad ocupacional:', error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id, estado: true },
      });

      if (!unidad) {
        throw new NotFoundException('Grupo ocupacional no encontrado');
      }

      await exigirSinTrabajadoresParaEliminar(this.prisma, 'unidad', id);

      const removedUnidad =
        await this.prisma.unidadOcupacionalEmpleadora.update({
          where: { idUnidadOcupacionalEmpleadora: id },
          data: {
            estado: false,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
          },
        });
      return removedUnidad;
    } catch (error) {
      console.error('Error al eliminar la unidad ocupacional:', error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  // async asignarCompetenciasLote(
  //   user: AuthUser,
  //   dto: AsignarCompetenciasLoteDto,
  // ) {
  //   try {
  //     return await this.prisma.$transaction(async (tx) => {
  //       // 1. Eliminar asignaciones previas
  //       // await tx.unidadOcupacionalEmpleadoraCompetencia.deleteMany({
  //       //   where: {
  //       //     idUnidadOcupacionalEmpleadora: {
  //       //       in: dto.asignaciones.map((a) => a.idUnidadOcupacionalEmpleadora),
  //       //     },
  //       //   },
  //       // });

  //       // 2. Preparar nuevas asignaciones
  //       const asignacion = dto.asignaciones.map((item) => ({
  //         idUnidadOcupacionalEmpleadora: item.idUnidadOcupacionalEmpleadora,
  //         idCompetencia: item.idCompetencia,
  //         creadoPorId: user.idUsuario,
  //       }));

  //       // 3. Insertar nuevas
  //       // await tx.unidadOcupacionalEmpleadoraCompetencia.createMany({
  //       //   data: asignacion,
  //       // });

  //       return {
  //         message: 'Asignaciones sobrescritas con éxito',
  //         cantidadInsertada: asignacion.length,
  //       };
  //     });
  //   } catch (error) {
  //     console.error('Error en asignarCompetenciasLote:', error);
  //     throw new InternalServerErrorException(
  //       'Ocurrió un error al asignar competencias. Detalles: ' + error.message,
  //     );
  //   }
  // }

  async importData(
    user: AuthUser,
    data: CreateUnidadOcupacionalEmpleadoraDto[],
  ) {
    try {
      const { nuevas, omitidas } = await filtrarImportacion(
        this.prisma,
        'unidad',
        data,
      );
      const registros = nuevas.map((row) => ({
        descripcion: row.descripcion,
        idEmpresaEmpleadora: row.idEmpresaEmpleadora,
        creadoPorId: user.idUsuario,
      }));

      const { count } =
        await this.prisma.unidadOcupacionalEmpleadora.createMany({
          data: registros,
        });
      return { count, omitidas };
    } catch (error) {
      console.error('Error al importar datos:', error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  // ==========================================================
  //         GUARDAR Y RETORNAR MAPA FINAL
  // ==========================================================
  async asignarCompetenciasRetornarMapa(
    user: AuthUser,
    data: UnidadCompetenciaAsignacionDto[],
  ) {
    try {
      // 1) Primero GUARDAMOS todas las asignaciones
      await this.asignarCompetenciasInterno(user, data);

      // 2) Luego DEVOLVEMOS EL MAPA COMPLETO PARA CADA UNIDAD
      const resultado: any[] = [];
      for (const unidad of data) {
        const mapa = await this.obtenerMapaCompetenciasPorUnidad(
          unidad.idUnidadOcupacionalEmpleadora,
        );
        resultado.push(mapa[0]); // porque el método devuelve []
      }

      return resultado;
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  /**
   * Asigna competencias (y su nivel) a una unidad ocupacional.
   *
   * Antes borraba TODAS las asignaciones previas y las volvía a crear. Como la
   * lista de competencias a evaluar se arma en vivo desde esta tabla, cambiar
   * un nivel en plena campaña dejaba a los trabajadores de la unidad con una
   * evaluación abierta del nivel viejo —con calificaciones dentro— y otra del
   * nivel nuevo. El indicador de avance ignoraba la vieja, pero el Excel de
   * resultados la promediaba igual.
   *
   * Ahora se compara contra lo que ya había: solo se tocan las filas que de
   * verdad cambian, y las evaluaciones abiertas del nivel que se abandona se
   * anulan para que no contaminen el resultado. Las CERRADAS no se tocan.
   */
  /**
   * Coherencia de una asignación antes de calcular su impacto o guardarla:
   * cada competencia una sola vez por grupo, de la MISMA empresa que el
   * grupo y vigente, y su nivel tiene que ser de esa competencia y estar
   * vigente. El alcance por empresa ya lo comprueba el controlador, pero no
   * que grupo y competencia sean de la misma empresa (el superadministrador
   * podía mezclarlas) ni que el nivel fuera de esa competencia.
   */
  private async validarAsignacion(data: UnidadCompetenciaAsignacionDto[]) {
    const problemas: string[] = [];
    const unidadesVistas = new Set<number>();
    for (const { idUnidadOcupacionalEmpleadora, competencias } of data) {
      if (unidadesVistas.has(idUnidadOcupacionalEmpleadora))
        problemas.push(
          `El grupo ocupacional ${idUnidadOcupacionalEmpleadora} viene repetido.`,
        );
      unidadesVistas.add(idUnidadOcupacionalEmpleadora);
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findFirst({
        where: { idUnidadOcupacionalEmpleadora, estado: true },
        select: { descripcion: true, idEmpresaEmpleadora: true },
      });
      if (!unidad) {
        problemas.push(
          `El grupo ocupacional ${idUnidadOcupacionalEmpleadora} no existe.`,
        );
        continue;
      }
      const ids = competencias.map((c) => c.idCompetencia);
      const repetidas = ids.filter((x, i) => ids.indexOf(x) !== i);
      if (repetidas.length)
        problemas.push(
          `En «${unidad.descripcion}» una competencia viene dos veces.`,
        );
      if (!ids.length) continue;
      const comps = await this.prisma.competencia.findMany({
        where: { idCompetencia: { in: ids } },
        select: {
          idCompetencia: true,
          titulo: true,
          estado: true,
          idEmpresaEmpleadora: true,
          niveles: {
            where: { estado: true },
            select: { idCompetenciaNivel: true },
          },
        },
      });
      const porId = new Map(comps.map((c) => [c.idCompetencia, c]));
      for (const c of competencias) {
        const comp = porId.get(c.idCompetencia);
        if (!comp || !comp.estado) {
          problemas.push(
            `La competencia ${c.idCompetencia} no existe o fue eliminada.`,
          );
          continue;
        }
        if (comp.idEmpresaEmpleadora !== unidad.idEmpresaEmpleadora) {
          problemas.push(
            `«${comp.titulo}» es de otra empresa que «${unidad.descripcion}».`,
          );
          continue;
        }
        if (
          !comp.niveles.some(
            (n) => n.idCompetenciaNivel === c.idCompetenciaNivel,
          )
        )
          problemas.push(
            `El nivel elegido para «${comp.titulo}» en «${unidad.descripcion}» no existe o ya no está vigente.`,
          );
      }
    }
    if (problemas.length) {
      throw new BadRequestException({
        message: 'Revise la asignación.',
        errors: problemas,
      });
    }
  }

  /**
   * Lo que hay que avisar antes de guardar una asignación (no escribe). El
   * PDF que se descarga desde la confirmación es una **lista de aviso**: una
   * fila por persona con qué debe calificar, porque eso es lo que RR. HH.
   * hace con ella.
   *
   * - **Cambio de nivel:** la evaluación en curso se anula; quien la
   *   calificaba (jefe, el propio trabajador o un subordinado) debe
   *   calificar la competencia en el nivel nuevo.
   * - **Competencia nueva en el grupo:** cada trabajador debe autoevaluarse y
   *   su jefe calificarlo (no se anula nada).
   * - **Se quita:** deja de evaluarse; sus calificaciones dejan de contar y
   *   no hay que avisar a nadie. Va aparte, como información.
   */
  async detalleImpactoAsignacion(data: UnidadCompetenciaAsignacionDto[]) {
    await this.validarAsignacion(data);
    const plural = (n: number, uno: string, varios: string) =>
      n === 1 ? `1 ${uno}` : `${n} ${varios}`;
    const nombre = (e?: { nombres: string; apellidos: string } | null) =>
      e ? `${e.nombres} ${e.apellidos}`.trim() : '—';
    const datosPersona = {
      idEmpleado: true,
      nombres: true,
      apellidos: true,
      codigoEmpleado: true,
      codigoEmpleadoJefe: true,
      documento: true,
      idEmpresaEmpleadora: true,
      usuario: { select: { codigoUsuario: true } },
      areaEmpleadora: { select: { descripcion: true } },
      puestoEmpleadora: { select: { descripcion: true } },
    } as const;
    type Persona = {
      idEmpleado: number;
      nombres: string;
      apellidos: string;
      codigoEmpleado: string;
      documento: string | null;
      usuario: { codigoUsuario: string } | null;
      areaEmpleadora: { descripcion: string } | null;
      puestoEmpleadora: { descripcion: string } | null;
    };

    // Tareas por persona: competencia+nivel → a quién califica.
    const avisos = new Map<
      number,
      {
        persona: Persona;
        auto: Set<string>;
        califica: Map<string, Set<string>>;
        jefe: Map<string, Set<string>>;
        perdidas: number;
      }
    >();
    const anotar = (
      p: Persona,
      tipo: 'auto' | 'califica' | 'jefe',
      tarea: string,
      aQuien?: string,
      perdidas = 0,
    ) => {
      if (!avisos.has(p.idEmpleado))
        avisos.set(p.idEmpleado, {
          persona: p,
          auto: new Set(),
          califica: new Map(),
          jefe: new Map(),
          perdidas: 0,
        });
      const a = avisos.get(p.idEmpleado)!;
      a.perdidas += perdidas;
      if (tipo === 'auto') a.auto.add(tarea);
      else {
        const m = tipo === 'califica' ? a.califica : a.jefe;
        if (!m.has(tarea)) m.set(tarea, new Set());
        m.get(tarea)!.add(aQuien ?? '');
      }
    };

    const grupos: {
      grupo: string;
      textoTrabajadores: string;
      cambios: {
        competencia: string;
        codigo: string;
        de: number;
        a: number;
        evaluaciones: number;
        calificaciones: number;
      }[];
      nuevas: { competencia: string; codigo: string; nivel: number }[];
    }[] = [];
    const quitadas: {
      grupo: string;
      competencia: string;
      codigo: string;
      nivel: number;
      calificaciones: number;
    }[] = [];
    let empresa = '';
    let perdidasTotal = 0;

    for (const { idUnidadOcupacionalEmpleadora, competencias } of data) {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findFirst({
        where: { idUnidadOcupacionalEmpleadora, estado: true },
        select: {
          descripcion: true,
          idEmpresaEmpleadora: true,
          empresaEmpleadora: { select: { nombreEmpresa: true } },
        },
      });
      if (!unidad) continue;
      empresa = unidad.empresaEmpleadora.nombreEmpresa;
      const actuales =
        await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
          where: { idUnidadOcupacionalEmpleadora },
          include: {
            competencia: { select: { titulo: true, codigo: true } },
            competenciaNivel: { select: { nivel: true } },
          },
        });
      const nivelPorCompetencia = new Map(
        competencias.map((c) => [c.idCompetencia, c.idCompetenciaNivel]),
      );
      const numeroDeNivel = new Map(
        (
          await this.prisma.competenciaNivel.findMany({
            where: {
              idCompetenciaNivel: {
                in: competencias.map((c) => c.idCompetenciaNivel),
              },
            },
            select: { idCompetenciaNivel: true, nivel: true },
          })
        ).map((n) => [n.idCompetenciaNivel, n.nivel]),
      );
      const trabajadores = await this.prisma.empleado.findMany({
        where: { idUnidadOcupacionalEmpleadora, estado: true },
        select: datosPersona,
      });
      const ids = trabajadores.map((t) => t.idEmpleado);
      const cambios: (typeof grupos)[number]['cambios'] = [];

      for (const ab of actuales.filter(
        (x) =>
          nivelPorCompetencia.get(x.idCompetencia) !== x.idCompetenciaNivel,
      )) {
        const idNuevo = nivelPorCompetencia.get(ab.idCompetencia);
        const a = idNuevo ? (numeroDeNivel.get(idNuevo) ?? null) : null;
        const evaluaciones = ids.length
          ? await this.prisma.evaluacionCompetencia.findMany({
              where: {
                idEvaluado: { in: ids },
                estado: true,
                estadoEvaluacion: 'PROCESO',
                idCompetencia: ab.idCompetencia,
                idCompetenciaNivel: ab.idCompetenciaNivel,
              },
              select: {
                idEvaluado: true,
                idEvaluador: true,
                tipoEvaluador: true,
                evaluado: { select: { nombres: true, apellidos: true } },
                evaluador: { select: datosPersona },
                _count: {
                  select: {
                    itemsEvaluados: {
                      where: { estado: true, calificacion: { not: null } },
                    },
                  },
                },
              },
            })
          : [];
        const perdidas = evaluaciones.reduce(
          (t, e) => t + e._count.itemsEvaluados,
          0,
        );
        perdidasTotal += perdidas;
        if (a === null) {
          quitadas.push({
            grupo: unidad.descripcion,
            competencia: ab.competencia.titulo,
            codigo: ab.competencia.codigo,
            nivel: ab.competenciaNivel.nivel,
            calificaciones: perdidas,
          });
          continue;
        }
        cambios.push({
          competencia: ab.competencia.titulo,
          codigo: ab.competencia.codigo,
          de: ab.competenciaNivel.nivel,
          a,
          evaluaciones: evaluaciones.length,
          calificaciones: perdidas,
        });
        const tarea = `${ab.competencia.titulo} (nivel ${a})`;
        for (const ev of evaluaciones) {
          if (!ev.evaluador) continue;
          const tipo =
            ev.tipoEvaluador === 'AUTO' || ev.idEvaluador === ev.idEvaluado
              ? 'auto'
              : ev.tipoEvaluador === 'SUBORDINADO'
                ? 'jefe'
                : 'califica';
          anotar(
            ev.evaluador,
            tipo,
            tarea,
            nombre(ev.evaluado),
            ev._count.itemsEvaluados,
          );
        }
      }

      // Competencias nuevas: autoevaluación de cada trabajador y calificación
      // de su jefe (por código, dentro de la misma empresa).
      const nuevas: (typeof grupos)[number]['nuevas'] = [];
      const nuevasIds = competencias.filter(
        (c) => !actuales.some((x) => x.idCompetencia === c.idCompetencia),
      );
      if (nuevasIds.length) {
        const comps = await this.prisma.competencia.findMany({
          where: {
            idCompetencia: { in: nuevasIds.map((c) => c.idCompetencia) },
          },
          select: { idCompetencia: true, titulo: true, codigo: true },
        });
        const codigosJefe = [
          ...new Set(
            trabajadores
              .map((t) => t.codigoEmpleadoJefe)
              .filter((c): c is string => !!c),
          ),
        ];
        const jefes = codigosJefe.length
          ? await this.prisma.empleado.findMany({
              where: {
                codigoEmpleado: { in: codigosJefe },
                idEmpresaEmpleadora: unidad.idEmpresaEmpleadora,
                estado: true,
              },
              select: datosPersona,
            })
          : [];
        const jefePorCodigo = new Map(jefes.map((j) => [j.codigoEmpleado, j]));
        for (const c of nuevasIds) {
          const comp = comps.find((x) => x.idCompetencia === c.idCompetencia);
          if (!comp) continue;
          const nivel = numeroDeNivel.get(c.idCompetenciaNivel) ?? 0;
          nuevas.push({ competencia: comp.titulo, codigo: comp.codigo, nivel });
          const tarea = `${comp.titulo} (nivel ${nivel})`;
          for (const t of trabajadores) {
            anotar(t, 'auto', tarea);
            const jefe = t.codigoEmpleadoJefe
              ? jefePorCodigo.get(t.codigoEmpleadoJefe)
              : undefined;
            if (jefe) anotar(jefe, 'califica', tarea, nombre(t));
          }
        }
      }

      if (
        cambios.length ||
        nuevas.length ||
        quitadas.some((q) => q.grupo === unidad.descripcion)
      )
        grupos.push({
          grupo: unidad.descripcion,
          textoTrabajadores: plural(
            trabajadores.length,
            'trabajador',
            'trabajadores',
          ),
          cambios,
          nuevas,
        });
    }

    // Una fila por persona, con sus tareas en frases cortas.
    const lista = (nombres: Set<string>) => {
      const l = [...nombres].filter(Boolean).sort((x, y) => x.localeCompare(y));
      return l.length <= 4
        ? l.join(', ')
        : `${l.slice(0, 4).join(', ')} y ${l.length - 4} más`;
    };
    const personas = [...avisos.values()]
      .map(({ persona: p, auto, califica, jefe, perdidas }) => {
        const tareas: string[] = [];
        for (const t of auto) tareas.push(`Autoevaluarse en ${t}`);
        for (const [t, a] of califica)
          tareas.push(
            a.size === 1
              ? `Calificar a ${lista(a)} en ${t}`
              : `Calificar a ${a.size} personas en ${t}: ${lista(a)}`,
          );
        for (const [t, a] of jefe)
          tareas.push(`Calificar a su jefe ${lista(a)} en ${t}`);
        const total =
          auto.size +
          [...califica.values()].reduce((n, a) => n + a.size, 0) +
          [...jefe.values()].reduce((n, a) => n + a.size, 0);
        return {
          nombre: nombre(p),
          codigo: p.codigoEmpleado,
          documento: p.documento ?? '—',
          usuario: p.usuario?.codigoUsuario ?? '—',
          area: p.areaEmpleadora?.descripcion ?? '—',
          puesto: p.puestoEmpleadora?.descripcion ?? '—',
          tareas,
          total,
          perdidas,
        };
      })
      .sort((x, y) => x.nombre.localeCompare(y.nombre))
      .map((p, i) => ({ ...p, n: i + 1 }));
    const evaluaciones = personas.reduce((t, p) => t + p.total, 0);

    return {
      empresa,
      grupos,
      quitadas,
      personas,
      totales: {
        personas: personas.length,
        textoPersonas:
          personas.length === 1 ? 'persona a avisar' : 'personas a avisar',
        evaluaciones,
        textoEvaluaciones:
          evaluaciones === 1
            ? 'evaluación por registrar'
            : 'evaluaciones por registrar',
        calificaciones: perdidasTotal,
        textoCalificaciones:
          perdidasTotal === 1
            ? 'calificación se pierde'
            : 'calificaciones se pierden',
      },
    };
  }

  /**
   * Qué se perdería al guardar una asignación, ANTES de guardarla.
   *
   * Cambiar el nivel de una competencia o quitarla de la unidad anula las
   * evaluaciones abiertas de sus ocupantes, y eso se llevaba por delante notas
   * ya puestas sin que nadie dijera nada. Este método no escribe: solo mira
   * qué evaluaciones en PROCESO caerían y cuántas calificaciones se irían con
   * ellas, para que la pantalla pueda pedir confirmación.
   */
  async calcularImpactoAsignacion(data: UnidadCompetenciaAsignacionDto[]) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un grupo ocupacional.',
      );
    }
    await this.validarAsignacion(data);

    const afectadas: {
      unidad: string;
      competencia: string;
      motivo: 'retirada' | 'cambio-de-nivel';
      trabajadores: number;
      notasPuestas: number;
    }[] = [];

    for (const { idUnidadOcupacionalEmpleadora, competencias } of data) {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findFirst({
        where: { idUnidadOcupacionalEmpleadora, estado: true },
        select: { descripcion: true },
      });

      if (!unidad) continue;

      const actuales =
        await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
          where: { idUnidadOcupacionalEmpleadora },
          include: { competencia: { select: { titulo: true } } },
        });

      const nivelPorCompetencia = new Map(
        competencias.map((c) => [c.idCompetencia, c.idCompetenciaNivel]),
      );

      // El mismo criterio que usa `asignarCompetenciasInterno` para anular.
      const abandonados = actuales.filter(
        (a) =>
          nivelPorCompetencia.get(a.idCompetencia) !== a.idCompetenciaNivel,
      );

      if (abandonados.length === 0) continue;

      const empleados = await this.prisma.empleado.findMany({
        where: { idUnidadOcupacionalEmpleadora, estado: true },
        select: { idEmpleado: true },
      });

      if (empleados.length === 0) continue;

      const idsEmpleados = empleados.map((e) => e.idEmpleado);

      for (const a of abandonados) {
        const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
          where: {
            idEvaluado: { in: idsEmpleados },
            estado: true,
            estadoEvaluacion: 'PROCESO',
            idCompetencia: a.idCompetencia,
            idCompetenciaNivel: a.idCompetenciaNivel,
          },
          select: {
            idEvaluado: true,
            itemsEvaluados: {
              where: { estado: true, calificacion: { not: null } },
              select: { idEvaluacionCompetenciaItem: true },
            },
          },
        });

        if (evaluaciones.length === 0) continue;

        afectadas.push({
          unidad: unidad.descripcion,
          competencia: a.competencia.titulo,
          motivo: nivelPorCompetencia.has(a.idCompetencia)
            ? 'cambio-de-nivel'
            : 'retirada',
          trabajadores: new Set(evaluaciones.map((e) => e.idEvaluado)).size,
          notasPuestas: evaluaciones.reduce(
            (total, e) => total + e.itemsEvaluados.length,
            0,
          ),
        });
      }
    }

    const notasPuestas = afectadas.reduce((t, a) => t + a.notasPuestas, 0);

    return {
      afectadas,
      // Lo que de verdad decide si hay que preguntar: anular una evaluación
      // vacía no cuesta nada, perder notas ya puestas sí.
      notasPuestas,
      requiereConfirmacion: notasPuestas > 0,
    };
  }

  private async asignarCompetenciasInterno(
    user: AuthUser,
    data: UnidadCompetenciaAsignacionDto[],
  ) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un grupo ocupacional.',
      );
    }
    await this.validarAsignacion(data);

    await this.prisma.$transaction(async (tx) => {
      const fechaModificacion = new Date();

      for (const unidadBlock of data) {
        const { idUnidadOcupacionalEmpleadora, competencias } = unidadBlock;

        // 1. Validar unidad
        const unidad = await tx.unidadOcupacionalEmpleadora.findFirst({
          where: {
            idUnidadOcupacionalEmpleadora,
            estado: true,
          },
        });

        if (!unidad) {
          throw new NotFoundException(
            `El grupo ocupacional ${idUnidadOcupacionalEmpleadora} no existe.`,
          );
        }

        // 2. Comparar con lo que ya estaba asignado
        const actuales = await tx.unidadOcupacionalCompetenciaNivel.findMany({
          where: { idUnidadOcupacionalEmpleadora },
        });

        const nivelPorCompetencia = new Map(
          competencias.map((c) => [c.idCompetencia, c.idCompetenciaNivel]),
        );
        const yaAsignadas = new Set(actuales.map((a) => a.idCompetencia));

        // Se abandona un nivel cuando la competencia sale de la unidad o
        // cuando pasa a evaluarse en otro nivel.
        const nivelesAbandonados = actuales.filter(
          (a) =>
            nivelPorCompetencia.get(a.idCompetencia) !== a.idCompetenciaNivel,
        );

        // 3. Anular las evaluaciones abiertas de los niveles abandonados
        if (nivelesAbandonados.length > 0) {
          const empleados = await tx.empleado.findMany({
            where: { idUnidadOcupacionalEmpleadora, estado: true },
            select: { idEmpleado: true },
          });

          if (empleados.length > 0) {
            await tx.evaluacionCompetencia.updateMany({
              where: {
                idEvaluado: { in: empleados.map((e) => e.idEmpleado) },
                estado: true,
                estadoEvaluacion: 'PROCESO',
                OR: nivelesAbandonados.map((a) => ({
                  idCompetencia: a.idCompetencia,
                  idCompetenciaNivel: a.idCompetenciaNivel,
                })),
              },
              data: {
                estadoEvaluacion: 'ANULADA',
                actualizadoPorId: user.idUsuario,
                fechaModificacion,
              },
            });
          }
        }

        // 4. Quitar las competencias que ya no se evalúan en esta unidad
        const retiradas = actuales
          .filter((a) => !nivelPorCompetencia.has(a.idCompetencia))
          .map((a) => a.idUnidadOcupacionalCompetenciaNivel);

        if (retiradas.length > 0) {
          await tx.unidadOcupacionalCompetenciaNivel.deleteMany({
            where: {
              idUnidadOcupacionalCompetenciaNivel: { in: retiradas },
            },
          });
        }

        // 5. Mover de nivel las que cambiaron y crear las nuevas
        for (const [idCompetencia, idCompetenciaNivel] of nivelPorCompetencia) {
          if (yaAsignadas.has(idCompetencia)) {
            await tx.unidadOcupacionalCompetenciaNivel.updateMany({
              where: { idUnidadOcupacionalEmpleadora, idCompetencia },
              data: { idCompetenciaNivel },
            });

            continue;
          }

          await tx.unidadOcupacionalCompetenciaNivel.create({
            data: {
              idUnidadOcupacionalEmpleadora,
              idCompetencia,
              idCompetenciaNivel,
            },
          });
        }
      }
    });
  }

  // ==========================================================
  //     OBTENER MAPA FINAL (estructura exacta solicitada)
  // ==========================================================
  async obtenerMapaCompetenciasPorUnidad(idUnidad: number) {
    // Verificar unidad
    const unidad = await this.prisma.unidadOcupacionalEmpleadora.findFirst({
      where: { idUnidadOcupacionalEmpleadora: idUnidad, estado: true },
    });

    if (!unidad)
      throw new NotFoundException('Grupo ocupacional no encontrado.');

    // Cargar competencias de la empresa
    const competencias = await this.prisma.competencia.findMany({
      where: { estado: true, idEmpresaEmpleadora: unidad.idEmpresaEmpleadora },
      include: {
        niveles: true,
      },
    });

    // Cargar asignaciones
    const asignaciones =
      await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
        where: { idUnidadOcupacionalEmpleadora: idUnidad },
      });

    const asignadasSet = new Set(asignaciones.map((a) => a.idCompetenciaNivel));

    // Formar la estructura solicitada
    const competenciasData = competencias.map((comp) => ({
      idCompetencia: comp.idCompetencia,
      nombre: comp.nombre,
      titulo: comp.titulo,
      codigo: comp.codigo,
      idEmpresaEmpleadora: comp.idEmpresaEmpleadora,
      niveles: comp.niveles.map((nivel) => ({
        idCompetenciaNivel: nivel.idCompetenciaNivel,
        nivel: nivel.nivel,
        idCompetencia: comp.idCompetencia,

        // 👇 NUEVO CAMPO QUE SOLICITAS
        isActive: asignadasSet.has(nivel.idCompetenciaNivel),

        // (o asignada si prefieres)
        // asignada: asignadasSet.has(nivel.idCompetenciaNivel),
      })),
    }));

    return [
      {
        idUnidadOcupacionalEmpleadora: unidad.idUnidadOcupacionalEmpleadora,
        descripcion: unidad.descripcion,
        idEmpresaEmpleadora: unidad.idEmpresaEmpleadora,
        competencias: competenciasData,
      },
    ];
  }

  /**
   * Obtener todas las unidades ocupacionales de una empresa
   * junto con TODAS las competencias y todos sus niveles.
   */
  async obtenerUnidadesConCompetenciasPorEmpresa(id: number) {
    try {
      // 1. Validar empresa
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: { idEmpresaEmpleadora: id },
      });

      if (!empresa) {
        throw new NotFoundException(`La empresa con ID ${id} no existe.`);
      }

      // 2. Unidades ocupacionales de la empresa
      const unidades = await this.prisma.unidadOcupacionalEmpleadora.findMany({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
        orderBy: { descripcion: 'asc' },
        // Cuántos trabajadores (no cesados) se evalúan con lo que se asigne.
        include: {
          _count: { select: { empleados: { where: { estado: true } } } },
        },
      });

      // 3. Competencias de la empresa (con niveles)
      const competencias = await this.prisma.competencia.findMany({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
        include: {
          niveles: {
            where: { estado: true },
            orderBy: { nivel: 'asc' },
          },
        },
        orderBy: { codigo: 'asc' },
      });

      // ============================================
      // 4. Por cada unidad → traer sus asignaciones
      // ============================================

      const resultados: any[] = [];

      for (const unidad of unidades) {
        // Traer asignaciones de esta unidad
        const asignaciones =
          await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
            where: {
              idUnidadOcupacionalEmpleadora:
                unidad.idUnidadOcupacionalEmpleadora,
            },
          });

        const asignadasSet = new Set(
          asignaciones.map((a) => a.idCompetenciaNivel),
        );

        // 5. Formatear competencias con isActive por nivel
        const competenciasFormateadas = competencias.map((comp) => ({
          idCompetencia: comp.idCompetencia,
          nombre: comp.nombre,
          titulo: comp.titulo,
          codigo: comp.codigo,
          idEmpresaEmpleadora: comp.idEmpresaEmpleadora,
          niveles: comp.niveles.map((nivel) => ({
            idCompetenciaNivel: nivel.idCompetenciaNivel,
            nivel: nivel.nivel,
            idCompetencia: nivel.idCompetencia,

            // 👇 SE AGREGA AQUÍ
            isActive: asignadasSet.has(nivel.idCompetenciaNivel),
          })),
        }));

        resultados.push({
          idUnidadOcupacionalEmpleadora: unidad.idUnidadOcupacionalEmpleadora,
          descripcion: unidad.descripcion,
          idEmpresaEmpleadora: unidad.idEmpresaEmpleadora,
          trabajadores: unidad._count.empleados,
          competencias: competenciasFormateadas,
        });
      }

      return resultados;
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  async findAllByCompany(id: number) {
    try {
      const unidades = await this.prisma.unidadOcupacionalEmpleadora.findMany({
        where: { estado: true, idEmpresaEmpleadora: id },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return unidades;
    } catch (error) {
      console.error('Error al obtener unidades ocupacionales:', error);
      handlePrismaError(error, 'unidad ocupacional');
    }
  }

  async exportExcel(query: UnidadOcupacionalQueryDto) {
    try {
      const where: Prisma.UnidadOcupacionalEmpleadoraWhereInput = {
        estado: true,

        // El controlador ya resolvió la empresa (`empresaDelListado`); sin
        // esta línea el Excel traía los registros de todas las empresas,
        // también a RR. HH., aunque el listado en pantalla sí filtraba.
        ...(query.idEmpresaEmpleadora && {
          idEmpresaEmpleadora: Number(query.idEmpresaEmpleadora),
        }),

        ...(query.idUnidadOcupacionalEmpleadora && {
          idUnidadOcupacionalEmpleadora: Number(
            query.idUnidadOcupacionalEmpleadora,
          ),
        }),

        ...(query.descripcion && {
          descripcion: {
            contains: query.descripcion,
            mode: 'insensitive',
          },
        }),

        ...((query.nombreEmpresaEmpleadora || query.ruc) && {
          empresaEmpleadora: {
            ...(query.nombreEmpresaEmpleadora && {
              nombreEmpresa: {
                contains: query.nombreEmpresaEmpleadora,
                mode: 'insensitive' as const,
              },
            }),
            ...(query.ruc && {
              ruc: { contains: query.ruc, mode: 'insensitive' as const },
            }),
          },
        }),

        ...(query.search && {
          // Un número busca por ID o en el nombre, no en el RUC de la empresa
          // (el de SEAL tiene un 6 y coincidían todas).
          OR: /^\d+$/.test(String(query.search).trim())
            ? [
                {
                  idUnidadOcupacionalEmpleadora: Number(
                    String(query.search).trim(),
                  ),
                },
                { descripcion: { contains: String(query.search).trim() } },
              ]
            : [
                {
                  descripcion: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
                {
                  empresaEmpleadora: {
                    nombreEmpresa: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  empresaEmpleadora: {
                    ruc: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
        }),
      };

      const unidades = await this.prisma.unidadOcupacionalEmpleadora.findMany({
        where,
        include: {
          empresaEmpleadora: true,
          _count: {
            select: { empleados: { where: { situacion: { not: 'CESADO' } } } },
          },
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Grupos ocupacionales');

      // Se exporta desde el espacio de una empresa (el front manda la activa):
      // «Empresa» repetiría el mismo nombre en cada fila. Solo va si el archivo
      // mezcla empresas.
      const variasEmpresas =
        !query.idEmpresaEmpleadora &&
        new Set(unidades.map((x) => x.idEmpresaEmpleadora)).size > 1;
      const columnasEmpresa = variasEmpresas
        ? [
            { header: 'ID empresa', key: 'idEmpresaEmpleadora', width: 14 },
            { header: 'Empresa', key: 'empresa', width: 50 },
          ]
        : [];

      worksheet.columns = [
        {
          header: 'ID grupo ocupacional',
          key: 'idUnidadOcupacionalEmpleadora',
          width: 20,
        },
        {
          header: 'Nombre',
          key: 'descripcion',
          width: 40,
        },
        { header: 'Trabajadores', key: 'trabajadores', width: 14 },
        ...columnasEmpresa,
      ];

      unidades.forEach((item) => {
        worksheet.addRow({
          idUnidadOcupacionalEmpleadora: item.idUnidadOcupacionalEmpleadora,
          descripcion: item.descripcion,
          trabajadores: item._count.empleados,
          idEmpresaEmpleadora: item.idEmpresaEmpleadora,
          empresa: item.empresaEmpleadora.nombreEmpresa,
        });
      });

      aplicarCabecera(worksheet);

      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      handlePrismaError(error, 'unidad ocupacional');
    }
  }
}
