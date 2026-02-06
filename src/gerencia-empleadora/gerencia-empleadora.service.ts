import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGerenciaEmpleadoraDto } from './dto/create-gerencia-empleadora.dto';
import { UpdateGerenciaEmpleadoraDto } from './dto/update-gerencia-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { GerenciaQueryDto } from './dto/gerencia-query.dto';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

@Injectable()
export class GerenciaEmpleadoraService {
  private readonly logger = new Logger(GerenciaEmpleadoraService.name);
  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateGerenciaEmpleadoraDto) {
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return gerencia;
    } catch (error) {
      console.error('Error al crear gerencia:', error);
      handlePrismaError(error, 'gerencia empleadora');
    }
  }

  async findAll({ page, limit, search }: GerenciaQueryDto) {
    try {
      const where: Prisma.GerenciaEmpleadoraWhereInput = {
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

      const include: Prisma.AreaEmpleadoraInclude = {
        empresaEmpleadora: true,
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.gerenciaEmpleadora.findMany({
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
        this.prisma.gerenciaEmpleadora.count({ where }),
        this.prisma.gerenciaEmpleadora.findMany({
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
      handlePrismaError(error, 'gerencia empleadora');
    }
  }

  async findOne(id: number) {
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
        where: { idGerenciaEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!gerencia) {
        throw new NotFoundException('Gerencia no encontrada');
      }

      return gerencia;
    } catch (error) {
      console.error('Error al obtener la gerencia:', error);
      handlePrismaError(error, 'gerencia empleadora');
    }
  }

  async update(user: AuthUser, id: number, dto: UpdateGerenciaEmpleadoraDto) {
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
        where: { idGerenciaEmpleadora: id, estado: true },
      });

      if (!gerencia) {
        throw new NotFoundException('Gerencia no encontrada');
      }

      return await this.prisma.gerenciaEmpleadora.update({
        where: { idGerenciaEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
    } catch (error) {
      console.error('Error al actualizar la gerencia:', error);
      handlePrismaError(error, 'gerencia empleadora');
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
        where: { idGerenciaEmpleadora: id, estado: true },
      });

      if (!gerencia) {
        throw new NotFoundException('Gerencia no encontrada');
      }

      return await this.prisma.gerenciaEmpleadora.update({
        where: { idGerenciaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al eliminar la gerencia:', error);
      handlePrismaError(error, 'gerencia empleadora');
    }
  }

  async importData(user: AuthUser, data: CreateGerenciaEmpleadoraDto[]) {
    try {
      const registros = data.map((row) => ({
        descripcion: row.descripcion,
        idEmpresaEmpleadora: row.idEmpresaEmpleadora,
        creadoPorId: user.idUsuario,
      }));

      return await this.prisma.$transaction(async (tx) => {
        return await tx.gerenciaEmpleadora.createMany({
          data: registros,
        });
      });
    } catch (error) {
      console.error('Error al importar datos:', error);
      handlePrismaError(error, 'gerencia empleadora');
    }
  }

  async findByEmpresaId(id: number) {
    try {
      return await this.prisma.gerenciaEmpleadora.findMany({
        where: {
          estado: true,
          idEmpresaEmpleadora: id,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener gerencias por empresa:', error);
      handlePrismaError(error, 'gerencia empleadora');
    }
  }
}
