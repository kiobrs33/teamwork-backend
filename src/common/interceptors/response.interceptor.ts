import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((resp: any) => ({
        status: true,
        message: resp?.message ?? 'Operación exitosa Controller!',
        data: resp?.data ?? resp,
        error: null,
      })),
    );
  }
}
