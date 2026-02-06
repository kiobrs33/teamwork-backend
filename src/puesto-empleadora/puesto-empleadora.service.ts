import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePuestoEmpleadoraDto } from './dto/create-puesto-empleadora.dto';
import { UpdatePuestoEmpleadoraDto } from './dto/update-puesto-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Prisma } from '@prisma/client';
import { PuestoQueryDto } from './dto/puesto-query.dto';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

@Injectable()
export class PuestoEmpleadoraService {
  private readonly logger = new Logger(PuestoEmpleadoraService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreatePuestoEmpleadoraDto) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return puesto;
    } catch (error) {
      console.error('Error al crear puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  // async findAll() {
  //   try {
  //     const puestos = await this.prisma.puestoEmpleadora.findMany({
  //       include: { empresaEmpleadora: true },
  //       where: { estado: true },
  //       orderBy: {
  //         fechaCreacion: 'desc',
  //       },
  //     });
  //     return puestos;
  //   } catch (error) {
  //     console.error('Error al obtener puestos:', error);
  //     throw new InternalServerErrorException(
  //       'No se pudieron obtener los puestos.',
  //     );
  //   }
  // }

  async findAll({ page, limit, search }: PuestoQueryDto) {
    try {
      const where: Prisma.PuestoEmpleadoraWhereInput = {
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

      const include: Prisma.PuestoEmpleadoraInclude = {
        empresaEmpleadora: true,
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.puestoEmpleadora.findMany({
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
        this.prisma.puestoEmpleadora.count({ where }),
        this.prisma.puestoEmpleadora.findMany({
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
      this.logger.error('Error al obtener los puestos:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async findOne(id: number) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.findUnique({
        where: { idPuestoEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!puesto) {
        throw new NotFoundException('Puesto no encontrado');
      }

      return puesto;
    } catch (error) {
      console.error('Error al obtener el puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async update(user: AuthUser, id: number, dto: UpdatePuestoEmpleadoraDto) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.findUnique({
        where: { idPuestoEmpleadora: id, estado: true },
      });

      if (!puesto) {
        throw new NotFoundException('Puesto no encontrado');
      }

      return await this.prisma.puestoEmpleadora.update({
        where: { idPuestoEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
    } catch (error) {
      console.error('Error al actualizar el puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.findUnique({
        where: { idPuestoEmpleadora: id, estado: true },
      });

      if (!puesto) {
        throw new NotFoundException('Puesto no encontrado');
      }

      return await this.prisma.puestoEmpleadora.update({
        where: { idPuestoEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al eliminar el puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async importData(user: AuthUser, data: CreatePuestoEmpleadoraDto[]) {
    try {
      const registros = data.map((row) => ({
        descripcion: row.descripcion,
        idEmpresaEmpleadora: row.idEmpresaEmpleadora,
        creadoPorId: user.idUsuario,
      }));

      return await this.prisma.$transaction(async (tx) => {
        return await tx.puestoEmpleadora.createMany({
          data: registros,
        });
      });
    } catch (error) {
      console.error('Error al importar datos:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async findByEmpresaId(id: number) {
    try {
      return await this.prisma.puestoEmpleadora.findMany({
        where: {
          estado: true,
          idEmpresaEmpleadora: id,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener puestos por empresa:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }
}
