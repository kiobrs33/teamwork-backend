// empresa-empleadora.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpresaEmpleadoraDto } from './dto/create-empresa-empleadora.dto';
import { UpdateEmpresaEmpleadoraDto } from './dto/update-empresa-empleadora.dto';

@Injectable()
export class EmpresaEmpleadoraService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, dto: CreateEmpresaEmpleadoraDto) {
    try {
      const empresa = await this.prisma.empresaEmpleadora.create({
        data: {
          ...dto,
          fechaVigenciaInicio: new Date(dto.fechaVigenciaInicio),
          fechaVigenciaFin: new Date(dto.fechaVigenciaFin),
          creadoPorId: user.idUsuario,
        },
      });
      return empresa;
    } catch (error) {
      console.error('Error al crear empresa:', error);
      throw new InternalServerErrorException('No se pudo crear la empresa.');
    }
  }

  async findAll() {
    try {
      const empresas = await this.prisma.empresaEmpleadora.findMany({
        include: {
          equipoEmpleadora: true,
          puestoEmpleadora: true,
          unidadEmpleadora: true,
          objetivo: true,
          empleado: true,
        },
        where: {
          estado: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return empresas;
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las empresas.',
      );
    }
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresaEmpleadora.findUnique({
      where: { idEmpresaEmpleadora: id, estado: true },
      include: {
        equipoEmpleadora: true,
        puestoEmpleadora: true,
        unidadEmpleadora: true,
        objetivo: true,
        empleado: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  async update(user: any, id: number, dto: UpdateEmpresaEmpleadoraDto) {
    try {
      const existEmpresa = await this.prisma.empresaEmpleadora.findUnique({
        where: { idEmpresaEmpleadora: id },
      });

      if (!existEmpresa || !existEmpresa.estado) {
        throw new NotFoundException('Empresa no encontrada');
      }

      const updated = await this.prisma.empresaEmpleadora.update({
        where: { idEmpresaEmpleadora: id },
        data: {
          ...dto,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });

      return updated;
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la empresa.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const existEmpresa = await this.prisma.empresaEmpleadora.findUnique({
        where: { idEmpresaEmpleadora: id },
      });

      if (!existEmpresa || !existEmpresa.estado) {
        throw new NotFoundException('Empresa no encontrada');
      }

      const removed = await this.prisma.empresaEmpleadora.update({
        where: { idEmpresaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });

      return removed;
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      throw new InternalServerErrorException('No se pudo eliminar la empresa.');
    }
  }
}
