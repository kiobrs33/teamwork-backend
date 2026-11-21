import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(codigoUsuario: string, contrasena: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { codigoUsuario },
      include: {
        // La empresa que administra un ADMIN_EMPRESA (no tiene Empleado).
        empresaEmpleadora: {
          select: {
            idEmpresaEmpleadora: true,
            nombreEmpresa: true,
            urlLogo: true,
          },
        },
        empleado: {
          include: {
            empresaEmpleadora: true,
            puestoEmpleadora: true,
            areaEmpleadora: true,
            gerenciaEmpleadora: true,
            unidadOcupacionalEmpleadora: true,
          },
        },
      },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException(
        'Credenciales inválidas o usuario inactivo.',
      );
    }

    const isMatch = await compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return usuario;
  }

  async login(dto: { codigoUsuario: string; contrasena: string }) {
    const usuario = await this.validateUser(dto.codigoUsuario, dto.contrasena);

    const payload = {
      idUsuario: usuario.idUsuario,
      codigoUsuario: usuario.codigoUsuario,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        codigoUsuario: usuario.codigoUsuario,
        rol: usuario.rol,
        empleado: usuario.empleado,
        // Solo para ADMIN_EMPRESA: quién es y qué empresa administra.
        nombreCompleto: usuario.nombreCompleto,
        empresaAdministrada: usuario.empresaEmpleadora,
      },
    };
  }

  /**
   * Cambiar la propia contraseña. Es opcional: la cuenta nace con la que le
   * puso quien la creó (TeamWork o RR. HH.), que se entrega por fuera del
   * sistema; no hay correo.
   */
  async cambiarContrasena(
    idUsuario: number,
    dto: { contrasenaActual: string; contrasenaNueva: string },
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idUsuario: Number(idUsuario) },
      select: { contrasena: true, estado: true },
    });
    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Sesión no válida');
    }
    if (!(await compare(dto.contrasenaActual, usuario.contrasena))) {
      throw new BadRequestException('La contraseña actual no es correcta.');
    }
    if (dto.contrasenaActual === dto.contrasenaNueva) {
      throw new BadRequestException(
        'La contraseña nueva es igual a la actual.',
      );
    }
    await this.prisma.usuario.update({
      where: { idUsuario: Number(idUsuario) },
      data: {
        contrasena: await hash(dto.contrasenaNueva, 10),
        actualizadoPorId: Number(idUsuario),
        fechaModificacion: new Date(),
      },
    });
  }
}
