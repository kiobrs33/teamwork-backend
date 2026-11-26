import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UNIDADES_MEDIDA, normalizarUnidad } from './unidades-medida';

// =====================================================
// DETALLE MASIVO
// =====================================================
export class ObjetivoDetalleMasivoDto {
  @ApiProperty({
    example: 'ASCENDENTE',
    enum: ['ASCENDENTE', 'DESCENDENTE', 'MANUAL'],
  })
  @IsString()
  @IsIn(['ASCENDENTE', 'DESCENDENTE', 'MANUAL'], {
    message: 'El tipo de cálculo debe ser ASCENDENTE, DESCENDENTE o MANUAL.',
  })
  tipoCalculo: string;

  @ApiProperty({ example: 'Descripción del detalle' })
  @IsString({ message: 'La descripción debe ser texto.' })
  @Matches(/\S/, { message: 'La descripción es obligatoria.' })
  @MaxLength(1000, {
    message: 'La descripción no puede pasar de 1000 caracteres.',
  })
  descripcion: string;

  @ApiProperty({ example: 'Iniciativa relacionada', required: false })
  @IsOptional()
  @IsString({ message: 'La iniciativa debe ser texto.' })
  @MaxLength(1000, {
    message: 'La iniciativa no puede pasar de 1000 caracteres.',
  })
  descripcionIniciativa?: string;

  @ApiProperty({
    example: 'PORCENTAJE',
    enum: UNIDADES_MEDIDA,
  })
  @IsString()
  @Transform(({ value }) => normalizarUnidad(value))
  @IsIn(UNIDADES_MEDIDA, {
    message: `La unidad de medida debe ser una de: ${UNIDADES_MEDIDA.join(', ')}.`,
  })
  unidadMedida: string;

  @ApiProperty({ example: 0.5 })
  @IsNumber({}, { message: 'El peso debe ser un número.' })
  @Min(1, { message: 'El peso debe ser de al menos 1 %.' })
  @Max(100, { message: 'El peso no puede pasar de 100 %.' })
  pesoEspecifico: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber({}, { message: 'La meta debe ser un número.' })
  @Min(0, { message: 'La meta no puede ser negativa.' })
  metaObjetivo: number;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Fecha límite: hasta cuándo hay para lograr la meta',
  })
  @IsDateString({}, { message: 'La fecha límite no es válida.' })
  @Matches(/^(20\d{2}|2100)-/, {
    message: 'La fecha límite debe estar entre los años 2000 y 2100.',
  })
  fechaCulminacion: string;
}

// NOTA: igual que en la carga individual, la importación masiva define
// objetivos pero no los califica: `metaAlcanzada` y `porcentajeLogrado` solo
// se escriben desde evaluaciones (PATCH /objetivo/:id/evaluar).

// =====================================================
// ITEM MASIVO
// =====================================================
export class ObjetivoMasivoItemDto {
  @ApiProperty({
    example: 'A001',
    description: 'Código del empleado (campo: codigoEmpleado)',
  })
  @IsString()
  codigoEmpleado: string;

  @ApiProperty({
    type: [ObjetivoDetalleMasivoDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ObjetivoDetalleMasivoDto)
  objetivoDetalles: ObjetivoDetalleMasivoDto[];
}

// =====================================================
// REQUEST MASIVO
// =====================================================
export class CreateObjetivosMasivosDto {
  @ApiProperty({ type: [ObjetivoMasivoItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ObjetivoMasivoItemDto)
  objetivos: ObjetivoMasivoItemDto[];

  /**
   * Empresa de los trabajadores del archivo: el código de empleado es único
   * por empresa. RR. HH. no la necesita (se fuerza la suya).
   */
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt({ message: 'La empresa debe ser un número entero.' })
  idEmpresaEmpleadora?: number;
}
