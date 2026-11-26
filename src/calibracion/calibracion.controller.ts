import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import {
  Alcance,
  ADMINISTRADORES,
  empresaDelListado,
} from 'src/autorizacion/alcance';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { PdfRendererService } from 'src/reporte/pdf/pdf-renderer.service';
import { CalibracionService } from './calibracion.service';
import { AjusteCalibracionDto } from './dto/ajuste-calibracion.dto';

/**
 * Calibración de la campaña en curso: RR. HH. y TeamWork. Ajustar y quitar
 * son escritura (las cuentas de solo lectura las tiene bloqueadas el
 * RolesGuard); ver y descargar el acta, no.
 */
@ApiTags('Calibración')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('calibracion')
export class CalibracionController {
  constructor(
    private readonly service: CalibracionService,
    private readonly pdf: PdfRendererService,
  ) {}

  private empresa(alcance: Alcance, pedida: unknown) {
    const id = Number(empresaDelListado(alcance, pedida as string));
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Indique la empresa.');
    return id;
  }

  @Get()
  @ApiOperation({ summary: 'Resultados de la campaña en curso para calibrar' })
  async panel(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
  ) {
    return {
      message: 'Resultados para calibrar.',
      data: await this.service.panel(this.empresa(alcance, idEmpresa)),
    };
  }

  @Put('ajustes')
  @ApiOperation({
    summary: 'Ajustar (o reemplazar el ajuste de) un trabajador',
  })
  async ajustar(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: AjusteCalibracionDto,
  ) {
    const idEmpresa = this.empresa(alcance, dto.idEmpresaEmpleadora);
    const ajuste = await this.service.ajustar(user, {
      ...dto,
      idEmpresaEmpleadora: idEmpresa,
    });
    return { message: 'Resultado calibrado.', data: { ajuste } };
  }

  // `:id` es el trabajador: así la bitácora anota de quién se quitó.
  @Delete('ajustes/:id')
  @ApiOperation({ summary: 'Quitar el ajuste de un trabajador' })
  async quitar(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) idEmpleado: number,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
  ) {
    return {
      message: 'Ajuste quitado: vuelve a valer el cálculo.',
      data: await this.service.quitar(
        this.empresa(alcance, idEmpresa),
        idEmpleado,
      ),
    };
  }

  @Get('acta/pdf')
  @ApiOperation({ summary: 'Acta de calibración en PDF' })
  async acta(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @Query('comite') comite: string | undefined,
    @Res() res: Response,
  ) {
    const miembros = String(comite ?? '')
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 12);
    const datos = await this.service.acta(
      this.empresa(alcance, idEmpresa),
      miembros,
    );
    const pdf = await this.pdf.render('acta-calibracion', datos, {
      piePagina: `Acta de calibración · ${datos.empresa} · ${datos.campana}`,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=acta-calibracion.pdf',
    });
    res.send(pdf);
  }
}
