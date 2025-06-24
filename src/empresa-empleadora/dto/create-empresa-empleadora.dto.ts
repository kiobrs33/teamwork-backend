import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
  Length,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';

export class CreateEmpresaEmpleadoraDto {
  @ApiProperty({
    example: 'Empresa XYZ S.A.',
    description: 'Nombre de la empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
  @Length(1, 100, {
    message: 'El nombre debe tener entre 3 y 100 caracteres.',
  })
  nombreEmpresa: string;

  @ApiProperty({
    example: '12345678901',
    description: 'RUC de la empresa (11 dígitos)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe tener exactamente 11 dígitos numéricos.',
  })
  ruc?: string;

  @ApiProperty({
    example: 'Av. Principal 123, Lima',
    description: 'Dirección de la empresa (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto.' })
  @Length(1, 200, {
    message: 'La dirección debe tener entre 5 y 200 caracteres.',
  })
  direccionEmpresa?: string;

  @ApiProperty({
    example: 'https://empresa.com/logo.png',
    description: 'URL del logo de la empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'La URL del logo es obligatoria.' })
  urlLogo: string;

  @ApiProperty({
    example: '90, 180 y 90/180',
    description: 'Modelo Empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El modelo empresa es obligatorio.' })
  modeloEmpresa: string;

  @ApiProperty({
    example: '2, 3 o 4',
    description: 'Obejetivo Empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El objetivo empresa es obligatorio.' })
  cantidadObjetivos: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Fecha de inicio de vigencia (ISO 8601)',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha de inicio de vigencia debe tener formato ISO 8601.',
    },
  )
  fechaVigenciaInicio: string;

  @ApiProperty({
    example: '2099-12-31',
    description: 'Fecha fin de vigencia (ISO 8601)',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha fin de vigencia debe tener formato ISO 8601.',
    },
  )
  fechaVigenciaFin: string;
}
