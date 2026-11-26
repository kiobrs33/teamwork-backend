import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { UpdateRetroalimentacionDetalleItemDto } from './update-retroalimentacion-detalle-item.dto';

export class UpdateManyRetroalimentacionDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  idObjetivo: number;

  @ApiProperty({
    type: [UpdateRetroalimentacionDetalleItemDto],
  })
  @IsArray()
  // Sin esto las acciones no se validaban (el pipe solo veía un arreglo).
  @ValidateNested({ each: true })
  @Type(() => UpdateRetroalimentacionDetalleItemDto)
  detalles: UpdateRetroalimentacionDetalleItemDto[];
}
