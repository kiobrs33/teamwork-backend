import { PartialType } from '@nestjs/swagger';
import { CreateObjetivoDetalleDto } from './create-objetivo-detalle.dto';

export class UpdateObjetivoDetalleDto extends PartialType(
  CreateObjetivoDetalleDto,
) {}
