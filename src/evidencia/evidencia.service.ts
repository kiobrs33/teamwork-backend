import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { EvidenciaQueryDto } from './dto/evidencia-query.dto';

import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class EvidenciaService {
  private readonly logger = new Logger(EvidenciaService.name);

  constructor(private prisma: PrismaService) {}

  // 📌 CREATE
  async create(
    user: AuthUser,
    dto: CreateEvidenciaDto,
    url: string,
    publicId: string,
    file: any,
  ) {
    try {
      // 🔴 VALIDACIÓN IMPORTANTE
      if (dto.idEvaluacionCompetencia && dto.idObjetivo) {
        throw new BadRequestException(
          'No puedes asociar evidencia a evaluación y objetivo al mismo tiempo',
        );
      }

      return await this.prisma.evidencia.create({
        data: {
          idEmpleado: dto.idEmpleado,
          idEvaluacionCompetencia: dto.idEvaluacionCompetencia,
          idObjetivo: dto.idObjetivo,

          nombreArchivo: file.originalname,
          urlArchivo: url,
          publicId: publicId,
          tipoArchivo: file.mimetype,

          creadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      this.logger.error('Error al crear evidencia', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  // 📌 FIND ALL (igual a tu lógica)
  async findAll({ page, limit, idEmpleado }: EvidenciaQueryDto) {
    try {
      const where: any = {
        estado: true,
        ...(idEmpleado && { idEmpleado }),
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.evidencia.findMany({
          where,
          include: {
            empleado: true,
            evaluacion: true,
            objetivo: true,
          },
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
        this.prisma.evidencia.count({ where }),
        this.prisma.evidencia.findMany({
          where,
          skip,
          take: safeLimit,
          include: {
            empleado: true,
            evaluacion: true,
            objetivo: true,
          },
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
      this.logger.error('Error al listar evidencias', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  async findByEmpleado(idEmpleado: number) {
    try {
      return await this.prisma.evidencia.findMany({
        where: {
          idEmpleado,
          estado: true,
        },

        select: {
          idEvidencia: true,
          nombreArchivo: true,
          urlArchivo: true,
          tipoArchivo: true,
          fechaCreacion: true,
        },

        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Error obteniendo evidencias por empleado', error);

      handlePrismaError(error, 'evidencia');
    }
  }

  // 📌 FIND ONE
  async findOne(id: number) {
    try {
      const evidencia = await this.prisma.evidencia.findFirst({
        where: {
          idEvidencia: id,
          estado: true,
        },
        include: {
          empleado: true,
          evaluacion: true,
          objetivo: true,
        },
      });

      if (!evidencia) {
        throw new NotFoundException('Evidencia no encontrada');
      }

      return evidencia;
    } catch (error) {
      this.logger.error('Error al obtener evidencia', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  // 📌 REMOVE (soft delete + eliminar cloudinary)
  async remove(user: AuthUser, id: number) {
    try {
      const evidencia = await this.prisma.evidencia.findFirst({
        where: {
          idEvidencia: id,
          estado: true,
        },
      });

      if (!evidencia) {
        throw new NotFoundException('Evidencia no encontrada');
      }

      // 🔴 BORRAR EN CLOUDINARY
      if (evidencia.publicId) {
        await cloudinary.uploader.destroy(evidencia.publicId, {
          resource_type: 'auto',
        });
      }

      return await this.prisma.evidencia.update({
        where: { idEvidencia: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error al eliminar evidencia', error);
      handlePrismaError(error, 'evidencia');
    }
  }
}
