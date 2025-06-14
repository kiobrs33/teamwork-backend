import { PartialType } from '@nestjs/swagger';
import { CreateUnidadOcupacionalEmpleadoraDto } from './create-unidad-ocupacional-empleadora.dto';

export class UpdateUnidadOcupacionalEmpleadoraDto extends PartialType(
  CreateUnidadOcupacionalEmpleadoraDto,
) {}
