import { PartialType } from '@nestjs/swagger';
import { CreateAreaEmpleadoraDto } from './create-area-empleadora.dto';

export class UpdateAreaEmpleadoraDto extends PartialType(
  CreateAreaEmpleadoraDto,
) {}
