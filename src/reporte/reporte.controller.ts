// import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
// import { Response } from 'express';
// import { ReporteService } from './reporte.service';

// @Controller('reporte')
// export class ReporteController {
//   constructor(private readonly reporteService: ReporteService) {}

//   @Get('evaluacion/:idEmpleado/pdf')
//   async generarReporteEvaluacionPDF(
//     @Param('idEmpleado', ParseIntPipe) idEmpleado: number,
//     @Res() res: Response,
//   ) {
//     const pdf =
//       await this.reporteService.obtenerDataReporteEvaluacion(idEmpleado);

//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': 'attachment; filename=reporte-evaluacion.pdf',
//     });

//     res.end(pdf);
//   }
// }

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { ReporteService } from './reporte.service';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/jwt.guard';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Get('evaluacion/:idEmpleado/pdf')
  @ApiOperation({
    summary: 'Generar reporte PDF de evaluación de desempeño de un empleado',
    description:
      'Genera un reporte en formato PDF con los resultados de la evaluación de competencias y objetivos del empleado.',
  })
  @ApiParam({
    name: 'idEmpleado',
    description: 'ID del empleado evaluado',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte PDF generado correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Empleado no encontrado.',
  })
  async generarReporteEvaluacionPDF(
    @User() user: AuthUser,
    @Param('idEmpleado', ParseIntPipe) idEmpleado: number,
    @Query('campana') campanaParam: string | undefined,
    @Res() res: Response,
  ) {
    // Sin `campana` (id), la en curso. El acceso se comprueba con el token:
    // antes cualquier usuario con sesión descargaba el informe de cualquiera.
    const idCampana = campanaParam ? Number(campanaParam) || undefined : undefined;
    await this.reporteService.verificarAcceso(user, idEmpleado, idCampana);

    const pdf = await this.reporteService.obtenerDataReporteEvaluacion(
      idEmpleado,
      idCampana,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=reporte-evaluacion-${idEmpleado}${idCampana ? `-campana-${idCampana}` : ''}.pdf`,
    });

    res.end(pdf);
  }
  // ─────────────────────────── historial ───────────────────────────

  @Get('mis-campanas')
  @ApiOperation({
    summary: 'Mis resultados: campañas CERRADAS del usuario conectado',
  })
  async misCampanas(@User() user: AuthUser) {
    const idEmpleado = await this.reporteService.idEmpleadoDe(user);
    return {
      message: 'Campañas cerradas del trabajador.',
      data: {
        idEmpleado,
        campanas: await this.reporteService.campanasDeEmpleado(idEmpleado, true),
      },
    };
  }

  @Get('campanas/:idEmpleado')
  @ApiOperation({
    summary: 'Historial de campañas de un trabajador (admin o su jefe)',
  })
  async campanas(
    @User() user: AuthUser,
    @Param('idEmpleado', ParseIntPipe) idEmpleado: number,
  ) {
    const propio =
      user.rol !== 'ADMIN' &&
      (await this.reporteService.idEmpleadoDe(user).catch(() => null)) ===
        idEmpleado;
    // Sobre uno mismo, las mismas reglas que "Mis resultados".
    if (!propio) {
      await this.reporteService.verificarAcceso(user, idEmpleado);
    }
    return {
      message: 'Historial de campañas.',
      data: {
        campanas: await this.reporteService.campanasDeEmpleado(idEmpleado, propio),
      },
    };
  }
}
