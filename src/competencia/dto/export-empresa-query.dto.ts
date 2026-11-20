import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

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
    example: '2026-07',
    description:
      'Campaña a exportar ("YYYY-MM"). Si no se envía se usa el periodo ' +
      'vigente de la empresa, que es lo que hace la interfaz: sin esto el ' +
      'reporte mezclaría las notas de todas las campañas anteriores.',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener el formato YYYY-MM.',
  })
  periodoEvaluacion?: string;
}
