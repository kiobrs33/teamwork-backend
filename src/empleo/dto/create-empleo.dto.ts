import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateComunicadoDto } from './create-comunicado.dto';

export class CreateEmpleoDto {
  @ApiProperty({
    example: 'Desarrollador Full Stack',
    description: 'Título del empleo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El título del empleo es obligatorio.' })
  titulo: string;

  @ApiProperty({
    example: 'Desarrollar aplicaciones web.',
    description: 'Descripción del empleo',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    example: 'TechCorp S.A.',
    description: 'Nombre de la empresa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio.' })
  nombreEmpresa: string;

  @ApiProperty({ example: 'Lima, Perú', description: 'Ubicación del empleo' })
  @IsString()
  @IsNotEmpty({ message: 'La ubicación del empleo es obligatoria.' })
  ubicacion: string;

  @ApiProperty({ example: 'Tiempo completo', description: 'Tipo de empleo' })
  @IsString()
  @IsNotEmpty({ message: 'El tipo de empleo es obligatorio.' })
  tipoEmpleo: string;

  @ApiProperty({ example: 'Remoto', description: 'Modalidad del empleo' })
  @IsOptional()
  @IsString()
  modalidad?: string;

  @ApiProperty({
    example: '2025-08-05T00:00:00Z',
    description: 'Fecha de publicación',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de publicación es obligatoria.' })
  fechaPublicacion: Date;

  @ApiProperty({
    example: '2025-08-20T00:00:00Z',
    description: 'Fecha fin de publicación',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha fin de publicación es obligatoria.' })
  fechaFinPublicacion: Date;

  @ApiProperty({
    example: '2 años',
    description: 'Tiempo de experiencia requerido',
  })
  @IsString()
  @IsNotEmpty({ message: 'El tiempo de experiencia es obligatorio.' })
  tiempoExperiencia: string;

  @ApiProperty({ example: '3', description: 'Número de vacantes' })
  @IsString()
  @IsNotEmpty({ message: 'El número de vacantes es obligatorio.' })
  numeroVacantes: string;

  @ApiProperty({ example: '3000 - 4000 PEN', description: 'Salario ofrecido' })
  @IsOptional()
  @IsString()
  salario?: string;

  @ApiProperty({
    description: 'Lista de comunicados relacionados al empleo',
    type: [CreateComunicadoDto],
    required: false,
  })
  @IsArray({ message: 'Comunicados debe ser un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => CreateComunicadoDto)
  @IsOptional()
  comunicados?: CreateComunicadoDto[];
}
