import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEquipoEmpleadoraDto } from './dto/create-equipo-empleadora.dto';
import { UpdateEquipoEmpleadoraDto } from './dto/update-equipo-empleadora.dto';

@Injectable()
export class EquipoEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateEquipoEmpleadoraDto) {
    try {
      const equipo = await this.prisma.equipoEmpleadora.create({
        data: {
          ...dto,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });
      return equipo;
    } catch (error) {
      console.error('Error al crear equipo:', error);
      throw new InternalServerErrorException('No se pudo crear el equipo.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.equipoEmpleadora.findMany({
        include: { empresaEmpleadora: true },
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los equipos.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const equipo = await this.prisma.equipoEmpleadora.findUnique({
        where: { idEquipoEmpleadora: id },
        include: { empresaEmpleadora: true },
      });

      if (!equipo || !equipo.estado) {
        throw new NotFoundException('Equipo no encontrado');
      }

      return equipo;
    } catch (error) {
      console.error('Error al obtener el equipo:', error);
      throw new InternalServerErrorException('No se pudo obtener el equipo.');
    }
  }

  async update(user: any, id: number, dto: UpdateEquipoEmpleadoraDto) {
    try {
      const equipo = await this.prisma.equipoEmpleadora.findUnique({
        where: { idEquipoEmpleadora: id },
      });

      if (!equipo || !equipo.estado) {
        throw new NotFoundException('Equipo no encontrado');
      }

      return await this.prisma.equipoEmpleadora.update({
        where: { idEquipoEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al actualizar el equipo:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar el equipo.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const equipo = await this.prisma.equipoEmpleadora.findUnique({
        where: { idEquipoEmpleadora: id },
      });

      if (!equipo || !equipo.estado) {
        throw new NotFoundException('Equipo no encontrado');
      }

      return await this.prisma.equipoEmpleadora.update({
        where: { idEquipoEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error al eliminar el equipo:', error);
      throw new InternalServerErrorException('No se pudo eliminar el equipo.');
    }
  }
}
