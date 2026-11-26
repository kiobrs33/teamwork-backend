import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { ADMINISTRADORES } from 'src/autorizacion/alcance';
import { ConsultaDocumentoService } from './consulta-documento.service';

/**
 * Autocompletado de formularios: datos de RENIEC por DNI (alta de
 * trabajadores) y de SUNAT por RUC (alta de empresas). Solo para quienes
 * llenan esos formularios; no guarda nada.
 */
@ApiTags('Consulta de DNI y RUC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('consulta-documento')
export class ConsultaDocumentoController {
  constructor(private readonly service: ConsultaDocumentoService) {}

  @Get('dni/:dni')
  @ApiOperation({ summary: 'Nombres y apellidos de un DNI (RENIEC)' })
  async dni(@Param('dni') dni: string) {
    return {
      message: 'DNI encontrado.',
      data: { persona: await this.service.dni(dni.trim()) },
    };
  }

  @Get('ruc/:ruc')
  @ApiOperation({
    summary: 'Razón social, estado y dirección de un RUC (SUNAT)',
  })
  async ruc(@Param('ruc') ruc: string) {
    return {
      message: 'RUC encontrado.',
      data: { contribuyente: await this.service.ruc(ruc.trim()) },
    };
  }
}
