import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluarObjetivoDetalleDto } from './evaluar-objetivo-detalle.dto';

export class EvaluarObjetivoDto {
  @ApiProperty({
    type: [EvaluarObjetivoDetalleDto],
    description: 'Listado de detalles a evaluar',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluarObjetivoDetalleDto)
  detalles: EvaluarObjetivoDetalleDto[];
}
