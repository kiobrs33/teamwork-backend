import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsString,
  MaxLength,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ======================================================
//            ITEM DEL NIVEL DE COMPETENCIA
// ======================================================
export class CompetenciaNivelItemDto {
  @ApiProperty({ example: 'Muestra iniciativa en actividades del equipo' })
  @IsString()
  enunciado: string;
}

// ======================================================
//                 NIVEL DE COMPETENCIA
// ======================================================
export class CompetenciaNivelDto {
  @ApiProperty({ example: 1, description: 'Número del nivel (1 - 5)' })
  @IsInt({ message: 'El nivel debe ser un número entero.' })
  nivel: number;

  @ApiProperty({
    type: CompetenciaNivelItemDto,
    isArray: true,
    description: 'Lista de ítems pertenecientes al nivel',
  })
  @IsArray({ message: 'Debe enviar un arreglo de items.' })
  @ValidateNested({ each: true })
  @Type(() => CompetenciaNivelItemDto)
  items: CompetenciaNivelItemDto[];
}

// ======================================================
//     DTO PRINCIPAL PARA CREAR COMPETENCIA COMPLETA
// ======================================================
export class CreateCompetenciaNivelesItemsDto {
  @ApiProperty({ example: 'COM-001', description: 'Código de la competencia' })
  codigo: string;

  @ApiProperty({
    example: 'Liderazgo',
    description: 'Título de la competencia',
  })
  @IsString()
  titulo: string;

  @ApiProperty({
    example: 'Capacidad de influir y motivar a otros.',
    description: 'Nombre o descripción corta de la competencia',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 5,
    description:
      'ID de la empresa empleadora a la que pertenece la competencia',
  })
  @IsInt({ message: 'El ID de la empresa debe ser un número entero.' })
  idEmpresaEmpleadora: number;

  @ApiProperty({
    type: CompetenciaNivelDto,
    isArray: true,
    description: 'Lista de niveles con sus items asociados',
  })
  @IsArray({ message: 'Debe enviar un arreglo de niveles.' })
  @ValidateNested({ each: true })
  @Type(() => CompetenciaNivelDto)
  niveles: CompetenciaNivelDto[];
}
