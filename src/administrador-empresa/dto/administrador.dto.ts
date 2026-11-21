import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearAdministradorDto {
  @ApiProperty({ example: 'María Quispe Rojas' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(120)
  nombreCompleto: string;

  @ApiProperty({ example: 'rrhh.seal.mquispe' })
  @IsString()
  @Matches(/^[A-Za-z0-9._-]{4,40}$/, {
    message:
      'El usuario debe tener de 4 a 40 caracteres: letras, números, punto, guion o guion bajo.',
  })
  codigoUsuario: string;

  /** La pone quien crea la cuenta y la entrega por sus medios (no hay correo). */
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena: string;
}

export class ActualizarAdministradorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombreCompleto?: string;

  /** Restablecer la contraseña (p. ej. si la persona la olvidó). */
  @ApiPropertyOptional({ minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena?: string;

  /** Desactivar o reactivar la cuenta (cuando la persona deja la empresa). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
