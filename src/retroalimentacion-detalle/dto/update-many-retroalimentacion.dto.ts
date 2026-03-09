import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { UpdateRetroalimentacionDetalleDto } from './update-retroalimentacion-detalle.dto';

export class UpdateManyRetroalimentacionDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  idObjetivo: number;

  @ApiProperty({
    type: [UpdateRetroalimentacionDetalleDto],
  })
  @IsArray()
  detalles: UpdateRetroalimentacionDetalleDto[];
}
