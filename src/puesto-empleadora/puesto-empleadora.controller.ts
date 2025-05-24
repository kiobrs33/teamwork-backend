import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PuestoEmpleadoraService } from './puesto-empleadora.service';
import { CreatePuestoEmpleadoraDto } from './dto/create-puesto-empleadora.dto';
import { UpdatePuestoEmpleadoraDto } from './dto/update-puesto-empleadora.dto';

@Controller('puesto-empleadora')
export class PuestoEmpleadoraController {
  constructor(private readonly service: PuestoEmpleadoraService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreatePuestoEmpleadoraDto) {
    return this.service.create(req.user, dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePuestoEmpleadoraDto,
  ) {
    return this.service.update(req.user, +id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user, +id);
  }
}
