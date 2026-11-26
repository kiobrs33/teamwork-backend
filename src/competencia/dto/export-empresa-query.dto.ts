import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * Filtros de los tres reportes Excel por empresa.
 *
 * Todos recortan por la jerarquía del empleado evaluado, que es lo único que
 * los tres reportes tienen en común. Son opcionales: sin ninguno, el reporte
 * sale completo como hasta ahora.
 */
export class ExportEmpresaQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por gerencia' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idGerenciaEmpleadora?: number;

  @ApiPropertyOptional({ description: 'Filtrar por área' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idAreaEmpleadora?: number;

  @ApiPropertyOptional({ description: 'Filtrar por unidad ocupacional' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idUnidadOcupacionalEmpleadora?: number;

  @ApiPropertyOptional({ description: 'Filtrar por puesto' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idPuestoEmpleadora?: number;

  @ApiPropertyOptional({
    description: 'Busca en nombres, apellidos y código del empleado',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Solo el equipo directo de este jefe (su código de empleado)',
  })
  @IsOptional()
  @IsString()
  codigoJefe?: string;

  @ApiPropertyOptional({
    example: 5,
    description:
      'Campaña a exportar (id). Si no se envía se usa la campaña en curso ' +
      'de la empresa: sin esto el reporte mezclaría las notas de todas las ' +
      'campañas.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idCampanaEvaluacion?: number;
}
