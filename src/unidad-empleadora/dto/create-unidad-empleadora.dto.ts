import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUnidadEmpleadoraDto {
  @ApiProperty({
    example: 'Unidad A',
    description: 'Descripción de la unidad empleadora',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  descripcion: string;

  @ApiProperty({ example: 1, description: 'ID de la empresa empleadora' })
  @IsNumber({}, { message: 'El ID de empresa empleadora debe ser un número.' })
  idEmpresaEmpleadora: number;

  @ApiProperty({
    example: 101,
    description: 'ID del usuario que crea el registro',
  })
  @IsNumber({}, { message: 'El ID del creador debe ser un número.' })
  creadoPorId: number;
}
