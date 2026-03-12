import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { CreateRetroalimentacionDetalleItemDto } from './create-retroalimentacion-detalle-item.dto';

export class CreateManyRetroalimentacionDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  idObjetivo: number;

  @ApiProperty({
    type: [CreateRetroalimentacionDetalleItemDto],
  })
  @IsArray()
  detalles: CreateRetroalimentacionDetalleItemDto[];
}
