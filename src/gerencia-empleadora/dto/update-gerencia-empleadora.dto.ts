import { PartialType } from '@nestjs/swagger';
import { CreateGerenciaEmpleadoraDto } from './create-gerencia-empleadora.dto';

export class UpdateGerenciaEmpleadoraDto extends PartialType(
  CreateGerenciaEmpleadoraDto,
) {}
