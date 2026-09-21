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
  IsNotEmpty,
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
    description: 'Fecha de culminación',
  })
  @IsDateString()
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
}
