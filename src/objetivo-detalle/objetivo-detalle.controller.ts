// objetivo-detalle.controller.ts
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
import { ObjetivoDetalleService } from './objetivo-detalle.service';
import { CreateObjetivoDetalleDto } from './dto/create-objetivo-detalle.dto';
import { UpdateObjetivoDetalleDto } from './dto/update-objetivo-detalle.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@ApiTags('Objetivos Detalle')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('objetivo-detalle')
export class ObjetivoDetalleController {
  constructor(private readonly service: ObjetivoDetalleService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo detalle de objetivo' })
  @ApiResponse({
    status: 201,
    description: 'Detalle de objetivo creado exitosamente.',
  })
  async create(@User() user: AuthUser, @Body() dto: CreateObjetivoDetalleDto) {
    const detalle = await this.service.create(user, dto);
    return {
      message: 'Detalle de objetivo creado exitosamente.',
      data: { detalle },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los detalles de objetivos' })
  @ApiResponse({ status: 200, description: 'Lista de detalles de objetivos.' })
  async findAll() {
    const detalles = await this.service.findAll();
    return {
      message: 'Lista de detalles de objetivos.',
      data: { detalles },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de objetivo por ID' })
  @ApiParam({ name: 'id', description: 'ID del detalle de objetivo' })
  @ApiResponse({ status: 200, description: 'Detalle de objetivo encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const detalle = await this.service.findOne(id);
    return {
      message: 'Detalle de objetivo encontrado.',
      data: { detalle },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar detalle de objetivo' })
  @ApiParam({ name: 'id', description: 'ID del detalle de objetivo' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de objetivo actualizado correctamente.',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateObjetivoDetalleDto,
  ) {
    const detalle = await this.service.update(user, id, dto);
    return {
      message: `Detalle de objetivo con ID ${id} actualizado correctamente.`,
      data: { detalle },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar detalle de objetivo (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del detalle de objetivo' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de objetivo eliminado correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const detalle = await this.service.remove(user, id);
    return {
      message: `Detalle de objetivo con ID ${id} eliminado correctamente.`,
      data: { detalle },
    };
  }
}
