import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol, TiempoEmpresaUnidad } from '../types/empleadoTypes';
import { TIPOS_DOCUMENTO } from '../types/situacion';

export class CreateEmpleadoDto {
  // ==================== USUARIO ====================

  /**
   * Opcional: si no llega, el usuario es el número de documento (así está en
   * todas las empresas) y lo pone el servicio.
   */
  @ApiPropertyOptional({ example: '45871236' })
  @IsOptional()
  @IsString({ message: 'El código de usuario debe ser una cadena de texto.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^\S+$/, {
    message: 'El código de usuario no puede tener espacios.',
  })
  @MaxLength(50, {
    message: 'El código de usuario admite hasta 50 caracteres.',
  })
  codigoUsuario?: string;

  /**
   * Opcional: si no llega, el servicio genera una y la devuelve una sola vez
   * (`acceso`). Si llega, al menos 8 caracteres.
   */
  @ApiPropertyOptional({ example: 'password123' })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena?: string;

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
  // `IsNotEmpty` deja pasar "   ".
  @Matches(/\S/, { message: 'Ingrese el código del empleado.' })
  @MaxLength(30, {
    message: 'El código del empleado admite hasta 30 caracteres.',
  })
  codigoEmpleado: string;

  @ApiProperty({ example: 'Juan Carlos' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  // `IsNotEmpty` deja pasar "   ".
  @Matches(/\S/, { message: 'Ingrese los nombres.' })
  @MaxLength(100, { message: 'Los nombres admiten hasta 100 caracteres.' })
  nombres: string;

  @ApiProperty({ example: 'Pérez López' })
  @IsString({ message: 'Los apellidos deben ser una cadena de texto.' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios.' })
  // `IsNotEmpty` deja pasar "   ".
  @Matches(/\S/, { message: 'Ingrese los apellidos.' })
  @MaxLength(100, { message: 'Los apellidos admiten hasta 100 caracteres.' })
  apellidos: string;

  @ApiPropertyOptional({ enum: TIPOS_DOCUMENTO, default: 'DNI' })
  @IsOptional()
  @IsIn(TIPOS_DOCUMENTO, {
    message: 'El tipo de documento debe ser DNI, CE o PASAPORTE.',
  })
  tipoDocumento?: (typeof TIPOS_DOCUMENTO)[number];

  /**
   * Obligatorio: identifica a la persona dentro de la empresa (con su tipo,
   * no se repite). El formato por tipo se valida en el servicio.
   */
  @ApiProperty({ example: '12345678' })
  @IsString({ message: 'El documento debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El documento es obligatorio.' })
  documento: string;

  @ApiProperty({ example: 'Arequipa' })
  @IsOptional()
  @IsString({ message: 'La sede debe ser una cadena de texto.' })
  @MaxLength(100, { message: 'La sede admite hasta 100 caracteres.' })
  sede?: string;

  /**
   * Fecha de ingreso (AAAA-MM-DD): la antigüedad se calcula con ella. Reemplaza
   * a `tiempoEmpresaValor/Unidad`, que ya no se reciben (un "3 años" escrito
   * una vez quedaba desactualizado). Que no sea futura lo valida el servicio.
   */
  @ApiPropertyOptional({ example: '2023-03-15' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de ingreso debe tener el formato AAAA-MM-DD.',
  })
  fechaIngreso?: string | null;

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
