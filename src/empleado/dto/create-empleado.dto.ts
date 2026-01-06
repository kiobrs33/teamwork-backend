import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol, TiempoEmpresaUnidad } from '../types/empleadoTypes';

export class CreateEmpleadoDto {
  // ==================== USUARIO ====================

  @ApiProperty({ example: 'ABC123' })
  @IsString({ message: 'El código de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código de usuario es obligatorio.' })
  codigoUsuario: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  // @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  // @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena: string;

  @ApiProperty({
    example: Rol.EMPLEADO,
    enum: Rol,
    description: 'Rol del usuario dentro del sistema',
  })
  @IsEnum(Rol, {
    message:
      'El rol debe ser uno de los siguientes valores válidos: ADMIN, JEFE o EMPLEADO.',
  })
  rol: Rol;

  // ==================== EMPLEADO ====================

  @ApiProperty({
    example: 'EMP001',
    description: 'Código único del empleado',
  })
  @IsString({ message: 'El código del empleado debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El código del empleado es obligatorio.' })
  codigoEmpleado: string;

  @ApiProperty({ example: 'Juan Carlos' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombres: string;

  @ApiProperty({ example: 'Pérez López' })
  @IsString({ message: 'Los apellidos deben ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios.' })
  apellidos: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString({ message: 'El documento debe ser una cadena de texto.' })
  documento?: string;

  @ApiProperty({ example: 'Arequipa' })
  @IsOptional()
  @IsString({ message: 'La sede debe ser una cadena de texto.' })
  sede?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt({ message: 'El tiempo empresa valor debe ser un número entero.' })
  tiempoEmpresaValor?: number;

  @ApiProperty({
    example: TiempoEmpresaUnidad.DIAS,
    enum: TiempoEmpresaUnidad,
    description: 'Unidad del tiempo en la empresa',
  })
  @IsEnum(TiempoEmpresaUnidad, {
    message:
      'La unidad del tiempo debe ser uno de los siguientes valores válidos: DIAS, MESES o AÑOS.',
  })
  @IsOptional()
  tiempoEmpresaUnidad?: TiempoEmpresaUnidad;

  @ApiProperty({
    example: 1,
    description: 'ID de la empresa empleadora',
  })
  @IsInt({
    message: 'El ID de la empresa empleadora debe ser un número entero.',
  })
  idEmpresaEmpleadora: number;

  @ApiProperty({
    example: 1,
    description: 'ID del área empleadora',
  })
  @IsInt({
    message: 'El ID del área empleadora debe ser un número entero.',
  })
  idAreaEmpleadora: number;

  @ApiProperty({
    example: 1,
    description: 'ID del puesto empleador',
  })
  @IsInt({
    message: 'El ID del puesto empleador debe ser un número entero.',
  })
  idPuestoEmpleadora: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la gerencia empleadora',
  })
  @IsInt({
    message: 'El ID de la gerencia empleadora debe ser un número entero.',
  })
  idGerenciaEmpleadora: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la unidad ocupacional empleadora',
  })
  @IsInt({
    message:
      'El ID de la unidad ocupacional empleadora debe ser un número entero.',
  })
  idUnidadOcupacionalEmpleadora: number;

  @ApiPropertyOptional({
    example: 'EMP002',
    description: 'Código del empleado jefe',
  })
  @IsOptional()
  @IsString({
    message: 'El código del jefe debe ser una cadena de texto.',
  })
  codigoEmpleadoJefe?: string;
}
