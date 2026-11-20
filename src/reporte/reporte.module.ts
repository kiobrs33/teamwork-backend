import { Module } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';
import { PdfRendererService } from './pdf/pdf-renderer.service';

@Module({
  controllers: [ReporteController],
  providers: [ReporteService, PdfRendererService],
})
export class ReporteModule {}
