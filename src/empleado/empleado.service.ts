import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadoService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateEmpleadoDto) {
    try {
      const empleado = await this.prisma.empleado.create({
        data: {
          ...dto,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });
      return empleado;
    } catch (error) {
      console.error('Error al crear empleado:', error);
      throw new InternalServerErrorException('No se pudo crear al empleado.');
    }
  }

  async findAll() {
    try {
      const empleados = await this.prisma.empleado.findMany({
        include: {
          empresaEmpleadora: true,
          equipoEmpleadora: true,
          puestoEmpleadora: true,
          unidadEmpleadora: true,
          usuario: true,
          objetivo: true,
        },
      });
      return empleados;
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los empleados.',
      );
    }
  }

  async findOne(id: number) {
    try {
      console.log('ID', id);
      const empleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id },
        include: {
          empresaEmpleadora: true,
          equipoEmpleadora: true,
          puestoEmpleadora: true,
          unidadEmpleadora: true,
          usuario: true,
          objetivo: true,
        },
      });

      if (!empleado || !empleado.estado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      return empleado;
    } catch (error) {
      console.error('Error al obtener al empleado:', error);
      throw new InternalServerErrorException('No se pudo obtener al empleado.');
    }
  }

  async update(user: any, id: number, dto: UpdateEmpleadoDto) {
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id },
      });

      if (!existEmpleado || !existEmpleado.estado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      const updated = await this.prisma.empleado.update({
        where: { idEmpleado: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.id,
        },
      });

      return updated;
    } catch (error) {
      console.error('Error al actualizar al empleado:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar al empleado.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id },
      });

      if (!existEmpleado || !existEmpleado.estado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      const removed = await this.prisma.empleado.update({
        where: { idEmpleado: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.id,
        },
      });

      return removed;
    } catch (error) {
      console.error('Error al eliminar al empleado:', error);
      throw new InternalServerErrorException(
        'No se pudo eliminar al empleado.',
      );
    }
  }
}
