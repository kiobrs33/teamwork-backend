import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGerenciaEmpleadoraDto } from './dto/create-gerencia-empleadora.dto';
import { UpdateGerenciaEmpleadoraDto } from './dto/update-gerencia-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class GerenciaEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateGerenciaEmpleadoraDto) {
    console.log(user);
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
        },
      });
      return gerencia;
    } catch (error) {
      console.error('Error al crear gerencia:', error);
      throw new InternalServerErrorException('No se pudo crear la gerencia.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.gerenciaEmpleadora.findMany({
        include: { empresaEmpleadora: true },
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener gerencias:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las gerencias.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
        where: { idGerenciaEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!gerencia) {
        throw new NotFoundException('Gerencia no encontrada');
      }

      return gerencia;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al obtener la gerencia:', error);
      throw new InternalServerErrorException('No se pudo obtener la gerencia.');
    }
  }

  async update(user: AuthUser, id: number, dto: UpdateGerenciaEmpleadoraDto) {
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
        where: { idGerenciaEmpleadora: id, estado: true },
      });

      if (!gerencia) {
        throw new NotFoundException('Gerencia no encontrada');
      }

      return await this.prisma.gerenciaEmpleadora.update({
        where: { idGerenciaEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al actualizar la gerencia:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la gerencia.',
      );
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
        where: { idGerenciaEmpleadora: id, estado: true },
      });

      if (!gerencia) {
        throw new NotFoundException('Gerencia no encontrada');
      }

      return await this.prisma.gerenciaEmpleadora.update({
        where: { idGerenciaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al eliminar la gerencia:', error);
      throw new InternalServerErrorException(
        'No se pudo eliminar la gerencia.',
      );
    }
  }
}
