import { Module } from '@nestjs/common';
import { UnidadEmpleadoraService } from './unidad-empleadora.service';
import { UnidadEmpleadoraController } from './unidad-empleadora.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UnidadEmpleadoraController],
  providers: [UnidadEmpleadoraService, PrismaService],
})
export class UnidadEmpleadoraModule {}
