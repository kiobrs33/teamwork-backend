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
import { EquipoEmpleadoraService } from './equipo-empleadora.service';
import { CreateEquipoEmpleadoraDto } from './dto/create-equipo-empleadora.dto';
import { UpdateEquipoEmpleadoraDto } from './dto/update-equipo-empleadora.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';

@ApiTags('Equipo Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('equipo-empleadora')
export class EquipoEmpleadoraController {
  constructor(
    private readonly equipoEmpleadoraService: EquipoEmpleadoraService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo equipo empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Equipo empleadora creado exitosamente.',
  })
  async create(@User() user: any, @Body() dto: CreateEquipoEmpleadoraDto) {
    const equipo = await this.equipoEmpleadoraService.create(user, dto);
    return {
      message: 'Equipo empleadora creado exitosamente.',
      data: { equipo },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los equipos empleadora' })
  @ApiResponse({ status: 200, description: 'Lista de equipos empleadora.' })
  async findAll() {
    const equipos = await this.equipoEmpleadoraService.findAll();
    return {
      message: 'Lista de equipos empleadora.',
      data: { equipos },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener equipo empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID del equipo empleadora' })
  @ApiResponse({ status: 200, description: 'Equipo empleadora encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const equipo = await this.equipoEmpleadoraService.findOne(id);
    return {
      message: 'Equipo empleadora encontrado.',
      data: { equipo },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar equipo empleadora' })
  @ApiParam({ name: 'id', description: 'ID del equipo empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Equipo empleadora actualizado correctamente.',
  })
  async update(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipoEmpleadoraDto,
  ) {
    const equipo = await this.equipoEmpleadoraService.update(user, id, dto);
    return {
      message: `Equipo empleadora con ID ${id} actualizado correctamente.`,
      data: { equipo },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar equipo empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del equipo empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Equipo empleadora eliminado correctamente.',
  })
  async remove(@User() user: any, @Param('id', ParseIntPipe) id: number) {
    const equipo = await this.equipoEmpleadoraService.remove(user, id);
    return {
      message: `Equipo empleadora con ID ${id} eliminado correctamente.`,
      data: { equipo },
    };
  }
}
