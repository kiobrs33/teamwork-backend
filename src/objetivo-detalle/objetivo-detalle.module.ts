import { Module } from '@nestjs/common';
import { ObjetivoDetalleService } from './objetivo-detalle.service';
import { ObjetivoDetalleController } from './objetivo-detalle.controller';

@Module({
  controllers: [ObjetivoDetalleController],
  providers: [ObjetivoDetalleService],
})
export class ObjetivoDetalleModule {}
