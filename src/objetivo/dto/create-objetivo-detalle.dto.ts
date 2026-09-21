import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
  IsString,
  IsIn,
  ValidateNested,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsIn(['ASCENDENTE', 'DESCENDENTE', 'MANUAL'])
  tipoCalculo: string;

  @ApiProperty({ example: 'Descripción del detalle' })
  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  @ApiProperty({ example: 'Iniciativa relacionada', required: false })
  @IsOptional()
  descripcionIniciativa?: string;

  @ApiProperty({
    example: 'PORCENTAJE',
    enum: ['PORCENTAJE', 'UNIDAD'],
  })
  @IsString()
  unidadMedida: string;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  pesoEspecifico: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  metaObjetivo: number;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Fecha de culminación del objetivo',
  })
  @IsDateString()
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
