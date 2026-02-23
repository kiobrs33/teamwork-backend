// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import {
//   IsString,
//   IsNotEmpty,
//   IsOptional,
//   Matches,
//   Length,
//   IsDateString,
//   IsInt,
//   Min,
//   Max,
// } from 'class-validator';

// export class CreateEmpresaEmpleadoraDto {
//   @ApiProperty({
//     example: 'Empresa XYZ S.A.',
//     description: 'Nombre de la empresa',
//   })
//   @IsString()
//   @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
//   @Length(1, 100, {
//     message: 'El nombre debe tener entre 1 y 100 caracteres.',
//   })
//   nombreEmpresa: string;

//   @ApiProperty({
//     example: '12345678901',
//     description: 'RUC de la empresa (11 dígitos)',
//     required: false,
//   })
//   @IsOptional()
//   @IsString()
//   @Matches(/^\d{11}$/, {
//     message: 'El RUC debe tener exactamente 11 dígitos numéricos.',
//   })
//   ruc?: string;

//   @ApiProperty({
//     example: 'Av. Principal 123, Lima',
//     description: 'Dirección de la empresa (opcional)',
//     required: false,
//   })
//   @IsOptional()
//   @IsString({ message: 'La dirección debe ser un texto.' })
//   @Length(5, 200, {
//     message: 'La dirección debe tener entre 5 y 200 caracteres.',
//   })
//   direccionEmpresa?: string;

//   @ApiProperty({
//     example: 'https://empresa.com/logo.png',
//     description: 'URL del logo de la empresa',
//   })
//   @IsString()
//   @IsNotEmpty({ message: 'La URL del logo es obligatoria.' })
//   urlLogo: string;

//   @ApiProperty({
//     example: '90',
//     description: 'Modelo de empresa (90 o 180)',
//   })
//   @IsString()
//   modeloEmpresa: string;

//   @ApiProperty({
//     example: '2025-07-10T17:30:07.811Z',
//     description: 'Fecha de inicio de vigencia (ISO 8601)',
//   })
//   @IsDateString(
//     {},
//     {
//       message: 'La fecha de inicio de vigencia debe tener formato ISO 8601.',
//     },
//   )
//   fechaVigenciaInicio: string;

//   @ApiProperty({
//     example: '2025-07-10T17:30:07.811Z',
//     description: 'Fecha fin de vigencia (ISO 8601)',
//   })
//   @IsDateString(
//     {},
//     {
//       message: 'La fecha fin de vigencia debe tener formato ISO 8601.',
//     },
//   )
//   fechaVigenciaFin: string;

//   @ApiProperty({
//     example: '2025-07-10T17:30:07.811Z',
//     description: 'Fecha de inicio de vigencia de objetivos (ISO 8601)',
//     required: false,
//   })
//   @IsOptional()
//   @IsDateString(
//     {},
//     {
//       message: 'La fecha de inicio de objetivos debe tener formato ISO 8601.',
//     },
//   )
//   fechaVigenciaInicioObjetivo?: string | null;

//   @ApiProperty({
//     example: '2025-07-10T17:30:07.811Z',
//     description: 'Fecha fin de vigencia de objetivos (ISO 8601)',
//     required: false,
//   })
//   @IsOptional()
//   @IsDateString(
//     {},
//     {
//       message: 'La fecha fin de objetivos debe tener formato ISO 8601.',
//     },
//   )
//   fechaVigenciaFinObjetivo?: string | null;

//   @ApiPropertyOptional({
//     example: 80,
//     description: 'Porcentaje de competencias (0 a 100)',
//   })
//   @IsOptional()
//   @IsInt()
//   porcentajeCompetecias?: number;

//   @ApiPropertyOptional({
//     example: 20,
//     description: 'Porcentaje de objetivos (0 a 100)',
//   })
//   @IsOptional()
//   @IsInt()
//   porcentajeObjetivos?: number;
// }

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  Length,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsEnum,
} from 'class-validator';
import { TipoCalificacion } from '../types/empresaTypes';

export class CreateEmpresaEmpleadoraDto {
  @ApiProperty({
    example: 'Empresa XYZ S.A.',
    description: 'Nombre de la empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
  @Length(1, 100, {
    message: 'El nombre debe tener entre 1 y 100 caracteres.',
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
    description: 'Dirección de la empresa',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(5, 200, {
    message: 'La dirección debe tener entre 5 y 200 caracteres.',
  })
  direccionEmpresa?: string;

  @ApiProperty({
    example: 'https://empresa.com/logo.png',
    description: 'URL del logo',
  })
  @IsString()
  @IsNotEmpty({ message: 'La URL del logo es obligatoria.' })
  urlLogo: string;

  @ApiProperty({
    example: '90',
    description: 'Modelo de evaluación (90 o 180)',
  })
  @IsString()
  @IsIn(['90', '180'], {
    message: 'El modelo debe ser 90 o 180.',
  })
  modeloEmpresa: string;

  @ApiProperty({
    example: '2025-07-10T17:30:07.811Z',
  })
  @IsDateString()
  fechaVigenciaInicio: string;

  @ApiProperty({
    example: '2025-12-10T17:30:07.811Z',
  })
  @IsDateString()
  fechaVigenciaFin: string;

  @ApiPropertyOptional({
    example: '2025-07-10T17:30:07.811Z',
  })
  @IsOptional()
  @IsDateString()
  fechaVigenciaInicioObjetivo?: string | null;

  @ApiPropertyOptional({
    example: '2025-12-10T17:30:07.811Z',
  })
  @IsOptional()
  @IsDateString()
  fechaVigenciaFinObjetivo?: string | null;

  /*
    =========================
    PONDERACIONES
    =========================
  */

  @ApiPropertyOptional({
    example: 80,
    description: 'Porcentaje de competencias',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  porcentajeCompetecias?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Porcentaje de objetivos',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  porcentajeObjetivos?: number;

  @ApiPropertyOptional({
    example: 70,
    description: 'Porcentaje evaluación jefe (competencias)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  porcentajeJefeCompetencia?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Porcentaje autoevaluación (competencias)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  porcentajeAutoevaluacionCompetencia?: number;

  /*
    =========================
    TIPO CALIFICACION
    =========================
  */

  @ApiPropertyOptional({
    example: 'LIKERT',
    description: 'Tipo de calificación de competencias',
  })
  @IsOptional()
  @IsString()
  @IsEnum(TipoCalificacion, {
    message: 'El tipo debe ser LIKERT o MANUAL',
  })
  tipoCalificacionCompetencia?: string;
}
