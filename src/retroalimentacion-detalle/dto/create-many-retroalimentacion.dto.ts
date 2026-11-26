import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { CreateRetroalimentacionDetalleItemDto } from './create-retroalimentacion-detalle-item.dto';

export class CreateManyRetroalimentacionDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  idObjetivo: number;

  @ApiProperty({
    type: [CreateRetroalimentacionDetalleItemDto],
  })
  @IsArray()
  // Sin esto las acciones no se validaban (el pipe solo veía un arreglo).
  @ValidateNested({ each: true })
  @Type(() => CreateRetroalimentacionDetalleItemDto)
  detalles: CreateRetroalimentacionDetalleItemDto[];
}
