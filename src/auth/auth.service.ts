import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';

import { problemaContrasena } from 'src/common/acceso/politica-contrasena';
import {
  exigirSinBloqueo,
  limpiarFallos,
  registrarFallo,
} from 'src/common/acceso/intentos-login';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Las cuentas a las que puede entrar con ese usuario y contraseña. El
   * usuario ya no es único en todo el sistema: las cuentas de trabajadores
   * son por empresa, así una persona que pasó por varias empresas tiene una
   * cuenta en cada una con el mismo DNI. Se valida la contraseña en cada
   * cuenta con ese usuario y quedan las que coinciden y pueden entrar.
   */
  private async cuentasValidas(
    codigoUsuario: string,
    contrasena: string,
    empresa?: number,
  ) {
    const candidatas = await this.prisma.usuario.findMany({
      where: { codigoUsuario: String(codigoUsuario ?? '').trim() },
      include: {
        // La empresa que administra un ADMIN_EMPRESA (no tiene Empleado).
        empresaEmpleadora: {
          select: {
            idEmpresaEmpleadora: true,
            nombreEmpresa: true,
            urlLogo: true,
            colorPrimario: true,
            estado: true,
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

    // Con el enlace de una empresa, primero sus cuentas: si la contraseña
    // coincide ahí, no hace falta verificar las demás (cada verificación
    // tarda a propósito, para que adivinar sea caro).
    const deEmpresa = empresa
      ? candidatas.filter(
          (u) => this.empresaDe(u)?.idEmpresaEmpleadora === Number(empresa),
        )
      : [];
    const verificar = async (lista: typeof candidatas) => {
      const ok: typeof candidatas = [];
      for (const u of lista)
        if (await compare(contrasena, u.contrasena)) ok.push(u);
      return ok;
    };
    let conClave = await verificar(deEmpresa);
    if (!conClave.length)
      conClave = await verificar(
        candidatas.filter((u) => !deEmpresa.includes(u)),
      );
    if (!conClave.length)
      throw new UnauthorizedException('Credenciales inválidas.');

    // Un trabajador dado de baja no entra aunque su usuario haya quedado
    // activo: las bajas anteriores a que `remove` desactivara también el
    // usuario lo dejaron así.
    const activas = conClave.filter(
      (u) => u.estado && u.empleado?.estado !== false,
    );
    if (!activas.length)
      throw new UnauthorizedException(
        'Credenciales inválidas o usuario inactivo.',
      );

    // Empresa archivada: nadie de ella entra (RR. HH., jefes ni empleados).
    // Se mira después de la contraseña para no confirmar a un desconocido
    // que el usuario existe.
    const conAcceso = activas.filter(
      (u) => this.empresaDe(u)?.estado !== false,
    );
    if (!conAcceso.length)
      throw new UnauthorizedException(
        'Su empresa no tiene acceso a TeamWork en este momento. Comuníquese con TeamWork.',
      );
    return conAcceso;
  }

  private empresaDe(u: {
    empresaEmpleadora: {
      idEmpresaEmpleadora: number;
      nombreEmpresa: string;
      estado: boolean;
    } | null;
    empleado: {
      empresaEmpleadora: {
        idEmpresaEmpleadora: number;
        nombreEmpresa: string;
        estado: boolean;
      };
    } | null;
  }) {
    return u.empresaEmpleadora ?? u.empleado?.empresaEmpleadora ?? null;
  }

  /**
   * Inicio de sesión. Con una sola cuenta válida, entra. Con varias (la misma
   * persona en varias empresas), responde `cuentas` sin token para que elija;
   * el front vuelve a enviar con `idUsuario`. `empresa` (del enlace de
   * ingreso de cada empresa) deja solo las de esa empresa, si las hay.
   */
  async login(
    dto: {
      codigoUsuario: string;
      contrasena: string;
      idUsuario?: number;
      empresa?: number;
    },
    ip = 'desconocida',
  ) {
    // Límite de intentos: el usuario es el DNI, fácil de conocer.
    exigirSinBloqueo(dto.codigoUsuario, ip);
    let cuentas: Awaited<ReturnType<AuthService['cuentasValidas']>>;
    try {
      cuentas = await this.cuentasValidas(
        dto.codigoUsuario,
        dto.contrasena,
        dto.empresa,
      );
    } catch (error) {
      // Solo cuenta como fallo una contraseña o un usuario incorrectos, no
      // una cuenta inactiva o una empresa archivada (la clave era buena).
      if (
        error instanceof UnauthorizedException &&
        error.message === 'Credenciales inválidas.'
      )
        registrarFallo(dto.codigoUsuario, ip);
      throw error;
    }
    limpiarFallos(dto.codigoUsuario);

    if (dto.empresa) {
      const deLaEmpresa = cuentas.filter(
        (u) => this.empresaDe(u)?.idEmpresaEmpleadora === Number(dto.empresa),
      );
      if (deLaEmpresa.length) cuentas = deLaEmpresa;
    }
    if (dto.idUsuario) {
      const elegida = cuentas.find(
        (u) => u.idUsuario === Number(dto.idUsuario),
      );
      if (!elegida) throw new UnauthorizedException('Credenciales inválidas.');
      cuentas = [elegida];
    }
    if (cuentas.length > 1) {
      return {
        cuentas: cuentas.map((u) => ({
          idUsuario: u.idUsuario,
          rol: u.rol,
          empresa: this.empresaDe(u)?.nombreEmpresa ?? 'TeamWork',
          urlLogo:
            u.empresaEmpleadora?.urlLogo ??
            u.empleado?.empresaEmpleadora?.urlLogo ??
            null,
        })),
      };
    }

    const usuario = cuentas[0];
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
        // Nivel de las cuentas de gestión: el front oculta las acciones.
        soloLectura:
          (usuario.rol === 'EQUIPO' || usuario.rol === 'ADMIN_EMPRESA') &&
          usuario.soloLectura,
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
      select: {
        contrasena: true,
        estado: true,
        codigoUsuario: true,
        nombreCompleto: true,
      },
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
    const debil = problemaContrasena(dto.contrasenaNueva, [
      usuario.codigoUsuario,
      usuario.nombreCompleto,
    ]);
    if (debil) throw new BadRequestException(debil);
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
