import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleoDto } from './dto/create-empleo.dto';
import { UpdateEmpleoDto } from './dto/update-empleo.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class EmpleoService {
  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateEmpleoDto) {
    try {
      const empleo = await this.prisma.empleo.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
          comunicados: dto.comunicados
            ? {
                create: dto.comunicados.map((item) => ({
                  ...item,
                  creadoPorId: user.idUsuario,
                })),
              }
            : undefined,
        },
        include: {
          comunicados: true,
        },
      });
      return empleo;
    } catch (error) {
      console.error('Error al crear empleo:', error);
      throw new InternalServerErrorException('No se pudo crear el empleo.');
    }
  }

  async findAll() {
    try {
      return await this.prisma.empleo.findMany({
        where: { estado: true },
        include: { comunicados: true },
        orderBy: { fechaPublicacion: 'desc' },
      });
    } catch (error) {
      console.error('Error al obtener empleos:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los empleos.',
      );
    }
  }

  async findOne(id: number) {
    const empleo = await this.prisma.empleo.findFirst({
      where: { idEmpleo: id, estado: true },
      include: { comunicados: true },
    });

    if (!empleo) {
      throw new NotFoundException('Empleo no encontrado');
    }

    return empleo;
  }

  async update(user: AuthUser, id: number, dto: UpdateEmpleoDto) {
    const { comunicados = [], ...restDto } = dto;

    try {
      const empleo = await this.prisma.$transaction(async (tx) => {
        const exist = await tx.empleo.findFirst({
          where: { idEmpleo: id, estado: true },
        });

        if (!exist) {
          throw new NotFoundException('Empleo no encontrado');
        }

        // Eliminar comunicados anteriores
        await tx.comunicado.deleteMany({
          where: { idEmpleo: id },
        });

        // Actualizar empleo
        const updatedEmpleo = await tx.empleo.update({
          where: { idEmpleo: id },
          data: {
            ...restDto,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
            comunicados: comunicados.length
              ? {
                  create: comunicados.map((item) => ({
                    ...item,
                    creadoPorId: user.idUsuario,
                  })),
                }
              : undefined,
          },
          include: { comunicados: true },
        });

        return updatedEmpleo;
      });

      return empleo;
    } catch (error) {
      console.error('Error al actualizar empleo:', error);

      if (error instanceof NotFoundException) {
        throw error; // Lo reenvías tal cual
      }

      throw new InternalServerErrorException(
        'No se pudo actualizar el empleo.',
      );
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const empleo = await this.prisma.empleo.findFirst({
        where: { idEmpleo: id, estado: true },
      });

      if (!empleo) throw new NotFoundException('Empleo no encontrado');

      return await this.prisma.empleo.update({
        where: { idEmpleo: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al eliminar empleo:', error);

      if (error instanceof NotFoundException) {
        throw error; // Lo reenvías tal cual
      }
      
      throw new InternalServerErrorException('No se pudo eliminar el empleo.');
    }
  }
}
