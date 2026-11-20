import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { CampanaService, paraRespuesta } from './campana.service';
import {
  ActualizarCampanaDto,
  CampanaQueryDto,
  CrearCampanaDto,
} from './dto/campana.dto';

/** Solo el administrador gestiona campañas (lo decide el token). */
const soloAdmin = (user: AuthUser) => {
  if (user.rol !== Rol.ADMIN) {
    throw new ForbiddenException('Solo un administrador gestiona campañas.');
  }
};

@ApiTags('Campañas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campana')
export class CampanaController {
  constructor(private readonly service: CampanaService) {}

  private resp<T extends { estado: string; fechaCreacion: Date }>(c?: T) {
    return c ? paraRespuesta(c) : c;
  }

  @Get()
  @ApiOperation({ summary: 'Campañas de una empresa (la en curso primero)' })
  async listar(@User() user: AuthUser, @Query() query: CampanaQueryDto) {
    soloAdmin(user);
    return {
      message: 'Campañas de la empresa.',
      data: { campanas: await this.service.listar(query.idEmpresaEmpleadora) },
    };
  }

  @Get(':id')
  async obtener(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    soloAdmin(user);
    return { message: 'Campaña.', data: { campana: paraRespuesta(await this.service.obtener(id)) } };
  }

  @Get(':id/impacto-cierre')
  @ApiOperation({ summary: 'Qué queda sin calificar si se cierra hoy' })
  async impacto(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    soloAdmin(user);
    return { message: 'Impacto del cierre.', data: await this.service.impactoCierre(id) };
  }

  @Post()
  @ApiOperation({
    summary: 'Abrir una campaña (con cerrarActual cierra la en curso en el mismo paso)',
  })
  async abrir(@User() user: AuthUser, @Body() dto: CrearCampanaDto) {
    soloAdmin(user);
    const r = await this.service.abrir(user, dto);
    return {
      message: 'Campaña abierta.',
      data: r && { ...r, campana: paraRespuesta(r.campana) },
    };
  }

  @Patch(':id')
  async actualizar(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCampanaDto,
  ) {
    soloAdmin(user);
    return {
      message: 'Campaña actualizada.',
      data: { campana: this.resp(await this.service.actualizar(user, id, dto)) },
    };
  }

  @Post(':id/cerrar')
  async cerrar(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    soloAdmin(user);
    return {
      message: 'Campaña cerrada.',
      data: { campana: this.resp(await this.service.cerrar(user, id)) },
    };
  }

  @Post(':id/reabrir')
  async reabrir(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    soloAdmin(user);
    return {
      message: 'Campaña reabierta.',
      data: { campana: this.resp(await this.service.reabrir(user, id)) },
    };
  }
}
