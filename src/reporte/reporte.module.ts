import { Module } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';
import { EmpleadoModule } from 'src/empleado/empleado.module';
import { PdfRendererService } from './pdf/pdf-renderer.service';

@Module({
  imports: [
    EmpleadoModule, // 👈 IMPORTANTE
  ],
  controllers: [ReporteController],
  providers: [ReporteService, PdfRendererService],
})
export class ReporteModule {}
