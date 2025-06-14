import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AreaEmpleadoraService } from './area-empleadora.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';

@Controller('area-empleadora')
export class AreaEmpleadoraController {
  constructor(private readonly areaEmpleadoraService: AreaEmpleadoraService) {}

  @Post()
  create(@Body() createAreaEmpleadoraDto: CreateAreaEmpleadoraDto) {
    return this.areaEmpleadoraService.create(createAreaEmpleadoraDto);
  }

  @Get()
  findAll() {
    return this.areaEmpleadoraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.areaEmpleadoraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAreaEmpleadoraDto: UpdateAreaEmpleadoraDto) {
    return this.areaEmpleadoraService.update(+id, updateAreaEmpleadoraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.areaEmpleadoraService.remove(+id);
  }
}
