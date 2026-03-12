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

  // =========================
  // CREATE
  // =========================

  @Post()
  @ApiOperation({ summary: 'Crear retroalimentación detalle' })
  @ApiResponse({
    status: 201,
    description: 'Retroalimentación creada',
  })
  async create(
    @User() user: AuthUser,
    @Body() dto: CreateRetroalimentacionDetalleDto,
  ) {
    const data = await this.retroalimentacionDetalleService.create(user, dto);

    return {
      message: 'Retroalimentación creada correctamente',
      data,
    };
  }

  // =========================
  // CREATE MANY
  // =========================

  @Post('many')
  @ApiOperation({
    summary: 'Crear múltiples retroalimentaciones',
  })
  @ApiBody({
    type: CreateManyRetroalimentacionDto,
  })
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
      message: 'Retroalimentaciones creadas',
      data: result,
    };
  }

  // =========================
  // UPDATE MANY
  // =========================

  @Patch('many')
  @ApiOperation({
    summary: 'Actualizar lista completa de retroalimentaciones',
  })
  @ApiBody({
    type: UpdateManyRetroalimentacionDto,
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
      message: 'Lista actualizada',
      data: result,
    };
  }

  // =========================
  // FIND ALL
  // =========================

  @Get()
  @ApiOperation({
    summary: 'Listar retroalimentaciones',
  })
  async findAll() {
    const data = await this.retroalimentacionDetalleService.findAll();

    return {
      message: 'Lista obtenida',
      data,
    };
  }

  // =========================
  // FIND BY OBJETIVO
  // =========================

  @Get('objetivo/:id')
  @ApiOperation({
    summary: 'Listar por objetivo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID objetivo',
  })
  async findByObjetivo(@Param('id', ParseIntPipe) id: number) {
    const data =
      await this.retroalimentacionDetalleService.findByObjetivoId(id);

    return {
      message: 'Lista por objetivo',
      data,
    };
  }

  // =========================
  // FIND ONE
  // =========================

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener por id',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.retroalimentacionDetalleService.findOne(id);

    return {
      message: 'Registro encontrado',
      data,
    };
  }

  // =========================
  // UPDATE ONE
  // =========================

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar retroalimentación',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRetroalimentacionDetalleDto,
  ) {
    const data = await this.retroalimentacionDetalleService.update(
      user,
      id,
      dto,
    );

    return {
      message: 'Actualizado correctamente',
      data,
    };
  }

  // =========================
  // DELETE
  // =========================

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar retroalimentación',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const data = await this.retroalimentacionDetalleService.remove(user, id);

    return {
      message: 'Eliminado correctamente',
      data,
    };
  }
}
