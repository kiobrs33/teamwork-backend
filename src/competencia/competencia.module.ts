import { Module } from '@nestjs/common';
import { CompetenciaService } from './competencia.service';
import { CompetenciaController } from './competencia.controller';
import { EmpleadoModule } from 'src/empleado/empleado.module';

@Module({
  // El Excel de la campaña incluye el avance por trabajador.
  imports: [EmpleadoModule],
  controllers: [CompetenciaController],
  providers: [CompetenciaService],
  // La calibración reutiliza el cálculo de resultados del Excel.
  exports: [CompetenciaService],
})
export class CompetenciaModule {}
