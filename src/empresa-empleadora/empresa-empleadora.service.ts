import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpresaEmpleadoraDto } from './dto/create-empresa-empleadora.dto';
import { UpdateEmpresaEmpleadoraDto } from './dto/update-empresa-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class EmpresaEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  // ======================================================
  // CREATE
  // ======================================================
  async create(user: AuthUser, dto: CreateEmpresaEmpleadoraDto) {
    try {
      return await this.prisma.empresaEmpleadora.create({
        data: {
          ...dto,
          creadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al crear empresa:', error);
      throw new InternalServerErrorException('No se pudo crear la empresa.');
    }
  }

  // ======================================================
  // FIND ALL
  // ======================================================
  async findAll() {
    try {
      return await this.prisma.empresaEmpleadora.findMany({
        where: { estado: true },
        orderBy: { fechaCreacion: 'desc' },
      });
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las empresas.',
      );
    }
  }

  // ======================================================
  // FIND ONE
  // ======================================================
  async findOne(id: number) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: {
        idEmpresaEmpleadora: id,
        estado: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  // ======================================================
  // UPDATE
  // ======================================================
  async update(user: AuthUser, id: number, dto: UpdateEmpresaEmpleadoraDto) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      return await this.prisma.empresaEmpleadora.update({
        where: { idEmpresaEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al actualizar empresa:', error);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'No se pudo actualizar la empresa.',
      );
    }
  }

  // ======================================================
  // REMOVE (soft delete)
  // ======================================================
  async remove(user: AuthUser, id: number) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.findFirst({
        where: {
          idEmpresaEmpleadora: id,
          estado: true,
        },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }

      return await this.prisma.empresaEmpleadora.update({
        where: { idEmpresaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al eliminar empresa:', error);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('No se pudo eliminar la empresa.');
    }
  }
}
