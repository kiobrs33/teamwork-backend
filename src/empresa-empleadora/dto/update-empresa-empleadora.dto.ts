import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaEmpleadoraDto } from './create-empresa-empleadora.dto';

export class UpdateEmpresaEmpleadoraDto extends PartialType(CreateEmpresaEmpleadoraDto) {}