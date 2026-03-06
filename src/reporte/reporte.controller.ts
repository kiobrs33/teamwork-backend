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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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
    @Param('idEmpleado', ParseIntPipe) idEmpleado: number,
    @Res() res: Response,
  ) {
    const pdf =
      await this.reporteService.obtenerDataReporteEvaluacion(idEmpleado);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=reporte-evaluacion-${idEmpleado}.pdf`,
    });

    res.end(pdf);
  }
}
