import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EmpleadoModule } from './empleado/empleado.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpresaEmpleadoraModule } from './empresa-empleadora/empresa-empleadora.module';
import { PuestoEmpleadoraModule } from './puesto-empleadora/puesto-empleadora.module';
import { ObjetivoModule } from './objetivo/objetivo.module';
import { ObjetivoDetalleModule } from './objetivo-detalle/objetivo-detalle.module';
import { GerenciaEmpleadoraModule } from './gerencia-empleadora/gerencia-empleadora.module';
import { UnidadOcupacionalEmpleadoraModule } from './unidad-ocupacional-empleadora/unidad-ocupacional-empleadora.module';
import { AreaEmpleadoraModule } from './area-empleadora/area-empleadora.module';
import { CompetenciaModule } from './competencia/competencia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la app
    }),
    PrismaModule,
    AuthModule,
    EmpleadoModule,
    EmpresaEmpleadoraModule,
    PuestoEmpleadoraModule,
    ObjetivoModule,
    ObjetivoDetalleModule,
    GerenciaEmpleadoraModule,
    UnidadOcupacionalEmpleadoraModule,
    AreaEmpleadoraModule,
    CompetenciaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
