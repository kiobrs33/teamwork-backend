import { Module } from '@nestjs/common';
import { CompetenciaModule } from 'src/competencia/competencia.module';
import { PdfRendererService } from 'src/reporte/pdf/pdf-renderer.service';
import { CalibracionController } from './calibracion.controller';
import { CalibracionService } from './calibracion.service';

@Module({
  imports: [CompetenciaModule],
  controllers: [CalibracionController],
  providers: [CalibracionService, PdfRendererService],
})
export class CalibracionModule {}
