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
} from 'class-validator';
import { Type } from 'class-transformer';

// =====================================================
// DETALLE INDIVIDUAL
// =====================================================
export class ObjetivoDetalleDto {
  @ApiProperty({
    example: 'ASCENDENTE',
    enum: ['ASCENDENTE', 'DESCENDENTE', 'MANUAL'],
  })
  @IsString()
  @IsIn(['ASCENDENTE', 'DESCENDENTE', 'MANUAL'])
  tipoCalculo: string;

  @ApiProperty({ example: 'Descripción del detalle' })
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

  @ApiProperty({ example: 0.2, required: false })
  @IsOptional()
  @IsNumber()
  metaAlcanzada?: number;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Fecha de culminación del objetivo',
  })
  @IsDateString()
  fechaCulminacion: string;

  @ApiProperty({
    example: 75,
    required: false,
    description: 'Porcentaje logrado hasta la fecha',
  })
  @IsOptional()
  @IsNumber()
  porcentajeLogrado?: number;
}

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
