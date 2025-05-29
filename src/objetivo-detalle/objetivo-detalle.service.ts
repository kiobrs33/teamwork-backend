import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateObjetivoDetalleDto } from './dto/create-objetivo-detalle.dto';
import { UpdateObjetivoDetalleDto } from './dto/update-objetivo-detalle.dto';

@Injectable()
export class ObjetivoDetalleService {
  private readonly logger = new Logger(ObjetivoDetalleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(user: any, dto: CreateObjetivoDetalleDto) {
    try {
      const objetivoDetalle = await this.prisma.objetivoDetalle.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
          fechaCreacion: new Date(),
          estado: true,
        },
      });
      return objetivoDetalle;
    } catch (error) {
      this.logger.error('Error al crear objetivo detalle:', error);
      throw new InternalServerErrorException(
        'No se pudo crear el objetivo detalle.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.objetivoDetalle.findMany({
        where: { estado: true },
        orderBy: { idObjetivoDetalle: 'desc' },
      });
    } catch (error) {
      this.logger.error('Error al obtener objetivos detalle:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los objetivos detalle.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const objetivoDetalle = await this.prisma.objetivoDetalle.findFirst({
        where: { idObjetivoDetalle: id, estado: true },
      });
      if (!objetivoDetalle) {
        throw new NotFoundException(
          `Objetivo detalle con ID ${id} no encontrado.`,
        );
      }
      return objetivoDetalle;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Error al obtener objetivo detalle con ID ${id}:`,
        error,
      );
      throw new InternalServerErrorException(
        'No se pudo obtener el objetivo detalle.',
      );
    }
  }

  async update(user: any, id: number, dto: UpdateObjetivoDetalleDto) {
    try {
      const exist = await this.prisma.objetivoDetalle.findFirst({
        where: { idObjetivoDetalle: id, estado: true },
        select: { idObjetivoDetalle: true },
      });
      if (!exist) {
        throw new NotFoundException(
          `Objetivo detalle con ID ${id} no encontrado.`,
        );
      }

      const updated = await this.prisma.objetivoDetalle.update({
        where: { idObjetivoDetalle: id },
        data: {
          ...dto,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });

      return updated;
    } catch (error) {
      this.logger.error(
        `Error al actualizar objetivo detalle con ID ${id}:`,
        error,
      );
      throw new InternalServerErrorException(
        'No se pudo actualizar el objetivo detalle.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const exist = await this.prisma.objetivoDetalle.findUnique({
        where: { idObjetivoDetalle: id },
      });
      if (!exist || !exist.estado) {
        throw new NotFoundException(
          `Objetivo detalle con ID ${id} no encontrado.`,
        );
      }

      const removed = await this.prisma.objetivoDetalle.update({
        where: { idObjetivoDetalle: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });

      return removed;
    } catch (error) {
      this.logger.error(
        `Error al eliminar objetivo detalle con ID ${id}:`,
        error,
      );
      throw new InternalServerErrorException(
        'No se pudo eliminar el objetivo detalle.',
      );
    }
  }
}
