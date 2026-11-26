import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, MaxLength, MinLength } from 'class-validator';
import { ETAPAS } from '../registro-proceso.service';

export class HitoDto {
  @ApiProperty({ example: 'Calibración' })
  @IsIn(ETAPAS as unknown as string[], {
    message: `La etapa debe ser una de: ${ETAPAS.join(', ')}.`,
  })
  etapa: string;

  @ApiProperty({ example: 'Calibración de resultados' })
  @IsString({ message: 'Indique el nombre del hito.' })
  @MinLength(5, { message: 'El nombre: al menos 5 caracteres.' })
  @MaxLength(200, { message: 'El nombre: hasta 200 caracteres.' })
  nombre: string;

  @ApiProperty({ example: 'Actas de las sesiones de calibración, firmadas.' })
  @IsString({ message: 'Indique el registro esperado.' })
  @MinLength(5, { message: 'El registro: al menos 5 caracteres.' })
  @MaxLength(500, { message: 'El registro: hasta 500 caracteres.' })
  registro: string;
}

export class CrearListaDto {
  @ApiProperty({ example: 4 })
  @IsInt({ message: 'Indique la campaña.' })
  idCampanaEvaluacion: number;

  @ApiProperty({ enum: ['FONAFE', 'ANTERIOR'] })
  @IsIn(['FONAFE', 'ANTERIOR'], {
    message: 'Elija la lista sugerida o la de la campaña anterior.',
  })
  origen: 'FONAFE' | 'ANTERIOR';
}

export class NuevoHitoDto extends HitoDto {
  @ApiProperty({ example: 4 })
  @IsInt({ message: 'Indique la campaña.' })
  idCampanaEvaluacion: number;
}
