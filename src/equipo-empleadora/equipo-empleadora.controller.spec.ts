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
import { EquipoEmpleadoraService } from './equipo-empleadora.service';
import { CreateEquipoEmpleadoraDto } from './dto/create-equipo-empleadora.dto';
import { UpdateEquipoEmpleadoraDto } from './dto/update-equipo-empleadora.dto';

@Controller('equipos-empleadoras')
export class EquipoEmpleadoraController {
  constructor(private readonly service: EquipoEmpleadoraService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateEquipoEmpleadoraDto) {
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
    @Body() dto: UpdateEquipoEmpleadoraDto,
  ) {
    return this.service.update(req.user, +id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user, +id);
  }
}
