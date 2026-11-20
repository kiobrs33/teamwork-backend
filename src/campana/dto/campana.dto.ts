import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Datos de una campaña. La configuración (modelo, pesos, escala) es opcional:
 * si no llega, se copia de la campaña anterior de la empresa (o de la propia
 * empresa si es la primera).
 */
export class CrearCampanaDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  idEmpresaEmpleadora: number;

  @ApiProperty({ example: 'Evaluación anual 2026' })
  @IsString()
  @IsNotEmpty({ message: 'Ingresa el nombre de la campaña.' })
  @MaxLength(120)
  nombre: string;

  @ApiProperty({ example: '2026-01-01', description: 'Inicio del periodo evaluado' })
  @IsDateString()
  periodoDesde: string;

  @ApiProperty({ example: '2026-12-31', description: 'Fin del periodo evaluado' })
  @IsDateString()
  periodoHasta: string;

  @ApiProperty({ description: 'Desde cuándo se pueden calificar competencias' })
  @IsDateString()
  fechaVigenciaInicio: string;

  @ApiProperty()
  @IsDateString()
  fechaVigenciaFin: string;

  @ApiPropertyOptional({ description: 'Ventana de edición de objetivos' })
  @IsOptional()
  @IsDateString()
  fechaVigenciaInicioObjetivo?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaVigenciaFinObjetivo?: string | null;

  @ApiPropertyOptional({ enum: ['90', '180'] })
  @IsOptional()
  @IsIn(['90', '180'])
  modeloEmpresa?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100)
  porcentajeCompetecias?: number | null;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100)
  porcentajeObjetivos?: number | null;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100)
  porcentajeEvaluacionJefeCompetencia?: number | null;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100)
  porcentajeEvaluacionSubordinadoCompetencia?: number | null;

  @ApiPropertyOptional({ enum: ['LIKERT', 'MANUAL'] })
  @IsOptional()
  @IsIn(['LIKERT', 'MANUAL'])
  tipoCalificacionCompetencia?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100)
  competenciaResultadoEsperado?: number | null;

  @ApiPropertyOptional({
    description:
      'Si la empresa tiene una campaña en curso, cerrarla en el mismo paso. Sin esto, abrir otra responde 409.',
  })
  @IsOptional()
  @IsBoolean()
  cerrarActual?: boolean;

  @ApiPropertyOptional({
    description:
      'Copiar los objetivos (sin calificaciones) de la campaña anterior a los trabajadores activos.',
  })
  @IsOptional()
  @IsBoolean()
  copiarObjetivos?: boolean;
}

/** En una campaña CERRADA solo se aceptan `nombre` y el periodo evaluado. */
export class ActualizarCampanaDto extends PartialType(
  OmitType(CrearCampanaDto, ['idEmpresaEmpleadora', 'cerrarActual', 'copiarObjetivos'] as const),
) {}

export class CampanaQueryDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  idEmpresaEmpleadora: number;
}
