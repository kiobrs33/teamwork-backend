import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  Length,
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
    example: '90',
    description: 'Modelo Empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El modelo empresa es obligatorio.' })
  modeloEmpresa: string;

  @ApiProperty({
    example: '2',
    description: 'Objetivo Empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El objetivo empresa es obligatorio.' })
  cantidadObjetivos: string;

  @ApiProperty({
    example: '2025-07-10T17:30:07.811Z',
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
    example: '2025-07-10T17:30:07.811Z',
    description: 'Fecha fin de vigencia (ISO 8601)',
  })
  @IsDateString(
    {},
    {
      message: 'La fecha fin de vigencia debe tener formato ISO 8601.',
    },
  )
  fechaVigenciaFin: string;
  @ApiProperty({
    example: '2025-07-10T17:30:07.811Z',
    description: 'Fecha de inicio de vigencia de objetivos (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio de objetivos debe tener formato ISO 8601.' },
  )
  fechaVigenciaInicioObjetivo?: string | null;

  @ApiProperty({
    example: '2025-07-10T17:30:07.811Z',
    description: 'Fecha fin de vigencia de objetivos (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha fin de objetivos debe tener formato ISO 8601.' },
  )
  fechaVigenciaFinObjetivo?: string | null;
}
