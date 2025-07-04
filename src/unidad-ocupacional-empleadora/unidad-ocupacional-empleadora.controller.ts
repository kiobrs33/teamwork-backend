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
import { UnidadOcupacionalEmpleadoraService } from './unidad-ocupacional-empleadora.service';
import { CreateUnidadOcupacionalEmpleadoraDto } from './dto/create-unidad-ocupacional-empleadora.dto';
import { UpdateUnidadOcupacionalEmpleadoraDto } from './dto/update-unidad-ocupacional-empleadora.dto';

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
import { AsignarCompetenciasLoteDto } from './dto/asignar-competencias-a-unidad-ocupacional-empleadora.dto';

@ApiTags('Unidad Ocupacional Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('unidad-ocupacional-empleadora')
export class UnidadOcupacionalEmpleadoraController {
  constructor(
    private readonly unidadOcupacionalEmpleadoraService: UnidadOcupacionalEmpleadoraService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva unidad ocupacional empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Unidad ocupacional empleadora creada exitosamente.',
  })
  async create(
    @User() user: AuthUser,
    @Body() dto: CreateUnidadOcupacionalEmpleadoraDto,
  ) {
    const unidad = await this.unidadOcupacionalEmpleadoraService.create(
      user,
      dto,
    );
    return {
      message: 'Unidad ocupacional empleadora creada exitosamente.',
      data: { unidad },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las unidades ocupacionales empleadoras',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de unidades ocupacionales empleadoras.',
  })
  async findAll() {
    const unidades = await this.unidadOcupacionalEmpleadoraService.findAll();
    return {
      message: 'Lista de unidades ocupacionales empleadoras.',
      data: { unidades },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener unidad ocupacional empleadora por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad ocupacional empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad ocupacional empleadora encontrada.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadOcupacionalEmpleadoraService.findOne(id);
    return {
      message: 'Unidad ocupacional empleadora encontrada.',
      data: { unidad },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar unidad ocupacional empleadora' })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad ocupacional empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad ocupacional empleadora actualizada correctamente.',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnidadOcupacionalEmpleadoraDto,
  ) {
    const unidad = await this.unidadOcupacionalEmpleadoraService.update(
      user,
      id,
      dto,
    );
    return {
      message: `Unidad ocupacional empleadora con ID ${id} actualizada correctamente.`,
      data: { unidad },
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar unidad ocupacional empleadora (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad ocupacional empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad ocupacional empleadora eliminada correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadOcupacionalEmpleadoraService.remove(
      user,
      id,
    );
    return {
      message: `Unidad ocupacional empleadora con ID ${id} eliminada correctamente.`,
      data: { unidad },
    };
  }

  @Post('asignar-competencias')
  @ApiOperation({
    summary: 'Asignar competencias a unidad ocupacional empleadora',
  })
  @ApiResponse({
    status: 201,
    description: 'Importacion de gerencia empleadora creada exitosamente.',
  })
  async asignarCompetenciasLote(
    @User() user: AuthUser,
    @Body() dto: AsignarCompetenciasLoteDto,
  ) {
    const asignacionCompetencia =
      await this.unidadOcupacionalEmpleadoraService.asignarCompetenciasLote(
        user,
        dto,
      );
    return {
      message: 'Gerencia empleadora creadas exitosamente.',
      data: { asignacionCompetencia },
    };
  }
}
