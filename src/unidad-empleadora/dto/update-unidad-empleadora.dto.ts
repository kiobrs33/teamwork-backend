import { PartialType } from '@nestjs/swagger';
import { CreateUnidadEmpleadoraDto } from './create-unidad-empleadora.dto';

export class UpdateUnidadEmpleadoraDto extends PartialType(
  CreateUnidadEmpleadoraDto,
) {}
