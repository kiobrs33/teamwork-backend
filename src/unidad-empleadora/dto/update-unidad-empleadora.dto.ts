import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadEmpleadoraDto } from './create-unidad-empleadora.dto';

export class UpdateUnidadEmpleadoraDto extends PartialType(
  CreateUnidadEmpleadoraDto,
) {}
