// dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  codigoUsuario: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  contrasena: string;

  /** La cuenta elegida, cuando el mismo usuario tiene cuenta en varias empresas. */
  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  idUsuario?: number;

  /** Empresa del enlace de ingreso (`/login?empresa=2`): deja solo sus cuentas. */
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  empresa?: number;
}
