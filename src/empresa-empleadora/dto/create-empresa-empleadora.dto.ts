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
  IsHexColor,
  IsEnum,
} from 'class-validator';
import { TipoCalificacion } from '../types/empresaTypes';

export class CreateEmpresaEmpleadoraDto {
  /*
  =========================
  INFORMACIÓN GENERAL
  =========================
  */

  @ApiProperty({
    example: 'Empresa XYZ S.A.',
  })
  @IsString({ message: 'El nombre de la empresa debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
  @Length(1, 100, {
    message: 'El nombre de la empresa debe tener entre 1 y 100 caracteres.',
  })
  nombreEmpresa: string;

  @ApiPropertyOptional({
    example: '12345678901',
  })
  @IsOptional()
  @IsString({ message: 'El RUC debe ser un texto.' })
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe tener 11 dígitos.',
  })
  ruc?: string;

  @ApiPropertyOptional({
    example: 'Av. Principal 123, Lima',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto.' })
  @Length(5, 200, {
    message: 'La dirección debe tener entre 5 y 200 caracteres.',
  })
  direccionEmpresa?: string;

  @ApiPropertyOptional({
    example: 'https://empresa.com/logo.png',
    description:
      'URL del logo. Opcional al crear: el archivo se sube despues con POST /empresa-empleadora/:id/logo, que necesita el id de la empresa ya creada.',
  })
  @IsOptional()
  @IsString({ message: 'La URL del logo debe ser un texto.' })
  urlLogo?: string;

  @ApiPropertyOptional({
    example: '#722ed1',
    description:
      'Color primario de la empresa: el sistema lo usa en botones, enlaces y selección para que se sienta suyo. Null = el azul por defecto. El front ofrece solo colores de la paleta de antd.',
  })
  @IsOptional()
  @IsHexColor({ message: 'El color debe ser un hexadecimal, como #722ed1.' })
  colorPrimario?: string | null;

  // Configuración y vigencias de la empresa: valores por defecto de su
  // PRIMERA campaña. Las de cada ciclo viven en la campaña (módulo campana).
  @ApiPropertyOptional({
    example: '90',
  })
  @IsOptional()
  @IsString({ message: 'El modelo de empresa debe ser un texto.' })
  @IsIn(['90', '180'], { message: 'El modelo de empresa debe ser 90 o 180.' })
  modeloEmpresa?: string;

  /*
  =========================
  VIGENCIAS
  =========================
  */

  @ApiPropertyOptional({
    example: '2025-07-10T17:30:07.811Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio de vigencia debe ser una fecha válida.' },
  )
  fechaVigenciaInicio?: string;

  @ApiPropertyOptional({
    example: '2025-12-10T17:30:07.811Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de fin de vigencia debe ser una fecha válida.' },
  )
  fechaVigenciaFin?: string;

  @ApiPropertyOptional({
    example: '2025-07-10T17:30:07.811Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de inicio de vigencia de objetivos debe ser una fecha válida.',
    },
  )
  fechaVigenciaInicioObjetivo?: string | null;

  @ApiPropertyOptional({
    example: '2025-12-10T17:30:07.811Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de fin de vigencia de objetivos debe ser una fecha válida.',
    },
  )
  fechaVigenciaFinObjetivo?: string | null;

  /*
  =========================
  PONDERACIONES GENERALES
  =========================
  */

  @ApiPropertyOptional({
    example: 80,
  })
  @IsOptional()
  @IsInt({ message: 'El porcentaje de competencias debe ser un entero.' })
  @Min(0, {
    message: 'El porcentaje de competencias debe estar entre 0 y 100.',
  })
  @Max(100, {
    message: 'El porcentaje de competencias debe estar entre 0 y 100.',
  })
  porcentajeCompetecias?: number;

  @ApiPropertyOptional({
    example: 20,
  })
  @IsOptional()
  @IsInt({ message: 'El porcentaje de objetivos debe ser un entero.' })
  @Min(0, { message: 'El porcentaje de objetivos debe estar entre 0 y 100.' })
  @Max(100, { message: 'El porcentaje de objetivos debe estar entre 0 y 100.' })
  porcentajeObjetivos?: number;

  /*
  =========================
  PONDERACIÓN COMPETENCIAS
  =========================
  */

  @ApiPropertyOptional({
    example: 70,
  })
  @IsOptional()
  @IsInt({
    message: 'El porcentaje de evaluación del jefe debe ser un entero.',
  })
  @Min(0, {
    message: 'El porcentaje de evaluación del jefe debe estar entre 0 y 100.',
  })
  @Max(100, {
    message: 'El porcentaje de evaluación del jefe debe estar entre 0 y 100.',
  })
  porcentajeEvaluacionJefeCompetencia?: number;

  @ApiPropertyOptional({
    example: 30,
  })
  @IsOptional()
  @IsInt({
    message: 'El porcentaje de evaluación del subordinado debe ser un entero.',
  })
  @Min(0, {
    message:
      'El porcentaje de evaluación del subordinado debe estar entre 0 y 100.',
  })
  @Max(100, {
    message:
      'El porcentaje de evaluación del subordinado debe estar entre 0 y 100.',
  })
  porcentajeEvaluacionSubordinadoCompetencia?: number;

  /*
  =========================
  CONFIGURACIÓN EVALUACIÓN
  =========================
  */

  @ApiPropertyOptional({
    example: 'LIKERT',
  })
  @IsOptional()
  @IsEnum(TipoCalificacion, {
    message: 'El tipo de calificación debe ser LIKERT o MANUAL.',
  })
  tipoCalificacionCompetencia?: TipoCalificacion;

  @ApiPropertyOptional({
    example: '2025-01',
    description: 'Periodo de evaluación en formato YYYY-MM',
  })
  @IsOptional()
  @IsString({ message: 'El periodo de evaluación debe ser un texto.' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo de evaluación debe tener el formato YYYY-MM.',
  })
  periodoEvaluacion?: string;

  @ApiPropertyOptional({
    example: 70,
    description: 'Resultado esperado de competencias (0 - 100)',
  })
  @IsOptional()
  @IsInt({ message: 'El resultado esperado debe ser un entero.' })
  @Min(0, { message: 'El resultado esperado debe estar entre 0 y 100.' })
  @Max(100, { message: 'El resultado esperado debe estar entre 0 y 100.' })
  competenciaResultadoEsperado?: number;
}
