import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Prisma } from '@prisma/client';
import { AreaQueryDto } from './dto/area-query.dto';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

@Injectable()
export class AreaEmpleadoraService {
  private readonly logger = new Logger(AreaEmpleadoraService.name);
  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateAreaEmpleadoraDto) {
    try {
      const area = await this.prisma.areaEmpleadora.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return area;
    } catch (error) {
      console.error('Error al crear área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async findAll({ page, limit, search }: AreaQueryDto) {
    try {
      const where: Prisma.AreaEmpleadoraWhereInput = {
        estado: true,
        ...(search && {
          OR: [
            { descripcion: { contains: search, mode: 'insensitive' } },
            {
              empresaEmpleadora: {
                nombreEmpresa: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        }),
      };

      const include: Prisma.AreaEmpleadoraInclude = {
        empresaEmpleadora: true,
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.areaEmpleadora.findMany({
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
        this.prisma.areaEmpleadora.count({ where }),
        this.prisma.areaEmpleadora.findMany({
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
      handlePrismaError(error, 'area empleadora');
    }
  }

  async findOne(id: number) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!area) {
        throw new NotFoundException('Área no encontrada');
      }

      return area;
    } catch (error) {
      console.error('Error al obtener el área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async update(user: AuthUser, id: number, dto: UpdateAreaEmpleadoraDto) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id, estado: true },
      });

      if (!area) {
        throw new NotFoundException('Área no encontrada');
      }

      const updatedArea = await this.prisma.areaEmpleadora.update({
        where: { idAreaEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return updatedArea;
    } catch (error) {
      console.error('Error al actualizar el área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id, estado: true },
      });

      if (!area) {
        throw new NotFoundException('Área no encontrada');
      }

      const deletedArea = await this.prisma.areaEmpleadora.update({
        where: { idAreaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
      return deletedArea;
    } catch (error) {
      console.error('Error al eliminar el área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async importData(user: AuthUser, data: CreateAreaEmpleadoraDto[]) {
    try {
      const registros = data.map((row) => ({
        descripcion: row.descripcion,
        idEmpresaEmpleadora: row.idEmpresaEmpleadora,
        creadoPorId: user.idUsuario,
      }));

      return await this.prisma.$transaction(async (tx) => {
        return await tx.areaEmpleadora.createMany({
          data: registros,
        });
      });
    } catch (error) {
      console.error('Error al importar datos:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async findByEmpresaId(id: number) {
    try {
      return await this.prisma.areaEmpleadora.findMany({
        where: {
          estado: true,
          idEmpresaEmpleadora: id,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener areas por empresa:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }
}
