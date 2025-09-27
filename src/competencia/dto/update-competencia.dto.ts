import { PartialType } from '@nestjs/swagger';
import { CreateCompetenciaDto } from './create-competencia.dto';
import { CreateCompetenciaConDetallesDto } from './create-competencia-con-detalles.dto';

export class UpdateCompetenciaDto extends PartialType(
  CreateCompetenciaConDetallesDto,
) {}
