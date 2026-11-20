import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export const TIPOS_EVIDENCIA = ['OBJETIVO', 'COMPETENCIA'] as const;
export type TipoEvidencia = (typeof TIPOS_EVIDENCIA)[number];

export class EvidenciaQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: '0 = sin paginar' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idEmpleado?: number;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idEmpresaEmpleadora?: number;

  @ApiPropertyOptional({
    description: 'Trabajador (nombres, apellidos, código, documento) o archivo',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: TIPOS_EVIDENCIA })
  @IsIn(TIPOS_EVIDENCIA)
  @IsOptional()
  tipo?: TipoEvidencia;

  @ApiPropertyOptional({
    description: 'Código de empleado del jefe del trabajador',
  })
  @IsString()
  @IsOptional()
  codigoEmpleadoJefe?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  fechaHasta?: string;
}
