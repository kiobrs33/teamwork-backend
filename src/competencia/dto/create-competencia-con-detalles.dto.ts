import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CompetenciaDetalleDto {
  @ApiProperty({ example: 'Capacidad de liderazgo' })
  @MaxLength(255, {
    message: 'La descripción no puede exceder 255 caracteres.',
  })
  descripcion: string;
}

export class CreateCompetenciaConDetallesDto {
  @ApiProperty({ example: 'COM-001', description: 'Código de la competencia' })
  @MaxLength(100, {
    message: 'El código no puede exceder 100 caracteres.',
  })
  codigo: string;

  @ApiProperty({
    example: 'Liderazgo',
    description: 'Título de la competencia',
  })
  @MaxLength(255, {
    message: 'El título no puede exceder 255 caracteres.',
  })
  titulo: string;

  @ApiProperty({ example: 1, description: 'Nivel de la competencia' })
  @IsInt({ message: 'El nivel debe ser un número entero.' })
  nivel: number;

  @ApiProperty({
    type: [CompetenciaDetalleDto],
    description:
      'Lista de detalles asociados a la competencia (1 a 10 detalles)',
    minItems: 1,
    maxItems: 10,
  })
  @IsArray({ message: 'Debe enviar un arreglo de detalles.' })
  @ValidateNested({ each: true })
  @Type(() => CompetenciaDetalleDto)
  competenciaDetalles: CompetenciaDetalleDto[];
}
