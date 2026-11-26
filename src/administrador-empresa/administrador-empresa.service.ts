import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Rol } from 'src/empleado/types/empleadoTypes';
import {
  ActualizarAdministradorDto,
  CrearAdministradorDto,
} from './dto/administrador.dto';

/**
 * Administradores de una empresa (rol ADMIN_EMPRESA): una cuenta por persona
 * de RR. HH., para saber quién hizo qué y poder dar de baja solo a quien se
 * va. El superadministrador crea el primero al registrar la empresa; desde ahí
 * RR. HH. agrega a sus compañeros. La contraseña la pone quien crea la cuenta
 * y se entrega por fuera del sistema; cambiarla después es opcional.
 */
import { problemaContrasena } from 'src/common/acceso/politica-contrasena';
@Injectable()
export class AdministradorEmpresaService {
  constructor(private readonly prisma: PrismaService) {}

  // `estado` y `fechaCreacion` los borra el PurgeResponseInterceptor de toda
  // respuesta: viajan como `activo` y `creadoEl`.
  private aRespuesta(u: {
    idUsuario: number;
    codigoUsuario: string;
    nombreCompleto: string | null;
    estado: boolean;
    soloLectura: boolean;
    fechaCreacion: Date;
  }) {
    return {
      idUsuario: u.idUsuario,
      codigoUsuario: u.codigoUsuario,
      nombreCompleto: u.nombreCompleto,
      activo: u.estado,
      soloLectura: u.soloLectura,
      creadoEl: u.fechaCreacion,
    };
  }

  private readonly campos = {
    idUsuario: true,
    codigoUsuario: true,
    nombreCompleto: true,
    estado: true,
    soloLectura: true,
    fechaCreacion: true,
  } as const;

  async listar(idEmpresa: number) {
    const usuarios = await this.prisma.usuario.findMany({
      where: { rol: Rol.ADMIN_EMPRESA, idEmpresaEmpleadora: idEmpresa },
      orderBy: [{ estado: 'desc' }, { nombreCompleto: 'asc' }],
      select: this.campos,
    });
    return usuarios.map((u) => this.aRespuesta(u));
  }

  /**
   * Todas las cuentas de empresa, con su empresa y su nivel: la pestaña
   * "Empresas" de Usuarios en la consola (solo el dueño).
   */
  async listarTodas() {
    const usuarios = await this.prisma.usuario.findMany({
      where: { rol: Rol.ADMIN_EMPRESA },
      orderBy: [{ estado: 'desc' }, { nombreCompleto: 'asc' }],
      select: {
        ...this.campos,
        empresaEmpleadora: {
          select: { idEmpresaEmpleadora: true, nombreEmpresa: true },
        },
      },
    });
    return usuarios.map((u) => ({
      ...this.aRespuesta(u),
      empresa: u.empresaEmpleadora,
    }));
  }

  async crear(
    idCreador: number,
    idEmpresa: number,
    dto: CrearAdministradorDto,
  ) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: { idEmpresaEmpleadora: idEmpresa, estado: true },
      select: { idEmpresaEmpleadora: true },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    const codigo = dto.codigoUsuario.trim();
    // Cuenta del sistema: su usuario es único entre las cuentas del sistema
    // (las de trabajadores son por empresa, `idEmpresaCuenta`).
    const existe = await this.prisma.usuario.findFirst({
      where: { codigoUsuario: codigo, idEmpresaCuenta: null },
      select: { idUsuario: true },
    });
    if (existe) {
      throw new ConflictException(
        `El usuario "${codigo}" ya existe. Elija otro nombre de usuario.`,
      );
    }

    const debil = problemaContrasena(dto.contrasena, [
      codigo,
      dto.nombreCompleto,
    ]);
    if (debil) throw new BadRequestException(debil);

    const creado = await this.prisma.usuario.create({
      data: {
        codigoUsuario: codigo,
        contrasena: await hash(dto.contrasena, 10),
        rol: Rol.ADMIN_EMPRESA,
        soloLectura: dto.soloLectura ?? false,
        nombreCompleto: dto.nombreCompleto.trim(),
        idEmpresaEmpleadora: idEmpresa,
        creadoPorId: idCreador,
      },
      select: this.campos,
    });
    return this.aRespuesta(creado);
  }

  async actualizar(
    idEditor: number,
    idEmpresa: number,
    idUsuario: number,
    dto: ActualizarAdministradorDto,
  ) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        idUsuario,
        rol: Rol.ADMIN_EMPRESA,
        idEmpresaEmpleadora: idEmpresa,
      },
      select: { idUsuario: true },
    });
    if (!usuario) throw new NotFoundException('Administrador no encontrado');

    // Nadie se desactiva a sí mismo: dejaría a la empresa sin acceso si era
    // el único, y siempre puede pedírselo a un compañero o a TeamWork.
    if (dto.activo === false && idUsuario === idEditor) {
      throw new BadRequestException('No puede desactivar su propia cuenta.');
    }

    if (dto.contrasena !== undefined) {
      const debil = problemaContrasena(dto.contrasena, [dto.nombreCompleto]);
      if (debil) throw new BadRequestException(debil);
    }
    const actualizado = await this.prisma.usuario.update({
      where: { idUsuario },
      data: {
        ...(dto.nombreCompleto !== undefined && {
          nombreCompleto: dto.nombreCompleto.trim(),
        }),
        ...(dto.contrasena !== undefined && {
          contrasena: await hash(dto.contrasena, 10),
        }),
        ...(dto.activo !== undefined && { estado: dto.activo }),
        ...(dto.soloLectura !== undefined && { soloLectura: dto.soloLectura }),
        actualizadoPorId: idEditor,
        fechaModificacion: new Date(),
      },
      select: this.campos,
    });
    return this.aRespuesta(actualizado);
  }
}
