import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CompetenciaDetalleDto } from './create-competencia-con-detalles.dto';

export class CreateCompetenciaDto {
  @ApiProperty({ example: 'COM-001' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'Trabajo en equipo' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  nivel: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetenciaDetalleDto)
  competenciaDetalles: CompetenciaDetalleDto[];
}
