import { Module } from '@nestjs/common';
import { AreaEmpleadoraService } from './area-empleadora.service';
import { AreaEmpleadoraController } from './area-empleadora.controller';

@Module({
  controllers: [AreaEmpleadoraController],
  providers: [AreaEmpleadoraService],
})
export class AreaEmpleadoraModule {}
