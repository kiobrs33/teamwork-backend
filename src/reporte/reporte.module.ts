import { Module } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';
import { PdfRendererService } from './pdf/pdf-renderer.service';

@Module({
  controllers: [ReporteController],
  providers: [ReporteService, PdfRendererService],
  // Retroalimentación arma su «apoyo para la sesión» con el mismo cálculo.
  exports: [ReporteService],
})
export class ReporteModule {}
