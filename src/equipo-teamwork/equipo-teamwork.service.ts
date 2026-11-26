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
  ActualizarMiembroEquipoDto,
  CrearMiembroEquipoDto,
} from './dto/equipo.dto';

/**
 * Las cuentas del personal de TeamWork (rol EQUIPO). Las gestiona solo el
 * dueño (ADMIN): crearlas, asignarles empresas, restablecer su contraseña y
 * desactivarlas. La contraseña la pone el dueño y la entrega por fuera del
 * sistema, como con los administradores de empresa.
 */
import { problemaContrasena } from 'src/common/acceso/politica-contrasena';
@Injectable()
export class EquipoTeamworkService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly campos = {
    idUsuario: true,
    codigoUsuario: true,
    nombreCompleto: true,
    rol: true,
    estado: true,
    soloLectura: true,
    todasLasEmpresas: true,
    fechaCreacion: true,
    empresasAsignadas: {
      select: {
        empresaEmpleadora: {
          select: { idEmpresaEmpleadora: true, nombreEmpresa: true },
        },
      },
    },
  } as const;

  private aRespuesta(u: {
    idUsuario: number;
    codigoUsuario: string;
    nombreCompleto: string | null;
    rol: string;
    estado: boolean;
    soloLectura: boolean;
    todasLasEmpresas: boolean;
    fechaCreacion: Date;
    empresasAsignadas: {
      empresaEmpleadora: { idEmpresaEmpleadora: number; nombreEmpresa: string };
    }[];
  }) {
    // `estado` y `fechaCreacion` los borra el PurgeResponseInterceptor:
    // viajan con otro nombre.
    return {
      idUsuario: u.idUsuario,
      codigoUsuario: u.codigoUsuario,
      nombreCompleto: u.nombreCompleto,
      rol: u.rol,
      activo: u.estado,
      soloLectura: u.soloLectura,
      todasLasEmpresas: u.todasLasEmpresas,
      creadoEl: u.fechaCreacion,
      empresas: u.empresasAsignadas.map((a) => a.empresaEmpleadora),
    };
  }

  /** El dueño y su equipo (el dueño solo para mostrarlo). */
  async listar() {
    const usuarios = await this.prisma.usuario.findMany({
      where: { rol: { in: [Rol.ADMIN, Rol.EQUIPO] } },
      select: this.campos,
      orderBy: [{ rol: 'asc' }, { codigoUsuario: 'asc' }],
    });
    return usuarios.map((u) => this.aRespuesta(u));
  }

  private async validarEmpresas(ids: number[]) {
    const unicos = [...new Set(ids.map(Number))];
    if (!unicos.length) return [];
    const existentes = await this.prisma.empresaEmpleadora.findMany({
      where: { idEmpresaEmpleadora: { in: unicos }, estado: true },
      select: { idEmpresaEmpleadora: true },
    });
    if (existentes.length !== unicos.length) {
      throw new BadRequestException(
        'Alguna de las empresas elegidas no existe o está dada de baja.',
      );
    }
    return unicos;
  }

  async crear(idCreador: number, dto: CrearMiembroEquipoDto) {
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
    const empresas = dto.todasLasEmpresas
      ? []
      : await this.validarEmpresas(dto.idsEmpresas ?? []);
    if (!dto.todasLasEmpresas && empresas.length === 0) {
      throw new BadRequestException(
        'Asigne al menos una empresa o marque «Todas las empresas».',
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
        rol: Rol.EQUIPO,
        soloLectura: dto.soloLectura ?? false,
        nombreCompleto: dto.nombreCompleto.trim(),
        todasLasEmpresas: dto.todasLasEmpresas,
        creadoPorId: idCreador,
        empresasAsignadas: {
          create: empresas.map((idEmpresaEmpleadora) => ({
            idEmpresaEmpleadora,
            asignadoPorId: idCreador,
          })),
        },
      },
      select: this.campos,
    });
    return this.aRespuesta(creado);
  }

  async actualizar(
    idEditor: number,
    idUsuario: number,
    dto: ActualizarMiembroEquipoDto,
  ) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { idUsuario, rol: Rol.EQUIPO },
      select: {
        idUsuario: true,
        todasLasEmpresas: true,
        empresasAsignadas: { select: { idEmpresaEmpleadora: true } },
      },
    });
    if (!usuario)
      throw new NotFoundException('Cuenta del equipo no encontrada');
    if (dto.activo === false && idUsuario === idEditor) {
      throw new BadRequestException('No puede desactivar su propia cuenta.');
    }

    const todas = dto.todasLasEmpresas ?? usuario.todasLasEmpresas;
    const empresas =
      dto.idsEmpresas !== undefined
        ? await this.validarEmpresas(dto.idsEmpresas)
        : undefined;
    // La regla se mira sobre cómo queda la cuenta, no sobre lo enviado:
    // quitar «Todas» sin mandar empresas la dejaba activa y sin ninguna.
    const quedan =
      empresas ?? usuario.empresasAsignadas.map((a) => a.idEmpresaEmpleadora);
    if (!todas && quedan.length === 0) {
      throw new BadRequestException(
        'Asigne al menos una empresa o marque «Todas las empresas».',
      );
    }

    const actualizado = await this.prisma.$transaction(async (tx) => {
      if (empresas !== undefined || todas) {
        await tx.usuarioEmpresa.deleteMany({ where: { idUsuario } });
        if (!todas && empresas?.length) {
          await tx.usuarioEmpresa.createMany({
            data: empresas.map((idEmpresaEmpleadora) => ({
              idUsuario,
              idEmpresaEmpleadora,
              asignadoPorId: idEditor,
            })),
          });
        }
      }
      if (dto.contrasena) {
        const debil = problemaContrasena(dto.contrasena, [dto.nombreCompleto]);
        if (debil) throw new BadRequestException(debil);
      }
      return tx.usuario.update({
        where: { idUsuario },
        data: {
          ...(dto.nombreCompleto && {
            nombreCompleto: dto.nombreCompleto.trim(),
          }),
          ...(dto.contrasena && {
            contrasena: await hash(dto.contrasena, 10),
          }),
          ...(dto.soloLectura !== undefined && {
            soloLectura: dto.soloLectura,
          }),
          ...(dto.todasLasEmpresas !== undefined && {
            todasLasEmpresas: dto.todasLasEmpresas,
          }),
          ...(dto.activo !== undefined && { estado: dto.activo }),
          actualizadoPorId: idEditor,
          fechaModificacion: new Date(),
        },
        select: this.campos,
      });
    });
    return this.aRespuesta(actualizado);
  }
}
