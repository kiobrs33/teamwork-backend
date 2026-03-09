import { Module } from '@nestjs/common';
import { RetroalimentacionDetalleService } from './retroalimentacion-detalle.service';
import { RetroalimentacionDetalleController } from './retroalimentacion-detalle.controller';

@Module({
  controllers: [RetroalimentacionDetalleController],
  providers: [RetroalimentacionDetalleService],
})
export class RetroalimentacionDetalleModule {}
