import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNumber, Min } from 'class-validator';

export class CreateObjetivoDetalleDto {
  @ApiProperty({ example: 1, description: 'ID del objetivo al que pertenece' })
  @IsInt({ message: 'Debe ser un número entero.' })
  idObjetivo: number;

  @ApiProperty({ example: 1, description: 'Número secuencial del detalle' })
  @IsInt({ message: 'Debe ser un número entero.' })
  @Min(1, { message: 'El secuencial debe ser mayor o igual a 1.' })
  secuencial: number;

  @ApiProperty({
    example: 'Descripción del objetivo detalle',
    description: 'Descripción opcional',
    required: false,
  })
  @IsString({ message: 'Debe ser un texto.' })
  descripcion: string;

  @ApiProperty({
    example: 'Iniciativa para mejorar...',
    description: 'Descripción de la iniciativa',
    required: false,
  })
  @IsString({ message: 'Debe ser un texto.' })
  descripcionIniciativa: string;

  @ApiProperty({
    example: 'Horas',
    description: 'Unidad de medida',
    required: false,
  })
  @IsString({ message: 'Debe ser un texto.' })
  unidadMedida: string;

  @ApiProperty({
    example: 25.5,
    description: 'Peso específico del objetivo detalle',
    required: false,
  })
  @IsNumber({}, { message: 'Debe ser un número.' })
  pesoEspecifico: number;

  @ApiProperty({
    example: 25.5,
    description: 'Ponderación del objetivo detalle',
    required: false,
  })
  @IsNumber({}, { message: 'Debe ser un número.' })
  ponderacion: number;
}
