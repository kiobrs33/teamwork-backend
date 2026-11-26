import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SITUACIONES } from '../types/situacion';

/** Suspender, cesar o reactivar a uno o varios trabajadores. */
export class CambiarSituacionDto {
  @ApiProperty({ type: [Number], example: [12, 15] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty({ enum: SITUACIONES })
  @IsIn(SITUACIONES, {
    message: 'La situación debe ser ACTIVO, SUSPENDIDO o CESADO.',
  })
  situacion: (typeof SITUACIONES)[number];

  @ApiPropertyOptional({
    example: '2026-11-21',
    description: 'Desde cuándo. Por defecto, hoy.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha no es válida.' })
  fecha?: string;

  @ApiPropertyOptional({ example: 'Licencia sin goce de haber' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'El motivo admite hasta 200 caracteres.' })
  motivo?: string;
}
