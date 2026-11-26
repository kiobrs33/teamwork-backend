import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearMiembroEquipoDto {
  @ApiProperty({ example: 'Ana Torres' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(120)
  nombreCompleto: string;

  @ApiProperty({ example: 'tw.atorres' })
  @IsString()
  @Matches(/^[A-Za-z0-9._-]{4,40}$/, {
    message:
      'El usuario debe tener de 4 a 40 caracteres: letras, números, punto, guion o guion bajo.',
  })
  codigoUsuario: string;

  /** La pone el dueño y la entrega por sus medios (no hay correo). */
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena: string;

  /** true = atiende todas las empresas; false = solo `idsEmpresas`. */
  @ApiProperty()
  @IsBoolean()
  todasLasEmpresas: boolean;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  idsEmpresas?: number[];

  /** Nivel de acceso: `true` = Solo lectura, `false` = Edición (por defecto). */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  soloLectura?: boolean;
}

export class ActualizarMiembroEquipoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombreCompleto?: string;

  /** Restablecer la contraseña. */
  @ApiPropertyOptional({ minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  todasLasEmpresas?: boolean;

  /** Reemplaza las empresas asignadas. */
  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  idsEmpresas?: number[];

  /** Desactivar o reactivar la cuenta. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  /** Nivel de acceso: `true` = Solo lectura, `false` = Edición (por defecto). */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  soloLectura?: boolean;
}
