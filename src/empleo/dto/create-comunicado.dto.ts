import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateComunicadoDto {
  @ApiProperty({
    example: 'Convocatoria abierta',
    description: 'Título del comunicado',
  })
  @IsString({
    message: 'El título del comunicado debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'El título del comunicado es obligatorio.' })
  titulo: string;

  @ApiProperty({
    example: 'https://empresa.com/convocatoria.pdf',
    description: 'URL del comunicado',
  })
  @IsOptional()
  @IsString({ message: 'La URL del comunicado debe ser una cadena de texto.' })
  url?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el comunicado está disponible',
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado disponible debe ser un valor booleano.' })
  estadoDisponible?: boolean;
}
