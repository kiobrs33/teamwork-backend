import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class AreaEmpleadoraService {
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
      throw new InternalServerErrorException('No se pudo crear el área.');
    }
  }

  async findAll() {
    try {
      const areas = await this.prisma.areaEmpleadora.findMany({
        include: { empresaEmpleadora: true },
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return areas;
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
        where: { idAreaEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!area) {
        throw new NotFoundException('Área no encontrada');
      }

      return area;
    } catch (error) {
      console.error('Error al obtener el área:', error);
      throw new InternalServerErrorException('No se pudo obtener el área.');
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
      throw new InternalServerErrorException('No se pudo actualizar el área.');
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
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error al eliminar el área:', error);
      throw new InternalServerErrorException('No se pudo eliminar el área.');
    }
  }
}
