import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateRetroalimentacionDetalleDto } from './create-retroalimentacion-detalle.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateRetroalimentacionDetalleDto extends PartialType(
  CreateRetroalimentacionDetalleDto,
) {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la retroalimentación detalle',
  })
  @IsOptional()
  @IsNumber()
  idRetroalimentacionDetalle?: number;
}
