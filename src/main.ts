import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { PurgeResponseInterceptor } from './common/interceptors/purge-response.interceptor';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Almacena los logs temporalmente durante el arranque de la aplicación
    bufferLogs: true,
  });

  // Usa el logger configurado en la aplicación (reemplaza el logger por defecto)
  app.useLogger(app.get(Logger));

  // Permite recibir solicitudes JSON de hasta 50MB (útil para cargas masivas)
  app.use(json({ limit: '50mb' }));

  // Permite recibir formularios grandes y estructuras complejas (x-www-form-urlencoded)
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Configuración de variables de entorno
  const configService = app.get(ConfigService);
  // console.log('NODE_ENV:', configService.get('NODE_ENV'));
  // console.log('JWT_SECRET_KEY:', configService.get('JWT_SECRET_KEY'));
  // console.log('DB_URL:', configService.get('DATABASE_URL'));
  app.enableCors({
    origin: '*', // Permitir todas las solicitudes CORS
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: false, // lanza error si se envían propiedades no esperadas
      forbidUnknownValues: true, // lanza error si se envía null en vez de objeto
      // transform: true,
    }),
  );

  const configSwagger = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for your project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document, {
    // URL: /docs
    swaggerOptions: { persistAuthorization: true }, // 👈 guarda el JWT
  });

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new PurgeResponseInterceptor(),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
  console.log(`📘 Documentación Swagger: http://localhost:${port}/api`);
}

bootstrap();
