import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// Campos por los que se permite ordenar. La lista es cerrada a propósito:
// llega desde la query, así que no puede ser cualquier columna.
export const EMPRESA_SORT_FIELDS = [
  'idEmpresaEmpleadora',
  'nombreEmpresa',
  'ruc',
  'modeloEmpresa',
  'direccionEmpresa',
  'fechaVigenciaInicio',
  'fechaVigenciaFin',
  'fechaCreacion',
] as const;

export type EmpresaSortField = (typeof EMPRESA_SORT_FIELDS)[number];

export class EmpresaQueryDto {
  /**
   * Interno: lo pone el controlador para el equipo con empresas asignadas
   * (su cartera). No lleva decoradores, así que el `whitelist` lo descarta si
   * viene en la URL.
   */
  idsPermitidos?: number[];

  /**
   * `true`: lista las empresas archivadas en vez de las activas. Solo el
   * dueño (lo comprueba el controlador).
   */
  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsIn(['true', 'false'])
  archivadas?: 'true' | 'false';

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 0,
    description: 'Número de registros por página (0 para sin paginación)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  limit?: number = 0;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  search?: string;

  // ================= FILTROS POR COLUMNA =================

  // El filtro de ID es una caja de texto libre en el front: si lo que escriben
  // no son solo dígitos se ignora, en vez de responder un 400.
  @ApiPropertyOptional()
  @Transform(({ value }) =>
    /^\d+$/.test(String(value ?? '').trim())
      ? Number(String(value).trim())
      : undefined,
  )
  @IsInt()
  @IsOptional()
  idEmpresaEmpleadora?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreEmpresa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiPropertyOptional({ example: '90' })
  @IsOptional()
  @IsString()
  modeloEmpresa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  direccionEmpresa?: string;

  @ApiPropertyOptional({
    example: '2026-09',
    description:
      'Campaña. Coincidencia parcial, así que "2026" trae todas las del año.',
  })
  @IsOptional()
  @IsString()
  periodoEvaluacion?: string;

  // ================= ORDENAMIENTO =================

  @ApiPropertyOptional({
    example: 'nombreEmpresa',
    enum: EMPRESA_SORT_FIELDS,
    description: 'Campo por el que ordenar. Por defecto fechaCreacion.',
  })
  @IsOptional()
  @IsIn(EMPRESA_SORT_FIELDS as unknown as string[], {
    message: `El campo de ordenamiento debe ser uno de: ${EMPRESA_SORT_FIELDS.join(', ')}.`,
  })
  sortBy?: EmpresaSortField;

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'El sentido de ordenamiento debe ser asc o desc.',
  })
  sortOrder?: 'asc' | 'desc';
}
