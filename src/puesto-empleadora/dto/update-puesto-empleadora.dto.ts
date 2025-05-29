import { PartialType } from '@nestjs/swagger';
import { CreatePuestoEmpleadoraDto } from './create-puesto-empleadora.dto';

export class UpdatePuestoEmpleadoraDto extends PartialType(
  CreatePuestoEmpleadoraDto,
) {}
