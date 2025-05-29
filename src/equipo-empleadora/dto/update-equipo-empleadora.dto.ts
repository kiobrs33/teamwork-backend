import { PartialType } from '@nestjs/swagger';
import { CreateEquipoEmpleadoraDto } from './create-equipo-empleadora.dto';

export class UpdateEquipoEmpleadoraDto extends PartialType(
  CreateEquipoEmpleadoraDto,
) {}
