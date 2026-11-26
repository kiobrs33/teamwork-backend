import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Query,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import {
  Alcance,
  ADMINISTRADORES,
  empresaDelListado,
} from 'src/autorizacion/alcance';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { RetroalimentacionService } from './retroalimentacion.service';
import {
  ConformidadDto,
  SesionRetroalimentacionDto,
} from './dto/retroalimentacion.dto';

/**
 * Sesiones de retroalimentación de la campaña en curso. El jefe las
 * registra, el trabajador responde y RR. HH. hace el seguimiento.
 */
@ApiTags('Retroalimentación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('retroalimentacion')
export class RetroalimentacionController {
  constructor(private readonly service: RetroalimentacionService) {}

  @Get('equipo')
  @Roles(Rol.JEFE)
  @ApiOperation({ summary: 'Equipo del jefe con resultado y sesión' })
  async equipo(@User() user: AuthUser) {
    return { message: 'Equipo.', data: await this.service.equipo(user) };
  }

  @Get('equipo/:idEmpleado/apoyo')
  @Roles(Rol.JEFE)
  @ApiOperation({
    summary:
      'Para preparar la sesión: competencias y objetivos con su nota, frente a lo esperado',
  })
  async apoyo(
    @User() user: AuthUser,
    @Param('idEmpleado', ParseIntPipe) idEmpleado: number,
  ) {
    return {
      message: 'Apoyo para la sesión.',
      data: await this.service.apoyo(user, idEmpleado),
    };
  }

  @Put('sesion')
  @Roles(Rol.JEFE)
  @ApiOperation({ summary: 'Registrar o corregir la sesión de un trabajador' })
  async sesion(
    @User() user: AuthUser,
    @Body() dto: SesionRetroalimentacionDto,
  ) {
    const sesion = await this.service.registrarSesion(user, dto);
    return {
      message: 'Sesión de retroalimentación guardada.',
      data: { sesion },
    };
  }

  @Get('mia')
  @Roles(Rol.JEFE, Rol.EMPLEADO)
  @ApiOperation({ summary: 'Mi retroalimentación de la campaña en curso' })
  async mia(@User() user: AuthUser) {
    return {
      message: 'Retroalimentación.',
      data: await this.service.mia(user),
    };
  }

  @Put('mia/conformidad')
  @Roles(Rol.JEFE, Rol.EMPLEADO)
  @ApiOperation({ summary: 'Responder si está conforme con su resultado' })
  async conformidad(@User() user: AuthUser, @Body() dto: ConformidadDto) {
    const sesion = await this.service.responder(user, dto);
    return { message: 'Respuesta registrada.', data: { sesion } };
  }

  @Get('empresa')
  @Roles(...ADMINISTRADORES)
  @ApiOperation({
    summary: 'Seguimiento de la retroalimentación de la empresa',
  })
  async empresa(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
  ) {
    const id = Number(empresaDelListado(alcance, idEmpresa));
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Indique la empresa.');
    return {
      message: 'Seguimiento de retroalimentación.',
      data: await this.service.empresa(id),
    };
  }
}
