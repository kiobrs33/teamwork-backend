import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';

@Injectable()
export class AreaEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateAreaEmpleadoraDto) {
    try {
      const area = await this.prisma.areaEmpleadora.create({
        data: {
          ...dto,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });
      return area;
    } catch (error) {
      console.error('Error al crear área:', error);
      throw new InternalServerErrorException('No se pudo crear el área.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.areaEmpleadora.findMany({
        include: { empresaEmpleadora: true },
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener áreas:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las áreas.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id },
        include: { empresaEmpleadora: true },
      });

      if (!area || !area.estado) {
        throw new NotFoundException('Área no encontrada');
      }

      return area;
    } catch (error) {
      console.error('Error al obtener el área:', error);
      throw new InternalServerErrorException('No se pudo obtener el área.');
    }
  }

  async update(user: any, id: number, dto: UpdateAreaEmpleadoraDto) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id },
      });

      if (!area || !area.estado) {
        throw new NotFoundException('Área no encontrada');
      }

      return await this.prisma.areaEmpleadora.update({
        where: { idAreaEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al actualizar el área:', error);
      throw new InternalServerErrorException('No se pudo actualizar el área.');
    }
  }

  async remove(user: any, id: number) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id },
      });

      if (!area || !area.estado) {
        throw new NotFoundException('Área no encontrada');
      }

      return await this.prisma.areaEmpleadora.update({
        where: { idAreaEmpleadora: id },
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

      console.error('Error al eliminar el área:', error);
      throw new InternalServerErrorException('No se pudo eliminar el área.');
    }
  }
}
