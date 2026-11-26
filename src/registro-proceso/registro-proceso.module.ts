import { Module } from '@nestjs/common';
import { RegistroProcesoController } from './registro-proceso.controller';
import { RegistroProcesoService } from './registro-proceso.service';

@Module({
  controllers: [RegistroProcesoController],
  providers: [RegistroProcesoService],
})
export class RegistroProcesoModule {}
