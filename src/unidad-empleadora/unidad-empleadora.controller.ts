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
import { UnidadEmpleadoraService } from './unidad-empleadora.service';
import { CreateUnidadEmpleadoraDto } from './dto/create-unidad-empleadora.dto';
import { UpdateUnidadEmpleadoraDto } from './dto/update-unidad-empleadora.dto';

@Controller('unidad-empleadora')
export class UnidadEmpleadoraController {
  constructor(private readonly service: UnidadEmpleadoraService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateUnidadEmpleadoraDto) {
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
    @Body() dto: UpdateUnidadEmpleadoraDto,
  ) {
    return this.service.update(req.user, +id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user, +id);
  }
}
