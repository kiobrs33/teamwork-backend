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
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AreaEmpleadoraService } from './area-empleadora.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';

@ApiTags('Área Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('area-empleadora')
export class AreaEmpleadoraController {
  constructor(private readonly areaEmpleadoraService: AreaEmpleadoraService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva área empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Área empleadora creada exitosamente.',
  })
  async create(@User() user: any, @Body() dto: CreateAreaEmpleadoraDto) {
    const area = await this.areaEmpleadoraService.create(user, dto);
    return {
      message: 'Área empleadora creada exitosamente.',
      data: { area },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las áreas empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de áreas empleadoras.' })
  async findAll() {
    const areas = await this.areaEmpleadoraService.findAll();
    return {
      message: 'Lista de áreas empleadoras.',
      data: { areas },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener área empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({ status: 200, description: 'Área empleadora encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const area = await this.areaEmpleadoraService.findOne(id);
    return {
      message: 'Área empleadora encontrada.',
      data: { area },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar área empleadora' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Área empleadora actualizada correctamente.',
  })
  async update(
    @User() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreaEmpleadoraDto,
  ) {
    const area = await this.areaEmpleadoraService.update(user, id, dto);
    return {
      message: `Área empleadora con ID ${id} actualizada correctamente.`,
      data: { area },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar área empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Área empleadora eliminada correctamente.',
  })
  async remove(@User() user: any, @Param('id', ParseIntPipe) id: number) {
    const area = await this.areaEmpleadoraService.remove(user, id);
    return {
      message: `Área empleadora con ID ${id} eliminada correctamente.`,
      data: { area },
    };
  }
}
