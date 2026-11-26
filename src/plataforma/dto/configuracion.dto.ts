import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsOptional } from 'class-validator';

export class ActualizarConfiguracionDto {
  @ApiPropertyOptional({
    example: '#722ed1',
    description:
      'Color primario de la consola de TeamWork. Null = el azul por defecto.',
  })
  @IsOptional()
  @IsHexColor({ message: 'El color debe ser un hexadecimal, como #722ed1.' })
  colorPrimario?: string | null;
}
