import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateEquipoEmpleadoraDto {
  @ApiProperty({
    example: 'Equipo de Marketing',
    description: 'Descripción del equipo empleadora',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @Length(3, 100, {
    message: 'La descripción debe tener entre 3 y 100 caracteres.',
  })
  descripcion: string;

  @ApiProperty({ example: 1, description: 'ID de la empresa empleadora' })
  @IsInt({
    message: 'El ID de la empresa empleadora debe ser un número entero.',
  })
  idEmpresaEmpleadora: number;
}
