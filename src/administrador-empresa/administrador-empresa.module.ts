import { Module } from '@nestjs/common';
import {
  AdministradorEmpresaController,
  AdministradoresTodasController,
} from './administrador-empresa.controller';
import { AdministradorEmpresaService } from './administrador-empresa.service';

@Module({
  controllers: [AdministradorEmpresaController, AdministradoresTodasController],
  providers: [AdministradorEmpresaService],
})
export class AdministradorEmpresaModule {}
