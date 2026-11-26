import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { AlcanceService } from 'src/autorizacion/alcance.service';
import {
  Alcance,
  ADMINISTRADORES,
  INTERNOS,
  TODOS,
  empresaDelListado,
  empresasDelAlcance,
  verificarEmpresa,
} from 'src/autorizacion/alcance';
import { Rol } from 'src/empleado/types/empleadoTypes';
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
import { CampanaService, paraRespuesta } from './campana.service';
import {
  ActualizarCampanaDto,
  CampanaQueryDto,
  CrearCampanaDto,
} from './dto/campana.dto';

@ApiTags('Campañas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Abrir, editar y reabrir: solo el superadministrador (TeamWork define cómo
// se evalúa). RR. HH. de la empresa ve y cierra sus campañas.
// Abrir, editar y reabrir: TeamWork (dueño y equipo, en sus empresas).
@Roles(...INTERNOS)
@Controller('campana')
export class CampanaController {
  constructor(
    private readonly service: CampanaService,
    private readonly alcances: AlcanceService,
  ) {}

  private resp<T extends { estado: string; fechaCreacion: Date }>(c?: T) {
    return c ? paraRespuesta(c) : c;
  }

  @Get()
  @ApiOperation({ summary: 'Campañas de una empresa (la en curso primero)' })
  @Roles(...ADMINISTRADORES)
  async listar(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Query() query: CampanaQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    ) as number;
    return {
      message: 'Campañas de la empresa.',
      data: { campanas: await this.service.listar(query.idEmpresaEmpleadora) },
    };
  }

  @Get(':id')
  @Roles(...ADMINISTRADORES)
  async obtener(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'campana', id);
    return {
      message: 'Campaña.',
      data: { campana: paraRespuesta(await this.service.obtener(id)) },
    };
  }

  @Get(':id/impacto-cierre')
  @ApiOperation({ summary: 'Qué queda sin calificar si se cierra hoy' })
  @Roles(...ADMINISTRADORES)
  async impacto(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'campana', id);
    return {
      message: 'Impacto del cierre.',
      data: await this.service.impactoCierre(id),
    };
  }

  @Get(':id/impacto-edicion')
  @ApiOperation({
    summary: 'A cuántos afecta editar la configuración de la campaña',
  })
  @Roles(...ADMINISTRADORES)
  async impactoEdicion(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'campana', id);
    return {
      message: 'Impacto de la edición.',
      data: await this.service.impactoEdicion(id),
    };
  }

  @Post()
  @ApiOperation({
    summary:
      'Abrir una campaña (con cerrarActual cierra la en curso en el mismo paso)',
  })
  async abrir(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CrearCampanaDto,
  ) {
    verificarEmpresa(alcance, Number(dto.idEmpresaEmpleadora), 'Empresa');
    const r = await this.service.abrir(user, dto);
    return {
      message: 'Campaña abierta.',
      data: r && { ...r, campana: paraRespuesta(r.campana) },
    };
  }

  @Patch(':id')
  async actualizar(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCampanaDto,
  ) {
    await this.alcances.verificar(alcance, 'campana', id);
    const actualizada = await this.service.actualizar(user, id, dto);
    return {
      message: 'Campaña actualizada.',
      data: {
        campana: this.resp(actualizada),
        // Notas vaciadas por pasar a Likert en un cambio excepcional (la
        // bitácora guarda el detalle con la nota anterior de cada una).
        notasVaciadas: actualizada?.notasVaciadas ?? [],
      },
    };
  }

  @Post(':id/cerrar')
  @Roles(...ADMINISTRADORES)
  async cerrar(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'campana', id);
    return {
      message: 'Campaña cerrada.',
      data: { campana: this.resp(await this.service.cerrar(user, id)) },
    };
  }

  @Post(':id/reabrir')
  async reabrir(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'campana', id);
    return {
      message: 'Campaña reabierta.',
      data: { campana: this.resp(await this.service.reabrir(user, id)) },
    };
  }
}
