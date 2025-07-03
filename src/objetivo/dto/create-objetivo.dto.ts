import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { ObjetivoDetalleDto } from './create-objetivo-con-detalles.dto';

export class CreateObjetivoDto {
  @ApiProperty({
    example: 1,
    description: 'ID del empleado al que está asignado el objetivo',
  })
  @IsInt({ message: 'Debe ser un número entero.' })
  idEmpleado: number;

  @ApiProperty({
    type: [ObjetivoDetalleDto],
    description: 'Lista de detalles del objetivo',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjetivoDetalleDto)
  objetivoDetalles: ObjetivoDetalleDto[];
}
