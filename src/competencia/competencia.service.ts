import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompetenciaDto } from './dto/update-competencia.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CreateCompetenciaNivelesItemsDto } from './dto/create-competencia-nivel-item.dto';
import { IniciarEvaluacionDto } from './dto/init-evaluation.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluation-item.dto';
// import { CreateCompetenciaConDetallesDto } from './dto/create-competencia-con-detalles.dto';

import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';
import { CompetenciaQueryDto } from './dto/competencia-query.dto';
import { ExportEmpresaQueryDto } from './dto/export-empresa-query.dto';
import { Prisma } from '@prisma/client';
import { styleText } from 'util';
import {
  calcularResultados,
  calificacionValida,
  CALIFICACION_MAXIMA_MANUAL,
  OPCIONES_LIKERT,
  filtroEvaluacionesVigentes,
  normalizarPeriodo as normalizarPeriodoCompartido,
  notaDeEvaluacion,
  notasVacias,
  origenDeEvaluacion,
  redondear,
  resultadoDeCompetenciasAsignadas,
  resultadoDeObjetivo,
  type ConfiguracionEmpresa,
  type NotasDeEvaluado,
} from 'src/common/resultados/resultados-evaluacion';

@Injectable()
export class CompetenciaService {
  private readonly logger = new Logger(CompetenciaService.name);

  constructor(private prisma: PrismaService) {}

