// dto/evaluar-objetivo-detalle.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class EvaluarObjetivoDetalleDto {
  @ApiProperty({
    example: 101,
    description: 'ID del detalle del objetivo',
  })
  @IsNumber()
  idObjetivoDetalle: number;

  @ApiPropertyOptional({
    example: 85,
    nullable: true,
    description:
      'Valor alcanzado del objetivo. `null` significa SIN EVALUAR; `0` es un valor válido.',
  })
  @IsOptional()
  @IsNumber()
  metaAlcanzada?: number | null;

  @ApiPropertyOptional({
    example: 85,
    nullable: true,
    minimum: 0,
    description:
      'Porcentaje logrado del detalle. `null` significa SIN EVALUAR; `0` es un valor válido.',
  })
  @IsOptional()
  @IsNumber()
  porcentajeLogrado?: number | null;
}
