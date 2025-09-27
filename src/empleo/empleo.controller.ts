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
import { EmpleoService } from './empleo.service';
import { CreateEmpleoDto } from './dto/create-empleo.dto';
import { UpdateEmpleoDto } from './dto/update-empleo.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@ApiTags('Empleos')
@ApiBearerAuth()
@Controller('empleo')
export class EmpleoController {
  constructor(private readonly empleoService: EmpleoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear un nuevo empleo' })
  async create(@User() user: AuthUser, @Body() dto: CreateEmpleoDto) {
    const empleo = await this.empleoService.create(user, dto);
    return {
      message: 'Empleo creado correctamente',
      data: { empleo },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleos activos' })
  async findAll() {
    const empleos = await this.empleoService.findAll();
    return {
      message: 'Lista de empleos',
      data: { empleos },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleo por ID' })
  @ApiParam({ name: 'id', description: 'ID del empleo' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const empleo = await this.empleoService.findOne(id);
    return {
      message: 'Empleo encontrado',
      data: { empleo },
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar un empleo' })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleoDto,
  ) {
    const empleo = await this.empleoService.update(user, id, dto);
    return {
      message: 'Empleo actualizado correctamente',
      data: { empleo },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar un empleo (soft delete)' })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const empleo = await this.empleoService.remove(user, id);
    return {
      message: 'Empleo eliminado correctamente',
      data: { empleo },
    };
  }
}
