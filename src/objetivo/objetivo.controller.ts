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
import { ObjetivoService } from './objetivo.service';
import { CreateObjetivoDto } from './dto/create-objetivo.dto';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { CreateObjetivoConDetallesDto } from './dto/create-objetivo-con-detalles.dto';
import { AddDetallesAObjetivoDto } from './dto/add-detalles-a-objetivo.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@ApiTags('Objetivo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('objetivo')
export class ObjetivoController {
  constructor(private readonly objetivoService: ObjetivoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo objetivo' })
  @ApiResponse({ status: 201, description: 'Objetivo creado exitosamente.' })
  async create(@User() user: AuthUser, @Body() dto: CreateObjetivoDto) {
    const objetivo = await this.objetivoService.create(user, dto);
    return {
      message: 'Objetivo creado exitosamente.',
      data: { objetivo },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los objetivos' })
  @ApiResponse({ status: 200, description: 'Lista de objetivos.' })
  async findAll() {
    const objetivos = await this.objetivoService.findAll();
    return {
      message: 'Lista de objetivos.',
      data: { objetivos },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener objetivo por ID' })
  @ApiParam({ name: 'id', description: 'ID del objetivo' })
  @ApiResponse({ status: 200, description: 'Objetivo encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const objetivo = await this.objetivoService.findOne(id);
    return {
      message: 'Objetivo encontrado.',
      data: { objetivo },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar objetivo' })
  @ApiParam({ name: 'id', description: 'ID del objetivo' })
  @ApiResponse({
    status: 200,
    description: 'Objetivo actualizado correctamente.',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateObjetivoDto,
  ) {
    const objetivo = await this.objetivoService.update(id, user, dto);
    return {
      message: `Objetivo con ID ${id} actualizado correctamente.`,
      data: { objetivo },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar objetivo (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del objetivo' })
  @ApiResponse({
    status: 200,
    description: 'Objetivo eliminado correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const objetivo = await this.objetivoService.remove(user, id);
    return {
      message: `Objetivo con ID ${id} eliminado correctamente.`,
      data: { objetivo },
    };
  }

  @Post('con-detalles')
  @ApiOperation({ summary: 'Crear objetivo con detalles asociados' })
  @ApiResponse({
    status: 201,
    description: 'Objetivo y detalles creados exitosamente.',
  })
  async createConDetalles(
    @User() user: AuthUser,
    @Body() dto: CreateObjetivoConDetallesDto,
  ) {
    const empleado = await this.objetivoService.createConDetalles(user, dto);
    return {
      message: 'Objetivo y detalles creados exitosamente.',
      data: { empleado },
    };
  }

  @Post(':idObjetivo/agregar-detalles')
  @ApiOperation({ summary: 'Agregar 1 o 2 detalles a un objetivo existente' })
  @ApiResponse({
    status: 201,
    description: 'Detalles agregados correctamente.',
  })
  async agregarDetalles(
    @User() user: AuthUser,
    @Param('idObjetivo', ParseIntPipe) idObjetivo: number,
    @Body() dto: AddDetallesAObjetivoDto,
  ) {
    const result = await this.objetivoService.agregarDetalles(
      user,
      idObjetivo,
      dto.detalles,
    );
    return {
      message: 'Detalles agregados correctamente.',
      data: result,
    };
  }
}
