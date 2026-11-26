import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** Texto recortado: "  A01 " y "A01" son el mismo código. */
const recortar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// ======================================================
//            ITEM DEL NIVEL DE COMPETENCIA
// ======================================================
export class CompetenciaNivelItemDto {
  @ApiProperty({ example: 'Muestra iniciativa en actividades del equipo' })
  @Transform(recortar)
  @IsString({ message: 'El comportamiento debe ser texto.' })
  @Matches(/\S/, { message: 'Hay un comportamiento vacío.' })
  @MaxLength(1000, {
    message: 'Un comportamiento no puede pasar de 1000 caracteres.',
  })
  enunciado: string;

  @ApiPropertyOptional({
    example: 12,
    description:
      'Solo al editar: id del ítem existente. Sin él, el ítem se trata como nuevo.',
  })
  @IsOptional()
  @IsInt()
  idCompetenciaNivelItem?: number;
}

// ======================================================
//                 NIVEL DE COMPETENCIA
// ======================================================
export class CompetenciaNivelDto {
  @ApiProperty({ example: 1, description: 'Número del nivel (1 a 10)' })
  @IsInt({ message: 'El nivel debe ser un número entero.' })
  @Min(1, { message: 'El nivel va de 1 a 10.' })
  @Max(10, { message: 'El nivel va de 1 a 10.' })
  nivel: number;

  @ApiProperty({
    type: CompetenciaNivelItemDto,
    isArray: true,
    description: 'Lista de ítems pertenecientes al nivel',
  })
  @IsArray({ message: 'Debe enviar un arreglo de items.' })
  @ArrayMinSize(1, {
    message: 'Cada nivel necesita al menos un comportamiento.',
  })
  @ArrayMaxSize(50, {
    message: 'Un nivel no puede tener más de 50 comportamientos.',
  })
  @ValidateNested({ each: true })
  @Type(() => CompetenciaNivelItemDto)
  items: CompetenciaNivelItemDto[];
}

// ======================================================
//     DTO PRINCIPAL PARA CREAR COMPETENCIA COMPLETA
// ======================================================
export class CreateCompetenciaNivelesItemsDto {
  @ApiProperty({ example: 'COM-001', description: 'Código de la competencia' })
  @Transform(recortar)
  @IsString({ message: 'El código de la competencia debe ser texto.' })
  @IsNotEmpty({ message: 'El código de la competencia es obligatorio.' })
  @MaxLength(20, { message: 'El código no puede pasar de 20 caracteres.' })
  codigo: string;

  @ApiProperty({
    example: 'Liderazgo',
    description: 'Título de la competencia',
  })
  @Transform(recortar)
  @IsString({ message: 'El título debe ser texto.' })
  @Matches(/\S/, { message: 'El título es obligatorio.' })
  @MaxLength(150, { message: 'El título no puede pasar de 150 caracteres.' })
  titulo: string;

  @ApiProperty({
    example: 'Capacidad de influir y motivar a otros.',
    description: 'Nombre o descripción corta de la competencia',
  })
  @Transform(recortar)
  @IsString({ message: 'La descripción debe ser texto.' })
  @Matches(/\S/, { message: 'La descripción es obligatoria.' })
  @MaxLength(2000, {
    message: 'La descripción no puede pasar de 2000 caracteres.',
  })
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
  @ArrayMinSize(1, { message: 'La competencia necesita al menos un nivel.' })
  @ArrayMaxSize(10, { message: 'No puede tener más de 10 niveles.' })
  @ValidateNested({ each: true })
  @Type(() => CompetenciaNivelDto)
  niveles: CompetenciaNivelDto[];
}
