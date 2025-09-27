import { PartialType } from '@nestjs/swagger';
import { CreateEmpresaEmpleadoraDto } from './create-empresa-empleadora.dto';

export class UpdateEmpresaEmpleadoraDto extends PartialType(
  CreateEmpresaEmpleadoraDto,
) {}
