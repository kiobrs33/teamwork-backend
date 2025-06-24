import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, ValidateNested } from 'class-validator';
import { CreateObjetivoDetalleDto } from './create-objetivo-detalle.dto';

export class CreateObjetivoDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la empresa empleadora asociada al objetivo',
  })
  @IsInt({ message: 'Debe ser un número entero.' })
  idEmpresaEmpleadora: number;

  @ApiProperty({
    example: 1,
    description: 'ID del empleado al que está asignado el objetivo',
  })
  @IsInt({ message: 'Debe ser un número entero.' })
  idEmpleado: number;

  @ApiProperty({
    type: [CreateObjetivoDetalleDto],
    description: 'Lista de detalles del objetivo',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObjetivoDetalleDto)
  objetivoDetalles: CreateObjetivoDetalleDto[];
}
