import {
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  isInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UnidadCompetenciaItemDto {
  @IsInt()
  @ApiProperty({ example: 1, description: 'ID de unidad ocupacional' })
  idUnidadOcupacionalEmpleadora: number;

  @IsInt()
  @ApiProperty({ example: 2, description: 'ID de competencia' })
  idCompetencia: number;
}

export class AsignarCompetenciasLoteDto {
  @ApiProperty({
    type: [UnidadCompetenciaItemDto],
    example: [
      { idUnidadOcupacionalEmpleadora: 1, idCompetencia: 1 },
      { idUnidadOcupacionalEmpleadora: 1, idCompetencia: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnidadCompetenciaItemDto)
  asignaciones: UnidadCompetenciaItemDto[];
}
