// create-retroalimentacion-detalle-item.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRetroalimentacionDetalleItemDto {
  @ApiPropertyOptional({
    example: 'Incrementar ventas del trimestre',
  })
  @IsOptional()
  @IsString()
  descripcionObjetivo?: string;

  @ApiPropertyOptional({
    example: 'Realizar campañas digitales',
  })
  @IsOptional()
  @IsString()
  descripcionActividad?: string;

  @ApiPropertyOptional({
    example: 'Marzo 2026',
  })
  @IsOptional()
  @IsString()
  descripcionFecha?: string;

  @ApiPropertyOptional({
    example: 'En progreso',
  })
  @IsOptional()
  @IsString()
  descripcionEstado?: string;
}
