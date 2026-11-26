import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { enviarExcel } from 'src/common/excel/libro-excel';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { ADMINISTRADORES, Alcance } from 'src/autorizacion/alcance';
import { ActividadService } from './actividad.service';
import { ActividadQueryDto } from './dto/actividad-query.dto';

/**
 * Bitácora de actividad. La ven el dueño (todo), el equipo (sus empresas) y
 * RR. HH. (su empresa). No tiene rutas para editar ni borrar.
 */
@ApiTags('Actividad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('actividad')
export class ActividadController {
  constructor(private readonly service: ActividadService) {}

  @Get('export/excel')
  @ApiOperation({ summary: 'Bitácora en Excel (mismos filtros que la tabla)' })
  async exportar(
    @AlcanceActual() alcance: Alcance,
    @Query() query: ActividadQueryDto,
    @Res() res: Response,
  ) {
    enviarExcel(res, await this.service.exportar(alcance, query), 'actividad');
  }

  @Get()
  @ApiOperation({
    summary: 'Bitácora de actividad (con el alcance del usuario)',
  })
  async listar(
    @AlcanceActual() alcance: Alcance,
    @Query() query: ActividadQueryDto,
  ) {
    return {
      message: 'Actividad.',
      data: await this.service.listar(alcance, query),
    };
  }
}
