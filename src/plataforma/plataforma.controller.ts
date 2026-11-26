import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { INTERNOS } from 'src/autorizacion/alcance';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { PlataformaService } from './plataforma.service';
import { ActualizarConfiguracionDto } from './dto/configuracion.dto';

/**
 * Configuración de la plataforma TeamWork (no de una empresa). La leen el
 * dueño y el equipo (la consola la usa); solo el dueño la cambia.
 */
@ApiTags('Plataforma')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plataforma')
export class PlataformaController {
  constructor(private readonly service: PlataformaService) {}

  @Get('configuracion')
  @Roles(...INTERNOS)
  @ApiOperation({
    summary: 'Configuración de la plataforma (color de la consola)',
  })
  async leer() {
    return {
      message: 'Configuración de la plataforma.',
      data: { configuracion: await this.service.leer() },
    };
  }

  @Patch('configuracion')
  @Roles(Rol.ADMIN)
  @ApiOperation({
    summary: 'Cambiar la configuración de la plataforma (solo el dueño)',
  })
  async actualizar(
    @User() user: AuthUser,
    @Body() dto: ActualizarConfiguracionDto,
  ) {
    return {
      message: 'Configuración de la plataforma actualizada.',
      data: { configuracion: await this.service.actualizar(user, dto) },
    };
  }
}
