import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { EmployeeQueryDto } from './employee-query.dto';

export const ESTADOS_AVANCE = [
  'SIN_ASIGNACION',
  'SIN_INICIAR',
  'EN_CURSO',
  'COMPLETO',
] as const;
export type EstadoAvance = (typeof ESTADOS_AVANCE)[number];

/** Los mismos filtros que el listado de trabajadores, más el estado. */
export class AvanceQueryDto extends EmployeeQueryDto {
  @ApiPropertyOptional({ enum: ESTADOS_AVANCE })
  @IsIn(ESTADOS_AVANCE)
  @IsOptional()
  estadoAvance?: EstadoAvance;
}
