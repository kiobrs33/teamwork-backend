import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUnidadOcupacionalEmpleadoraDto } from './dto/create-unidad-ocupacional-empleadora.dto';
import { UpdateUnidadOcupacionalEmpleadoraDto } from './dto/update-unidad-ocupacional-empleadora.dto';

@Injectable()
export class UnidadOcupacionalEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateUnidadOcupacionalEmpleadoraDto) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.create({
        data: {
          ...dto,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });
      return unidad;
    } catch (error) {
      console.error('Error al crear unidad ocupacional:', error);
      throw new InternalServerErrorException(
        'No se pudo crear la unidad ocupacional.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.unidadOcupacionalEmpleadora.findMany({
        include: { empresaEmpleadora: true },
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener unidades ocupacionales:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las unidades ocupacionales.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id },
        include: { empresaEmpleadora: true },
      });

      if (!unidad || !unidad.estado) {
        throw new NotFoundException('Unidad ocupacional no encontrada');
      }

      return unidad;
    } catch (error) {
      console.error('Error al obtener la unidad ocupacional:', error);
      throw new InternalServerErrorException(
        'No se pudo obtener la unidad ocupacional.',
      );
    }
  }

  async update(
    user: any,
    id: number,
    dto: UpdateUnidadOcupacionalEmpleadoraDto,
  ) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id },
      });

      if (!unidad || !unidad.estado) {
        throw new NotFoundException('Unidad ocupacional no encontrada');
      }

      return await this.prisma.unidadOcupacionalEmpleadora.update({
        where: { idUnidadOcupacionalEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al actualizar la unidad ocupacional:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la unidad ocupacional.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id },
      });

      if (!unidad || !unidad.estado) {
        throw new NotFoundException('Unidad ocupacional no encontrada');
      }

      return await this.prisma.unidadOcupacionalEmpleadora.update({
        where: { idUnidadOcupacionalEmpleadora: id },
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

      console.error('Error al eliminar la unidad ocupacional:', error);
      throw new InternalServerErrorException(
        'No se pudo eliminar la unidad ocupacional.',
      );
    }
  }
}
