import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { CreateRetroalimentacionDetalleDto } from './create-retroalimentacion-detalle.dto';

export class CreateManyRetroalimentacionDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  idObjetivo: number;

  @ApiProperty({
    type: [CreateRetroalimentacionDetalleDto],
  })
  @IsArray()
  detalles: CreateRetroalimentacionDetalleDto[];
}
