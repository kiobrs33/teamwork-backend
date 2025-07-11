import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompetenciaDto } from './dto/update-competencia.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CreateCompetenciaConDetallesDto } from './dto/create-competencia-con-detalles.dto';

@Injectable()
export class CompetenciaService {
  private readonly logger = new Logger(CompetenciaService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.competencia.findMany({
        where: { estado: true },
        orderBy: { fechaCreacion: 'desc' },
        include: { competenciaDetalles: true },
      });
    } catch (error) {
      this.logger.error('Error al obtener competencias:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las competencias.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const competencia = await this.prisma.competencia.findFirst({
        where: { idCompetencia: id, estado: true },
        include: { competenciaDetalles: true },
      });
      if (!competencia) {
        throw new NotFoundException(`Competencia con ID ${id} no encontrada.`);
      }
      return competencia;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error al obtener competencia con ID ${id}:`, error);
      throw new InternalServerErrorException(
        'No se pudo obtener la competencia.',
      );
    }
  }

  async update(id: number, user: AuthUser, dto: UpdateCompetenciaDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const competencia = await tx.competencia.findUnique({
          where: { idCompetencia: id, estado: true },
        });

        if (!competencia) {
          throw new NotFoundException('Competencia no encontrada');
        }

        await tx.competencia.update({
          where: { idCompetencia: id },
          data: {
            codigo: dto.codigo,
            titulo: dto.titulo,
            nivel: dto.nivel,
            actualizadoPorId: user.idUsuario,
            fechaModificacion: new Date(),
          },
        });
        if (!dto.competenciaDetalles || dto.competenciaDetalles.length === 0) {
          throw new BadRequestException(
            'competenciaDetalles no puede estar vacío',
          );
        }
        await tx.competenciaDetalle.deleteMany({
          where: { idCompetencia: id },
        });

        if (dto.competenciaDetalles) {
          await tx.competenciaDetalle.createMany({
            data: dto.competenciaDetalles.map((detalle, index) => ({
              idCompetencia: id,
              secuencial: index + 1,
              descripcion: detalle.descripcion,
              creadoPorId: user.idUsuario,
            })),
          });
          const competenciaCompleto = await tx.competencia.findUnique({
            where: { idCompetencia: id },
            include: { competenciaDetalles: true },
          });

          console.log(competenciaCompleto);
          return competenciaCompleto;
        }
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al actualizar la competencia',
      );
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const existCompetencia = await this.prisma.competencia.findFirst({
        where: { idCompetencia: id },
      });
      if (!existCompetencia || !existCompetencia.estado) {
        throw new NotFoundException(`Competencia con ID ${id} no encontrada.`);
      }

      const removed = await this.prisma.competencia.update({
        where: { idCompetencia: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
          competenciaDetalles: {
            updateMany: {
              where: {
                idCompetencia: id,
              },
              data: {
                estado: false,
              },
            },
          },
        },
      });
      return removed;
    } catch (error) {
      this.logger.error(`Error al eliminar competencia con ID ${id}:`, error);
      throw new InternalServerErrorException(
        'No se pudo eliminar la competencia.',
      );
    }
  }

  async createConDetalles(
    user: AuthUser,
    dto: CreateCompetenciaConDetallesDto,
  ) {
    if (
      dto.competenciaDetalles.length < 1 ||
      dto.competenciaDetalles.length > 10
    ) {
      throw new BadRequestException(
        'Debe enviar entre 1 y 10 detalles para la competencia.',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx: PrismaService) => {
        const competencia = await tx.competencia.create({
          data: {
            codigo: dto.codigo,
            titulo: dto.titulo,
            nivel: dto.nivel,
            creadoPorId: user.idUsuario,
            competenciaDetalles: {
              createMany: {
                data: dto.competenciaDetalles.map((detalle, index) => ({
                  secuencial: index + 1,
                  descripcion: detalle.descripcion,
                  creadoPorId: user.idUsuario,
                })),
              },
            },
          },
        });

        const competenciaCompleto = await tx.competencia.findUnique({
          where: { idCompetencia: competencia.idCompetencia },
          include: { competenciaDetalles: true },
        });
        return competenciaCompleto;
      });
    } catch (error) {
      this.logger.error('Error creando competencia con detalles:', error);
      throw new InternalServerErrorException(
        'No se pudo crear la competencia con sus detalles.',
      );
    }
  }
}
