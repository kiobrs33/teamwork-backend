// dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'Hq0z1vDTYz' })
  @IsString()
  codigoUsuario: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  contrasena: string;
}
