import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ObjetivoExportQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idEmpresaEmpleadora?: number;

  @ApiPropertyOptional({
    description:
      'Trabajador (nombres, apellidos, código, documento) o descripción',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
