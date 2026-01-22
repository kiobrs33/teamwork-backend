// dto/evaluar-objetivo-detalle.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class EvaluarObjetivoDetalleDto {
  @ApiProperty({
    example: 101,
    description: 'ID del detalle del objetivo',
  })
  @IsNumber()
  idObjetivoDetalle: number;

  @ApiProperty({
    example: 85,
    description: 'Valor alcanzado del objetivo',
  })
  @IsNumber()
  metaAlcanzada: number;

  @ApiProperty({
    example: 85,
    description: 'Porcentaje logrado del detalle (0 - 100)',
    minimum: 0,
  })
  @IsNumber()
  porcentajeLogrado: number;
}
