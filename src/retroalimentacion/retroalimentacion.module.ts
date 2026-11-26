import { Module } from '@nestjs/common';
import { CompetenciaModule } from 'src/competencia/competencia.module';
import { ReporteModule } from 'src/reporte/reporte.module';
import { RetroalimentacionController } from './retroalimentacion.controller';
import { RetroalimentacionService } from './retroalimentacion.service';

@Module({
  imports: [CompetenciaModule, ReporteModule],
  controllers: [RetroalimentacionController],
  providers: [RetroalimentacionService],
})
export class RetroalimentacionModule {}
