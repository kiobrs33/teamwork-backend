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
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CompetenciaService } from './competencia.service';
import { UpdateCompetenciaDto } from './dto/update-competencia.dto';
import { CreateCompetenciaConDetallesDto } from './dto/create-competencia-con-detalles.dto';

@ApiTags('Competencia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('competencia')
export class CompetenciaController {
  constructor(private readonly competenciaService: CompetenciaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las competencias' })
  @ApiResponse({ status: 200, description: 'Lista de competencias.' })
  async findAll() {
    const competencias = await this.competenciaService.findAll();
    return {
      message: 'Lista de competencias.',
      data: { competencias },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener competencia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la competencia' })
  @ApiResponse({ status: 200, description: 'Competencia encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const competencia = await this.competenciaService.findOne(id);
    return {
      message: 'Competencia encontrada.',
      data: { competencia },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar competencia y sus detalles' })
  @ApiParam({ name: 'id', description: 'ID de la competencia a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Competencia actualizada correctamente con sus detalles.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
    @Body() dto: UpdateCompetenciaDto,
  ) {
    const competencia = await this.competenciaService.update(id, user, dto);
    return {
      message: `Competencia con ID ${id} actualizada correctamente.`,
      data: competencia,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar competencia (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la competencia' })
  @ApiResponse({
    status: 200,
    description: 'Competencia eliminada correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const competencia = await this.competenciaService.remove(user, id);
    return {
      message: `Competencia con ID ${id} eliminada correctamente.`,
      data: { competencia },
    };
  }

  @Post('con-detalles')
  @ApiOperation({ summary: 'Crear competencia con detalles asociados' })
  @ApiResponse({
    status: 201,
    description: 'Competencia y detalles creados exitosamente.',
  })
  async createConDetalles(
    @User() user: AuthUser,
    @Body() dto: CreateCompetenciaConDetallesDto,
  ) {
    const competencia = await this.competenciaService.createConDetalles(
      user,
      dto,
    );
    return {
      message: 'Competencia y detalles creados exitosamente.',
      data: { competencia },
    };
  }
}
