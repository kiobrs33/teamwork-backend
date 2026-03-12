import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateRetroalimentacionDetalleDto } from './dto/create-retroalimentacion-detalle.dto';
import { UpdateRetroalimentacionDetalleDto } from './dto/update-retroalimentacion-detalle.dto';
import { UpdateRetroalimentacionDetalleItemDto } from './dto/update-retroalimentacion-detalle-item.dto';

import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';
import { CreateRetroalimentacionDetalleItemDto } from './dto/create-retroalimentacion-detalle-item.dto';

@Injectable()
export class RetroalimentacionDetalleService {
  private readonly logger = new Logger(RetroalimentacionDetalleService.name);

  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE
  // =========================

  async create(user: AuthUser, dto: CreateRetroalimentacionDetalleDto) {
    try {
      return await this.prisma.retroalimentacionDetalle.create({
        data: {
          ...dto,
          actualizadoPorId: user.idUsuario,
        },
        include: {
          objetivo: true,
        },
      });
    } catch (error) {
      this.logger.error('Error al crear retroalimentación', error);
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  // =========================
  // FIND ALL
  // =========================

  async findAll(page = 1, limit = 10, search?: string) {
    try {
      const where: Prisma.RetroalimentacionDetalleWhereInput = {
        estado: true,
        ...(search && {
          OR: [
            {
              descripcionObjetivo: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              descripcionActividad: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              descripcionEstado: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      };

      const include: Prisma.RetroalimentacionDetalleInclude = {
        objetivo: true,
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.retroalimentacionDetalle.findMany({
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
        this.prisma.retroalimentacionDetalle.count({ where }),
        this.prisma.retroalimentacionDetalle.findMany({
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
      this.logger.error('Error al obtener retroalimentaciones', error);
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  // =========================
  // FIND ONE
  // =========================

  async findOne(id: number) {
    try {
      const data = await this.prisma.retroalimentacionDetalle.findUnique({
        where: {
          idRetroalimentacionDetalle: id,
          estado: true,
        },
        include: {
          objetivo: true,
        },
      });

      if (!data) {
        throw new NotFoundException('Retroalimentación no encontrada');
      }

      return data;
    } catch (error) {
      this.logger.error('Error al obtener retroalimentación', error);
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  // =========================
  // UPDATE
  // =========================

  async update(
    user: AuthUser,
    id: number,
    dto: UpdateRetroalimentacionDetalleDto,
  ) {
    try {
      const existe = await this.prisma.retroalimentacionDetalle.findUnique({
        where: {
          idRetroalimentacionDetalle: id,
          estado: true,
        },
      });

      if (!existe) {
        throw new NotFoundException('Retroalimentación no encontrada');
      }

      return await this.prisma.retroalimentacionDetalle.update({
        where: {
          idRetroalimentacionDetalle: id,
        },
        data: {
          ...dto,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
        include: {
          objetivo: true,
        },
      });
    } catch (error) {
      this.logger.error('Error al actualizar retroalimentación', error);
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  // =========================
  // DELETE (soft)
  // =========================

  async remove(user: AuthUser, id: number) {
    try {
      const existe = await this.prisma.retroalimentacionDetalle.findUnique({
        where: {
          idRetroalimentacionDetalle: id,
          estado: true,
        },
      });

      if (!existe) {
        throw new NotFoundException('Retroalimentación no encontrada');
      }

      return await this.prisma.retroalimentacionDetalle.update({
        where: {
          idRetroalimentacionDetalle: id,
        },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error al eliminar retroalimentación', error);
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  // =========================
  // IMPORT
  // =========================

  async importData(user: AuthUser, data: CreateRetroalimentacionDetalleDto[]) {
    try {
      const registros = data.map((row) => ({
        ...row,
        actualizadoPorId: user.idUsuario,
      }));

      return await this.prisma.retroalimentacionDetalle.createMany({
        data: registros,
      });
    } catch (error) {
      this.logger.error('Error al importar datos', error);
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  // =========================
  // FIND BY OBJETIVO
  // =========================

  // async findByObjetivoId(idObjetivo: number) {
  //   try {
  //     return await this.prisma.retroalimentacionDetalle.findMany({
  //       where: {
  //         estado: true,
  //         idObjetivo,
  //       },
  //       orderBy: {
  //         fechaCreacion: 'desc',
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error('Error al obtener por objetivo', error);
  //     handlePrismaError(error, 'retroalimentación detalle');
  //   }
  // }

  // =========================
  // CREATE MANY
  // =========================

  async createMany(
    user: AuthUser,
    idObjetivo: number,
    detalles: CreateRetroalimentacionDetalleItemDto[],
  ) {
    try {
      const data = detalles.map((d) => ({
        ...d,
        idObjetivo,
        actualizadoPorId: user.idUsuario,
      }));

      return await this.prisma.retroalimentacionDetalle.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  // =========================
  // UPDATE MANY (PRO)
  // =========================

  async updateMany(
    user: AuthUser,
    idObjetivo: number,
    detalles: UpdateRetroalimentacionDetalleItemDto[],
  ) {
    try {
      const existentes = await this.prisma.retroalimentacionDetalle.findMany({
        where: {
          idObjetivo,
          estado: true,
        },
      });

      const idsExistentes = existentes.map((d) => d.idRetroalimentacionDetalle);

      const idsRecibidos = detalles
        .filter((d) => d.idRetroalimentacionDetalle)
        .map((d) => d.idRetroalimentacionDetalle);

      const eliminar = idsExistentes.filter((id) => !idsRecibidos.includes(id));

      return await this.prisma.$transaction(async (tx) => {
        // eliminar

        if (eliminar.length > 0) {
          await tx.retroalimentacionDetalle.updateMany({
            where: {
              idRetroalimentacionDetalle: {
                in: eliminar,
              },
            },
            data: {
              estado: false,
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        }

        // create / update

        for (const item of detalles) {
          if (item.idRetroalimentacionDetalle) {
            const { idRetroalimentacionDetalle, ...data } = item;

            await tx.retroalimentacionDetalle.update({
              where: {
                idRetroalimentacionDetalle,
              },
              data: {
                ...data,
                actualizadoPorId: user.idUsuario,
                fechaModificacion: new Date(),
              },
            });
          } else {
            await tx.retroalimentacionDetalle.create({
              data: {
                ...item,
                idObjetivo,
                actualizadoPorId: user.idUsuario,
              },
            });
          }
        }

        return {
          message: 'Retroalimentaciones actualizadas correctamente',
        };
      });
    } catch (error) {
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }

  async findByObjetivoId(idObjetivo: number) {
    try {
      const objetivo = await this.prisma.objetivo.findUnique({
        where: {
          idObjetivo,
        },
      });

      if (!objetivo) {
        throw new NotFoundException(`No existe objetivo con id ${idObjetivo}`);
      }

      const data = await this.prisma.retroalimentacionDetalle.findMany({
        where: {
          idObjetivo,
          estado: true,
        },
        orderBy: {
          idRetroalimentacionDetalle: 'asc',
        },
      });

      return data;
    } catch (error) {
      handlePrismaError(error, 'retroalimentación detalle');
    }
  }
}
