import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoEmpleadoraDto } from './create-equipo-empleadora.dto';

export class UpdateEquipoEmpleadoraDto extends PartialType(
  CreateEquipoEmpleadoraDto,
) {}
