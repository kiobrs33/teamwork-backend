import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { UpdateRetroalimentacionDetalleItemDto } from './update-retroalimentacion-detalle-item.dto';

export class UpdateManyRetroalimentacionDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  idObjetivo: number;

  @ApiProperty({
    type: [UpdateRetroalimentacionDetalleItemDto],
  })
  @IsArray()
  detalles: UpdateRetroalimentacionDetalleItemDto[];
}
