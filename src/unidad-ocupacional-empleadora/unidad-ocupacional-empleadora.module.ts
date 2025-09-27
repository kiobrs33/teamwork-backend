import { Module } from '@nestjs/common';
import { UnidadOcupacionalEmpleadoraService } from './unidad-ocupacional-empleadora.service';
import { UnidadOcupacionalEmpleadoraController } from './unidad-ocupacional-empleadora.controller';

@Module({
  controllers: [UnidadOcupacionalEmpleadoraController],
  providers: [UnidadOcupacionalEmpleadoraService],
})
export class UnidadOcupacionalEmpleadoraModule {}
