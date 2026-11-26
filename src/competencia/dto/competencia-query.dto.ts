import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';

/** Columnas por las que la tabla puede ordenar (en el servidor). */
export const COMPETENCIA_SORT_FIELDS = [
  'idCompetencia',
  'codigo',
  'titulo',
  'fechaCreacion',
] as const;
import { Type } from 'class-transformer';

export class CompetenciaQueryDto {
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
  @IsOptional()
  limit?: number = 0;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  search?: string;

  // ================= FILTROS POR COLUMNA =================

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idCompetencia?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titulo?: string;

  /**
   * Recorta a una empresa. Es el filtro del selector de empresa del front:
   * el administrador trabaja con una empresa a la vez.
   */
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idEmpresaEmpleadora?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreEmpresaEmpleadora?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ruc?: string;

  // ================= ORDEN =================
  // Ordenar en el servidor: con un comparador local solo se reacomodaba la
  // página visible.
  @ApiPropertyOptional({ enum: COMPETENCIA_SORT_FIELDS })
  @IsOptional()
  @IsIn(COMPETENCIA_SORT_FIELDS as unknown as string[], {
    message: `El campo de ordenamiento debe ser uno de: ${COMPETENCIA_SORT_FIELDS.join(', ')}.`,
  })
  sortBy?: (typeof COMPETENCIA_SORT_FIELDS)[number];

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'El orden debe ser asc o desc.' })
  sortOrder?: 'asc' | 'desc';
}
