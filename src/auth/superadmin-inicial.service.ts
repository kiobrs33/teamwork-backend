import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { problemaContrasena } from 'src/common/acceso/politica-contrasena';
import { Rol } from 'src/empleado/types/empleadoTypes';

/** Más exigente que la de trabajadores: es la cuenta que controla todo. */
const LARGO_MINIMO = 12;

/**
 * Crea el superadministrador de una instalación limpia a partir de
 * `SUPERADMIN_USUARIO` y `SUPERADMIN_CONTRASENA` (y `SUPERADMIN_NOMBRE`,
 * opcional). Reemplaza al seed en producción, que crea cuentas de prueba con
 * contraseña conocida.
 *
 * Solo actúa si **no hay ningún ADMIN activo**: en los despliegues siguientes
 * no hace nada, aunque las variables sigan puestas, y nunca cambia la
 * contraseña de una cuenta existente. Una vez creado conviene quitar
 * `SUPERADMIN_CONTRASENA` del entorno.
 *
 * Una contraseña débil detiene el arranque con el motivo: mejor no levantar
 * que dejar la consola protegida por "12345678".
 */
@Injectable()
export class SuperadminInicialService implements OnApplicationBootstrap {
  private readonly logger = new Logger('SuperadminInicial');

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const usuario = (
      this.config.get<string>('SUPERADMIN_USUARIO') ?? ''
    ).trim();
    const contrasena = this.config.get<string>('SUPERADMIN_CONTRASENA') ?? '';
    if (!usuario && !contrasena) return;

    const hayAdmin = await this.prisma.usuario.count({
      where: { rol: Rol.ADMIN, estado: true },
    });
    if (hayAdmin > 0) {
      if (contrasena)
        this.logger.warn(
          'Ya existe un superadministrador: SUPERADMIN_CONTRASENA no se usa y conviene quitarla del entorno.',
        );
      return;
    }

    if (!usuario || !contrasena)
      throw new Error(
        'Para crear el superadministrador inicial faltan SUPERADMIN_USUARIO o SUPERADMIN_CONTRASENA.',
      );
    if (!/^[A-Za-z0-9._-]{3,50}$/.test(usuario))
      throw new Error(
        'SUPERADMIN_USUARIO: de 3 a 50 caracteres, solo letras, números, punto, guion o guion bajo.',
      );
    const problema =
      contrasena.length < LARGO_MINIMO
        ? `La contraseña debe tener al menos ${LARGO_MINIMO} caracteres.`
        : problemaContrasena(contrasena, [usuario]);
    if (problema) throw new Error(`SUPERADMIN_CONTRASENA: ${problema}`);

    // Las cuentas del sistema son únicas en todo el sistema (idEmpresaCuenta
    // null); el índice no lo garantiza con NULL, así que se comprueba aquí.
    const tomado = await this.prisma.usuario.findFirst({
      where: { codigoUsuario: usuario, idEmpresaCuenta: null },
      select: { idUsuario: true },
    });
    if (tomado)
      throw new Error(
        `SUPERADMIN_USUARIO: el usuario «${usuario}» ya existe y no es un superadministrador activo.`,
      );

    await this.prisma.usuario.create({
      data: {
        codigoUsuario: usuario,
        contrasena: await hash(contrasena, 10),
        rol: Rol.ADMIN,
        nombreCompleto:
          (this.config.get<string>('SUPERADMIN_NOMBRE') ?? '').trim() ||
          'Administrador TeamWork',
      },
    });
    this.logger.log(
      `Superadministrador «${usuario}» creado. Quite SUPERADMIN_CONTRASENA del entorno.`,
    );
  }
}
