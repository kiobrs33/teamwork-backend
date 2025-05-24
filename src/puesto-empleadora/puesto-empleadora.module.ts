import { Module } from '@nestjs/common';
import { PuestoEmpleadoraService } from './puesto-empleadora.service';
import { PuestoEmpleadoraController } from './puesto-empleadora.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PuestoEmpleadoraController],
  providers: [PuestoEmpleadoraService, PrismaService],
})
export class PuestoEmpleadoraModule {}
