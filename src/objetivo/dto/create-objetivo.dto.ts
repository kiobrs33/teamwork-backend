import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, ValidateNested } from 'class-validator';
import { CreateObjetivoDetalleDto } from './create-objetivo-detalle.dto';

export class CreateObjetivoDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Fecha de inicio de vigencia (formato ISO 8601)',
  })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener formato ISO 8601.' },
  )
  fechaVigenciaInicia: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Fecha fin de vigencia (formato ISO 8601)',
  })
  @IsDateString({}, { message: 'La fecha fin debe tener formato ISO 8601.' })
  fechaVigenciaFin: string;

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
  objetivoDetalle: CreateObjetivoDetalleDto[];
}
