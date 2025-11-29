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
  @Min(0, { message: 'La calificación mínima permitida es 0.' })
  @Max(10, { message: 'La calificación máxima permitida es 10.' })
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
  @MaxLength(500, {
    message: 'El comentario general no puede exceder 500 caracteres.',
  })
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
