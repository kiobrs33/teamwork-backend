import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  MaxLength,
  IsNumber,
  ValidateNested,
  IsOptional,
  ArrayMinSize,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// =====================================================
// DETALLE MASIVO
// =====================================================
export class ObjetivoDetalleMasivoDto {
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
    description: 'Fecha de culminación',
  })
  @IsDateString()
  fechaCulminacion: string;

  @ApiProperty({
    example: 80,
    required: false,
    description: 'Porcentaje logrado (opcional)',
  })
  @IsOptional()
  @IsNumber()
  porcentajeLogrado?: number;
}

// =====================================================
// ITEM MASIVO
// =====================================================
export class ObjetivoMasivoItemDto {
  @ApiProperty({
    example: 'A001',
    description: 'Código del empleado (campo: codigoEmpleado)',
  })
  @IsString()
  @MaxLength(50)
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
}
