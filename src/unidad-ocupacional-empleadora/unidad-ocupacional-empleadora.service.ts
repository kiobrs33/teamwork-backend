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

@Injectable()
export class UnidadOcupacionalEmpleadoraService {
  private readonly logger = new Logger(UnidadOcupacionalEmpleadoraService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateUnidadOcupacionalEmpleadoraDto) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.create({
        data: {
          ...dto,
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
          OR: [
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
        throw new NotFoundException('Unidad ocupacional no encontrada');
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
        throw new NotFoundException('Unidad ocupacional no encontrada');
      }

      const updatedUnidad =
        await this.prisma.unidadOcupacionalEmpleadora.update({
          where: { idUnidadOcupacionalEmpleadora: id },
          data: {
            ...dto,
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
        throw new NotFoundException('Unidad ocupacional no encontrada');
      }

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
      const registros = data.map((row) => ({
        descripcion: row.descripcion,
        idEmpresaEmpleadora: row.idEmpresaEmpleadora,
        creadoPorId: user.idUsuario,
      }));

      return await this.prisma.$transaction(async (tx) => {
        return await tx.unidadOcupacionalEmpleadora.createMany({
          data: registros,
        });
      });
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
      throw new BadRequestException('Debe enviar al menos una unidad.');
    }

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
        (a) => nivelPorCompetencia.get(a.idCompetencia) !== a.idCompetenciaNivel,
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
      throw new BadRequestException('Debe enviar al menos una unidad.');
    }

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
            `La unidad ocupacional ${idUnidadOcupacionalEmpleadora} no existe.`,
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

    if (!unidad) throw new NotFoundException('Unidad no encontrada.');

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
        orderBy: { fechaCreacion: 'desc' },
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
          },
        },
        orderBy: { fechaCreacion: 'desc' },
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
          OR: [
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
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Unidades Ocupacionales');

      worksheet.columns = [
        {
          header: 'ID Unidad Ocupacional',
          key: 'idUnidadOcupacionalEmpleadora',
          width: 20,
        },
        {
          header: 'Descripción',
          key: 'descripcion',
          width: 40,
        },
        {
          header: 'ID Empresa',
          key: 'idEmpresaEmpleadora',
          width: 20,
        },
        {
          header: 'Empresa',
          key: 'empresa',
          width: 50,
        },
      ];

      unidades.forEach((item) => {
        worksheet.addRow({
          idUnidadOcupacionalEmpleadora: item.idUnidadOcupacionalEmpleadora,
          descripcion: item.descripcion,
          idEmpresaEmpleadora: item.idEmpresaEmpleadora,
          empresa: item.empresaEmpleadora.nombreEmpresa,
        });
      });

      worksheet.getRow(1).font = {
        bold: true,
      };

      worksheet.autoFilter = {
        from: 'A1',
        to: 'D1',
      };

      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      handlePrismaError(error, 'unidad ocupacional');
    }
  }
}
