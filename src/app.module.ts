import { AdministradorEmpresaModule } from './administrador-empresa/administrador-empresa.module';
import { AutorizacionModule } from './autorizacion/autorizacion.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validarEntorno } from './config/env.validation';
import { EmpleadoModule } from './empleado/empleado.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpresaEmpleadoraModule } from './empresa-empleadora/empresa-empleadora.module';
import { PuestoEmpleadoraModule } from './puesto-empleadora/puesto-empleadora.module';
import { ObjetivoModule } from './objetivo/objetivo.module';
import { GerenciaEmpleadoraModule } from './gerencia-empleadora/gerencia-empleadora.module';
import { UnidadOcupacionalEmpleadoraModule } from './unidad-ocupacional-empleadora/unidad-ocupacional-empleadora.module';
import { AreaEmpleadoraModule } from './area-empleadora/area-empleadora.module';
import { CompetenciaModule } from './competencia/competencia.module';
import { EmpleoModule } from './empleo/empleo.module';
import { LoggerModule } from 'nestjs-pino';
import { ReporteModule } from './reporte/reporte.module';
import { RetroalimentacionDetalleModule } from './retroalimentacion-detalle/retroalimentacion-detalle.module';
import { EvidenciaModule } from './evidencia/evidencia.module';
import { CampanaModule } from './campana/campana.module';

@Module({
  imports: [
    AutorizacionModule,
    AdministradorEmpresaModule,
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la app
      // Dos archivos, en este orden: el del entorno pisa a la base.
      //
      // `.env` es la base porque es lo único que lee el CLI de Prisma, que no
      // entiende de NODE_ENV; ahí vive `DATABASE_URL` y de ahí la hereda Nest,
      // sin duplicarla. El resto va en `.env.development`; en producción no hay
      // archivo y las variables las inyecta DigitalOcean.
      //
      // El fallback a 'development' importa: `npm start` (sin cross-env) deja
      // NODE_ENV sin definir y antes se buscaba el archivo `.env.undefined`.
      // Como indicar `envFilePath` desactiva la carga de `.env`, Nest terminaba
      // sin ninguna variable y el login fallaba sin explicación.
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      validate: validarEntorno,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty', // 👀 transforma JSON en formato legible
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            singleLine: false,
          },
        },
      },
    }),
    PrismaModule,
    AuthModule,
    EmpleadoModule,
    EmpresaEmpleadoraModule,
    PuestoEmpleadoraModule,
    ObjetivoModule,
    GerenciaEmpleadoraModule,
    UnidadOcupacionalEmpleadoraModule,
    AreaEmpleadoraModule,
    CompetenciaModule,
    EmpleoModule,
    ReporteModule,
    RetroalimentacionDetalleModule,
    EvidenciaModule,
    CampanaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
