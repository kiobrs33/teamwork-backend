import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { AlcanceService } from 'src/autorizacion/alcance.service';
import {
  Alcance,
  ADMINISTRADORES,
  TODOS,
  empresaDelListado,
  verificarEmpresa,
} from 'src/autorizacion/alcance';
import { Rol } from 'src/empleado/types/empleadoTypes';
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.JEFE, ...ADMINISTRADORES)
@Controller('retroalimentacion-detalle')
export class RetroalimentacionDetalleController {
  constructor(
    private readonly retroalimentacionDetalleService: RetroalimentacionDetalleService,
    private readonly alcances: AlcanceService,
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
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreateRetroalimentacionDetalleDto,
  ) {
    await this.alcances.verificarObjetivo(alcance, dto.idObjetivo);
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
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreateManyRetroalimentacionDto,
  ) {
    await this.alcances.verificarObjetivo(alcance, dto.idObjetivo);
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
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: UpdateManyRetroalimentacionDto,
  ) {
    await this.alcances.verificarObjetivo(alcance, dto.idObjetivo);
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
  @Roles(Rol.ADMIN)
  async findAll(@AlcanceActual() alcance: Alcance) {
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
  async findByObjetivo(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarObjetivo(alcance, id);
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
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const idObjetivo = await this.alcances.objetivoDeRetroalimentacion(id);
    await this.alcances.verificarObjetivo(alcance, idObjetivo);
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
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRetroalimentacionDetalleDto,
  ) {
    const idObjetivo = await this.alcances.objetivoDeRetroalimentacion(id);
    await this.alcances.verificarObjetivo(alcance, idObjetivo);
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
  async remove(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const idObjetivo = await this.alcances.objetivoDeRetroalimentacion(id);
    await this.alcances.verificarObjetivo(alcance, idObjetivo);
    const data = await this.retroalimentacionDetalleService.remove(user, id);

    return {
      message: 'Eliminado correctamente',
      data,
    };
  }
}
