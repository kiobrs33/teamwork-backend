import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpresaEmpleadoraDto } from './dto/create-empresa-empleadora.dto';
import { UpdateEmpresaEmpleadoraDto } from './dto/update-empresa-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { EmpresaQueryDto } from './dto/empresa-query.dto';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

@Injectable()
export class EmpresaEmpleadoraService {
  private readonly logger = new Logger(EmpresaEmpleadoraService.name);
  constructor(private prisma: PrismaService) {}

  // CREATE
  async create(user: AuthUser, dto: CreateEmpresaEmpleadoraDto) {
    try {
      // ✅ Validar RUC único si viene
      if (dto.ruc) {
        const exists = await this.prisma.empresaEmpleadora.findUnique({
          where: { ruc: dto.ruc },
          select: { idEmpresaEmpleadora: true },
        });

        if (exists) {
          throw new BadRequestException(
            'Ya existe una empresa registrada con este RUC',
          );
        }
      }

      return await this.prisma.empresaEmpleadora.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al crear empresa:', error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }

  // FIND ALL
  async findAll({ page, limit, search }: EmpresaQueryDto) {
    try {
      const where: Prisma.EmpresaEmpleadoraWhereInput = {
        estado: true,
        ...(search && {
          OR: [
            { nombreEmpresa: { contains: search, mode: 'insensitive' } },
            { ruc: { contains: search } },
            { modeloEmpresa: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.empresaEmpleadora.findMany({
          where,
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
        this.prisma.empresaEmpleadora.count({ where }),
        this.prisma.empresaEmpleadora.findMany({
          where,
          skip,
          take: safeLimit,
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
      this.logger.error('Error al obtener los puestos:', error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }

  // FIND ONE
  async findOne(id: number) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: {
        idEmpresaEmpleadora: id,
        estado: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  // UPDATE
  async update(user: AuthUser, id: number, dto: UpdateEmpresaEmpleadoraDto) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      return await this.prisma.empresaEmpleadora.update({
        where: { idEmpresaEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }

  // REMOVE (soft delete)
  async remove(user: AuthUser, id: number) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      return await this.prisma.empresaEmpleadora.update({
        where: { idEmpresaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      handlePrismaError(error, 'empresa empleadora');
    }
  }
}
