import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import {
  Alcance,
  ADMINISTRADORES,
  empresaDelListado,
} from 'src/autorizacion/alcance';
import { enviarExcel } from 'src/common/excel/libro-excel';
import {
  PlantillaService,
  TIPOS_PLANTILLA,
  type TipoPlantilla,
} from './plantilla.service';

/**
 * Plantillas de importación de una empresa, con el formato de la de
 * trabajadores: instrucciones, títulos con línea gris y listas desplegables.
 * GET solamente: las cuentas de solo lectura también pueden descargarlas.
 */
@ApiTags('Plantilla')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('plantilla')
export class PlantillaController {
  constructor(private readonly service: PlantillaService) {}

  @Get(':tipo')
  @ApiOperation({ summary: 'Plantilla de importación de una empresa' })
  async descargar(
    @AlcanceActual() alcance: Alcance,
    @Param('tipo') tipo: string,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @Res() res: Response,
  ) {
    if (!(TIPOS_PLANTILLA as readonly string[]).includes(tipo))
      throw new BadRequestException('Plantilla no encontrada.');
    const id = Number(empresaDelListado(alcance, idEmpresa));
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Indique la empresa.');
    const buffer = await this.service.construir(tipo as TipoPlantilla, id);
    enviarExcel(res, buffer, `plantilla-${tipo}`);
  }
}
