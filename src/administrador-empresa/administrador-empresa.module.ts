import { Module } from '@nestjs/common';
import { AdministradorEmpresaController } from './administrador-empresa.controller';
import { AdministradorEmpresaService } from './administrador-empresa.service';

@Module({
  controllers: [AdministradorEmpresaController],
  providers: [AdministradorEmpresaService],
})
export class AdministradorEmpresaModule {}
