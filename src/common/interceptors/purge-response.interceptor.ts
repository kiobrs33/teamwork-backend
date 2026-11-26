import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';
import { enlaceDeEntrega } from '../../config/cloudinary';

const PURGE_KEYS = new Set([
  'estado',
  'creadoPorId',
  'actualizadoPorId',
  'fechaCreacion',
  'fechaModificacion',
  'password', // puedes agregar más campos si lo deseas
]);

function purgeFields(data: any): any {
  if (Array.isArray(data)) {
    return data.map(purgeFields);
  }

  if (data instanceof Date) {
    return data; // No tocar objetos Date
  }

  if (data !== null && typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (PURGE_KEYS.has(key)) continue;
      // Los PDF de Cloudinary viajan con un enlace firmado: ver
      // `enlaceDeEntrega`. Evidencias, hitos y calibración pasan por aquí.
      result[key] =
        key === 'urlArchivo' && typeof data[key] === 'string'
          ? enlaceDeEntrega(data[key])
          : purgeFields(data[key]);
    }
    return result;
  }

  return data;
}

@Injectable()
export class PurgeResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => purgeFields(data)));
  }
}
