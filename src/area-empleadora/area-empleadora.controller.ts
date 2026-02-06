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
  Query,
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
import { AreaEmpleadoraService } from './area-empleadora.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { AreaQueryDto } from './dto/area-query.dto';

@ApiTags('Área Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('area-empleadora')
export class AreaEmpleadoraController {
  constructor(private readonly areaEmpleadoraService: AreaEmpleadoraService) {}

  // Crear área empleadora
  @Post()
  @ApiOperation({ summary: 'Crear una nueva área empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Área empleadora creada exitosamente.',
  })
  async create(@User() user: AuthUser, @Body() dto: CreateAreaEmpleadoraDto) {
    const area = await this.areaEmpleadoraService.create(user, dto);
    return {
      message: 'Área empleadora creada exitosamente.',
      data: { area },
    };
  }

  // Listar todas las áreas empleadoras
  @Get()
  @ApiOperation({ summary: 'Listar todas las áreas empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de áreas empleadoras.' })
  async findAll(@Query() query: AreaQueryDto) {
    const resp = await this.areaEmpleadoraService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 0,
      search: query.search,
    });
    return {
      message: 'Lista de áreas empleadoras.',
      data: { areas: resp.data, meta: resp.meta },
    };
  }

  // Listar áreas empleadoras por empresa
  @Get('empresa/:id')
  @ApiOperation({ summary: 'Listar areas empleadoras de una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de areas de la empresa especificada.',
  })
  async findByEmpresa(@Param('id') id: string) {
    const areas = await this.areaEmpleadoraService.findByEmpresaId(Number(id));

    return {
      message: 'Lista de areas empleadoras de la empresa.',
      data: { areas },
    };
  }

  // Obtener área empleadora por ID
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

  // Actualizar área empleadora
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar área empleadora' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Área empleadora actualizada correctamente.',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreaEmpleadoraDto,
  ) {
    const area = await this.areaEmpleadoraService.update(user, id, dto);
    return {
      message: `Área empleadora con ID ${id} actualizada correctamente.`,
      data: { area },
    };
  }

  // Eliminar área empleadora (soft delete)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar área empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Área empleadora eliminada correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const area = await this.areaEmpleadoraService.remove(user, id);
    return {
      message: `Área empleadora con ID ${id} eliminada correctamente.`,
      data: { area },
    };
  }

  // Importar áreas empleadoras desde Excel
  @Post('import')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: [CreateAreaEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar Area empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Importacion de area empleadora creada exitosamente.',
  })
  async importExcelData(
    @User() user: AuthUser,
    @Body() data: CreateAreaEmpleadoraDto[],
  ) {
    const { count } = await this.areaEmpleadoraService.importData(user, data);
    return {
      message: 'Areas empleadora creadas exitosamente.',
      data: { count },
    };
  }
}
