import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Permitir todas las solicitudes CORS
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description for your project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si se envían propiedades no esperadas
      forbidUnknownValues: true, // lanza error si se envía null en vez de objeto
      // transform: true, // convierte los tipos
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
  console.log(`📘 Documentación Swagger: http://localhost:${port}/api`);
}
bootstrap();
