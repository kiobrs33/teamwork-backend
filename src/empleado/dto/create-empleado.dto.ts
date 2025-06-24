import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol } from '../types/empleadoTypes';

export class CreateEmpleadoDto {
  @ApiProperty({ example: 'ABC123' })
  @IsString({ message: 'El codigo de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El codigo usuario es obligatorio.' })
  codigoUsuario: string;

  @ApiProperty({ example: '12345678' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena: string;

  @ApiProperty({
    example: Rol.EMPLEADO,
    enum: Rol,
    description: 'Rol del usuario dentro del sistema',
  })
  @IsEnum(Rol, {
    message:
      'El rol debe ser uno de los siguientes valores: ADMIN, SUBADMIN, JEFE o EMPLEADO.',
  })
  @IsOptional() // Si deseas que el campo sea opcional; quítalo si es obligatorio
  rol: Rol;

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

  @ApiProperty({ example: '12345678' })
  @IsInt({ message: 'El documento debe ser un número entero.' })
  @IsNotEmpty({ message: 'El documento es obligatorio.' })
  documento: number;

  @ApiProperty({ example: 'Arequipa' })
  @IsString({ message: 'La sede debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La sede es obligatorio.' })
  sede: string;

  @ApiProperty({ example: '1' })
  @IsInt({ message: 'El tiempo empresa valor debe ser un número entero.' })
  @IsNotEmpty({ message: 'El tiempo empresa valor es obligatorio.' })
  tiempoEmpresaValor: number;

  @ApiProperty({ example: 'mes' })
  @IsString({
    message: 'El tiempo empresa unidad debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'El tiempo empresa unidad obligatorio.' })
  tiempoEmpresaUnidad: string;

  @ApiProperty({ example: 1, description: 'ID de la empresa empleadora' })
  @IsInt({
    message: 'El ID de la empresa empleadora debe ser un número entero.',
  })
  idEmpresaEmpleadora: number;

  @ApiProperty({ example: 1, description: 'ID del equipo empleador' })
  @IsInt({ message: 'El ID del area empleador debe ser un número entero.' })
  idAreaEmpleadora: number;

  @ApiProperty({ example: 1, description: 'ID del puesto empleador' })
  @IsInt({ message: 'El ID del puesto empleador debe ser un número entero.' })
  idPuestoEmpleadora: number;

  @ApiProperty({ example: 1, description: 'ID de la unidad empleadora' })
  @IsInt({
    message: 'El ID de la gerencia empleadora debe ser un número entero.',
  })
  idGerenciaEmpleadora: number;

  @ApiProperty({ example: 1, description: 'ID de la unidad empleadora' })
  @IsInt({
    message: 'El ID de la gerencia empleadora debe ser un número entero.',
  })
  unidadOcupacionalEmpleadora: number;
}
