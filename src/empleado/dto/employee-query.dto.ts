import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 0,
    description: 'Número de registros por página (0 para sin paginación)',
  })
  @IsOptional()
  limit?: number = 0;

  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  idEmpleado?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellidos?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoEmpleado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoEmpleadoJefe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoUsuario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreEmpresaEmpleadora?: string;
}
