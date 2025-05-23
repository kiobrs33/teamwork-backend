import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EmpleadoModule } from './empleado/empleado.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la app
    }),
    PrismaModule,
    AuthModule,
    EmpleadoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
