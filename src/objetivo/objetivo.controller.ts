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
import { CreateObjetivoConDetallesDto } from './dto/create-objetivo-detalle.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CreateObjetivosMasivosDto } from './dto/create-objetivo-masivo.dto';
import { EvaluarObjetivoDto } from './dto/evaluar-objetivo.dto';

@ApiTags('Objetivo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('objetivo')
export class ObjetivoController {
  constructor(private readonly objetivoService: ObjetivoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los objetivos' })
  @ApiResponse({ status: 200, description: 'Lista de objetivos.' })
  async findAll() {
    const objetivos = await this.objetivoService.findAll();
    return { message: 'Lista de objetivos', objetivos };
  }

  @Get('subordinados/:id')
  @ApiOperation({
    summary: 'Listar los objetivos de todos los subordinados de un jefe',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de objetivos de todos los subordinados',
  })
  async findAllByJefe(@Param('id', ParseIntPipe) id: number) {
    const objetivos = await this.objetivoService.findAllByJefe(id);
    return {
      message: `Objetivos de subordinados del jefe ${id}`,
      objetivos,
    };
  }

  @Patch(':id/evaluar')
  @ApiOperation({
    summary: 'Calificar (evaluar) un objetivo de un subordinado',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Objetivo evaluado correctamente',
  })
  async evaluarObjetivo(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
    @Body() dto: EvaluarObjetivoDto,
  ) {
    const objetivo = await this.objetivoService.evaluarObjetivo(id, user, dto);

    return {
      message: `Objetivo ${id} evaluado correctamente`,
      objetivo,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener objetivo por ID' })
  @ApiParam({ name: 'id', example: 1 })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const objetivo = await this.objetivoService.findOne(id);
    return { message: 'Objetivo encontrado', objetivo };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar objetivo y sus detalles' })
  @ApiParam({ name: 'id', example: 1 })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
    @Body() dto: UpdateObjetivoDto,
  ) {
    const objetivo = await this.objetivoService.update(id, user, dto);
    return { message: `Objetivo ${id} actualizado`, objetivo };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar objetivo (soft delete)' })
  @ApiParam({ name: 'id', example: 1 })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const objetivo = await this.objetivoService.remove(user, id);
    return { message: `Objetivo ${id} eliminado`, objetivo };
  }

  @Post('con-detalles')
  @ApiOperation({ summary: 'Crear objetivo con detalles' })
  async createConDetalles(
    @User() user: AuthUser,
    @Body() dto: CreateObjetivoConDetallesDto,
  ) {
    const objetivo = await this.objetivoService.createConDetalles(user, dto);
    return { message: 'Objetivo creado exitosamente', objetivo };
  }

  @Post('masivo')
  @ApiOperation({ summary: 'Crear objetivos masivamente' })
  async createMasivo(
    @User() user: AuthUser,
    @Body() dto: CreateObjetivosMasivosDto,
  ) {
    const objetivos = await this.objetivoService.createMasivo(user, dto);
    return { message: 'Objetivos creados masivamente', objetivos };
  }
}
