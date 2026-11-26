// create-retroalimentacion-detalle-item.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRetroalimentacionDetalleItemDto {
  @ApiPropertyOptional({
    example: 'Incrementar ventas del trimestre',
  })
  @IsString({ message: 'Escriba el objetivo de desarrollo de cada acción.' })
  @Matches(/\S/, {
    message: 'Escriba el objetivo de desarrollo de cada acción.',
  })
  @MaxLength(1000, {
    message: 'El objetivo de desarrollo admite hasta 1000 caracteres.',
  })
  descripcionObjetivo: string;

  @ApiPropertyOptional({
    example: 'Realizar campañas digitales',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La actividad admite hasta 1000 caracteres.' })
  descripcionActividad?: string;

  @ApiPropertyOptional({
    example: 'Marzo 2026',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'El plazo admite hasta 1000 caracteres.' })
  descripcionFecha?: string;

  @ApiPropertyOptional({
    example: 'En progreso',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'El estado admite hasta 1000 caracteres.' })
  descripcionEstado?: string;
}
