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
import { CreateAreaEmpleadoraDto } from '../area-empleadora/dto/create-area-empleadora.dto';
import { AsignarCompetenciasDto } from './dto/create-unidad-competencia.dto';
import { UnidadOcupacionalQueryDto } from './dto/unidad-ocupacional-query.dto';

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
  async findAll(@Query() query: UnidadOcupacionalQueryDto) {
    const resp = await this.unidadOcupacionalEmpleadoraService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 0,
      search: query.search,
    });
    return {
      message: 'Lista de unidades ocupacionales empleadoras.',
      data: { unidades: resp.data, meta: resp.meta },
    };
  }

  @Get('empresa/:id')
  @ApiOperation({
    summary: 'Listar todas las unidades ocupacionales empleadoras por Empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de unidades ocupacionales empleadoras por Empresa.',
  })
  async findAllByCompany(@Param('id', ParseIntPipe) id: number) {
    const unidades =
      await this.unidadOcupacionalEmpleadoraService.findAllByCompany(id);
    return {
      message: 'Lista de unidades ocupacionales empleadoras por Empresa.',
      data: { unidades },
    };
  }

  @Get('empresa/:id/unidades-competencias')
  @ApiOperation({
    summary:
      'Obtener todas las unidades ocupacionales con todas las competencias y niveles de una empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa empleadora',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description:
      'Mapa completo de unidades ocupacionales con competencias y niveles.',
  })
  async obtenerMapaUnidadesPorEmpresa(@Param('id', ParseIntPipe) id: number) {
    const unidades =
      await this.unidadOcupacionalEmpleadoraService.obtenerUnidadesConCompetenciasPorEmpresa(
        id,
      );

    return {
      message: 'Mapa generado correctamente.',
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

  // @Post('asignar-competencias')
  // @ApiOperation({
  //   summary: 'Asignar competencias a unidad ocupacional empleadora',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Importacion de gerencia empleadora creada exitosamente.',
  // })
  // async asignarCompetenciasLote(
  //   @User() user: AuthUser,
  //   @Body() dto: AsignarCompetenciasLoteDto,
  // ) {
  //   const asignacionCompetencia =
  //     await this.unidadOcupacionalEmpleadoraService.asignarCompetenciasLote(
  //       user,
  //       dto,
  //     );
  //   return {
  //     message: 'Gerencia empleadora creadas exitosamente.',
  //     data: { asignacionCompetencia },
  //   };
  // }

  @Post('import')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: [CreateUnidadOcupacionalEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar unidad ocupacional empleadora' })
  @ApiResponse({
    status: 201,
    description:
      'Importacion de unidad ocupacional empleadora creada exitosamente.',
  })
  async importExcelData(
    @User() user: AuthUser,
    @Body() data: CreateUnidadOcupacionalEmpleadoraDto[],
  ) {
    const { count } = await this.unidadOcupacionalEmpleadoraService.importData(
      user,
      data,
    );
    return {
      message: 'Unidades Ocupacionales empleadora creadas exitosamente.',
      data: { count },
    };
  }

  @Post('asignar')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: AsignarCompetenciasDto })
  @ApiOperation({
    summary:
      'Asignar competencias a unidades ocupacionales y devolver mapa actualizado',
  })
  @ApiResponse({
    status: 201,
    description:
      'Competencias asignadas correctamente y se devuelve el mapa actualizado por unidad.',
  })
  async asignarCompetencias(
    @User() user: AuthUser,
    @Body() dto: AsignarCompetenciasDto,
  ) {
    const resultado =
      await this.unidadOcupacionalEmpleadoraService.asignarCompetenciasRetornarMapa(
        user,
        dto.unidades, // ← importante: la data interna está en "unidades"
      );

    return {
      message: 'Competencias asignadas correctamente.',
      data: resultado,
    };
  }
}
