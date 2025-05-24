// empresa-empleadora.controller.ts
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
import { EmpresaEmpleadoraService } from './empresa-empleadora.service';
import { CreateEmpresaEmpleadoraDto } from './dto/create-empresa-empleadora.dto';
import { UpdateEmpresaEmpleadoraDto } from './dto/update-empresa-empleadora.dto';

@Controller('empresa-empleadora')
export class EmpresaEmpleadoraController {
  constructor(private readonly service: EmpresaEmpleadoraService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateEmpresaEmpleadoraDto) {
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
    @Body() dto: UpdateEmpresaEmpleadoraDto,
  ) {
    return this.service.update(req.user, +id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user, +id);
  }
}
