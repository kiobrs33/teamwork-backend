import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ObjetivoDetalleDto {
  @ApiProperty({ example: 1, description: 'Número secuencial del detalle' })
  @IsInt({ message: 'El secuencial debe ser un número entero.' })
  @Min(1, { message: 'El secuencial debe ser mayor o igual a 1.' })
  secuencial: number;

  @ApiProperty({ example: 'Descripción del detalle' })
  @MaxLength(255, {
    message: 'La descripción no puede exceder 255 caracteres.',
  })
  descripcion: string;

  @ApiProperty({ example: 'Iniciativa relacionada' })
  @MaxLength(255, {
    message: 'La descripción de iniciativa no puede exceder 255 caracteres.',
  })
  descripcionIniciativa: string;

  @ApiProperty({ example: 'Kg' })
  @MaxLength(50, {
    message: 'La unidad de medida no puede exceder 50 caracteres.',
  })
  unidadMedida: string;

  @ApiProperty({ example: 0.5 })
  pesoEspecifico: number;

  @ApiProperty({ example: 0.5 })
  ponderacion: number;
}

export class CreateObjetivoConDetallesDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Fecha de inicio de vigencia (ISO 8601)',
  })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener formato ISO 8601.' },
  )
  fechaVigenciaInicia: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Fecha fin de vigencia (ISO 8601)',
  })
  @IsDateString({}, { message: 'La fecha fin debe tener formato ISO 8601.' })
  fechaVigenciaFin: string;

  @ApiProperty({ example: 1, description: 'ID de la empresa empleadora' })
  @IsInt({ message: 'El ID de empresa empleadora debe ser un número entero.' })
  idEmpresaEmpleadora: number;

  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsInt({ message: 'El ID del empleado debe ser un número entero.' })
  idEmpleado: number;

  @ApiProperty({
    type: [ObjetivoDetalleDto],
    description: 'Lista de detalles asociados al objetivo (2 a 4 detalles)',
    minItems: 2,
    maxItems: 4,
  })
  @IsArray({ message: 'Debe enviar un arreglo de detalles.' })
  @ValidateNested({ each: true })
  @Type(() => ObjetivoDetalleDto)
  detalles: ObjetivoDetalleDto[];
}
