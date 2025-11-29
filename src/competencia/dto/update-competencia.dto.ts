import { PartialType } from '@nestjs/swagger';
import { CreateCompetenciaNivelesItemsDto } from './create-competencia-nivel-item.dto';

export class UpdateCompetenciaDto extends PartialType(
  CreateCompetenciaNivelesItemsDto,
) {}
