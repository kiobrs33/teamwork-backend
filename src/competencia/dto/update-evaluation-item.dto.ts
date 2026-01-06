import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEvaluacionItemDto {
  @ApiProperty({
    example: 4401,
    description: 'ID del item evaluado',
  })
  @IsInt({ message: 'idEvaluacionCompetenciaItem debe ser un número entero.' })
  idEvaluacionCompetenciaItem: number;

  @ApiProperty({
    example: 4,
    description: 'Calificación asignada al ítem (ejemplo: escala 1 a 5)',
  })
  @IsInt()
  calificacion: number;
}

export class UpdateEvaluacionDto {
  @ApiProperty({
    example: 'Buen desempeño general del trabajador.',
    description: 'Comentario general del evaluador',
    required: false,
  })
  @IsOptional()
  @IsString()
  comentarioGeneral?: string;

  @ApiProperty({
    type: UpdateEvaluacionItemDto,
    isArray: true,
    description: 'Lista de ítems con sus calificaciones actualizadas',
  })
  @IsArray({ message: 'items debe ser un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => UpdateEvaluacionItemDto)
  items: UpdateEvaluacionItemDto[];
}
