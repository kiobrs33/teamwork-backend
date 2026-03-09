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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

import { RetroalimentacionDetalleService } from './retroalimentacion-detalle.service';
import { CreateRetroalimentacionDetalleDto } from './dto/create-retroalimentacion-detalle.dto';
import { UpdateRetroalimentacionDetalleDto } from './dto/update-retroalimentacion-detalle.dto';
import { CreateManyRetroalimentacionDto } from './dto/create-many-retroalimentacion.dto';
import { UpdateManyRetroalimentacionDto } from './dto/update-many-retroalimentacion.dto';

@ApiTags('Retroalimentación Detalle')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('retroalimentacion-detalle')
export class RetroalimentacionDetalleController {
  constructor(
    private readonly retroalimentacionDetalleService: RetroalimentacionDetalleService,
  ) {}

  // Crear retroalimentación
  @Post()
  @ApiOperation({ summary: 'Crear una retroalimentación detalle' })
  @ApiResponse({
    status: 201,
    description: 'Retroalimentación creada exitosamente.',
  })
  async create(
    @User() user: AuthUser,
    @Body() dto: CreateRetroalimentacionDetalleDto,
  ) {
    const retroalimentacion = await this.retroalimentacionDetalleService.create(
      user,
      dto,
    );

    return {
      message: 'Retroalimentación creada exitosamente.',
      data: { retroalimentacion },
    };
  }

  // Crear múltiples retroalimentaciones
  @Post('many')
  @ApiOperation({
    summary: 'Crear múltiples retroalimentaciones para un objetivo',
  })
  @ApiBody({ type: CreateManyRetroalimentacionDto })
  async createMany(
    @User() user: AuthUser,
    @Body() dto: CreateManyRetroalimentacionDto,
  ) {
    const result = await this.retroalimentacionDetalleService.createMany(
      user,
      dto.idObjetivo,
      dto.detalles,
    );

    return {
      message: 'Retroalimentaciones creadas correctamente.',
      data: result,
    };
  }

  // Listar todas
  @Get()
  @ApiOperation({ summary: 'Listar todas las retroalimentaciones' })
  async findAll() {
    const retroalimentaciones =
      await this.retroalimentacionDetalleService.findAll();

    return {
      message: 'Lista de retroalimentaciones.',
      data: { retroalimentaciones },
    };
  }

  // Listar por objetivo
  @Get('objetivo/:id')
  @ApiOperation({ summary: 'Listar retroalimentaciones por objetivo' })
  @ApiParam({ name: 'id', description: 'ID del objetivo' })
  async findByObjetivo(@Param('id', ParseIntPipe) id: number) {
    const retroalimentaciones =
      await this.retroalimentacionDetalleService.findByObjetivoId(id);

    return {
      message: 'Retroalimentaciones del objetivo.',
      data: { retroalimentaciones },
    };
  }

  // Obtener una retroalimentación
  @Get(':id')
  @ApiOperation({ summary: 'Obtener retroalimentación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la retroalimentación detalle',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const retroalimentacion =
      await this.retroalimentacionDetalleService.findOne(id);

    return {
      message: 'Retroalimentación encontrada.',
      data: { retroalimentacion },
    };
  }

  // Actualizar una retroalimentación
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar retroalimentación detalle' })
  @ApiParam({
    name: 'id',
    description: 'ID de la retroalimentación detalle',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRetroalimentacionDetalleDto,
  ) {
    const retroalimentacion = await this.retroalimentacionDetalleService.update(
      user,
      id,
      dto,
    );

    return {
      message: `Retroalimentación con ID ${id} actualizada correctamente.`,
      data: { retroalimentacion },
    };
  }

  // Actualizar lista completa
  @Patch('many')
  @ApiOperation({
    summary: 'Actualizar lista de retroalimentaciones de un objetivo',
  })
  async updateMany(
    @User() user: AuthUser,
    @Body() dto: UpdateManyRetroalimentacionDto,
  ) {
    const result = await this.retroalimentacionDetalleService.updateMany(
      user,
      dto.idObjetivo,
      dto.detalles,
    );

    return {
      message: 'Retroalimentaciones actualizadas correctamente.',
      data: result,
    };
  }

  // Eliminar retroalimentación
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar retroalimentación (soft delete)' })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const retroalimentacion = await this.retroalimentacionDetalleService.remove(
      user,
      id,
    );

    return {
      message: `Retroalimentación con ID ${id} eliminada correctamente.`,
      data: { retroalimentacion },
    };
  }
}
