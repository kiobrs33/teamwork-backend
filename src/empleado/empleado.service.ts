import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { hash } from 'bcryptjs';

@Injectable()
export class EmpleadoService {
  // Logger de NestJS configurado con el nombre del servicio para registrar eventos y errores del EmpleadoService
  private readonly logger = new Logger(EmpleadoService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: any, body: CreateEmpleadoDto) {
    try {
      const {
        codigoUsuario,
        correoElectronico,
        contrasena,
        rol,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        idEmpresaEmpleadora,
        idEquipoEmpleadora,
        idPuestoEmpleadora,
        idUnidadEmpleadora,
      } = body;

      if (!contrasena) {
        throw new InternalServerErrorException('La contraseña es requerida.');
      }
      const hashedPassword = await hash(contrasena, 10);

      const usuario = await this.prisma.usuario.create({
        data: {
          codigoUsuario,
          correoElectronico,
          contrasena: hashedPassword,
          rol,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });

      const empleado = await this.prisma.empleado.create({
        data: {
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          idEmpresaEmpleadora,
          idEquipoEmpleadora,
          idPuestoEmpleadora,
          idUnidadEmpleadora,
          idUsuario: usuario.idUsuario,
          fechaCreacion: new Date(),
          creadoPorId: user.idUsuario,
        },
      });
      return {
        idEmpleado: empleado.idEmpleado,
        idUsuario: usuario.idUsuario,
        codigoUsuario,
        correoElectronico,
        // contrasena,
        rol,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        idEmpresaEmpleadora,
        idEquipoEmpleadora,
        idPuestoEmpleadora,
        idUnidadEmpleadora,
      };
    } catch (error) {
      this.logger.error('Error al crear empleado:', error);
      throw new InternalServerErrorException('No se pudo crear al empleado.');
    }
  }

  async findAll() {
    try {
      const empleados = await this.prisma.empleado.findMany({
        where: { estado: true },
        include: {
          empresaEmpleadora: true,
          equipoEmpleadora: true,
          puestoEmpleadora: true,
          unidadEmpleadora: true,
          usuario: true,
          objetivo: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return empleados;
    } catch (error) {
      this.logger.error('Error al obtener los empleados:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los empleados.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const empleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        include: {
          empresaEmpleadora: true,
          equipoEmpleadora: true,
          puestoEmpleadora: true,
          unidadEmpleadora: true,
          usuario: true,
          objetivo: true,
        },
      });
      if (!empleado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      return empleado;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error al obtener al empleado:', error);
      throw new InternalServerErrorException('No se pudo obtener al empleado.');
    }
  }

  async update(user: any, id: number, body: UpdateEmpleadoDto) {
    try {
      const {
        codigoUsuario,
        contrasena,
        correoElectronico,
        rol,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        idEmpresaEmpleadora,
        idEquipoEmpleadora,
        idPuestoEmpleadora,
        idUnidadEmpleadora,
      } = body;

      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        select: { idEmpleado: true, idUsuario: true, usuario: true },
      });

      if (!existEmpleado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      // USER
      if (contrasena) {
        const hashedPassword = await hash(contrasena, 10);

        await this.prisma.usuario.update({
          where: { idUsuario: existEmpleado.idUsuario },
          data: {
            codigoUsuario,
            correoElectronico,
            contrasena: hashedPassword,
            rol,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
          },
        });
      } else {
        await this.prisma.usuario.update({
          where: { idUsuario: existEmpleado.idUsuario },
          data: {
            codigoUsuario,
            correoElectronico,
            rol,
            fechaModificacion: new Date(),
            actualizadoPorId: user.idUsuario,
          },
        });
      }

      // EMPLEADO
      const updated = await this.prisma.empleado.update({
        where: { idEmpleado: id },
        data: {
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          idEmpresaEmpleadora,
          idEquipoEmpleadora,
          idPuestoEmpleadora,
          idUnidadEmpleadora,
          idUsuario: existEmpleado.idUsuario,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
        include: {
          empresaEmpleadora: true,
          equipoEmpleadora: true,
          puestoEmpleadora: true,
          unidadEmpleadora: true,
          usuario: true,
          objetivo: true,
        },
      });

      return updated;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error al actualizar al empleado:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar al empleado.',
      );
    }
  }

  async remove(user: any, id: number) {
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id },
        select: { idEmpleado: true },
      });

      if (!existEmpleado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      const removed = await this.prisma.empleado.update({
        where: { idEmpleado: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });

      return removed;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error al eliminar al empleado:', error);
      throw new InternalServerErrorException(
        'No se pudo eliminar al empleado.',
      );
    }
  }
}
