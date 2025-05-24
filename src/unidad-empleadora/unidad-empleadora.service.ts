import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUnidadEmpleadoraDto } from './dto/create-unidad-empleadora.dto';
import { UpdateUnidadEmpleadoraDto } from './dto/update-unidad-empleadora.dto';

@Injectable()
export class UnidadEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateUnidadEmpleadoraDto) {
    try {
      const unidad = await this.prisma.unidadEmpleadora.create({
        data: {
          ...dto,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });
      return unidad;
    } catch (error) {
      console.error('Error al crear unidad:', error);
      throw new InternalServerErrorException('No se pudo crear la unidad.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.unidadEmpleadora.findMany({
        include: { empresaEmpleadora: true },
      });
    } catch (error) {
      console.error('Error al obtener unidades:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las unidades.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const unidad = await this.prisma.unidadEmpleadora.findUnique({
        where: { idUnidadEmpleadora: id },
        include: { empresaEmpleadora: true },
      });

      if (!unidad || !unidad.estado) {
        throw new NotFoundException('Unidad no encontrada');
      }

      return unidad;
    } catch (error) {
      console.error('Error al obtener la unidad:', error);
      throw new InternalServerErrorException('No se pudo obtener la unidad.');
    }
  }

  async update(user: any, id: number, dto: UpdateUnidadEmpleadoraDto) {
    try {
      const unidad = await this.prisma.unidadEmpleadora.findUnique({
        where: { idUnidadEmpleadora: id },
      });

      if (!unidad || !unidad.estado) {
        throw new NotFoundException('Unidad no encontrada');
      }

      return await this.prisma.unidadEmpleadora.update({
        where: { idUnidadEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.id,
        },
      });
    } catch (error) {
      console.error('Error al actualizar la unidad:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la unidad.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const unidad = await this.prisma.unidadEmpleadora.findUnique({
        where: { idUnidadEmpleadora: id },
      });

      if (!unidad || !unidad.estado) {
        throw new NotFoundException('Unidad no encontrada');
      }

      return await this.prisma.unidadEmpleadora.update({
        where: { idUnidadEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.id,
        },
      });
    } catch (error) {
      console.error('Error al eliminar la unidad:', error);
      throw new InternalServerErrorException('No se pudo eliminar la unidad.');
    }
  }
}
