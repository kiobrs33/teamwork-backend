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
import { Prisma } from '@prisma/client';
import { styleText } from 'util';

@Injectable()
export class CompetenciaService {
  private readonly logger = new Logger(CompetenciaService.name);

  constructor(private prisma: PrismaService) {}

  async findAll({ page, limit, search }: CompetenciaQueryDto) {
    try {
      const where: Prisma.CompetenciaWhereInput = {
        estado: true,
        ...(search && {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { titulo: { contains: search, mode: 'insensitive' } },
            { codigo: { contains: search, mode: 'insensitive' } },
            {
              empresaEmpleadora: {
                nombreEmpresa: { contains: search, mode: 'insensitive' },
                ruc: { contains: search, mode: 'insensitive' },
              },
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
        // 1. Actualizar competencia
        await tx.competencia.update({
          where: { idCompetencia: id },
          data: {
            nombre: dto.nombre,
            titulo: dto.titulo,
            codigo: dto.codigo,
            idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
            actualizadoPorId: user.idUsuario,
            fechaModificacion: new Date(),
          },
        });

        // 2. Eliminar niveles e items previos
        await tx.competenciaNivelItem.deleteMany({
          where: { nivel: { idCompetencia: id } },
        });

        await tx.competenciaNivel.deleteMany({
          where: { idCompetencia: id },
        });

        // 3. Crear los nuevos niveles e items
        for (const nivel of niveles) {
          const nuevoNivel = await tx.competenciaNivel.create({
            data: {
              idCompetencia: id,
              nivel: nivel.nivel,
              creadoPorId: user.idUsuario,
            },
          });

          await tx.competenciaNivelItem.createMany({
            data: nivel.items.map((item, index) => ({
              idCompetenciaNivel: nuevoNivel.idCompetenciaNivel,
              enunciado: item.enunciado,
              secuencial: index + 1,
              creadoPorId: user.idUsuario,
            })),
          });
        }

        return await tx.competencia.findUnique({
          where: { idCompetencia: id },
          include: {
            niveles: { include: { items: true } },
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

      return await this.prisma.competencia.update({
        where: { idCompetencia: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
          niveles: {
            updateMany: {
              where: { idCompetencia: id },
              data: { estado: false },
            },
          },
        },
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
  //                  INICIAR EVALUACIÓN
  // ======================================================
  async iniciarEvaluacion(user: AuthUser, dto: IniciarEvaluacionDto) {
    const { idEvaluado, idEvaluador, idCompetencia, idCompetenciaNivel } = dto;

    try {
      // 1) Buscar una evaluación en PROCESO
      let evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
        where: {
          idEvaluado,
          idEvaluador,
          idCompetencia,
          idCompetenciaNivel,
          estadoEvaluacion: 'PROCESO',
          estado: true,
        },
        include: {
          itemsEvaluados: { include: { item: true } },
        },
      });

      if (evaluacion) return evaluacion;

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
          estadoEvaluacion: 'PROCESO',
          creadoPorId: user.idUsuario,
        },
        include: {
          itemsEvaluados: { include: { item: true } },
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
        itemsEvaluados: { include: { item: true } },
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

        // 2) Actualizar calificación por ítem
        for (const it of dto.items) {
          await tx.evaluacionCompetenciaItem.update({
            where: {
              idEvaluacionCompetenciaItem: it.idEvaluacionCompetenciaItem,
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
            itemsEvaluados: { include: { item: true } },
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

  // async empleadosEvaluadosPorEmpresa(idEmpresaEmpleadora: number) {
  //   const empleados = await this.prisma.evaluacionCompetencia.findMany({
  //     where: {
  //       estado: true,
  //       idEvaluado: { not: null },
  //       evaluado: {
  //         idEmpresaEmpleadora,
  //         estado: true,
  //       },
  //     },
  //     distinct: ['idEvaluado'],
  //     select: {
  //       evaluado: {
  //         select: {
  //           idEmpleado: true,
  //           nombres: true,
  //           apellidos: true,
  //           codigoEmpleado: true,
  //         },
  //       },
  //     },
  //   });

  //   return {
  //     total: empleados.length,
  //     empleados: empleados.map((e) => e.evaluado),
  //   };
  // }

  // async empleadosEvaluadosPorEmpresa(idEmpresaEmpleadora: number) {
  //   const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
  //     where: {
  //       estado: true,
  //       idEvaluado: { not: null },
  //       evaluado: {
  //         idEmpresaEmpleadora,
  //         estado: true,
  //       },
  //     },
  //     include: {
  //       evaluado: {
  //         select: {
  //           idEmpleado: true,
  //           nombres: true,
  //           apellidos: true,
  //           codigoEmpleado: true,
  //         },
  //       },
  //       evaluador: {
  //         select: {
  //           idEmpleado: true,
  //           nombres: true,
  //           apellidos: true,
  //           codigoEmpleado: true,
  //         },
  //       },
  //       competencia: {
  //         select: {
  //           idCompetencia: true,
  //           nombre: true,
  //         },
  //       },
  //       nivel: {
  //         select: {
  //           idCompetenciaNivel: true,
  //           nivel: true,
  //         },
  //       },
  //       itemsEvaluados: {
  //         select: {
  //           calificacion: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       fechaCreacion: 'desc',
  //     },
  //   });

  //   // ======================================================
  //   // AGRUPAR POR EMPLEADO EVALUADO
  //   // ======================================================
  //   const map = new Map<number, any>();

  //   for (const ev of evaluaciones) {
  //     const totalItems = ev.itemsEvaluados.length;
  //     const itemsCalificados = ev.itemsEvaluados.filter(
  //       (i) => i.calificacion !== null && i.calificacion > 0,
  //     ).length;

  //     const nivelCalificado = itemsCalificados > 0;

  //     // Determinar tipo de evaluador
  //     let tipoEvaluador = 'SIN EVALUADOR';
  //     if (ev.idEvaluador && ev.idEvaluador === ev.idEvaluado) {
  //       tipoEvaluador = 'AUTOEVALUACIÓN';
  //     } else if (ev.idEvaluador) {
  //       tipoEvaluador = 'OTRO EVALUADOR';
  //     }

  //     const evaluacionDetalle = {
  //       evaluacionId: ev.idEvaluacionCompetencia,

  //       evaluador: ev.evaluador
  //         ? {
  //             idEmpleado: ev.evaluador.idEmpleado,
  //             nombres: ev.evaluador.nombres,
  //             apellidos: ev.evaluador.apellidos,
  //             codigoEmpleado: ev.evaluador.codigoEmpleado,
  //             tipo: tipoEvaluador,
  //           }
  //         : null,

  //       competencia: ev.competencia,

  //       nivel: ev.nivel,

  //       nivelCalificado,

  //       detalleCalificacion: {
  //         totalItems,
  //         itemsCalificados,
  //         itemsSinCalificar: totalItems - itemsCalificados,
  //       },

  //       estadoEvaluacion: ev.estadoEvaluacion,
  //       fechaEvaluacion: ev.fechaCreacion,
  //     };

  //     // Agrupar por evaluado
  //     if (ev.evaluado && !map.has(ev.evaluado.idEmpleado)) {
  //       map.set(ev.evaluado.idEmpleado, {
  //         evaluado: ev.evaluado,
  //         evaluaciones: [],
  //       });
  //     }

  //     if (ev.evaluado) {
  //       map.get(ev.evaluado.idEmpleado).evaluaciones.push(evaluacionDetalle);
  //     }
  //   }

  //   const resultado = Array.from(map.values());

  //   return {
  //     totalEmpleadosEvaluados: resultado.length,
  //     empleados: resultado,
  //   };
  // }

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
      const itemsCalificados = ev.itemsEvaluados.filter(
        (i) => i.calificacion !== null && i.calificacion > 0,
      ).length;

      const nivelCalificado = itemsCalificados > 0;

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

  // async exportarResultadosEmpresaExcel(idEmpresaEmpleadora: number) {
  //   const empresa = await this.prisma.empresaEmpleadora.findFirst({
  //     where: {
  //       idEmpresaEmpleadora,
  //       estado: true,
  //     },
  //   });

  //   if (!empresa) {
  //     throw new NotFoundException('Empresa no encontrada');
  //   }

  //   // ===============================
  //   // 1️⃣ OBTENER DATA
  //   // ===============================
  //   const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
  //     where: {
  //       estado: true,
  //       evaluado: {
  //         idEmpresaEmpleadora,
  //         estado: true,
  //       },
  //     },
  //     include: {
  //       evaluado: {
  //         select: {
  //           idEmpleado: true,
  //           nombres: true,
  //           apellidos: true,
  //           codigoEmpleado: true,
  //           codigoEmpleadoJefe: true, // 🔴 clave
  //         },
  //       },
  //       evaluador: {
  //         select: {
  //           idEmpleado: true,
  //           codigoEmpleado: true, // 🔴 clave
  //         },
  //       },
  //       itemsEvaluados: {
  //         where: { estado: true },
  //         select: { calificacion: true },
  //       },
  //     },
  //   });

  //   const objetivos = await this.prisma.objetivo.findMany({
  //     where: {
  //       estado: true,
  //       empleado: {
  //         idEmpresaEmpleadora,
  //         estado: true,
  //       },
  //     },
  //     include: {
  //       empleado: {
  //         select: {
  //           idEmpleado: true,
  //           nombres: true,
  //           apellidos: true,
  //           codigoEmpleado: true,
  //         },
  //       },
  //       objetivoDetalles: {
  //         where: { estado: true },
  //         select: {
  //           porcentajeLogrado: true,
  //           pesoEspecifico: true,
  //         },
  //       },
  //     },
  //   });

  //   // ===============================
  //   // 2️⃣ AGRUPAR POR EMPLEADO
  //   // ===============================
  //   const empleados = new Map<number, any>();

  //   for (const ev of evaluaciones) {
  //     if (!ev.evaluado) continue;

  //     if (!empleados.has(ev.evaluado.idEmpleado)) {
  //       empleados.set(ev.evaluado.idEmpleado, {
  //         empleado: ev.evaluado,
  //         evaluacionesJefe: [],
  //         evaluacionesSubordinados: [],
  //         autoEvaluaciones: [],
  //         objetivos: [],
  //       });
  //     }

  //     const calificaciones = ev.itemsEvaluados
  //       .map((i) => i.calificacion)
  //       .filter((n) => n !== null) as number[];

  //     const promedioEvaluacion =
  //       calificaciones.length > 0
  //         ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length
  //         : 0;

  //     const emp = empleados.get(ev.evaluado.idEmpleado);

  //     // ===============================
  //     // AUTOEVALUACIÓN
  //     // ===============================
  //     if (ev.idEvaluador === ev.idEvaluado) {
  //       emp.autoEvaluaciones.push(promedioEvaluacion);
  //       continue;
  //     }

  //     // ===============================
  //     // JEFE
  //     // ===============================
  //     const codigoJefe = ev.evaluado.codigoEmpleadoJefe;

  //     if (
  //       codigoJefe &&
  //       ev.evaluador &&
  //       ev.evaluador.codigoEmpleado === codigoJefe
  //     ) {
  //       emp.evaluacionesJefe.push(promedioEvaluacion);
  //       continue;
  //     }

  //     // ===============================
  //     // SUBORDINADOS
  //     // ===============================
  //     emp.evaluacionesSubordinados.push(promedioEvaluacion);
  //   }

  //   // ===============================
  //   // 3️⃣ OBJETIVOS
  //   // ===============================
  //   for (const obj of objetivos) {
  //     const emp = empleados.get(obj.empleado.idEmpleado);
  //     if (!emp) continue;

  //     let totalPeso = 0;
  //     let acumulado = 0;

  //     for (const det of obj.objetivoDetalles) {
  //       if (det.porcentajeLogrado !== null) {
  //         acumulado += det.porcentajeLogrado * det.pesoEspecifico;
  //         totalPeso += det.pesoEspecifico;
  //       }
  //     }

  //     const porcentajeObjetivo = totalPeso > 0 ? acumulado / totalPeso : 0;
  //     emp.objetivos.push(porcentajeObjetivo);
  //   }

  //   // ===============================
  //   // PESOS
  //   // ===============================
  //   const jefePeso = (empresa.porcentajeEvaluacionJefeCompetencia ?? 0) / 100;
  //   const subordinadoPeso =
  //     (empresa.porcentajeEvaluacionSubordinadoCompetencia ?? 0) / 100;
  //   const competenciaPeso = (empresa.porcentajeCompetecias ?? 0) / 100;
  //   const objetivoPeso = (empresa.porcentajeObjetivos ?? 0) / 100;

  //   // ===============================
  //   // CREAR EXCEL
  //   // ===============================
  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet('Resultados');

  //   sheet.columns = [
  //     { header: 'Código', key: 'codigo', width: 15 },
  //     { header: 'Empleado', key: 'empleado', width: 35 },
  //     { header: 'Autoevaluación', key: 'auto', width: 20 },
  //     {
  //       header: `Competencia Evaluacion Jefe ${jefePeso * 100} %`,
  //       key: 'jefe',
  //       width: 35,
  //     },
  //     {
  //       header: `Competencia Evaluacion Subordinados ${subordinadoPeso * 100} %`,
  //       key: 'subordinados',
  //       width: 40,
  //     },
  //     {
  //       header: `Resultado Competencias ${competenciaPeso * 100} %`,
  //       key: 'competencias',
  //       width: 35,
  //     },
  //     {
  //       header: `Resultado Objetivos ${objetivoPeso * 100} %`,
  //       key: 'objetivos',
  //       width: 20,
  //     },
  //     { header: 'Resultado Final', key: 'final', width: 20 },
  //   ];

  //   // ===============================
  //   // RESULTADOS
  //   // ===============================
  //   for (const emp of empleados.values()) {
  //     const avg = (arr: number[]) =>
  //       arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  //     const promedioAuto = avg(emp.autoEvaluaciones);
  //     const promedioJefe = avg(emp.evaluacionesJefe);
  //     const promedioSubordinados = avg(emp.evaluacionesSubordinados);

  //     let resultadoCompetencias = 0;

  //     if (empresa.modeloEmpresa === '90') {
  //       resultadoCompetencias = promedioJefe;
  //     }

  //     if (empresa.modeloEmpresa === '180') {
  //       const tieneSub = emp.evaluacionesSubordinados.length > 0;

  //       if (!tieneSub) {
  //         resultadoCompetencias = promedioJefe;
  //       } else {
  //         resultadoCompetencias =
  //           promedioJefe * jefePeso + promedioSubordinados * subordinadoPeso;
  //       }
  //     }

  //     const promedioObjetivos = avg(emp.objetivos);

  //     const resultadoFinal =
  //       resultadoCompetencias * competenciaPeso +
  //       promedioObjetivos * objetivoPeso;

  //     sheet.addRow({
  //       codigo: emp.empleado.codigoEmpleado,
  //       empleado: `${emp.empleado.nombres} ${emp.empleado.apellidos}`,
  //       auto: Number(promedioAuto.toFixed(2)),
  //       jefe: Number(promedioJefe.toFixed(2)),
  //       subordinados: Number(promedioSubordinados.toFixed(2)),
  //       competencias: Number(resultadoCompetencias.toFixed(2)),
  //       objetivos: Number(promedioObjetivos.toFixed(2)),
  //       final: Number(resultadoFinal.toFixed(2)),
  //     });
  //   }

  //   return workbook;
  // }

  async exportarResultadosEmpresaExcel(idEmpresaEmpleadora: number) {
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
    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        estado: true,
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
            codigoEmpleadoJefe: true,
          },
        },
        evaluador: {
          select: {
            idEmpleado: true,
            codigoEmpleado: true,
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
        empleado: {
          idEmpresaEmpleadora,
          estado: true,
        },
      },
      include: {
        empleado: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
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
          evaluacionesJefe: [],
          evaluacionesSubordinados: [],
          autoEvaluaciones: [],
          objetivos: [],
        });
      }

      const emp = empleados.get(ev.evaluado.idEmpleado);

      // =====================================
      // FILTRAR NULL / UNDEFINED CALIFICACIONES
      // =====================================
      const calificaciones: number[] = [];

      for (const item of ev.itemsEvaluados) {
        if (item.calificacion === null || item.calificacion === undefined) {
          continue;
        }

        calificaciones.push(item.calificacion);
      }

      if (calificaciones.length === 0) {
        continue;
      }

      const promedioEvaluacion =
        calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;

      // =====================================
      // AUTOEVALUACIÓN
      // =====================================
      if (ev.idEvaluador === ev.idEvaluado) {
        emp.autoEvaluaciones.push(promedioEvaluacion);
        continue;
      }

      // =====================================
      // IDENTIFICAR JEFE
      // =====================================
      const codigoJefe = ev.evaluado.codigoEmpleadoJefe;

      if (
        codigoJefe &&
        ev.evaluador &&
        ev.evaluador.codigoEmpleado === codigoJefe
      ) {
        emp.evaluacionesJefe.push(promedioEvaluacion);
        continue;
      }

      // =====================================
      // SUBORDINADOS
      // =====================================
      emp.evaluacionesSubordinados.push(promedioEvaluacion);
    }

    // ===============================
    // 3️⃣ OBJETIVOS
    // ===============================
    for (const obj of objetivos) {
      const emp = empleados.get(obj.empleado.idEmpleado);
      if (!emp) continue;

      let totalPeso = 0;
      let acumulado = 0;

      for (const det of obj.objetivoDetalles) {
        if (
          det.porcentajeLogrado === null ||
          det.porcentajeLogrado === undefined
        )
          continue;

        acumulado += det.porcentajeLogrado * det.pesoEspecifico;
        totalPeso += det.pesoEspecifico;
      }

      const porcentajeObjetivo = totalPeso > 0 ? acumulado / totalPeso : 0;

      emp.objetivos.push(porcentajeObjetivo);
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
      {
        header: `Competencia Evaluacion Jefe ${jefePeso * 100} %`,
        key: 'jefe',
        width: 35,
      },
      {
        header: `Competencia Evaluacion Subordinados ${subordinadoPeso * 100} %`,
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
    ];

    // ===============================
    // RESULTADOS
    // ===============================
    for (const emp of empleados.values()) {
      const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const promedioAuto = avg(emp.autoEvaluaciones);
      const promedioJefe = avg(emp.evaluacionesJefe);
      const promedioSubordinados = avg(emp.evaluacionesSubordinados);

      let resultadoCompetencias = 0;

      if (empresa.modeloEmpresa === '90') {
        resultadoCompetencias = promedioJefe;
      }

      if (empresa.modeloEmpresa === '180') {
        const tieneSub = emp.evaluacionesSubordinados.length > 0;

        if (!tieneSub) {
          resultadoCompetencias = promedioJefe;
        } else {
          resultadoCompetencias =
            promedioJefe * jefePeso + promedioSubordinados * subordinadoPeso;
        }
      }

      const promedioObjetivos = avg(emp.objetivos);

      const resultadoFinal =
        resultadoCompetencias * competenciaPeso +
        promedioObjetivos * objetivoPeso;

      sheet.addRow({
        codigo: emp.empleado.codigoEmpleado,
        empleado: `${emp.empleado.nombres} ${emp.empleado.apellidos}`,
        auto: Number(promedioAuto.toFixed(2)),
        jefe: Number(promedioJefe.toFixed(2)),
        subordinados: Number(promedioSubordinados.toFixed(2)),
        competencias: Number(resultadoCompetencias.toFixed(2)),
        objetivos: Number(promedioObjetivos.toFixed(2)),
        final: Number(resultadoFinal.toFixed(2)),
      });
    }

    return workbook;
  }

  // Competencias
  async exportarCompetenciasPorEmpresaExcel(idEmpresaEmpleadora: number) {
    // const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
    //   where: {
    //     estado: true,
    //     // estadoEvaluacion: 'PROCESO',
    //     evaluado: {
    //       idEmpresaEmpleadora,
    //     },
    //   },
    //   include: {
    //     evaluado: {
    //       where: { estado: true }, // FILTRO AQUÍ PARA SOLO INCLUIR EMPLEADOS ACTIVOS
    //       include: {
    //         empresaEmpleadora: true,
    //         areaEmpleadora: true,
    //         puestoEmpleadora: true,
    //         unidadOcupacionalEmpleadora: true,
    //         gerenciaEmpleadora: true,
    //       },
    //     },
    //     evaluador: {
    //       where: { estado: true }, // FILTRO AQUÍ PARA SOLO INCLUIR EVALUADORES ACTIVOS
    //     },
    //     competencia: true,
    //     nivel: true,
    //     itemsEvaluados: {
    //       where: { estado: true }, // FILTRO AQUÍ PARA SOLO INCLUIR ÍTEMS ACTIVOS
    //       include: {
    //         item: true,
    //       },
    //     },
    //   },
    //   orderBy: [
    //     { evaluado: { apellidos: 'asc' } },
    //     { competencia: { nombre: 'asc' } },
    //   ],
    // });

    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        estado: true, // evaluación activa
        evaluado: {
          is: {
            estado: true, // 👈 empleado activo
            idEmpresaEmpleadora,
          },
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

    console.log('COMPETENCIAS', evaluaciones);

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

  // async exportarObjetivosPorEmpresaExcel(idEmpresaEmpleadora: number) {
  //   const objetivos = await this.prisma.objetivo.findMany({
  //     where: {
  //       estado: true,
  //       empleado: {
  //         idEmpresaEmpleadora,
  //       },
  //     },
  //     include: {
  //       empleado: {
  //         include: {
  //           empresaEmpleadora: true,
  //           areaEmpleadora: true,
  //           puestoEmpleadora: true,
  //           unidadOcupacionalEmpleadora: true,
  //           gerenciaEmpleadora: true,
  //         },
  //       },
  //       objetivoDetalles: {
  //         where: { estado: true },
  //         orderBy: { secuencial: 'asc' },
  //       },
  //     },
  //     orderBy: [{ empleado: { apellidos: 'asc' } }],
  //   });

  //   const workbook = new ExcelJS.Workbook();
  //   const sheet = workbook.addWorksheet('Objetivos');

  //   sheet.columns = [
  //     { header: 'Empresa', key: 'empresa', width: 30 },
  //     { header: 'Codigo Empleado', key: 'codigoEmpleado', width: 35 }, //
  //     { header: 'Empleado', key: 'empleado', width: 35 },
  //     { header: 'Documento', key: 'documento', width: 15 },
  //     { header: 'Codigo Jefe', key: 'codigoJefe', width: 35 }, //
  //     // { header: 'Evaluador', key: 'evaluador', width: 30 }, // FALTA ESTO
  //     { header: 'Área', key: 'area', width: 25 },
  //     { header: 'Puesto', key: 'puesto', width: 25 },
  //     { header: 'Unidad', key: 'unidad', width: 25 },
  //     { header: 'Gerencia', key: 'gerencia', width: 25 },
  //     { header: 'Objetivo', key: 'objetivo', width: 40 },
  //     { header: 'Peso', key: 'peso', width: 10 },
  //     { header: 'Meta', key: 'meta', width: 12 },
  //     { header: 'Meta Alcanzada', key: 'metaAlcanzada', width: 15 },
  //     { header: '% Logrado', key: 'porcentaje', width: 12 },
  //     { header: 'Fecha Culminación', key: 'fecha', width: 18 },
  //   ];

  //   objetivos.forEach((obj) => {
  //     obj.objetivoDetalles.forEach((det) => {
  //       sheet.addRow({
  //         empresa: obj.empleado.empresaEmpleadora.nombreEmpresa,
  //         codigoEmpleado: obj.empleado.codigoEmpleado,
  //         empleado: `${obj.empleado.nombres} ${obj.empleado.apellidos}`,
  //         documento: obj.empleado.documento,
  //         codigoJefe: obj.empleado.codigoEmpleadoJefe,
  //         area: obj.empleado.areaEmpleadora.descripcion,
  //         puesto: obj.empleado.puestoEmpleadora.descripcion,
  //         unidad: obj.empleado.unidadOcupacionalEmpleadora.descripcion,
  //         gerencia: obj.empleado.gerenciaEmpleadora.descripcion,
  //         objetivo: det.descripcion,
  //         peso: det.pesoEspecifico,
  //         meta: det.metaObjetivo,
  //         metaAlcanzada: det.metaAlcanzada,
  //         porcentaje: det.porcentajeLogrado,
  //         fecha: det.fechaCulminacion,
  //       });
  //     });
  //   });

  //   return workbook;
  // }

  async exportarObjetivosPorEmpresaExcel(idEmpresaEmpleadora: number) {
    const objetivos = await this.prisma.objetivo.findMany({
      where: {
        estado: true,
        empleado: {
          idEmpresaEmpleadora,
        },
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

    console.log('CODIGOS JEFE', codigosJefe);

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

    console.log('JEFES', jefes);

    /* ===============================
     3. Crear mapa de evaluadores
     =============================== */
    const evaluadorMap = new Map(
      jefes.map((j) => [j.codigoEmpleado, `${j.nombres} ${j.apellidos}`]),
    );

    console.log('EVALUDOR MAP', evaluadorMap);

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
