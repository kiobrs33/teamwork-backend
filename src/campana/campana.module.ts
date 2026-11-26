import { Module } from '@nestjs/common';
import { CampanaController } from './campana.controller';
import { CampanaService } from './campana.service';
import { CompetenciaModule } from 'src/competencia/competencia.module';

@Module({
  // El aviso de cierre usa el cálculo de resultados (quién fue evaluado).
  imports: [CompetenciaModule],
  controllers: [CampanaController],
  providers: [CampanaService],
})
export class CampanaModule {}
