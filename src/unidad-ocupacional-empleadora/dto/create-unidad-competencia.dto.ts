// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsArray,
//   IsInt,
//   ValidateNested,
//   Min,
//   IsNotEmpty,
// } from 'class-validator';
// import { Type } from 'class-transformer';

// export class CompetenciaNivelAsignacionDto {
//   @ApiProperty({
//     example: 1,
//     description: 'ID de la competencia que será asignada.',
//   })
//   @IsInt({ message: 'idCompetencia debe ser un número entero.' })
//   @Min(1, { message: 'idCompetencia debe ser mayor a 0.' })
//   idCompetencia: number;

//   @ApiProperty({
//     example: 3,
//     description: 'ID del nivel de la competencia que se asignará.',
//   })
//   @IsInt({ message: 'idCompetenciaNivel debe ser un número entero.' })
//   @Min(1, { message: 'idCompetenciaNivel debe ser mayor a 0.' })
//   idCompetenciaNivel: number;
// }

// export class UnidadCompetenciaAsignacionDto {
//   @ApiProperty({
//     example: 1,
//     description: 'ID de la unidad ocupacional empleadora.',
//   })
//   @IsInt({ message: 'idUnidadOcupacionalEmpleadora debe ser un entero.' })
//   @Min(1, {
//     message: 'idUnidadOcupacionalEmpleadora debe ser mayor a 0.',
//   })
//   idUnidadOcupacionalEmpleadora: number;

//   @ApiProperty({
//     type: CompetenciaNivelAsignacionDto,
//     isArray: true,
//     description:
//       'Lista de competencias con sus niveles que se asignarán a esta unidad.',
//   })
//   @IsArray({ message: 'competencias debe ser un arreglo.' })
//   @ValidateNested({ each: true })
//   @Type(() => CompetenciaNivelAsignacionDto)
//   competencias: CompetenciaNivelAsignacionDto[];
// }

// export class AsignarCompetenciasDto {
//   @ApiProperty({
//     type: UnidadCompetenciaAsignacionDto,
//     isArray: true,
//     description: 'Listado de unidades con sus competencias a asignar.',
//   })
//   @IsArray({ message: 'El cuerpo debe ser un arreglo de unidades.' })
//   @ValidateNested({ each: true })
//   @Type(() => UnidadCompetenciaAsignacionDto)
//   unidades: UnidadCompetenciaAsignacionDto[];
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
//  DTO: Competencias dentro de una unidad
// ============================================
export class CompetenciaNivelAsignacionDto {
  @ApiProperty({ example: 1, description: 'ID de la competencia.' })
  @IsInt()
  @Min(1)
  idCompetencia: number;

  @ApiProperty({ example: 3, description: 'ID del nivel asignado.' })
  @IsInt()
  @Min(1)
  idCompetenciaNivel: number;
}

// ============================================
//  DTO: Unidad con lista de competencias
//  Esto reemplaza tu interfaz UnidadCompetenciasInput
// ============================================
export class UnidadCompetenciaAsignacionDto {
  @ApiProperty({
    example: 10,
    description: 'ID de la unidad ocupacional.',
  })
  @IsInt()
  @Min(1)
  idUnidadOcupacionalEmpleadora: number;

  @ApiProperty({
    type: CompetenciaNivelAsignacionDto,
    isArray: true,
    description: 'Lista de competencias con sus niveles.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetenciaNivelAsignacionDto)
  competencias: CompetenciaNivelAsignacionDto[];
}

// ============================================
//  DTO: Lista de unidades (DTO principal)
// ============================================
export class AsignarCompetenciasDto {
  @ApiProperty({
    type: UnidadCompetenciaAsignacionDto,
    isArray: true,
    description: 'Unidades con las competencias a asignar.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnidadCompetenciaAsignacionDto)
  unidades: UnidadCompetenciaAsignacionDto[];
}
