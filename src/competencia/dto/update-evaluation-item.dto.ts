import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    example: 4,
    nullable: true,
    description:
      'Calificación del ítem. `null` significa SIN CALIFICAR; `0` es una calificación válida (0% en LIKERT y en MANUAL). Se usa para saber si la evaluación está completa.',
  })
  @IsOptional()
  @IsInt()
  calificacion?: number | null;
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
