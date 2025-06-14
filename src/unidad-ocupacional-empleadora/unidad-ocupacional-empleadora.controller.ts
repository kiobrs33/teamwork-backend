import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnidadOcupacionalEmpleadoraService } from './unidad-ocupacional-empleadora.service';
import { CreateUnidadOcupacionalEmpleadoraDto } from './dto/create-unidad-ocupacional-empleadora.dto';
import { UpdateUnidadOcupacionalEmpleadoraDto } from './dto/update-unidad-ocupacional-empleadora.dto';

@Controller('unidad-ocupacional-empleadora')
export class UnidadOcupacionalEmpleadoraController {
  constructor(private readonly unidadOcupacionalEmpleadoraService: UnidadOcupacionalEmpleadoraService) {}

  @Post()
  create(@Body() createUnidadOcupacionalEmpleadoraDto: CreateUnidadOcupacionalEmpleadoraDto) {
    return this.unidadOcupacionalEmpleadoraService.create(createUnidadOcupacionalEmpleadoraDto);
  }

  @Get()
  findAll() {
    return this.unidadOcupacionalEmpleadoraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unidadOcupacionalEmpleadoraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnidadOcupacionalEmpleadoraDto: UpdateUnidadOcupacionalEmpleadoraDto) {
    return this.unidadOcupacionalEmpleadoraService.update(+id, updateUnidadOcupacionalEmpleadoraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unidadOcupacionalEmpleadoraService.remove(+id);
  }
}
