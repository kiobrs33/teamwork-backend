import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CambiarContrasenaDto {
  @ApiProperty()
  @IsString()
  contrasenaActual: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña nueva debe tener al menos 8 caracteres.',
  })
  contrasenaNueva: string;
}
