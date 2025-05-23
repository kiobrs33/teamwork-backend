import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpleadoDto {
  @ApiProperty({ example: 'Juan Carlos' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombres: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString({ message: 'El apellido paterno debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido paterno es obligatorio.' })
  apellidoPaterno: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString({ message: 'El apellido materno debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido materno es obligatorio.' })
  apellidoMaterno: string;

  @ApiProperty({ example: 1, description: 'ID de la empresa empleadora' })
  @IsInt({
    message: 'El ID de la empresa empleadora debe ser un número entero.',
  })
  idEmpresaEmpleadora: number;

  @ApiProperty({ example: 2, description: 'ID del equipo empleador' })
  @IsInt({ message: 'El ID del equipo empleador debe ser un número entero.' })
  idEquipoEmpleadora: number;

  @ApiProperty({ example: 3, description: 'ID del puesto empleador' })
  @IsInt({ message: 'El ID del puesto empleador debe ser un número entero.' })
  idPuestoEmpleadora: number;

  @ApiProperty({ example: 4, description: 'ID de la unidad empleadora' })
  @IsInt({
    message: 'El ID de la unidad empleadora debe ser un número entero.',
  })
  idUnidadEmpleadora: number;

  @ApiProperty({ example: 1, description: 'ID del usuario asociado' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero.' })
  idUsuario: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado del empleado (activo o no)',
  })
  @IsBoolean({
    message: 'El estado debe ser un valor booleano (true o false).',
  })
  @IsOptional()
  estado?: boolean = false;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que crea el registro',
  })
  @IsInt({ message: 'El ID del creador debe ser un número entero.' })
  creadoPorId: number;
}
