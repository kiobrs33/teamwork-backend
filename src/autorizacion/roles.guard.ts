import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { Alcance } from './alcance';
import { AlcanceService } from './alcance.service';

const CLAVE_ROLES = 'roles-permitidos';

/** Quién puede llamar a una ruta (o a todas las de un controlador). */
export const Roles = (...roles: Rol[]) => SetMetadata(CLAVE_ROLES, roles);

/**
 * Va DESPUÉS de JwtAuthGuard: comprueba el rol y deja el alcance del usuario
 * en la petición (`@AlcanceActual()`).
 *
 * Falla cerrado: una ruta sin `@Roles` responde error en vez de quedar
 * abierta a cualquier autenticado, que es como estaba toda la API.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly alcances: AlcanceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permitidos = this.reflector.getAllAndOverride<Rol[] | undefined>(
      CLAVE_ROLES,
      [context.getHandler(), context.getClass()],
    );
    if (!permitidos?.length) {
      throw new InternalServerErrorException(
        'Ruta sin política de acceso: falta @Roles',
      );
    }

    const request = context.switchToHttp().getRequest();
    const alcance = await this.alcances.de(request.user);
    request.alcance = alcance;

    if (!permitidos.includes(alcance.rol)) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }
    return true;
  }
}

/** El alcance que calculó `RolesGuard` para el usuario de la petición. */
export const AlcanceActual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Alcance =>
    ctx.switchToHttp().getRequest().alcance,
);
