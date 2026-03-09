import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateRetroalimentacionDetalleDto {
  @ApiProperty({
    example: 1,
    description: 'ID del objetivo asociado',
  })
  @IsNumber({}, { message: 'El ID del objetivo debe ser un número.' })
  idObjetivo: number;

  @ApiPropertyOptional({
    example: 'Incrementar ventas del trimestre',
    description: 'Descripción del objetivo',
  })
  @IsOptional()
  @IsString({ message: 'La descripción del objetivo debe ser texto.' })
  descripcionObjetivo?: string;

  @ApiPropertyOptional({
    example: 'Realizar campañas de marketing digital',
    description: 'Descripción de la actividad',
  })
  @IsOptional()
  @IsString({ message: 'La descripción de la actividad debe ser texto.' })
  descripcionActividad?: string;

  @ApiPropertyOptional({
    example: 'Marzo 2026',
    description: 'Descripción de la fecha relacionada',
  })
  @IsOptional()
  @IsString({ message: 'La descripción de la fecha debe ser texto.' })
  descripcionFecha?: string;

  @ApiPropertyOptional({
    example: 'En progreso',
    description: 'Estado descriptivo del objetivo',
  })
  @IsOptional()
  @IsString({ message: 'La descripción del estado debe ser texto.' })
  descripcionEstado?: string;
}
