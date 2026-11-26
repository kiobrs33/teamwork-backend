import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export const ACCIONES_ACTIVIDAD = [
  'CREAR',
  'EDITAR',
  'ELIMINAR',
  'CAMBIAR_SITUACION',
  'ASIGNAR',
  'IMPORTAR',
  'CALIFICAR',
  'CERRAR_CAMPANA',
  'REABRIR_CAMPANA',
  'CAMBIAR_CONTRASENA',
  'INICIAR_SESION',
  'INICIO_FALLIDO',
  'OTRA',
] as const;

export class ActividadQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() page?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() limit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idEmpresaEmpleadora?: string;
  @ApiPropertyOptional({ enum: ACCIONES_ACTIVIDAD })
  @IsOptional()
  @IsIn(ACCIONES_ACTIVIDAD)
  accion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() entidad?: string;
  @ApiPropertyOptional({ enum: ['OK', 'ERROR'] })
  @IsOptional()
  @IsIn(['OK', 'ERROR'])
  resultado?: string;
  /** Usuario o nombre de quien lo hizo. */
  @ApiPropertyOptional() @IsOptional() @IsString() usuario?: string;
  /** Texto de la descripción. */
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() desde?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() hasta?: string;
  /** Orden por fecha. Por defecto, lo más reciente primero. */
  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
