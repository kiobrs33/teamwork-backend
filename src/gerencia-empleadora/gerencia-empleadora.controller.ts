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
  UsePipes,
  ValidationPipe,
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
import { GerenciaEmpleadoraService } from './gerencia-empleadora.service';
import { CreateGerenciaEmpleadoraDto } from './dto/create-gerencia-empleadora.dto';
import { UpdateGerenciaEmpleadoraDto } from './dto/update-gerencia-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@ApiTags('Gerencia Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gerencia-empleadora')
export class GerenciaEmpleadoraController {
  constructor(
    private readonly gerenciaEmpleadoraService: GerenciaEmpleadoraService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva gerencia empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Gerencia empleadora creada exitosamente.',
  })
  async create(
    @User() user: AuthUser,
    @Body() dto: CreateGerenciaEmpleadoraDto,
  ) {
    const gerencia = await this.gerenciaEmpleadoraService.create(user, dto);
    return {
      message: 'Gerencia empleadora creada exitosamente.',
      data: { gerencia },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las gerencias empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de gerencias empleadoras.' })
  async findAll() {
    const gerencias = await this.gerenciaEmpleadoraService.findAll();
    return {
      message: 'Lista de gerencias empleadoras.',
      data: { gerencias },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener gerencia empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({ status: 200, description: 'Gerencia empleadora encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const gerencia = await this.gerenciaEmpleadoraService.findOne(id);
    return {
      message: 'Gerencia empleadora encontrada.',
      data: { gerencia },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar gerencia empleadora' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Gerencia empleadora actualizada correctamente.',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGerenciaEmpleadoraDto,
  ) {
    const gerencia = await this.gerenciaEmpleadoraService.update(user, id, dto);
    return {
      message: `Gerencia empleadora con ID ${id} actualizada correctamente.`,
      data: { gerencia },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar gerencia empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Gerencia empleadora eliminada correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const gerencia = await this.gerenciaEmpleadoraService.remove(user, id);
    return {
      message: `Gerencia empleadora con ID ${id} eliminada correctamente.`,
      data: { gerencia },
    };
  }

  @Post('import')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: [CreateGerenciaEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar Gerencia empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Importacion de gerencia empleadora creada exitosamente.',
  })
  async importExcelData(
    @User() user: AuthUser,
    @Body() data: CreateGerenciaEmpleadoraDto[],
  ) {
    const importGerenciaEmpleadora =
      await this.gerenciaEmpleadoraService.importData(user, data);
    return {
      message: 'Gerencia empleadora creadas exitosamente.',
      data: { importGerenciaEmpleadora },
    };
  }
}
