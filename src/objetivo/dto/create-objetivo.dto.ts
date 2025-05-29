import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateObjetivoDto {
  @ApiProperty({
    example: '2024-01-01',
    description: 'Fecha de inicio de vigencia (ISO 8601)',
  })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener formato ISO 8601.' },
  )
  fechaVigenciaInicia: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Fecha fin de vigencia (ISO 8601)',
  })
  @IsDateString({}, { message: 'La fecha fin debe tener formato ISO 8601.' })
  fechaVigenciaFin: string;

  @ApiProperty({ example: 1, description: 'ID de la empresa empleadora' })
  @IsInt({ message: 'Debe ser un número entero.' })
  idEmpresaEmpleadora: number;

  @ApiProperty({ example: 1, description: 'ID del empleado' })
  @IsInt({ message: 'Debe ser un número entero.' })
  idEmpleado: number;
}
