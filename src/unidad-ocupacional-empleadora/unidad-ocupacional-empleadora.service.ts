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

  async findAll({ page, limit, search }: UnidadOcupacionalQueryDto) {
    try {
      const where: Prisma.UnidadOcupacionalEmpleadoraWhereInput = {
        estado: true,
        ...(search && {
          OR: [
            { descripcion: { contains: search, mode: 'insensitive' } },
            {
              empresaEmpleadora: {
                nombreEmpresa: { contains: search, mode: 'insensitive' },
                ruc: { contains: search, mode: 'insensitive' },
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
   * Método interno para asignar competencias a una unidad ocupacional.
   * BORRA todas las asignaciones previas y CREA las nuevas.
   */
  // TODO: Agregar validacion, para cuando empiece la evaluacion ya no se permita CAMBIAR LAS ASIGNACIONES
  private async asignarCompetenciasInterno(
    user: AuthUser,
    data: UnidadCompetenciaAsignacionDto[],
  ) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new BadRequestException('Debe enviar al menos una unidad.');
    }

    await this.prisma.$transaction(async (tx) => {
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

        // 2. BORRAR todas las asignaciones previas de la unidad
        await tx.unidadOcupacionalCompetenciaNivel.deleteMany({
          where: { idUnidadOcupacionalEmpleadora },
        });

        // 3. Preparar nuevas asignaciones
        const nuevasAsignaciones = competencias.map((comp) => ({
          idUnidadOcupacionalEmpleadora,
          idCompetencia: comp.idCompetencia,
          idCompetenciaNivel: comp.idCompetenciaNivel,
        }));

        // 4. Crear en lote TODAS las nuevas asignaciones
        if (nuevasAsignaciones.length > 0) {
          await tx.unidadOcupacionalCompetenciaNivel.createMany({
            data: nuevasAsignaciones,
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
}
