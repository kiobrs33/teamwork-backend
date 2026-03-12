// update-retroalimentacion-detalle-item.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateRetroalimentacionDetalleItemDto } from './create-retroalimentacion-detalle-item.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateRetroalimentacionDetalleItemDto extends PartialType(
  CreateRetroalimentacionDetalleItemDto,
) {
  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  idRetroalimentacionDetalle?: number;
}
