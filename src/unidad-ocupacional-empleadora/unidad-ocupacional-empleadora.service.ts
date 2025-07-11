import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUnidadOcupacionalEmpleadoraDto } from './dto/create-unidad-ocupacional-empleadora.dto';
import { UpdateUnidadOcupacionalEmpleadoraDto } from './dto/update-unidad-ocupacional-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { AsignarCompetenciasLoteDto } from './dto/asignar-competencias-a-unidad-ocupacional-empleadora.dto';
import { CreateGerenciaEmpleadoraDto } from 'src/gerencia-empleadora/dto/create-gerencia-empleadora.dto';

@Injectable()
export class UnidadOcupacionalEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateUnidadOcupacionalEmpleadoraDto) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
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
      const unidades = await this.prisma.unidadOcupacionalEmpleadora.findMany({
        include: { empresaEmpleadora: true },
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return unidades;
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
        where: { idUnidadOcupacionalEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!unidad) {
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
    user: AuthUser,
    id: number,
    dto: UpdateUnidadOcupacionalEmpleadoraDto,
  ) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id, estado: true },
      });

      if (!unidad) {
        throw new NotFoundException('Unidad ocupacional no encontrada');
      }

      const updatedUnidad =
        await this.prisma.unidadOcupacionalEmpleadora.update({
          where: { idUnidadOcupacionalEmpleadora: id },
          data: {
            ...dto,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
          },
          include: { empresaEmpleadora: true },
        });
      return updatedUnidad;
    } catch (error) {
      console.error('Error al actualizar la unidad ocupacional:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la unidad ocupacional.',
      );
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
        where: { idUnidadOcupacionalEmpleadora: id, estado: true },
      });

      if (!unidad) {
        throw new NotFoundException('Unidad ocupacional no encontrada');
      }

      const removedUnidad =
        await this.prisma.unidadOcupacionalEmpleadora.update({
          where: { idUnidadOcupacionalEmpleadora: id },
          data: {
            estado: false,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
          },
        });
      return removedUnidad;
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

  async asignarCompetenciasLote(
    user: AuthUser,
    dto: AsignarCompetenciasLoteDto,
  ) {
    try {
      const asignacion = dto.asignaciones.map((item) => ({
        idUnidadOcupacionalEmpleadora: item.idUnidadOcupacionalEmpleadora,
        idCompetencia: item.idCompetencia,
        creadoPorId: user.idUsuario,
      }));

      return await this.prisma.$transaction(async (tx) => {
        await tx.unidadOcupacionalEmpleadoraCompetencia.createMany({
          data: asignacion,
        });
        return {
          message: 'Asignaciones realizadas con éxito',
          cantidadInsertada: asignacion.length,
        };
      });
    } catch (error) {
      console.error('Error en asignarCompetenciasLote:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error al asignar competencias. Detalles: ' + error.message,
      );
    }
  }
}
