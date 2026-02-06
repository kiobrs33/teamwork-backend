// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   catch(exception: any, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse();
//     const status =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const message =
//       exception instanceof HttpException
//         ? exception.getResponse()
//         : exception.message;

//     response.status(status).json({
//       status: false,
//       message:
//         typeof message === 'string'
//           ? message
//           : message.message || 'Error interno',
//       data: null,
//       error: {
//         code: status,
//         details: typeof message === 'object' ? message : null,
//       },
//     });
//   }
// }

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  // Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: any = null;

    // ===============================
    // HttpException (Nest / Validation / Custom)
    // ===============================
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
      } else if (typeof payload === 'object') {
        message = (payload as any).message ?? message;
        errors = (payload as any).errors ?? null;

        // class-validator devuelve array de mensajes
        if (Array.isArray(message)) {
          errors = message;
          message = 'Errores de validación';
        }
      }
    }

    // ===============================
    // Log estructurado
    // ===============================
    // const logMessage = `${request.method} ${request.url} ${status} - ${message}`;

    // if (status >= 500) {
    //   this.logger.error(logMessage, (exception as any)?.stack);
    // } else {
    //   this.logger.warn(logMessage);
    // }

    // ===============================
    // Respuesta JSON uniforme
    // ===============================
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
