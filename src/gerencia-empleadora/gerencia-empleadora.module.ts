import { Module } from '@nestjs/common';
import { GerenciaEmpleadoraService } from './gerencia-empleadora.service';
import { GerenciaEmpleadoraController } from './gerencia-empleadora.controller';

@Module({
  controllers: [GerenciaEmpleadoraController],
  providers: [GerenciaEmpleadoraService],
})
export class GerenciaEmpleadoraModule {}
