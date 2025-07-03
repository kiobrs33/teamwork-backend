import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';
import { CreateObjetivoConDetallesDto } from './dto/create-objetivo-con-detalles.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class ObjetivoService {
  private readonly logger = new Logger(ObjetivoService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const objetivos = await this.prisma.objetivo.findMany({
        where: { estado: true },
        orderBy: {
          fechaCreacion: 'desc',
        },
        include: {
          empleado: true,
          objetivoDetalles: true,
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
          empleado: true,
          objetivoDetalles: true,
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

  async update(id: number, user: AuthUser, dto: UpdateObjetivoDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const objetivo = await tx.objetivo.findUnique({
          where: { idObjetivo: id, estado: true },
        });

        if (!objetivo) {
          throw new NotFoundException('Objetivo no encontrado');
        }

        // Actualizar datos del objetivo
        await tx.objetivo.update({
          where: { idObjetivo: id },
          data: {
            actualizadoPorId: user.idUsuario,
            fechaModificacion: new Date(),
          },
        });

        // Eliminar detalles antiguos
        await tx.objetivoDetalle.deleteMany({
          where: { idObjetivo: id },
        });

        // Si se envían detalles, insertarlos
        if (dto.objetivoDetalles) {
          await tx.objetivoDetalle.createMany({
            data: dto.objetivoDetalles.map((detalle, index) => ({
              idObjetivo: id,
              secuencial: index + 1,
              descripcion: detalle.descripcion,
              descripcionIniciativa: detalle.descripcionIniciativa,
              unidadMedida: detalle.unidadMedida,
              pesoEspecifico: detalle.pesoEspecifico,
              metaObjetivo: detalle.metaObjetivo,
              metaAlcanzada: detalle.metaAlcanzada,
              creadoPorId: user.idUsuario,
              actualizadoPorId: user.idUsuario,
            })),
          });
          // Retornar actualizado con detalles
          const objetivoCompleto = await tx.objetivo.findUnique({
            where: { idObjetivo: id },
            include: { objetivoDetalles: true },
          });
          console.log('Detalles recibidos:', objetivoCompleto);
          return objetivoCompleto;
        }
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al actualizar el objetivo');
    }
  }

  async remove(user: AuthUser, id: number) {
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
  async createConDetalles(user: AuthUser, dto: CreateObjetivoConDetallesDto) {
    if (dto.detalles.length < 2 || dto.detalles.length > 4) {
      throw new BadRequestException(
        'Debe enviar entre 2 y 4 detalles para el objetivo.',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx: PrismaService) => {
        const objetivo = await tx.objetivo.create({
          data: {
            idEmpleado: dto.idEmpleado,
            creadoPorId: user.idUsuario,
            objetivoDetalles: {
              createMany: {
                data: dto.detalles.map((detalle, index) => ({
                  secuencial: index + 1,
                  descripcion: detalle.descripcion,
                  descripcionIniciativa: detalle.descripcionIniciativa,
                  unidadMedida: detalle.unidadMedida,
                  pesoEspecifico: detalle.pesoEspecifico,
                  metaObjetivo: detalle.metaObjetivo,
                  creadoPorId: user.idUsuario,
                })),
              },
            },
          },
        });

        const objetivoCompleto = await tx.objetivo.findUnique({
          where: { idObjetivo: objetivo.idObjetivo },
          include: { objetivoDetalles: true },
        });

        return objetivoCompleto;
      });
    } catch (error) {
      this.logger.error('Error creando objetivo con detalles:', error);

      throw new InternalServerErrorException(
        'No se pudo crear el objetivo con sus detalles.',
      );
    }
  }
}
