import { PartialType } from '@nestjs/mapped-types';
import { CreatePuestoEmpleadoraDto } from './create-puesto-empleadora.dto';

export class UpdatePuestoEmpleadoraDto extends PartialType(
  CreatePuestoEmpleadoraDto,
) {}
