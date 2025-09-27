import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ObjetivoDetalleDto {
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
  @IsNumber()
  pesoEspecifico: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  metaObjetivo: number;

  @IsOptional()
  metaAlcanzada?: number;
}

export class CreateObjetivoConDetallesDto {
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
