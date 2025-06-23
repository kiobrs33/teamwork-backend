import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateObjetivoDetalleDto {
  // @ApiProperty({
  //   example: 1,
  //   description: 'Número secuencial del detalle del objetivo',
  // })
  // @IsInt()
  // secuencial: number;

  @ApiPropertyOptional({
    example: 'Aprender NestJS',
    description: 'Descripción general del objetivo',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    example: 'Realizar curso oficial en línea',
    description: 'Descripción de la iniciativa para lograr el objetivo',
  })
  @IsOptional()
  @IsString()
  descripcionIniciativa?: string;

  @ApiPropertyOptional({
    example: 'horas',
    description: 'Unidad de medida del objetivo (por ejemplo: horas, tareas)',
  })
  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @ApiPropertyOptional({
    example: 0.25,
    description: 'Peso específico o ponderación del objetivo (de 0 a 1)',
  })
  @IsOptional()
  @IsNumber()
  pesoEspecifico?: number;
}
