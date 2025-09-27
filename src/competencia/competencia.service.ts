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
import { CreatePuestoEmpleadoraDto } from '../puesto-empleadora/dto/create-puesto-empleadora.dto';

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
    const competencia = await this.prisma.competencia.findUnique({
      where: { idCompetencia: id, estado: true },
    });

    if (!competencia) {
      throw new NotFoundException('Competencia no encontrada');
    }
    if (!dto.competenciaDetalles || dto.competenciaDetalles.length === 0) {
      throw new BadRequestException('competenciaDetalles no puede estar vacío');
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
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

  async importData(user: AuthUser, data: CreateCompetenciaConDetallesDto[]) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const registros = await Promise.all(
          data.map((row) =>
            tx.competencia.create({
              data: {
                codigo: row.codigo,
                titulo: row.titulo,
                nivel: row.nivel,
                creadoPorId: user.idUsuario,
                competenciaDetalles: {
                  createMany: {
                    data: row.competenciaDetalles.map((detalle, index) => ({
                      secuencial: index + 1,
                      descripcion: detalle.descripcion,
                      creadoPorId: user.idUsuario,
                    })),
                  },
                },
              },
              include: {
                competenciaDetalles: true,
              },
            }),
          ),
        );

        return {
          message: 'Datos importados correctamente',
          count: registros.length,
        };
      });
    } catch (error) {
      console.error('Error al importar datos:', error);
      throw new InternalServerErrorException(
        'Error al importar los datos. Por favor, verifica el archivo o contacta soporte.',
      );
    }
  }

  async findAllConCompetencias() {
    try {
      // 1. Obtener todos los puestos activos
      const unidades = await this.prisma.unidadOcupacionalEmpleadora.findMany({
        where: { estado: true },
        include: { empresaEmpleadora: true },
        orderBy: { fechaCreacion: 'desc' },
      });

      // 2. Obtener todas las competencias activas
      const competencias = await this.prisma.competencia.findMany({
        where: { estado: true },
        orderBy: { fechaCreacion: 'desc' },
        select: {
          idCompetencia: true,
          codigo: true,
          titulo: true,
          nivel: true,
        },
      });

      // 3. Armar la respuesta fusionada
      const resultado = unidades.map((unidad) => {
        // Agrupar competencias por código
        const competenciasAgrupadas = competencias.reduce(
          (
            acc: {
              idCompetencia: number;
              codigo: string;
              titulo: string;
              niveles: { titulo: string; nivel: number }[];
            }[],
            comp,
          ) => {
            let competencia = acc.find((c) => c.titulo === comp.codigo);
            if (!competencia) {
              competencia = {
                idCompetencia: comp.idCompetencia,
                codigo: comp.codigo,
                titulo: comp.titulo,
                niveles: [],
              };
              acc.push(competencia);
            }
            competencia.niveles.push({
              titulo: comp.titulo,
              nivel: comp.nivel,
            });
            return acc;
          },
          [],
        );

        return {
          idUnidadOcupacionalEmpleadora: unidad.idUnidadOcupacionalEmpleadora,
          descripcion: unidad.descripcion,
          idEmpresaEmpleadora: unidad.idEmpresaEmpleadora,
          competencias: competenciasAgrupadas,
        };
      });

      return resultado;
    } catch (error) {
      this.logger.error('Error al obtener puestos con competencias:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los puestos con competencias.',
      );
    }
  }
}
