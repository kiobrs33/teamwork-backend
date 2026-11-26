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
import helmet from 'helmet';
import { configurarCloudinary } from './config/cloudinary';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Almacena los logs temporalmente durante el arranque de la aplicación
    bufferLogs: true,
  });

  // Usa el logger configurado en la aplicación (reemplaza el logger por defecto)
  app.useLogger(app.get(Logger));

  // Encabezados de seguridad (sin MIME sniffing, sin iframes ajenos, HSTS…).
  // La CSP por defecto rompería Swagger, que carga scripts en línea; la API
  // solo devuelve JSON y archivos, así que no le hace falta.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Permite recibir solicitudes JSON de hasta 50MB (útil para cargas masivas)
  app.use(json({ limit: '50mb' }));

  // Permite recibir formularios grandes y estructuras complejas (x-www-form-urlencoded)
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Configuración de variables de entorno
  const configService = app.get(ConfigService);

  // Tiene que ir acá y no en el cuerpo de `config/cloudinary.ts`: ese módulo se
  // importa antes de que ConfigModule lea los `.env`, así que allá las
  // credenciales todavía no existen. Ver el comentario de esa función.
  // Credenciales y carpeta raíz del entorno (CLOUDINARY_CARPETA_RAIZ).
  configurarCloudinary(configService);
  // console.log('NODE_ENV:', configService.get('NODE_ENV'));
  // console.log('JWT_SECRET_KEY:', configService.get('JWT_SECRET_KEY'));
  // console.log('DB_URL:', configService.get('DATABASE_URL'));
  // Solo los sitios de TeamWork pueden llamar a la API desde el navegador
  // (antes `*`). `CORS_ORIGINS` (separados por coma) reemplaza la lista; sin
  // ella vale la de abajo: la SPA en Vercel, la landing y el front local.
  const origenes = (
    configService.get<string>('CORS_ORIGINS') ||
    [
      'https://teamwork-fronted-orpin.vercel.app',
      'https://teamwork.com.pe',
      'https://www.teamwork.com.pe',
      'http://localhost:5173',
      'http://localhost:4173',
    ].join(',')
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origenes });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: false, // lanza error si se envían propiedades no esperadas
      forbidUnknownValues: true, // lanza error si se envía null en vez de objeto
      // transform: true,
    }),
  );

  // Swagger enseña el mapa completo de la API: en producción solo si se pide
  // con SWAGGER=true (por ejemplo, para revisar algo y volver a quitarlo).
  const conSwagger =
    configService.get<string>('NODE_ENV') !== 'production' ||
    configService.get<string>('SWAGGER') === 'true';
  if (conSwagger) {
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
  }

  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new PurgeResponseInterceptor(),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
  if (conSwagger)
    console.log(`📘 Documentación Swagger: http://localhost:${port}/api`);
}

bootstrap();
