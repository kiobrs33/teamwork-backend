import { Module } from '@nestjs/common';
import { EquipoEmpleadoraService } from './equipo-empleadora.service';
import { EquipoEmpleadoraController } from './equipo-empleadora.controller';

@Module({
  controllers: [EquipoEmpleadoraController],
  providers: [EquipoEmpleadoraService],
})
export class EquipoEmpleadoraModule {}
