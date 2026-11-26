import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AjusteCalibracionDto {
  @ApiProperty({ example: 2 })
  @IsInt({ message: 'Indique la empresa.' })
  idEmpresaEmpleadora: number;

  @ApiProperty({ example: 943 })
  @IsInt({ message: 'Indique el trabajador.' })
  idEmpleado: number;

  /** Resultado de competencias ajustado. Vacío: no se ajusta. */
  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber({}, { message: 'El resultado de competencias debe ser un número.' })
  @Min(0, { message: 'El resultado de competencias no puede ser negativo.' })
  @Max(200, { message: 'El resultado de competencias no puede pasar de 200.' })
  competencias?: number | null;

  /** Resultado de objetivos ajustado. Vacío: no se ajusta. */
  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber({}, { message: 'El resultado de objetivos debe ser un número.' })
  @Min(0, { message: 'El resultado de objetivos no puede ser negativo.' })
  @Max(200, { message: 'El resultado de objetivos no puede pasar de 200.' })
  objetivos?: number | null;

  @ApiProperty({ example: 'Las evidencias muestran que cumplió la meta.' })
  @IsString({ message: 'Indique el motivo del ajuste.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres.' })
  @MaxLength(500, { message: 'El motivo no puede pasar de 500 caracteres.' })
  motivo: string;
}