  async findAll({
    page,
    limit,
    search,
    idCompetencia,
    codigo,
    titulo,
    nombreEmpresaEmpleadora,
    ruc,
  }: CompetenciaQueryDto) {
    try {
      // Los filtros de empresa se arman juntos: si se escribieran como dos
      // spreads de `empresaEmpleadora`, el segundo pisaría al primero.
      const empresaFiltro: Prisma.EmpresaEmpleadoraWhereInput = {
        ...(nombreEmpresaEmpleadora && {
          nombreEmpresa: {
            contains: nombreEmpresaEmpleadora,
            mode: 'insensitive' as const,
          },
        }),
        ...(ruc && { ruc: { contains: ruc } }),
      };

      const where: Prisma.CompetenciaWhereInput = {
        estado: true,

        // ============ FILTROS POR COLUMNA (se combinan con AND) ============
        ...(idCompetencia && { idCompetencia: Number(idCompetencia) }),

        ...(codigo && {
          codigo: { contains: codigo, mode: 'insensitive' },
        }),

        ...(titulo && {
          titulo: { contains: titulo, mode: 'insensitive' },
        }),

        ...(Object.keys(empresaFiltro).length > 0 && {
          empresaEmpleadora: empresaFiltro,
        }),

        // ============ BÚSQUEDA GLOBAL ============
        ...(search && {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { titulo: { contains: search, mode: 'insensitive' } },
            { codigo: { contains: search, mode: 'insensitive' } },
            // Nombre y RUC van en ramas separadas: dentro de un mismo filtro
            // de relación, Prisma los combinaría con AND y nunca coincidirían.
            {
              empresaEmpleadora: {
                nombreEmpresa: { contains: search, mode: 'insensitive' },
              },
            },
            {
              empresaEmpleadora: { ruc: { contains: search } },
            },
          ],
        }),
      };

      const include: Prisma.CompetenciaInclude = {
        empresaEmpleadora: true,
        niveles: {
          where: { estado: true },
          orderBy: { nivel: 'asc' },
          include: {
            items: {
              where: { estado: true },
              orderBy: { secuencial: 'asc' },
            },
          },
        },
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.competencia.findMany({
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
        this.prisma.competencia.count({ where }),
        this.prisma.competencia.findMany({
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
      this.logger.error('Error al obtener los empleados:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                 GET ONE BY ID
  // ======================================================
  async findOne(id: number) {
    try {
      const competencia = await this.prisma.competencia.findFirst({
        where: { idCompetencia: id, estado: true },
        include: {
          niveles: {
            include: { items: true },
          },
        },
      });
      if (!competencia) {
        throw new NotFoundException(`Competencia con ID ${id} no encontrada.`);
      }
      return competencia;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error al obtener competencia con ID ${id}:`, error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                      UPDATE
  // ======================================================
  async update(id: number, user: AuthUser, dto: UpdateCompetenciaDto) {
    const competencia = await this.prisma.competencia.findUnique({
      where: { idCompetencia: id, estado: true },
    });

    if (!competencia) throw new NotFoundException('Competencia no encontrada');

    if (!dto.niveles || dto.niveles.length === 0) {
      throw new BadRequestException('niveles no puede estar vacío');
    }

    const niveles = dto.niveles;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const fechaModificacion = new Date();

        // 1. Actualizar solo los campos enviados.
        await tx.competencia.update({
          where: { idCompetencia: id },
          data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre }),
            ...(dto.titulo !== undefined && { titulo: dto.titulo }),
            ...(dto.codigo !== undefined && { codigo: dto.codigo }),
            ...(dto.idEmpresaEmpleadora !== undefined && {
              idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
            }),
            actualizadoPorId: user.idUsuario,
            fechaModificacion,
          },
        });

        // 2. No se eliminan niveles ni items: pueden estar referenciados por
        // evaluaciones históricas. Se mantienen sus IDs y se usa estado para
        // controlar qué estructura estará disponible para nuevas evaluaciones.
        const nivelesActuales = await tx.competenciaNivel.findMany({
          where: { idCompetencia: id },
          include: { items: { where: { estado: true } } },
        });

        const nivelesEnviados = new Set<number>(niveles.map((n) => n.nivel));
        if (nivelesEnviados.size !== niveles.length) {
          throw new BadRequestException('Hay niveles repetidos.');
        }

        // Quitar un nivel que alguna unidad ocupacional tiene asignado dejaba
        // a sus ocupantes evaluándose contra un nivel inactivo, y el Excel los
        // descartaba en silencio. Hay que reasignar la unidad primero.
        const nivelesQueSeRetiran = nivelesActuales.filter(
          (n) => n.estado && !nivelesEnviados.has(n.nivel),
        );
        if (nivelesQueSeRetiran.length) {
          const asignados = await tx.unidadOcupacionalCompetenciaNivel.findMany({
            where: {
              idCompetenciaNivel: {
                in: nivelesQueSeRetiran.map((n) => n.idCompetenciaNivel),
              },
              unidadOcupacionalEmpleadora: { estado: true },
            },
            select: {
              competenciaNivel: { select: { nivel: true } },
              unidadOcupacionalEmpleadora: { select: { descripcion: true } },
            },
          });
          if (asignados.length) {
            const detalle = asignados
              .map(
                (a) =>
                  `nivel ${a.competenciaNivel.nivel} en "${a.unidadOcupacionalEmpleadora.descripcion}"`,
              )
              .join(', ');
            throw new BadRequestException(
              `No se puede quitar un nivel asignado a unidades ocupacionales (${detalle}). Reasigna esas unidades a otro nivel primero.`,
            );
          }
        }

        for (const nivelDto of niveles) {
          const nivelActual = nivelesActuales.find(
            (nivel) => nivel.nivel === nivelDto.nivel,
          );

          const nivel = nivelActual
            ? await tx.competenciaNivel.update({
                where: {
                  idCompetenciaNivel: nivelActual.idCompetenciaNivel,
                },
                data: {
                  estado: true,
                  actualizadoPorId: user.idUsuario,
                  fechaModificacion,
                },
              })
            : await tx.competenciaNivel.create({
                data: {
                  idCompetencia: id,
                  nivel: nivelDto.nivel,
                  creadoPorId: user.idUsuario,
                },
              });

          // Solo los ítems VIGENTES: con los retirados mezclados, el
          // emparejamiento podía reactivar uno viejo o duplicar el reemplazo.
          const itemsActuales = nivelActual?.items ?? [];
          const disponibles = new Map(
            itemsActuales.map((item) => [item.idCompetenciaNivelItem, item]),
          );
          const conservados = new Set<number>();

          // El ítem se identifica por su id, NO por su posición. Emparejando
          // por posición, borrar o reordenar un ítem intermedio hacía que los
          // siguientes "cambiaran de texto" y sus notas en PROCESO pasaran a un
          // enunciado que nadie calificó.
          // Sin id (clientes de la API que no lo mandan) solo se reconoce el
          // ítem si el texto es idéntico; si no, es un ítem nuevo.
          const emparejar = (itemDto: { idCompetenciaNivelItem?: number; enunciado: string }) => {
            const idEnviado = itemDto.idCompetenciaNivelItem
              ? Number(itemDto.idCompetenciaNivelItem)
              : undefined;
            if (idEnviado) {
              if (conservados.has(idEnviado)) {
                throw new BadRequestException(
                  `El ítem ${idEnviado} del nivel ${nivelDto.nivel} está repetido.`,
                );
              }
              return disponibles.get(idEnviado);
            }
            return itemsActuales.find(
              (item) =>
                !conservados.has(item.idCompetenciaNivelItem) &&
                item.enunciado === itemDto.enunciado,
            );
          };

          for (const [index, itemDto] of nivelDto.items.entries()) {
            const secuencial = index + 1;
            const itemActual = emparejar(itemDto);

            if (!itemActual) {
              const creado = await tx.competenciaNivelItem.create({
                data: {
                  idCompetenciaNivel: nivel.idCompetenciaNivel,
                  enunciado: itemDto.enunciado,
                  secuencial,
                  creadoPorId: user.idUsuario,
                },
              });
              conservados.add(creado.idCompetenciaNivelItem);
              continue;
            }

            conservados.add(itemActual.idCompetenciaNivelItem);

            const cambiaTexto = itemActual.enunciado !== itemDto.enunciado;
            const itemTieneHistorial = cambiaTexto
              ? await tx.evaluacionCompetenciaItem.count({
                  where: {
                    idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
                  },
                })
              : 0;

            if (!cambiaTexto || itemTieneHistorial === 0) {
              await tx.competenciaNivelItem.update({
                where: {
                  idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
                },
                data: {
                  enunciado: itemDto.enunciado,
                  secuencial,
                  actualizadoPorId: user.idUsuario,
                  fechaModificacion,
                },
              });
              continue;
            }

            // Cambió el texto de un ítem ya calificado: se retira y nace un
            // reemplazo, para que las evaluaciones CERRADAS y ANULADAS sigan
            // apuntando al enunciado que realmente se calificó.
            await tx.competenciaNivelItem.update({
              where: {
                idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
              },
              data: {
                estado: false,
                actualizadoPorId: user.idUsuario,
                fechaModificacion,
              },
            });

            const reemplazo = await tx.competenciaNivelItem.create({
              data: {
                idCompetenciaNivel: nivel.idCompetenciaNivel,
                enunciado: itemDto.enunciado,
                secuencial,
                creadoPorId: user.idUsuario,
              },
            });
            conservados.add(reemplazo.idCompetenciaNivelItem);

            // Las evaluaciones que siguen en PROCESO tienen que apuntar al
            // ítem nuevo. Si se quedan con el que acabamos de dar de baja,
            // su avance ya no cierra nunca: el progreso solo cuenta ítems
            // vigentes del nivel, así que la evaluación queda congelada en
            // "0 de N" sin ninguna forma de terminarla desde la interfaz.
            // Se conserva la calificación y se actualiza el enunciado, que
            // es el texto que el evaluador está viendo ahora (es el MISMO
            // ítem, emparejado por id, con el texto corregido).
            //
            // Las CERRADAS y ANULADAS no se tocan a propósito: para eso
            // existe el snapshot `textoItemEvaluado`.
            await tx.evaluacionCompetenciaItem.updateMany({
              where: {
                idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
                estado: true,
                evaluacion: {
                  estado: true,
                  estadoEvaluacion: 'PROCESO',
                },
              },
              data: {
                idCompetenciaNivelItem: reemplazo.idCompetenciaNivelItem,
                textoItemEvaluado: itemDto.enunciado,
                actualizadoPorId: user.idUsuario,
                fechaModificacion,
              },
            });
          }

          // Los vigentes que no llegaron en el formulario se retiran.
          await tx.competenciaNivelItem.updateMany({
            where: {
              idCompetenciaNivel: nivel.idCompetenciaNivel,
              estado: true,
              idCompetenciaNivelItem: { notIn: Array.from(conservados) },
            },
            data: {
              estado: false,
              actualizadoPorId: user.idUsuario,
              fechaModificacion,
            },
          });

          // Editar el nivel en plena campaña dejaba a las evaluaciones ya
          // abiertas con la lista de ítems vieja.
          await this.sincronizarItemsDeNivel(
            tx,
            user,
            nivel.idCompetenciaNivel,
          );
        }

        await tx.competenciaNivel.updateMany({
          where: {
            idCompetencia: id,
            nivel: { notIn: Array.from(nivelesEnviados) },
          },
          data: {
            estado: false,
            actualizadoPorId: user.idUsuario,
            fechaModificacion,
          },
        });

        // Misma forma que el listado (solo lo vigente, ordenado, con empresa):
        // el front reemplaza la fila con esto. Devolviendo todo, la tabla
        // mostraba ítems retirados y al volver a editar se reactivaban.
        return await tx.competencia.findUnique({
          where: { idCompetencia: id },
          include: {
            empresaEmpleadora: true,
            niveles: {
              where: { estado: true },
              orderBy: { nivel: 'asc' },
              include: {
                items: {
                  where: { estado: true },
                  orderBy: { secuencial: 'asc' },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                      DELETE
  // ======================================================
  async remove(user: AuthUser, id: number) {
    try {
      const competencia = await this.prisma.competencia.findFirst({
        where: { idCompetencia: id },
      });

      if (!competencia || !competencia.estado) {
        throw new NotFoundException(`Competencia con ID ${id} no encontrada.`);
      }

      // Dar de baja solo la competencia y sus niveles dejaba la eliminación a
      // medias: los ítems seguían activos, la asignación por unidad ocupacional
      // seguía en pie —así que la competencia borrada continuaba apareciendo
      // como pendiente para todo el que ocupara esa unidad— y las evaluaciones
      // abiertas seguían promediando en el Excel de resultados.
      return await this.prisma.$transaction(async (tx) => {
        const fechaModificacion = new Date();
        const auditoria = {
          actualizadoPorId: user.idUsuario,
          fechaModificacion,
        };

        const niveles = await tx.competenciaNivel.findMany({
          where: { idCompetencia: id },
          select: { idCompetenciaNivel: true },
        });

        await tx.competenciaNivelItem.updateMany({
          where: {
            idCompetenciaNivel: {
              in: niveles.map((n) => n.idCompetenciaNivel),
            },
          },
          data: { estado: false, ...auditoria },
        });

        await tx.competenciaNivel.updateMany({
          where: { idCompetencia: id },
          data: { estado: false, ...auditoria },
        });

        // Esta tabla no tiene soft delete, así que la asignación se borra.
        await tx.unidadOcupacionalCompetenciaNivel.deleteMany({
          where: { idCompetencia: id },
        });

        // Nadie puede terminar de calificar una competencia que ya no existe.
        await tx.evaluacionCompetencia.updateMany({
          where: {
            idCompetencia: id,
            estado: true,
            estadoEvaluacion: 'PROCESO',
          },
          data: { estadoEvaluacion: 'ANULADA', ...auditoria },
        });

        return await tx.competencia.update({
          where: { idCompetencia: id },
          data: { estado: false, ...auditoria },
        });
      });
    } catch (error) {
      this.logger.error(`Error al eliminar competencia con ID ${id}:`, error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //            CREATE CON NIVELES E ITEMS
  // ======================================================
  async createConDetalles(
    user: AuthUser,
    dto: CreateCompetenciaNivelesItemsDto,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const nueva = await tx.competencia.create({
          data: {
            nombre: dto.nombre,
            titulo: dto.titulo,
            codigo: dto.codigo,
            idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
            creadoPorId: user.idUsuario,
            niveles: {
              create: dto.niveles.map((nivel) => ({
                nivel: nivel.nivel,
                creadoPorId: user.idUsuario,
                items: {
                  createMany: {
                    data: nivel.items.map((item, index) => ({
                      enunciado: item.enunciado,
                      secuencial: index + 1,
                      creadoPorId: user.idUsuario,
                    })),
                  },
                },
              })),
            },
          },
          include: {
            niveles: { include: { items: true } },
            empresaEmpleadora: true,
          },
        });

        return nueva;
      });
    } catch (error) {
      this.logger.error('Error creando competencia con niveles:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //       IMPORTAR MUCHAS COMPETENCIAS COMPLETAS
  // ======================================================
  async importData(user: AuthUser, data: CreateCompetenciaNivelesItemsDto[]) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        return await Promise.all(
          data.map((row) =>
            tx.competencia.create({
              data: {
                nombre: row.nombre,
                titulo: row.titulo,
                codigo: row.codigo,
                idEmpresaEmpleadora: row.idEmpresaEmpleadora,
                creadoPorId: user.idUsuario,
                niveles: {
                  create: row.niveles.map((nivel) => ({
                    nivel: nivel.nivel,
                    creadoPorId: user.idUsuario,
                    items: {
                      createMany: {
                        data: nivel.items.map((item, index) => ({
                          enunciado: item.enunciado,
                          secuencial: index + 1,
                          creadoPorId: user.idUsuario,
                        })),
                      },
                    },
                  })),
                },
              },
              include: {
                niveles: { include: { items: true } },
              },
            }),
          ),
        );
      });
    } catch (error) {
      console.error('Error al importar datos:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  async findAllByCompany(id: number) {
    try {
      const competencias = await this.prisma.competencia.findMany({
        where: { estado: true, idEmpresaEmpleadora: id },
        include: {
          niveles: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return competencias;
    } catch (error) {
      console.error('Error al obtener unidades ocupacionales:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  // POST /evaluaciones/iniciar
  // GET /evaluaciones/:id
  // PUT /evaluaciones/:id
  // PATCH /evaluaciones/:id/cerrar
  // PATCH /evaluaciones/:id/anular

  // ======================================================
  //          SINCRONIZAR ÍTEMS DE EVALUACIONES ABIERTAS
  // ======================================================
  /**
   * Alinea las evaluaciones en PROCESO de un nivel con sus ítems vigentes.
   *
   * El enunciado se congela en `textoItemEvaluado` para que editar el catálogo
   * no reescriba evaluaciones antiguas, pero la lista de "lo que falta por
   * calificar" se arma contra los ítems vigentes del nivel. Cuando el nivel
   * gana o pierde un ítem en plena campaña, las evaluaciones ya abiertas se
   * quedan con la foto vieja y el avance deja de cuadrar: o piden calificar
   * algo que ya no existe, o nunca llegan al 100 % porque les falta un ítem
   * que nunca se les creó.
   *
   * Solo toca evaluaciones en PROCESO y nunca borra calificaciones puestas.
   */
  private async sincronizarItemsDeNivel(
    tx: Prisma.TransactionClient,
    user: AuthUser,
    idCompetenciaNivel: number,
  ) {
    const evaluaciones = await tx.evaluacionCompetencia.findMany({
      where: {
        idCompetenciaNivel,
        estado: true,
        estadoEvaluacion: 'PROCESO',
      },
      select: {
        idEvaluacionCompetencia: true,
        itemsEvaluados: {
          where: { estado: true },
          select: { idCompetenciaNivelItem: true },
        },
      },
    });

    if (evaluaciones.length === 0) return;

    const itemsVigentes = await tx.competenciaNivelItem.findMany({
      where: { idCompetenciaNivel, estado: true },
      select: { idCompetenciaNivelItem: true, enunciado: true },
      orderBy: { secuencial: 'asc' },
    });

    const idsEvaluaciones = evaluaciones.map((e) => e.idEvaluacionCompetencia);
    const idsVigentes = itemsVigentes.map((i) => i.idCompetenciaNivelItem);
    const fechaModificacion = new Date();

    // 1) Fuera lo que el nivel ya no tiene. Si el nivel se quedó sin ítems
    // vigentes no hay ninguno que conservar, y el filtro se omite en vez de
    // depender de cómo interpreta Prisma un `notIn` vacío.
    await tx.evaluacionCompetenciaItem.updateMany({
      where: {
        idEvaluacionCompetencia: { in: idsEvaluaciones },
        estado: true,
        ...(idsVigentes.length > 0 && {
          idCompetenciaNivelItem: { notIn: idsVigentes },
        }),
      },
      data: {
        estado: false,
        actualizadoPorId: user.idUsuario,
        fechaModificacion,
      },
    });

    // 2) Y dentro lo que se agregó después de abrir la evaluación.
    const faltantes = evaluaciones.flatMap((ev) => {
      const yaTiene = new Set(
        ev.itemsEvaluados.map((i) => i.idCompetenciaNivelItem),
      );

      return itemsVigentes
        .filter((item) => !yaTiene.has(item.idCompetenciaNivelItem))
        .map((item) => ({
          idEvaluacionCompetencia: ev.idEvaluacionCompetencia,
          idCompetenciaNivelItem: item.idCompetenciaNivelItem,
          textoItemEvaluado: item.enunciado,
          calificacion: null,
          creadoPorId: user.idUsuario,
        }));
    });

    if (faltantes.length > 0) {
      await tx.evaluacionCompetenciaItem.createMany({ data: faltantes });
    }
  }

  /**
   * Recorta un periodo a "YYYY-MM".
   *
   * `EmpresaEmpleadora.periodoEvaluacion` se guarda como "YYYY-MM" y el DTO lo
   * valida así, pero quedan filas antiguas con el ISO completo
   * ("2026-09-04T05:00:00.000Z"). Las dos formas no coinciden comparadas como
   * texto, así que el periodo se normaliza SIEMPRE antes de guardarlo en una
   * evaluación o de filtrar por él: si no, editar y guardar una empresa vieja
   * cambiaría su periodo a la forma corta y sus evaluaciones abiertas —
   * estampadas con la forma larga — dejarían de encontrarse, se crearían
   * nuevas y las notas quedarían huérfanas.
   */
  private normalizarPeriodo(periodo?: string | null): string | null {
    return normalizarPeriodoCompartido(periodo);
  }


  /**
   * Periodo de campaña ("YYYY-MM") que le corresponde a un evaluado, tomado de
   * la empresa a la que pertenece. Es lo que separa una campaña de la
   * siguiente en `EvaluacionCompetencia`.
   */
  private async periodoDeEvaluado(idEvaluado?: number | null) {
    if (!idEvaluado) return null;

    const empleado = await this.prisma.empleado.findFirst({
      where: { idEmpleado: idEvaluado },
      select: { empresaEmpleadora: { select: { periodoEvaluacion: true } } },
    });

    return this.normalizarPeriodo(
      empleado?.empresaEmpleadora?.periodoEvaluacion,
    );
  }

  // ======================================================
  //                  INICIAR EVALUACIÓN
  // ======================================================
  async iniciarEvaluacion(user: AuthUser, dto: IniciarEvaluacionDto) {
    const { idEvaluado, idEvaluador, idCompetencia, idCompetenciaNivel } = dto;

    try {
      const periodoEvaluacion = await this.periodoDeEvaluado(idEvaluado);

      // 1) Buscar una evaluación en PROCESO **de esta campaña**.
      //
      // Antes se buscaba sin periodo: al abrir la campaña siguiente aparecía
      // la evaluación del periodo anterior y el evaluador terminaba
      // sobrescribiendo sus calificaciones.
      let evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
        where: {
          idEvaluado,
          idEvaluador,
          idCompetencia,
          periodoEvaluacion,
          estadoEvaluacion: 'PROCESO',
          estado: true,
        },
        include: {
          itemsEvaluados: {
            // Sin este filtro volverían los ítems dados de baja al
            // sincronizar el nivel, y la pantalla los pintaría como
            // filas por calificar.
            where: { estado: true },
            include: { item: true },
            orderBy: { idEvaluacionCompetenciaItem: 'asc' },
          },
        },
      });

      if (evaluacion) {
        // El nivel asignado a la unidad ocupacional puede haber cambiado desde
        // que se abrió. Reutilizar la evaluación del nivel viejo mezclaría dos
        // niveles en el mismo periodo, así que se anula y se abre una nueva.
        if (evaluacion.idCompetenciaNivel !== idCompetenciaNivel) {
          await this.prisma.evaluacionCompetencia.update({
            where: {
              idEvaluacionCompetencia: evaluacion.idEvaluacionCompetencia,
            },
            data: {
              estadoEvaluacion: 'ANULADA',
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        } else {
          const idNivel = evaluacion.idCompetenciaNivel;

          await this.prisma.$transaction((tx) =>
            this.sincronizarItemsDeNivel(tx, user, idNivel),
          );

          return this.obtenerEvaluacion(evaluacion.idEvaluacionCompetencia);
        }
      }

      // 2) Validar que el nivel pertenece a la competencia
      const nivel = await this.prisma.competenciaNivel.findFirst({
        where: {
          idCompetenciaNivel,
          idCompetencia,
          estado: true,
        },
        include: { items: true },
      });

      if (!nivel) {
        throw new BadRequestException('Nivel de competencia no válido.');
      }

      // 3) Crear la evaluación
      evaluacion = await this.prisma.evaluacionCompetencia.create({
        data: {
          idEvaluado,
          idEvaluador,
          idCompetencia,
          idCompetenciaNivel,
          periodoEvaluacion,
          estadoEvaluacion: 'PROCESO',
          creadoPorId: user.idUsuario,
        },
        // El include mantiene el tipo de `evaluacion` igual al de la búsqueda
        // de arriba; recién creada no tiene ítems todavía.
        include: {
          itemsEvaluados: {
            where: { estado: true },
            include: { item: true },
            orderBy: { idEvaluacionCompetenciaItem: 'asc' },
          },
        },
      });

      // 4) Crear ítems evaluados con snapshot
      await this.prisma.evaluacionCompetenciaItem.createMany({
        // data: nivel.items.map((it) => ({
        //   idEvaluacionCompetencia: evaluacion.idEvaluacionCompetencia,
        //   idCompetenciaNivelItem: it.idCompetenciaNivelItem,
        //   textoItemEvaluado: it.enunciado,
        //   calificacion: null,
        //   creadoPorId: user.idUsuario,
        // })),
        data: nivel.items
          .filter((it) => it.estado === true) // 👈 FILTRO AQUÍ
          .map((it) => ({
            idEvaluacionCompetencia: evaluacion.idEvaluacionCompetencia,
            idCompetenciaNivelItem: it.idCompetenciaNivelItem,
            textoItemEvaluado: it.enunciado,
            calificacion: null,
            creadoPorId: user.idUsuario,
          })),
      });

      return this.obtenerEvaluacion(evaluacion.idEvaluacionCompetencia);
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                OBTENER EVALUACIÓN COMPLETA
  // ======================================================
  async obtenerEvaluacion(id: number) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: id, estado: true },
      include: {
        evaluado: true,
        evaluador: true,
        competencia: true,
        nivel: true,
        itemsEvaluados: {
          // Sin este filtro volverían los ítems dados de baja al
          // sincronizar el nivel, y la pantalla los pintaría como
          // filas por calificar.
          where: { estado: true },
          include: { item: true },
          orderBy: { idEvaluacionCompetenciaItem: 'asc' },
        },
      },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    return evaluacion;
  }

  // ======================================================
  //                ACTUALIZAR EVALUACIÓN
  // ======================================================
  async actualizarEvaluacion(
    user: AuthUser,
    idEvaluacion: number,
    dto: UpdateEvaluacionDto,
  ) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: idEvaluacion, estado: true },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    if (evaluacion.estadoEvaluacion !== 'PROCESO') {
      throw new BadRequestException(
        'La evaluación está cerrada y no puede ser modificada.',
      );
    }

    // La escala la fija la empresa del evaluado, y hasta ahora nadie la
    // comprobaba: por la API entraban un 9999 o un -500 y se guardaban tal
    // cual, arrastrando el promedio de la competencia entera.
    const empresaDelEvaluado = evaluacion.idEvaluado
      ? await this.prisma.empleado.findUnique({
          where: { idEmpleado: evaluacion.idEvaluado },
          select: {
            empresaEmpleadora: {
              select: { tipoCalificacionCompetencia: true },
            },
          },
        })
      : null;

    const tipoCalificacion =
      empresaDelEvaluado?.empresaEmpleadora?.tipoCalificacionCompetencia;

    const fueraDeEscala = (dto.items ?? []).filter(
      (i) => !calificacionValida(i.calificacion, tipoCalificacion),
    );

    if (fueraDeEscala.length > 0) {
      throw new BadRequestException(
        tipoCalificacion === 'LIKERT'
          ? `Con la escala LIKERT la calificación solo puede ser ${OPCIONES_LIKERT.join(', ')}.`
          : `La calificación debe estar entre 0 y ${CALIFICACION_MAXIMA_MANUAL}.`,
      );
    }

    // Los ítems llegan identificados por su id suelto, sin nada que los ate a
    // la evaluación de la URL: mandando ids ajenos se calificaba la evaluación
    // de cualquier otro trabajador.
    const items = dto.items ?? [];
    const idsEnviados = new Set(
      items.map((it) => it.idEvaluacionCompetenciaItem),
    );

    if (idsEnviados.size > 0) {
      const propios = await this.prisma.evaluacionCompetenciaItem.count({
        where: {
          idEvaluacionCompetenciaItem: { in: [...idsEnviados] },
          idEvaluacionCompetencia: idEvaluacion,
        },
      });

      if (propios !== idsEnviados.size) {
        throw new BadRequestException(
          'Alguno de los ítems enviados no pertenece a esta evaluación.',
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) Actualizar comentario general si existe
        if (dto.comentarioGeneral !== undefined) {
          await tx.evaluacionCompetencia.update({
            where: { idEvaluacionCompetencia: idEvaluacion },
            data: {
              comentarioGeneral: dto.comentarioGeneral,
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        }

        // 2) Actualizar calificación por ítem.
        //
        // `updateMany` con la evaluación en el `where` en vez de `update` por
        // id: así el ítem no se puede calificar desde otra evaluación ni
        // revivir uno dado de baja porque el nivel cambió mientras la pantalla
        // estaba abierta. Lo que ya no está vigente simplemente no se escribe.
        for (const it of items) {
          await tx.evaluacionCompetenciaItem.updateMany({
            where: {
              idEvaluacionCompetenciaItem: it.idEvaluacionCompetenciaItem,
              idEvaluacionCompetencia: idEvaluacion,
              estado: true,
            },
            data: {
              calificacion: it.calificacion,
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        }

        // ✅ 3) DEVOLVER DATOS ACTUALIZADOS USANDO TX
        return await tx.evaluacionCompetencia.findFirst({
          where: { idEvaluacionCompetencia: idEvaluacion, estado: true },
          include: {
            evaluado: true,
            evaluador: true,
            competencia: true,
            nivel: true,
            itemsEvaluados: {
              // Sin este filtro volverían los ítems dados de baja al
              // sincronizar el nivel, y la pantalla los pintaría como
              // filas por calificar.
              where: { estado: true },
              include: { item: true },
              orderBy: { idEvaluacionCompetenciaItem: 'asc' },
            },
          },
        });
      });
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                    CERRAR EVALUACIÓN
  // ======================================================
  async cerrarEvaluacion(id: number, user: AuthUser) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: id, estado: true },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    if (evaluacion.estadoEvaluacion === 'CERRADA') {
      throw new BadRequestException('La evaluación ya está cerrada.');
    }

    return await this.prisma.evaluacionCompetencia.update({
      where: { idEvaluacionCompetencia: id },
      data: {
        estadoEvaluacion: 'CERRADA',
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
  }

  // ======================================================
  //                    ANULAR EVALUACIÓN
  // ======================================================
  async anularEvaluacion(id: number, user: AuthUser) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: id, estado: true },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    return await this.prisma.evaluacionCompetencia.update({
      where: { idEvaluacionCompetencia: id },
      data: {
        estadoEvaluacion: 'ANULADA',
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
  }

  async empleadosEvaluadosPorEmpresa(idEmpresaEmpleadora: number) {
    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        estado: true,
        idEvaluado: { not: null },
        evaluado: {
          idEmpresaEmpleadora,
          estado: true,
        },
      },
      include: {
        evaluado: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
          },
        },
        evaluador: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
          },
        },
        competencia: {
          select: {
            idCompetencia: true,
            nombre: true,
          },
        },
        nivel: {
          select: {
            idCompetenciaNivel: true,
            nivel: true,
          },
        },
        itemsEvaluados: {
          // Los ítems dados de baja (porque el nivel cambió durante la
          // campaña) inflaban el total y la evaluación no llegaba nunca a
          // aparecer como completa.
          where: { estado: true },
          select: {
            calificacion: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    // ======================================================
    // AGRUPACIÓN
    // ======================================================
    const empleadosMap = new Map<number, any>();

    for (const ev of evaluaciones) {
      // Skip if evaluado is null
      if (!ev.evaluado) continue;

      const totalItems = ev.itemsEvaluados.length;
      // `null` es SIN CALIFICAR; 0 es una calificación real. El criterio
      // anterior (`> 0`) contaba un 0 como pendiente.
      const itemsCalificados = ev.itemsEvaluados.filter(
        (i) => i.calificacion !== null,
      ).length;

      // "Calificada" es la evaluación completa, no la que tiene un ítem
      // suelto: con el criterio anterior bastaba una nota para que la pantalla
      // la diera por terminada. Es el mismo criterio que el indicador de
      // avance del jefe.
      const nivelCalificado = totalItems > 0 && itemsCalificados === totalItems;

      // Tipo de evaluador
      let tipoEvaluador = 'SIN EVALUADOR';
      if (ev.idEvaluador && ev.idEvaluador === ev.idEvaluado) {
        tipoEvaluador = 'AUTOEVALUACIÓN';
      } else if (ev.idEvaluador) {
        tipoEvaluador = 'EVALUADOR';
      }

      // ==============================
      // ESTRUCTURAS BASE
      // ==============================
      if (!empleadosMap.has(ev.evaluado.idEmpleado)) {
        empleadosMap.set(ev.evaluado.idEmpleado, {
          evaluado: ev.evaluado,
          evaluacionesPorEvaluador: new Map<number, any>(),
        });
      }

      const empleado = empleadosMap.get(ev.evaluado.idEmpleado);

      const evaluadorId = ev.evaluador?.idEmpleado ?? 0;

      if (!empleado.evaluacionesPorEvaluador.has(evaluadorId)) {
        empleado.evaluacionesPorEvaluador.set(evaluadorId, {
          evaluador: ev.evaluador
            ? { ...ev.evaluador, tipo: tipoEvaluador }
            : null,
          niveles: new Map<number, any>(),
        });
      }

      const evaluador = empleado.evaluacionesPorEvaluador.get(evaluadorId);

      const nivelId = ev.nivel.idCompetenciaNivel;

      if (!evaluador.niveles.has(nivelId)) {
        evaluador.niveles.set(nivelId, {
          nivel: ev.nivel,
          evaluaciones: [],
        });
      }

      evaluador.niveles.get(nivelId).evaluaciones.push({
        evaluacionId: ev.idEvaluacionCompetencia,
        competencia: ev.competencia,
        nivelCalificado,
        detalleCalificacion: {
          totalItems,
          itemsCalificados,
          itemsSinCalificar: totalItems - itemsCalificados,
        },
        estadoEvaluacion: ev.estadoEvaluacion,
        fechaEvaluacion: ev.fechaCreacion,
      });
    }

    // ======================================================
    // NORMALIZAR MAPS A ARRAYS
    // ======================================================
    const empleados = Array.from(empleadosMap.values()).map((emp) => ({
      evaluado: emp.evaluado,
      evaluacionesPorEvaluador: Array.from(
        emp.evaluacionesPorEvaluador.values(),
      ).map((ev: { evaluador: any; niveles: Map<number, any> }) => ({
        evaluador: ev.evaluador,
        niveles: Array.from(ev.niveles.values()),
      })),
    }));

    return {
      totalEmpleadosEvaluados: empleados.length,
      empleados,
    };
  }

  // TODO: Metodos para obtener resultados finales por empleado (promedios ponderados) y exportar a Excel/PDF
  // ===============================
  // 🔹 UTILIDAD DE REDONDEO GLOBAL
  // ===============================
  private round(num: number, decimals = 2): number {
    return redondear(num, decimals);
  }

  // ===============================
  // 🔹 CÁLCULO DE RESULTADOS
  // ===============================
  /**
   * Conservado como puerta de entrada del Excel; la regla vive en
   * `src/common/resultados`, que es de donde la lee también el PDF individual.
   */
  public calcularResultadosEmpleadoDesdeAgrupado(
    empresa: ConfiguracionEmpresa,
    emp: NotasDeEvaluado,
  ) {
    return calcularResultados(empresa, emp);
  }


  /**
   * Filtro sobre el empleado que comparten los tres reportes Excel.
   *
   * Se aplica a la relación (`evaluado` en competencias, `empleado` en
   * objetivos), así que se devuelve suelto para incrustarlo donde toque.
   */
  private filtroEmpleadoExport(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
  ): Prisma.EmpleadoWhereInput {
    const search = filtros.search?.trim();

    return {
      idEmpresaEmpleadora,
      estado: true,
      ...(filtros.idGerenciaEmpleadora && {
        idGerenciaEmpleadora: Number(filtros.idGerenciaEmpleadora),
      }),
      ...(filtros.idAreaEmpleadora && {
        idAreaEmpleadora: Number(filtros.idAreaEmpleadora),
      }),
      ...(filtros.idUnidadOcupacionalEmpleadora && {
        idUnidadOcupacionalEmpleadora: Number(
          filtros.idUnidadOcupacionalEmpleadora,
        ),
      }),
      ...(filtros.idPuestoEmpleadora && {
        idPuestoEmpleadora: Number(filtros.idPuestoEmpleadora),
      }),
      ...(search && {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { codigoEmpleado: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
  }

  // TODO: Resultados COMPETENCIAS + OBJETIVOS
  async exportarResultadosEmpresaExcel(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
  ) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: {
        idEmpresaEmpleadora,
        estado: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // ===============================
    // 1️⃣ OBTENER DATA
    // ===============================
    const whereEmpleado = this.filtroEmpleadoExport(
      idEmpresaEmpleadora,
      filtros,
    );

    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        ...filtroEvaluacionesVigentes(
          filtros.periodoEvaluacion ?? empresa.periodoEvaluacion,
        ),
        evaluado: whereEmpleado,
      },
      include: {
        evaluado: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
            codigoEmpleadoJefe: true,
            idUnidadOcupacionalEmpleadora: true,
          },
        },
        evaluador: {
          select: {
            idEmpleado: true,
            codigoEmpleado: true,
            codigoEmpleadoJefe: true,
          },
        },
        itemsEvaluados: {
          where: { estado: true },
          select: { calificacion: true },
        },
      },
    });

    const objetivos = await this.prisma.objetivo.findMany({
      where: {
        estado: true,
        empleado: whereEmpleado,
      },
      include: {
        empleado: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
            idUnidadOcupacionalEmpleadora: true,
          },
        },
        objetivoDetalles: {
          where: { estado: true },
          select: {
            porcentajeLogrado: true,
            pesoEspecifico: true,
          },
        },
      },
    });

    // ===============================
    // 2️⃣ AGRUPAR POR EMPLEADO
    // ===============================
    const empleados = new Map<number, any>();

    for (const ev of evaluaciones) {
      if (!ev.evaluado) continue;

      if (!empleados.has(ev.evaluado.idEmpleado)) {
        empleados.set(ev.evaluado.idEmpleado, {
          empleado: ev.evaluado,
          porCompetencia: new Map<number, NotasDeEvaluado>(),
          ...notasVacias(),
        });
      }

      const emp = empleados.get(ev.evaluado.idEmpleado);

      // `null` es sin evaluar: una evaluación abierta pero sin ninguna nota
      // puesta no entra al promedio.
      const nota = notaDeEvaluacion(ev.itemsEvaluados);
      if (nota === null) continue;

      const origen = origenDeEvaluacion({
        idEvaluado: ev.idEvaluado,
        idEvaluador: ev.idEvaluador,
        codigoEvaluado: ev.evaluado.codigoEmpleado,
        codigoEvaluador: ev.evaluador?.codigoEmpleado,
        codigoEmpleadoJefe: ev.evaluado.codigoEmpleadoJefe,
        codigoJefeDelEvaluador: ev.evaluador?.codigoEmpleadoJefe,
      });

      // Ni evaluado, ni jefe, ni a su cargo: fuera del modelo, no puntúa.
      if (origen === 'otro') continue;

      if (origen === 'auto') emp.autoEvaluaciones.push(nota);
      else if (origen === 'jefe') emp.evaluacionesJefe.push(nota);
      else emp.evaluacionesSubordinados.push(nota);

      // También por competencia: el resultado se promedia sobre las que tiene
      // ASIGNADAS su unidad, contando 0 las que nadie evaluó. Igual que el PDF
      // individual; promediando solo las evaluadas, evaluar una de cinco daba
      // el mismo resultado que evaluarlas las cinco con esa nota.
      if (!emp.porCompetencia.has(ev.idCompetencia)) {
        emp.porCompetencia.set(ev.idCompetencia, notasVacias());
      }

      const deCompetencia = emp.porCompetencia.get(ev.idCompetencia);

      if (origen === 'auto') deCompetencia.autoEvaluaciones.push(nota);
      else if (origen === 'jefe') deCompetencia.evaluacionesJefe.push(nota);
      else deCompetencia.evaluacionesSubordinados.push(nota);
    }

    // ===============================
    // 3️⃣ OBJETIVOS
    // ===============================
    for (const obj of objetivos) {
      // Quien tiene objetivos pero ninguna evaluación de competencias vigente
      // no estaba en el mapa —se llenaba solo recorriendo evaluaciones— y se
      // caía del reporte entero, con sus objetivos calificados y todo.
      if (!empleados.has(obj.empleado.idEmpleado)) {
        empleados.set(obj.empleado.idEmpleado, {
          empleado: obj.empleado,
          porCompetencia: new Map<number, NotasDeEvaluado>(),
          ...notasVacias(),
        });
      }

      const emp = empleados.get(obj.empleado.idEmpleado);

      // `null` cuando ninguno de sus detalles está calificado: antes entraba
      // como un 0 y hundía el promedio de quien no tenía nada puesto todavía.
      const resultado = resultadoDeObjetivo(obj.objetivoDetalles);
      if (resultado === null) continue;

      emp.objetivos.push(resultado);
    }

    // ===============================
    // PESOS
    // ===============================
    const jefePeso = (empresa.porcentajeEvaluacionJefeCompetencia ?? 0) / 100;
    const subordinadoPeso =
      (empresa.porcentajeEvaluacionSubordinadoCompetencia ?? 0) / 100;
    const competenciaPeso = (empresa.porcentajeCompetecias ?? 0) / 100;
    const objetivoPeso = (empresa.porcentajeObjetivos ?? 0) / 100;

    // ===============================
    // CREAR EXCEL
    // ===============================
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Resultados');

    sheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Empleado', key: 'empleado', width: 35 },
      { header: 'Autoevaluación', key: 'auto', width: 20 },
      // En 90° el reparto jefe/subordinado no se aplica: la nota del jefe vale
      // el 100 %. Imprimir "Evaluacion Jefe 60 %" ahí era una cifra falsa en
      // un reporte que alguien usa para decidir.
      {
        header:
          empresa.modeloEmpresa === '180'
            ? `Competencia Evaluacion Jefe ${jefePeso * 100} %`
            : 'Competencia Evaluacion Jefe 100 %',
        key: 'jefe',
        width: 35,
      },
      {
        header:
          empresa.modeloEmpresa === '180'
            ? `Competencia Evaluacion Subordinados ${subordinadoPeso * 100} %`
            : 'Competencia Evaluacion Subordinados (no aplica en 90°)',
        key: 'subordinados',
        width: 40,
      },
      {
        header: `Resultado Competencias ${competenciaPeso * 100} %`,
        key: 'competencias',
        width: 35,
      },
      {
        header: `Resultado Objetivos ${objetivoPeso * 100} %`,
        key: 'objetivos',
        width: 20,
      },
      { header: 'Resultado Final', key: 'final', width: 20 },
      { header: 'Observación', key: 'observacion', width: 45 },
    ];

    // ===============================
    // RESULTADOS
    // ===============================
    // Las competencias que le tocan a cada quien salen de su unidad
    // ocupacional. Una consulta para todas las unidades en juego, no una por
    // trabajador.
    const unidades = [
      ...new Set(
        [...empleados.values()]
          .map((e) => e.empleado.idUnidadOcupacionalEmpleadora)
          .filter((id): id is number => !!id),
      ),
    ];

    const asignadas = await this.prisma.unidadOcupacionalCompetenciaNivel.findMany(
      {
        where: {
          idUnidadOcupacionalEmpleadora: { in: unidades },
          competencia: { estado: true },
          competenciaNivel: { estado: true },
        },
        select: {
          idUnidadOcupacionalEmpleadora: true,
          idCompetencia: true,
        },
      },
    );

    const competenciasPorUnidad = new Map<number, number[]>();

    for (const a of asignadas) {
      const lista =
        competenciasPorUnidad.get(a.idUnidadOcupacionalEmpleadora) ?? [];
      lista.push(a.idCompetencia);
      competenciasPorUnidad.set(a.idUnidadOcupacionalEmpleadora, lista);
    }

    for (const emp of empleados.values()) {
      const base = this.calcularResultadosEmpleadoDesdeAgrupado(empresa, emp);

      // Mismo criterio que el PDF individual: se promedia sobre las asignadas,
      // contando 0 las que nadie evaluó.
      const deAsignadas = resultadoDeCompetenciasAsignadas(
        empresa,
        competenciasPorUnidad.get(
          emp.empleado.idUnidadOcupacionalEmpleadora,
        ) ?? [],
        emp.porCompetencia,
      );

      const r = {
        ...base,
        resultadoCompetencias: deAsignadas.resultado,
        competenciasSinEvaluar: deAsignadas.sinEvaluar,
        resultadoFinal: redondear(
          deAsignadas.resultado * (empresa.porcentajeCompetecias ?? 80) / 100 +
            base.promedioObjetivos *
              ((empresa.porcentajeObjetivos ?? 20) / 100),
          2,
        ),
      };

      r.sinEvaluar = r.competenciasSinEvaluar && r.objetivosSinEvaluar;

      // Celda vacía, no 0, cuando no hay nada evaluado. En una hoja de cálculo
      // el vacío es "sin dato" y el 0 es un cero: escribir 0 hacía que alguien
      // con la evaluación abierta y sin notas apareciera como un suspenso, y
      // además falseaba cualquier promedio hecho sobre la columna. Es lo mismo
      // que el PDF resuelve escribiendo "Sin evaluar".
      const oVacio = (valor: number, sinEvaluar: boolean) =>
        sinEvaluar ? null : valor;

      // Una competencia asignada y sin evaluar vale 0 y ese 0 cuenta, así que
      // la celda lleva el número. Lo que no se puede es dejarlo sin explicar:
      // la columna de observación dice por qué es 0, que es lo que separa "le
      // pusieron cero" de "nadie lo evaluó".
      const observaciones: string[] = [];

      if (deAsignadas.asignadas === 0) {
        observaciones.push('Su unidad no tiene competencias asignadas');
      } else if (deAsignadas.ningunaEvaluada) {
        observaciones.push(
          `${deAsignadas.asignadas} competencias sin evaluar, cuentan como 0`,
        );
      }

      if (r.objetivosSinEvaluar) observaciones.push('Objetivos sin evaluar');

      sheet.addRow({
        codigo: emp.empleado.codigoEmpleado,
        empleado: `${emp.empleado.nombres} ${emp.empleado.apellidos}`,
        auto: oVacio(r.promedioAuto, r.competenciasSinEvaluar),
        jefe: oVacio(r.promedioJefe, r.competenciasSinEvaluar),
        subordinados: oVacio(r.promedioSubordinados, r.competenciasSinEvaluar),
        // Mismo criterio que el PDF: el 0 de una competencia sin evaluar se
        // enseña —la observación explica por qué— y solo se deja en blanco a
        // quien no tiene absolutamente nada evaluado.
        competencias: oVacio(r.resultadoCompetencias, r.sinEvaluar),
        objetivos: oVacio(r.promedioObjetivos, r.objetivosSinEvaluar),
        final: oVacio(r.resultadoFinal, r.sinEvaluar),
        observacion: observaciones.join(' · '),
      });
    }

    return workbook;
  }

  // Competencias

  async exportarCompetenciasPorEmpresaExcel(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
  ) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: { idEmpresaEmpleadora, estado: true },
      select: { periodoEvaluacion: true },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        estado: true, // evaluación activa
        // Ambos criterios, igual que en el export de resultados: las anuladas
        // no cuentan y solo se exporta la campaña pedida.
        estadoEvaluacion: { not: 'ANULADA' },
        periodoEvaluacion: this.normalizarPeriodo(
          filtros.periodoEvaluacion ?? empresa.periodoEvaluacion,
        ),
        evaluado: {
          is: this.filtroEmpleadoExport(idEmpresaEmpleadora, filtros),
        },
        competencia: {
          estado: true,
        },
        nivel: {
          estado: true,
        },
      },
      include: {
        evaluado: {
          where: { estado: true },
          include: {
            empresaEmpleadora: true,
            areaEmpleadora: true,
            puestoEmpleadora: true,
            unidadOcupacionalEmpleadora: true,
            gerenciaEmpleadora: true,
          },
        },
        evaluador: {
          where: {
            estado: true, // evaluador activo
          },
        },
        competencia: true,
        nivel: true,
        itemsEvaluados: {
          where: { estado: true },
          include: {
            item: true,
          },
        },
      },
      orderBy: [
        { evaluado: { apellidos: 'asc' } },
        { competencia: { nombre: 'asc' } },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Competencias');

    sheet.columns = [
      { header: 'Empresa', key: 'empresa', width: 30 },
      { header: 'Codigo Empleado', key: 'codigoEmpleado', width: 35 },
      { header: 'Empleado', key: 'empleado', width: 35 },
      { header: 'Documento', key: 'documento', width: 15 },
      { header: 'Codigo Jefe', key: 'codigoJefe', width: 35 },
      { header: 'Evaluador', key: 'evaluador', width: 30 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Puesto', key: 'puesto', width: 25 },
      { header: 'Unidad', key: 'unidad', width: 25 },
      { header: 'Gerencia', key: 'gerencia', width: 25 },
      { header: 'Competencia', key: 'competencia', width: 30 },
      { header: 'Nivel', key: 'nivel', width: 10 },
      { header: 'Ítem Evaluado', key: 'item', width: 50 },
      { header: 'Calificación', key: 'calificacion', width: 15 },
    ];

    // evaluaciones.forEach((evaluacion) => {
    //   evaluacion.itemsEvaluados.forEach((item) => {
    //     sheet.addRow({
    //       empresa: evaluacion.evaluado?.empresaEmpleadora.nombreEmpresa,
    //       codigoEmpleado: evaluacion.evaluado?.codigoEmpleado,
    //       empleado: `${evaluacion.evaluado?.nombres} ${evaluacion.evaluado?.apellidos}`,
    //       documento: Number(evaluacion.evaluado?.documento),
    //       codigoJefe: evaluacion.evaluador
    //         ? evaluacion.evaluador?.codigoEmpleado
    //         : evaluacion.evaluado?.codigoEmpleado,
    //       evaluador: evaluacion.evaluador
    //         ? `${evaluacion.evaluador.nombres} ${evaluacion.evaluador.apellidos}`
    //         : 'Autoevaluación',
    //       area: evaluacion.evaluado?.areaEmpleadora.descripcion,
    //       puesto: evaluacion.evaluado?.puestoEmpleadora.descripcion,
    //       unidad: evaluacion.evaluado?.unidadOcupacionalEmpleadora.descripcion,
    //       gerencia: evaluacion.evaluado?.gerenciaEmpleadora.descripcion,
    //       competencia: evaluacion.competencia.titulo,
    //       nivel: evaluacion.nivel.nivel,
    //       item: item.textoItemEvaluado ?? item.item.enunciado,
    //       calificacion: item.calificacion,
    //     });
    //   });
    // });

    // TODO: solucion
    for (const evaluacion of evaluaciones) {
      for (const item of evaluacion.itemsEvaluados) {
        // ❗ Saltar si la calificación es null o undefined 10/03/2026
        // if (item.calificacion === null || item.calificacion === undefined) {
        //   continue;
        // }

        sheet.addRow({
          empresa: evaluacion.evaluado?.empresaEmpleadora?.nombreEmpresa,
          codigoEmpleado: evaluacion.evaluado?.codigoEmpleado,
          empleado: `${evaluacion.evaluado?.nombres} ${evaluacion.evaluado?.apellidos}`,
          documento: evaluacion.evaluado?.documento,
          codigoJefe:
            evaluacion.evaluador?.codigoEmpleado ??
            evaluacion.evaluado?.codigoEmpleado,
          evaluador: evaluacion.evaluador
            ? `${evaluacion.evaluador.nombres} ${evaluacion.evaluador.apellidos}`
            : 'Autoevaluación',
          area: evaluacion.evaluado?.areaEmpleadora?.descripcion,
          puesto: evaluacion.evaluado?.puestoEmpleadora?.descripcion,
          unidad: evaluacion.evaluado?.unidadOcupacionalEmpleadora?.descripcion,
          gerencia: evaluacion.evaluado?.gerenciaEmpleadora?.descripcion,
          competencia: evaluacion.competencia.titulo,
          nivel: evaluacion.nivel.nivel,
          item: item.textoItemEvaluado ?? item.item.enunciado,
          calificacion: item.calificacion,
        });
      }
    }

    return workbook;
  }

  async exportarObjetivosPorEmpresaExcel(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
  ) {
    const objetivos = await this.prisma.objetivo.findMany({
      where: {
        estado: true,
        empleado: this.filtroEmpleadoExport(idEmpresaEmpleadora, filtros),
      },
      include: {
        empleado: {
          include: {
            empresaEmpleadora: true,
            areaEmpleadora: true,
            puestoEmpleadora: true,
            unidadOcupacionalEmpleadora: true,
            gerenciaEmpleadora: true,
          },
        },
        objetivoDetalles: {
          where: { estado: true },
          orderBy: { secuencial: 'asc' },
        },
      },
      orderBy: [{ empleado: { apellidos: 'asc' } }],
    });

    /* ===============================
     1. Obtener códigos de jefes
     =============================== */
    const codigosJefe = [
      ...new Set(
        objetivos
          .map((o) => o.empleado.codigoEmpleadoJefe)
          .filter((code): code is string => code !== null),
      ),
    ];

    /* ===============================
     2. Buscar empleados evaluadores
     =============================== */
    const jefes = await this.prisma.empleado.findMany({
      where: {
        codigoEmpleado: { in: codigosJefe },
      },
      select: {
        codigoEmpleado: true,
        nombres: true,
        apellidos: true,
      },
    });

    /* ===============================
     3. Crear mapa de evaluadores
     =============================== */
    const evaluadorMap = new Map(
      jefes.map((j) => [j.codigoEmpleado, `${j.nombres} ${j.apellidos}`]),
    );

    /* ===============================
     4. Excel
     =============================== */
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Objetivos');

    sheet.columns = [
      { header: 'Empresa', key: 'empresa', width: 30 },
      { header: 'Código Empleado', key: 'codigoEmpleado', width: 20 },
      { header: 'Empleado', key: 'empleado', width: 35 },
      { header: 'Documento', key: 'documento', width: 15 },
      { header: 'Código Jefe', key: 'codigoJefe', width: 20 },
      { header: 'Evaluador', key: 'evaluador', width: 35 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Puesto', key: 'puesto', width: 25 },
      { header: 'Unidad', key: 'unidad', width: 25 },
      { header: 'Gerencia', key: 'gerencia', width: 25 },
      { header: 'Objetivo', key: 'objetivo', width: 40 },
      { header: 'Peso', key: 'peso', width: 10 },
      { header: 'Meta', key: 'meta', width: 12 },
      { header: 'Meta Alcanzada', key: 'metaAlcanzada', width: 15 },
      { header: '% Logrado', key: 'porcentaje', width: 12 },
      { header: 'Fecha Culminación', key: 'fecha', width: 18 },
    ];

    objetivos.forEach((obj) => {
      obj.objetivoDetalles.forEach((det) => {
        sheet.addRow({
          empresa: obj.empleado.empresaEmpleadora.nombreEmpresa,
          codigoEmpleado: obj.empleado.codigoEmpleado,
          empleado: `${obj.empleado.nombres} ${obj.empleado.apellidos}`,
          documento: Number(obj.empleado.documento),
          codigoJefe: obj.empleado.codigoEmpleadoJefe,
          evaluador: obj.empleado.codigoEmpleadoJefe
            ? evaluadorMap.get(obj.empleado.codigoEmpleadoJefe)
            : 'SIN JEFE',
          area: obj.empleado.areaEmpleadora.descripcion,
          puesto: obj.empleado.puestoEmpleadora.descripcion,
          unidad: obj.empleado.unidadOcupacionalEmpleadora.descripcion,
          gerencia: obj.empleado.gerenciaEmpleadora.descripcion,
          objetivo: det.descripcion,
          peso: det.pesoEspecifico,
          meta: det.metaObjetivo,
          metaAlcanzada: det.metaAlcanzada,
          porcentaje: det.porcentajeLogrado,
          fecha: det.fechaCulminacion,
        });
      });
    });

    return workbook;
  }
}
