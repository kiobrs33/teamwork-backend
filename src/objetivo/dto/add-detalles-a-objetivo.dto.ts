import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NuevoDetalleDto {
  @ApiProperty({ example: 3, description: 'Número secuencial del detalle' })
  @IsInt()
  @Min(1)
  secuencial: number;

  @ApiProperty({ example: 'Descripción del nuevo detalle' })
  @MaxLength(255)
  descripcion: string;

  @ApiProperty({ example: 'Iniciativa relacionada' })
  @MaxLength(255)
  descripcionIniciativa: string;

  @ApiProperty({ example: 'Kg' })
  @MaxLength(50)
  unidadMedida: string;

  @ApiProperty({ example: 0.5 })
  pesoEspecifico: number;

  @ApiProperty({ example: 0.5 })
  ponderacion: number;
}

export class AddDetallesAObjetivoDto {
  @ApiProperty({
    type: [NuevoDetalleDto],
    description: '1 o 2 nuevos detalles a agregar',
    minItems: 1,
    maxItems: 2,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NuevoDetalleDto)
  detalles: NuevoDetalleDto[];
}
