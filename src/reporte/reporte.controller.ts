// import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
// import { Response } from 'express';
// import { ReporteService } from './reporte.service';

// @Controller('reporte')
// export class ReporteController {
//   constructor(private readonly reporteService: ReporteService) {}

//   @Get('evaluacion/:idEmpleado/pdfv1')
//   async generarReporteEvaluacionPDFV1(
//     @Param('idEmpleado', ParseIntPipe) idEmpleado: number,
//     @Res() res: Response,
//   ) {
//     const pdf =
//       await this.reporteService.generarReporteEvaluacionPDF(idEmpleado);

//     res.set({
//       'Content-Type': 'application/pdf',
//       // 'Content-Disposition': 'inline; filename=reporte-evaluacion.pdf',
//       'Content-Disposition': 'attachment; filename=reporte-evaluacion.pdf',
//     });

//     res.end(pdf);
//   }

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

import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReporteService } from './reporte.service';

@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Get('evaluacion/:idEmpleado/pdf')
  async generarReporteEvaluacionPDF(
    @Param('idEmpleado', ParseIntPipe) idEmpleado: number,
    @Res() res: Response,
  ) {
    const pdf =
      await this.reporteService.obtenerDataReporteEvaluacion(idEmpleado);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte-evaluacion.pdf',
    });

    res.end(pdf);
  }
}
