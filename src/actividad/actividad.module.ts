import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActividadController } from './actividad.controller';
import { ActividadInterceptor } from './actividad.interceptor';
import { ActividadService } from './actividad.service';

/** Bitácora: el interceptor global registra cada operación que cambia datos. */
@Global()
@Module({
  controllers: [ActividadController],
  providers: [
    ActividadService,
    { provide: APP_INTERCEPTOR, useClass: ActividadInterceptor },
  ],
  exports: [ActividadService],
})
export class ActividadModule {}
