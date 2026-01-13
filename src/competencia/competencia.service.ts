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

@Injectable()
export class CompetenciaService {
  private readonly logger = new Logger(CompetenciaService.name);

  constructor(private prisma: PrismaService) {}

  // ======================================================
  //                 GET ALL COMPETENCIAS
  // ======================================================
  async findAll() {
    try {
      return await this.prisma.competencia.findMany({
        where: { estado: true },
        orderBy: { fechaCreacion: 'desc' },
        include: {
          niveles: {
            include: { items: true },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error al obtener competencias:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las competencias.',
      );
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
      throw new InternalServerErrorException(
        'No se pudo obtener la competencia.',
      );
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
      throw new InternalServerErrorException(
        'Error al actualizar la competencia',
      );
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
      throw new InternalServerErrorException(
        'No se pudo eliminar la competencia.',
      );
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
      throw new InternalServerErrorException(
        'No se pudo crear la competencia.',
      );
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
      throw new InternalServerErrorException('Error al importar los datos.');
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
      throw new InternalServerErrorException(
        'No se pudieron obtener las unidades ocupacionales.',
      );
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
        data: nivel.items.map((it) => ({
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
      throw new InternalServerErrorException('Error al iniciar la evaluación.');
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
      throw new InternalServerErrorException(
        'Error al actualizar la evaluación.',
      );
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
}
