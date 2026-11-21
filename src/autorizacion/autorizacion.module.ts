import { Global, Module } from '@nestjs/common';
import { AlcanceService } from './alcance.service';
import { RolesGuard } from './roles.guard';

/** Roles y alcance por empresa, disponibles en todos los módulos. */
@Global()
@Module({
  providers: [AlcanceService, RolesGuard],
  exports: [AlcanceService, RolesGuard],
})
export class AutorizacionModule {}
