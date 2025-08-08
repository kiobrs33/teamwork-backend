import { PartialType } from '@nestjs/swagger';
import { CreateEmpleoDto } from './create-empleo.dto';

export class UpdateEmpleoDto extends PartialType(CreateEmpleoDto) {}
