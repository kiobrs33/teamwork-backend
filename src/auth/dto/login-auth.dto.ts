// dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'xgvBUDRTgU' })
  @IsEmail()
  codigoUsuario: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  contrasena: string;
}
