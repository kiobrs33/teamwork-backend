import { ApiProperty } from '@nestjs/swagger';
import {
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
// DETALLE INDIVIDUAL
// =====================================================
export class ObjetivoDetalleDto {
  @ApiProperty({
    example: 101,
    required: false,
    description:
      'ID del detalle existente. Si viene, se actualiza ese detalle y se ' +
      'conservan su calificación y su historial; si no viene, se crea uno nuevo.',
  })
  @IsOptional()
  @IsInt()
  idObjetivoDetalle?: number;

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

// NOTA: `metaAlcanzada` y `porcentajeLogrado` NO se aceptan acá a propósito.
// Un objetivo se define en este módulo y se califica únicamente desde
// evaluaciones (PATCH /objetivo/:id/evaluar). Como el ValidationPipe global
// usa `whitelist: true`, si un cliente los envía se descartan en silencio.

// =====================================================
// CREATE OBJETIVO INDIVIDUAL
// =====================================================
export class CreateObjetivoConDetallesDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  idEmpleado: number;

  @ApiProperty({
    type: [ObjetivoDetalleDto],
    minItems: 1,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjetivoDetalleDto)
  objetivoDetalles: ObjetivoDetalleDto[];
}
