import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

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
      if (!PURGE_KEYS.has(key)) {
        result[key] = purgeFields(data[key]);
      }
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
