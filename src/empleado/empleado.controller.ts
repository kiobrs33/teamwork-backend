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
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';

@ApiTags('Empleados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente.' })
  async create(@User() user: any, @Body() body: CreateEmpleadoDto) {
    const empleado = await this.empleadoService.create(user, body);
    return {
      message: 'Empleado creado exitosamente.',
      data: { empleado },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados' })
  @ApiResponse({ status: 200, description: 'Lista de empleados.' })
  async findAll() {
    const empleados = await this.empleadoService.findAll();
    return {
      message: 'Lista de empleados.',
      data: { empleados },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empleado por ID' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const empleado = await this.empleadoService.findOne(id);
    return {
      message: 'Empleado encontrado.',
      data: { empleado },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar empleado' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado correctamente.',
  })
  async update(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    const empleado = await this.empleadoService.update(user, id, dto);
    return {
      message: `Empleado con ID ${id} actualizado correctamente.`,
      data: { empleado },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empleado (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({
    status: 200,
    description: 'Empleado eliminado correctamente.',
  })
  async remove(@User() user: any, @Param('id', ParseIntPipe) id: number) {
    const empleado = await this.empleadoService.remove(user, id);
    return {
      message: `Empleado con ID ${id} eliminado correctamente.`,
      data: { empleado },
    };
  }
}
