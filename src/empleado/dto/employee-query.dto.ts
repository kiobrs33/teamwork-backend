import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsIn } from 'class-validator';

/**
 * Campos por los que el backend acepta ordenar.
 *
 * Lista blanca a propósito: `sortBy` llega como texto libre desde la query y
 * se usa para construir el `orderBy` de Prisma. Los dos últimos ordenan por
 * una relación.
 */
export const EMPLEADO_SORT_FIELDS = [
  'idEmpleado',
  'nombres',
  'apellidos',
  'documento',
  'codigoEmpleado',
  'codigoEmpleadoJefe',
  'sede',
  'fechaCreacion',
  'codigoUsuario',
  'nombreEmpresaEmpleadora',
] as const;

export type EmpleadoSortField = (typeof EMPLEADO_SORT_FIELDS)[number];

export class EmployeeQueryDto {
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

  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idEmpleado?: number;

  // Estructura: selects en el front, así que llegan como id exacto.
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idEmpresaEmpleadora?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idGerenciaEmpleadora?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idAreaEmpleadora?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idUnidadOcupacionalEmpleadora?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idPuestoEmpleadora?: number;

  @ApiPropertyOptional({ enum: ['ADMIN', 'JEFE', 'EMPLEADO'] })
  @IsIn(['ADMIN', 'JEFE', 'EMPLEADO'])
  @IsOptional()
  rol?: string;

  /**
   * Situación laboral a listar. Por defecto ACTIVO: los suspendidos y
   * cesados no operan y se consultan aparte.
   */
  @ApiPropertyOptional({ enum: ['ACTIVO', 'SUSPENDIDO', 'CESADO'] })
  @IsOptional()
  @IsIn(['ACTIVO', 'SUSPENDIDO', 'CESADO'])
  situacion?: string;

  /**
   * Nombres y apellidos en una sola caja, como se ven en el listado.
   *
   * Se parte en palabras y cada una tiene que aparecer en `nombres` o en
   * `apellidos`: con un `contains` sobre un solo campo, "Juan Perez" no
   * encontraba a nadie porque el nombre y el apellido viven en columnas
   * distintas.
   */
  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString()
  nombreCompleto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoEmpleado?: string;

  /**
   * El jefe por nombre, apellidos o código, que es como lo muestra la columna.
   *
   * `codigoEmpleadoJefe` es texto suelto, no una relación, así que buscar por
   * el nombre obliga a resolver antes qué códigos corresponden a ese nombre.
   */
  @ApiPropertyOptional({ example: 'Ana Torres' })
  @IsOptional()
  @IsString()
  jefe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreEmpresaEmpleadora?: string;

  /** El usuario con el que entra al sistema (`Usuario.codigoUsuario`). */
  @ApiPropertyOptional({ example: 'jperez' })
  @IsOptional()
  @IsString()
  codigoUsuario?: string;

  @ApiPropertyOptional({
    enum: EMPLEADO_SORT_FIELDS,
    description: 'Campo por el que ordenar.',
  })
  @IsOptional()
  @IsIn(EMPLEADO_SORT_FIELDS as unknown as string[])
  sortBy?: EmpleadoSortField;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
