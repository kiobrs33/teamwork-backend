// dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  codigoUsuario: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  contrasena: string;
}
