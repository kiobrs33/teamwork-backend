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
import { UnidadEmpleadoraService } from './unidad-empleadora.service';
import { CreateUnidadEmpleadoraDto } from './dto/create-unidad-empleadora.dto';
import { UpdateUnidadEmpleadoraDto } from './dto/update-unidad-empleadora.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';

@ApiTags('Unidad Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('unidad-empleadora')
export class UnidadEmpleadoraController {
  constructor(
    private readonly unidadEmpleadoraService: UnidadEmpleadoraService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva unidad empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Unidad empleadora creada exitosamente.',
  })
  async create(@User() user: any, @Body() dto: CreateUnidadEmpleadoraDto) {
    console.log('🐛 user in decorator:', user);
    const unidad = await this.unidadEmpleadoraService.create(user, dto);
    return {
      message: 'Unidad empleadora creada exitosamente.',
      data: { unidad },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las unidades empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de unidades empleadoras.' })
  async findAll() {
    const unidades = await this.unidadEmpleadoraService.findAll();
    return {
      message: 'Lista de unidades empleadoras.',
      data: { unidades },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener unidad empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID de la unidad empleadora' })
  @ApiResponse({ status: 200, description: 'Unidad empleadora encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadEmpleadoraService.findOne(id);
    return {
      message: 'Unidad empleadora encontrada.',
      data: { unidad },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar unidad empleadora' })
  @ApiParam({ name: 'id', description: 'ID de la unidad empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Unidad empleadora actualizada correctamente.',
  })
  async update(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnidadEmpleadoraDto,
  ) {
    const unidad = await this.unidadEmpleadoraService.update(user, id, dto);
    return {
      message: `Unidad empleadora con ID ${id} actualizada correctamente.`,
      data: { unidad },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar unidad empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la unidad empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Unidad empleadora eliminada correctamente.',
  })
  async remove(@User() user: any, @Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadEmpleadoraService.remove(user, id);
    return {
      message: `Unidad empleadora con ID ${id} eliminada correctamente.`,
      data: { unidad },
    };
  }
}
