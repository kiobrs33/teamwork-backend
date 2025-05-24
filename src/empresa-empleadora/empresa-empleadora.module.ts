import { Module } from '@nestjs/common';
import { EmpresaEmpleadoraService } from './empresa-empleadora.service';
import { EmpresaEmpleadoraController } from './empresa-empleadora.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EmpresaEmpleadoraController],
  providers: [EmpresaEmpleadoraService, PrismaService],
})
export class EmpresaEmpleadoraModule {}