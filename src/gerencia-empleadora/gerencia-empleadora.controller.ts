// unidad-empleadora.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { GerenciaEmpleadoraService } from './gerencia-empleadora.service';
import { CreateGerenciaEmpleadoraDto } from './dto/create-gerencia-empleadora.dto';
import { UpdateGerenciaEmpleadoraDto } from './dto/update-gerencia-empleadora.dto';

@ApiTags('Gerencia Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gerencia-empleadora')
export class GerenciaEmpleadoraController {
  constructor(
    private readonly unidadEmpleadoraService: GerenciaEmpleadoraService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva gerencia empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Gerencia empleadora creada exitosamente.',
  })
  async create(@User() user: any, @Body() dto: CreateGerenciaEmpleadoraDto) {
    console.log('🐛 user in decorator:', user);
    const unidad = await this.unidadEmpleadoraService.create(user, dto);
    return {
      message: 'Gerencia empleadora creada exitosamente.',
      data: { unidad },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las gerencias empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de gerencias empleadoras.' })
  async findAll() {
    const unidades = await this.unidadEmpleadoraService.findAll();
    return {
      message: 'Lista de gerencias empleadoras.',
      data: { unidades },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener gerencia empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({ status: 200, description: 'Gerencia empleadora encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadEmpleadoraService.findOne(id);
    return {
      message: 'Gerencia empleadora encontrada.',
      data: { unidad },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar gerencia empleadora' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Gerencia empleadora actualizada correctamente.',
  })
  async update(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGerenciaEmpleadoraDto,
  ) {
    const unidad = await this.unidadEmpleadoraService.update(user, id, dto);
    return {
      message: `Gerencia empleadora con ID ${id} actualizada correctamente.`,
      data: { unidad },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar gerencia empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Gerencia empleadora eliminada correctamente.',
  })
  async remove(@User() user: any, @Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadEmpleadoraService.remove(user, id);
    return {
      message: `Gerencia empleadora con ID ${id} eliminada correctamente.`,
      data: { unidad },
    };
  }
}
