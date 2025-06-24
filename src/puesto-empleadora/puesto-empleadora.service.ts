import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePuestoEmpleadoraDto } from './dto/create-puesto-empleadora.dto';
import { UpdatePuestoEmpleadoraDto } from './dto/update-puesto-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class PuestoEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreatePuestoEmpleadoraDto) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.create({
        data: {
          ...dto,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });
      return puesto;
    } catch (error) {
      console.error('Error al crear puesto:', error);
      throw new InternalServerErrorException('No se pudo crear el puesto.');
    }
  }

  async findAll() {
    try {
      const puestos = await this.prisma.puestoEmpleadora.findMany({
        include: { empresaEmpleadora: true },
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return puestos;
    } catch (error) {
      console.error('Error al obtener puestos:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los puestos.',
      );
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
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error al obtener el puesto:', error);
      throw new InternalServerErrorException('No se pudo obtener el puesto.');
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
      });
    } catch (error) {
      console.error('Error al actualizar el puesto:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar el puesto.',
      );
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
      throw new InternalServerErrorException('No se pudo eliminar el puesto.');
    }
  }
}
