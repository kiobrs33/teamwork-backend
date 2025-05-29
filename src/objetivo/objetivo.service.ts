import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateObjetivoDto } from './dto/create-objetivo.dto';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';
import { CreateObjetivoConDetallesDto } from './dto/create-objetivo-con-detalles.dto';

@Injectable()
export class ObjetivoService {
  private readonly logger = new Logger(ObjetivoService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateObjetivoDto) {
    try {
      const objetivo = await this.prisma.objetivo.create({
        data: {
          fechaVigenciaInicia: new Date(dto.fechaVigenciaInicia),
          fechaVigenciaFin: new Date(dto.fechaVigenciaFin),
          idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
          idEmpleado: dto.idEmpleado,
          creadoPorId: user.idUsuario,
          fechaCreacion: new Date(),
        },
      });
      return objetivo;
    } catch (error) {
      this.logger.error('Error al crear objetivo:', error);
      throw new InternalServerErrorException('No se pudo crear el objetivo.');
    }
  }

  async findAll() {
    try {
      const objetivos = await this.prisma.objetivo.findMany({
        where: { estado: true },
        orderBy: { idObjetivo: 'desc' },
        include: {
          empresaEmpleadora: true,
          empleado: true,
          ObjetivoDetalle: true,
        },
      });
      return objetivos;
    } catch (error) {
      this.logger.error('Error al obtener objetivos:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los objetivos.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const objetivo = await this.prisma.objetivo.findFirst({
        where: { idObjetivo: id, estado: true },
        include: {
          empresaEmpleadora: true,
          empleado: true,
          ObjetivoDetalle: true,
        },
      });
      if (!objetivo) {
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado.`);
      }
      return objetivo;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error al obtener objetivo con ID ${id}:`, error);
      throw new InternalServerErrorException('No se pudo obtener el objetivo.');
    }
  }

  async update(user: any, id: number, dto: UpdateObjetivoDto) {
    try {
      const existObjetivo = await this.prisma.objetivo.findFirst({
        where: { idObjetivo: id, estado: true },
        select: { idObjetivo: true },
      });
      if (!existObjetivo) {
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado.`);
      }

      const updated = await this.prisma.objetivo.update({
        where: { idObjetivo: id },
        data: {
          fechaVigenciaInicia: dto.fechaVigenciaInicia
            ? new Date(dto.fechaVigenciaInicia)
            : undefined,
          fechaVigenciaFin: dto.fechaVigenciaFin
            ? new Date(dto.fechaVigenciaFin)
            : undefined,
          idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
          idEmpleado: dto.idEmpleado,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });

      return updated;
    } catch (error) {
      this.logger.error(`Error al actualizar objetivo con ID ${id}:`, error);
      throw new InternalServerErrorException(
        'No se pudo actualizar el objetivo.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const existObjetivo = await this.prisma.objetivo.findFirst({
        where: { idObjetivo: id },
      });
      if (!existObjetivo || !existObjetivo.estado) {
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado.`);
      }

      const removed = await this.prisma.objetivo.update({
        where: { idObjetivo: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });

      return removed;
    } catch (error) {
      this.logger.error(`Error al eliminar objetivo con ID ${id}:`, error);
      throw new InternalServerErrorException(
        'No se pudo eliminar el objetivo.',
      );
    }
  }

  /**
   * Crea un objetivo con entre 2 y 4 detalles asociados en una transacción.
   */
  async createConDetalles(user: any, dto: CreateObjetivoConDetallesDto) {
    if (dto.detalles.length < 2 || dto.detalles.length > 4) {
      throw new BadRequestException(
        'Debe enviar entre 2 y 4 detalles para el objetivo.',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx: PrismaService) => {
        const objetivo = await tx.objetivo.create({
          data: {
            fechaVigenciaInicia: new Date(dto.fechaVigenciaInicia),
            fechaVigenciaFin: new Date(dto.fechaVigenciaFin),
            idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
            idEmpleado: dto.idEmpleado,
            estado: true,
            creadoPorId: user.idUsuario,
          },
        });

        const detallesCreados = await Promise.all(
          dto.detalles.map((detalle) =>
            tx.objetivoDetalle.create({
              data: {
                idObjetivo: objetivo.idObjetivo,
                secuencial: detalle.secuencial,
                descripcion: detalle.descripcion ?? null,
                descripcionIniciativa: detalle.descripcionIniciativa ?? null,
                unidadMedida: detalle.unidadMedida ?? null,
                pesoEspecifico: detalle.pesoEspecifico ?? null,
                estado: true,
                creadoPorId: user.idUsuario,
              },
            }),
          ),
        );

        return { objetivo, detalles: detallesCreados };
      });
    } catch (error) {
      this.logger.error('Error creando objetivo con detalles:', error);
      throw new InternalServerErrorException(
        'No se pudo crear el objetivo con sus detalles.',
      );
    }
  }
}
