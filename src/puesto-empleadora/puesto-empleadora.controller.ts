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
import { PuestoEmpleadoraService } from './puesto-empleadora.service';
import { CreatePuestoEmpleadoraDto } from './dto/create-puesto-empleadora.dto';
import { UpdatePuestoEmpleadoraDto } from './dto/update-puesto-empleadora.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';

@ApiTags('Puesto Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('puesto-empleadora')
export class PuestoEmpleadoraController {
  constructor(
    private readonly puestoEmpleadoraService: PuestoEmpleadoraService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo puesto empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Puesto empleadora creado exitosamente.',
  })
  async create(@User() user: any, @Body() dto: CreatePuestoEmpleadoraDto) {
    const puesto = await this.puestoEmpleadoraService.create(user, dto);
    return {
      message: 'Puesto empleadora creado exitosamente.',
      data: { puesto },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los puestos empleadora' })
  @ApiResponse({ status: 200, description: 'Lista de puestos empleadora.' })
  async findAll() {
    const puestos = await this.puestoEmpleadoraService.findAll();
    return {
      message: 'Lista de puestos empleadora.',
      data: { puestos },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener puesto empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID del puesto empleadora' })
  @ApiResponse({ status: 200, description: 'Puesto empleadora encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const puesto = await this.puestoEmpleadoraService.findOne(id);
    return {
      message: 'Puesto empleadora encontrado.',
      data: { puesto },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar puesto empleadora' })
  @ApiParam({ name: 'id', description: 'ID del puesto empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Puesto empleadora actualizado correctamente.',
  })
  async update(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePuestoEmpleadoraDto,
  ) {
    const puesto = await this.puestoEmpleadoraService.update(user, id, dto);
    return {
      message: `Puesto empleadora con ID ${id} actualizado correctamente.`,
      data: { puesto },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar puesto empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del puesto empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Puesto empleadora eliminado correctamente.',
  })
  async remove(@User() user: any, @Param('id', ParseIntPipe) id: number) {
    const puesto = await this.puestoEmpleadoraService.remove(user, id);
    return {
      message: `Puesto empleadora con ID ${id} eliminado correctamente.`,
      data: { puesto },
    };
  }
}
