import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {EmpleadoModule} from './empleado/empleado.module';
import {PrismaModule} from './prisma/prisma.module';
import {AuthModule} from './auth/auth.module';
import {EmpresaEmpleadoraModule} from './empresa-empleadora/empresa-empleadora.module';
import {PuestoEmpleadoraModule} from './puesto-empleadora/puesto-empleadora.module';
import {ObjetivoModule} from './objetivo/objetivo.module';
import {ObjetivoDetalleModule} from './objetivo-detalle/objetivo-detalle.module';
import {GerenciaEmpleadoraModule} from './gerencia-empleadora/gerencia-empleadora.module';
import {UnidadOcupacionalEmpleadoraModule} from './unidad-ocupacional-empleadora/unidad-ocupacional-empleadora.module';
import {AreaEmpleadoraModule} from './area-empleadora/area-empleadora.module';
import {CompetenciaModule} from './competencia/competencia.module';
import {EmpleoModule} from './empleo/empleo.module';
import {LoggerModule} from "nestjs-pino";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Disponible en toda la app
            envFilePath: [`.env.${process.env.NODE_ENV}`],
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
        ObjetivoDetalleModule,
        GerenciaEmpleadoraModule,
        UnidadOcupacionalEmpleadoraModule,
        AreaEmpleadoraModule,
        CompetenciaModule,
        EmpleoModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
