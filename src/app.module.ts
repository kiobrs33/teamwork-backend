import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EmpleadoModule } from './empleado/empleado.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpresaEmpleadoraModule } from './empresa-empleadora/empresa-empleadora.module';
import { EquipoEmpleadoraModule } from './equipo-empleadora/equipo-empleadora.module';
import { PuestoEmpleadoraModule } from './puesto-empleadora/puesto-empleadora.module';
import { UnidadEmpleadoraModule } from './unidad-empleadora/unidad-empleadora.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la app
    }),
    PrismaModule,
    AuthModule,
    EmpleadoModule,
    EmpresaEmpleadoraModule,
    EquipoEmpleadoraModule,
    PuestoEmpleadoraModule,
    UnidadEmpleadoraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
