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
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class EmpleadoService {
  // Logger de NestJS configurado con el nombre del servicio para registrar eventos y errores del EmpleadoService
  private readonly logger = new Logger(EmpleadoService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, body: CreateEmpleadoDto) {
    if (!body.contrasena) {
      throw new InternalServerErrorException('La contraseña es requerida.');
    }

    try {
      return await this.prisma.$transaction(async (tx: PrismaService) => {
        const hashedPassword = await hash(body.contrasena, 10);

        const usuario = await tx.usuario.create({
          data: {
            codigoUsuario: body.codigoUsuario,
            contrasena: hashedPassword,
            rol: body.rol,
            creadoPorId: user.idUsuario,
          },
        });

        const empleado = await tx.empleado.create({
          data: {
            nombres: body.nombres,
            apellidoPaterno: body.apellidoPaterno,
            apellidoMaterno: body.apellidoMaterno,
            documento: body.documento,
            sede: body.sede,
            tiempoEmpresaValor: body.tiempoEmpresaValor,
            tiempoEmpresaUnidad: body.tiempoEmpresaUnidad,
            idEmpresaEmpleadora: body.idEmpresaEmpleadora,
            idAreaEmpleadora: body.idAreaEmpleadora,
            idPuestoEmpleadora: body.idPuestoEmpleadora,
            idGerenciaEmpleadora: body.idGerenciaEmpleadora,
            idUnidadOcupacionalEmpleadora: body.unidadOcupacionalEmpleadora,
            idUsuario: usuario.idUsuario,
            creadoPorId: user.idUsuario,
          },
          include: {
            empresaEmpleadora: true,
            areaEmpleadora: true,
            puestoEmpleadora: true,
            gerenciaEmpleadora: true,
            usuario: true,
            objetivo: {
              include: {
                objetivoDetalles: true,
              },
            },
          },
        });
        return empleado;
      });
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
          areaEmpleadora: true,
          puestoEmpleadora: true,
          gerenciaEmpleadora: true,
          usuario: true,
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
          areaEmpleadora: true,
          puestoEmpleadora: true,
          gerenciaEmpleadora: true,
          usuario: true,
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

  async update(user: AuthUser, id: number, body: UpdateEmpleadoDto) {
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        select: { idEmpleado: true, idUsuario: true, usuario: true },
      });

      if (!existEmpleado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      const usuarioUpdateData: any = {
        codigoUsuario: body.codigoUsuario,
        rol: body.rol,
        fechaModificacion: new Date(),
        actualizadoPorId: user.idUsuario,
      };

      if (body.contrasena) {
        usuarioUpdateData.contrasena = await hash(body.contrasena, 10);
      }

      await this.prisma.usuario.update({
        where: { idUsuario: existEmpleado.idUsuario },
        data: usuarioUpdateData,
      });

      const empleadoUpdateData = {
        nombres: body.nombres,
        apellidoPaterno: body.apellidoPaterno,
        apellidoMaterno: body.apellidoMaterno,
        documento: body.documento,
        sede: body.sede,
        tiempoEmpresaValor: body.tiempoEmpresaValor,
        tiempoEmpresaUnidad: body.tiempoEmpresaUnidad,
        idEmpresaEmpleadora: body.idEmpresaEmpleadora,
        idAreaEmpleadora: body.idAreaEmpleadora,
        idPuestoEmpleadora: body.idPuestoEmpleadora,
        idGerenciaEmpleadora: body.idGerenciaEmpleadora,
        idUnidadOcupacionalEmpleadora: body.unidadOcupacionalEmpleadora,
        idUsuario: existEmpleado.idUsuario,
        fechaCreacion: new Date(),
        creadoPorId: user.idUsuario,
      };

      const updated = await this.prisma.empleado.update({
        where: { idEmpleado: id },
        data: empleadoUpdateData,
        include: {
          empresaEmpleadora: true,
          areaEmpleadora: true,
          puestoEmpleadora: true,
          gerenciaEmpleadora: true,
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

  // observar para inactivar por ejemplo objetivos
  async remove(user: AuthUser, id: number) {
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
