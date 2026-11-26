import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SesionRetroalimentacionDto {
  @ApiProperty({ example: 943 })
  @IsInt({ message: 'Indique el trabajador.' })
  idEmpleado: number;

  @ApiProperty({ example: '2026-11-20' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Indique la fecha de la sesión.',
  })
  fechaSesion: string;

  @ApiProperty()
  @IsString({ message: 'Indique las fortalezas.' })
  @MinLength(10, { message: 'Las fortalezas: al menos 10 caracteres.' })
  @MaxLength(2000, { message: 'Las fortalezas: hasta 2000 caracteres.' })
  fortalezas: string;

  @ApiProperty()
  @IsString({ message: 'Indique las oportunidades de mejora.' })
  @MinLength(10, {
    message: 'Las oportunidades de mejora: al menos 10 caracteres.',
  })
  @MaxLength(2000, {
    message: 'Las oportunidades de mejora: hasta 2000 caracteres.',
  })
  oportunidades: string;

  @ApiProperty()
  @IsString({ message: 'Indique los compromisos.' })
  @MinLength(10, { message: 'Los compromisos: al menos 10 caracteres.' })
  @MaxLength(2000, { message: 'Los compromisos: hasta 2000 caracteres.' })
  compromisos: string;
}

export class ConformidadDto {
  @ApiProperty({ example: true })
  @IsBoolean({ message: 'Indique si está conforme.' })
  conforme: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'El comentario: hasta 1000 caracteres.' })
  comentario?: string;
}
