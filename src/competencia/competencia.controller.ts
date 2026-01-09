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
  Put,
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
import { CompetenciaService } from './competencia.service';
import { UpdateCompetenciaDto } from './dto/update-competencia.dto';
import { CreateCompetenciaNivelesItemsDto } from './dto/create-competencia-nivel-item.dto';
import { IniciarEvaluacionDto } from './dto/init-evaluation.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluation-item.dto';

@ApiTags('Competencia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('competencia')
export class CompetenciaController {
  constructor(private readonly competenciaService: CompetenciaService) {}

  // ======================================================
  //                GET ALL COMPETENCIAS
  // ======================================================
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

  @Get('company/:id')
  @ApiOperation({
    summary: 'Listar todas las competencias por Empres',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de competencias por Empresa.',
  })
  async findAllByCompany(@Param('id', ParseIntPipe) id: number) {
    const competencias = await this.competenciaService.findAllByCompany(id);
    return {
      message: 'Lista de competencias por Empresa.',
      data: { competencias },
    };
  }

  // ======================================================
  //     LISTAR COMPETENCIAS AGRUPADAS POR UNIDAD/PUESTO
  // ======================================================
  // @Get('con-puestos/:id')
  // @ApiOperation({
  //   summary: 'Listar unidades ocupacionales con sus competencias asignadas',
  // })
  // @ApiResponse({ status: 200, description: 'Unidades y competencias.' })
  // async findAllConCompetencias(@Param('id', ParseIntPipe) id: number) {
  //   const competencias =
  //     await this.competenciaService.findAllConCompetencias(id);
  //   return {
  //     message: 'Unidades y competencias.',
  //     data: { competencias },
  //   };
  // }

  // ======================================================
  //                GET COMPETENCIA BY ID
  // ======================================================
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

  // ======================================================
  //                     UPDATE
  // ======================================================
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar competencia con sus niveles e items',
  })
  @ApiParam({ name: 'id', description: 'ID de la competencia a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Competencia actualizada correctamente con sus niveles.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
    @Body() dto: UpdateCompetenciaDto,
  ) {
    const competencia = await this.competenciaService.update(id, user, dto);
    return {
      message: `Competencia con ID ${id} actualizada correctamente.`,
      data: { competencia },
    };
  }

  // ======================================================
  //                     DELETE
  // ======================================================
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

  // ======================================================
  //                CREATE CON NIVELES E ITEMS
  // ======================================================
  @Post('con-niveles')
  @ApiOperation({
    summary: 'Crear competencia con sus niveles e items',
  })
  @ApiResponse({
    status: 201,
    description: 'Competencia creada exitosamente.',
  })
  async createConNiveles(
    @User() user: AuthUser,
    @Body() dto: CreateCompetenciaNivelesItemsDto,
  ) {
    const competencia = await this.competenciaService.createConDetalles(
      user,
      dto,
    );

    return {
      message: 'Competencia creada exitosamente con sus niveles.',
      data: { competencia },
    };
  }

  // ======================================================
  //                IMPORTAR MASIVAMENTE
  // ======================================================
  @Post('import')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: [CreateCompetenciaNivelesItemsDto] })
  @ApiOperation({ summary: 'Importar competencias con niveles e items' })
  @ApiResponse({
    status: 201,
    description: 'Competencias importadas exitosamente.',
  })
  async importExcelData(
    @User() user: AuthUser,
    @Body() data: CreateCompetenciaNivelesItemsDto[],
  ) {
    const competencias = await this.competenciaService.importData(user, data);
    return {
      message: 'Competencias creadas exitosamente.',
      data: { competencias },
    };
  }

  // TODO: EVALUACIONES - REVISAR
  // ======================================================
  //   POST /competencia/evaluaciones/iniciar
  // ======================================================
  @Post('evaluaciones/iniciar')
  @ApiOperation({ summary: 'Iniciar evaluación (crea si no existe)' })
  @ApiBody({ type: IniciarEvaluacionDto })
  @ApiResponse({
    status: 201,
    description: 'Evaluación iniciada o evaluación existente en PROCESO.',
  })
  async iniciarEvaluacion(
    @User() user: AuthUser,
    @Body() dto: IniciarEvaluacionDto,
  ) {
    const evaluacion = await this.competenciaService.iniciarEvaluacion(
      user,
      dto,
    );

    return {
      message: 'Evaluación iniciada correctamente.',
      data: { evaluacion },
    };
  }

  // ======================================================
  //     GET /competencia/evaluaciones/:id
  // ======================================================
  @Get('evaluaciones/:id')
  @ApiOperation({ summary: 'Obtener evaluación completa por ID' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @ApiResponse({ status: 200, description: 'Evaluación encontrada.' })
  async obtenerEvaluacion(@Param('id', ParseIntPipe) id: number) {
    const evaluacion = await this.competenciaService.obtenerEvaluacion(id);

    return {
      message: 'Evaluación encontrada.',
      data: { evaluacion },
    };
  }

  // ======================================================
  //     PUT /competencia/evaluaciones/:id
  // ======================================================
  @Put('evaluaciones/:id')
  @ApiOperation({
    summary: 'Actualizar evaluación (solo si está en PROCESO)',
  })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @ApiBody({ type: UpdateEvaluacionDto })
  @ApiResponse({
    status: 200,
    description: 'Evaluación actualizada correctamente.',
  })
  async actualizarEvaluacion(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEvaluacionDto,
  ) {
    const evaluacion = await this.competenciaService.actualizarEvaluacion(
      user,
      id,
      dto,
    );

    return {
      message: 'Evaluación actualizada correctamente.',
      data: { evaluacion },
    };
  }

  // ======================================================
  //  PATCH /competencia/evaluaciones/:id/cerrar
  // ======================================================
  @Patch('evaluaciones/:id/cerrar')
  @ApiOperation({ summary: 'Cerrar evaluación (bloquea edición)' })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación cerrada correctamente.',
  })
  async cerrarEvaluacion(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const evaluacion = await this.competenciaService.cerrarEvaluacion(id, user);

    return {
      message: 'Evaluación cerrada correctamente.',
      data: { evaluacion },
    };
  }

  // ======================================================
  //  PATCH /competencia/evaluaciones/:id/anular
  // ======================================================
  @Patch('evaluaciones/:id/anular')
  @ApiOperation({
    summary: 'Anular evaluación (mantiene histórico, no borra)',
  })
  @ApiParam({ name: 'id', description: 'ID de la evaluación' })
  @ApiResponse({
    status: 200,
    description: 'Evaluación anulada correctamente.',
  })
  async anularEvaluacion(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const evaluacion = await this.competenciaService.anularEvaluacion(id, user);

    return {
      message: 'Evaluación anulada correctamente.',
      data: { evaluacion },
    };
  }

  // ======================================================
  //  GET /competencia/evaluaciones/empresa/:idEmpresaEmpleadora/empleados
  // ======================================================
  @Get('evaluaciones/empresa/:idEmpresaEmpleadora/empleados')
  @ApiOperation({
    summary: 'Obtener empleados evaluados por empresa',
  })
  @ApiParam({
    name: 'idEmpresaEmpleadora',
    description: 'ID de la empresa empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados evaluados y total.',
  })
  async empleadosEvaluadosPorEmpresa(
    @Param('idEmpresaEmpleadora', ParseIntPipe) idEmpresaEmpleadora: number,
  ) {
    const result =
      await this.competenciaService.empleadosEvaluadosPorEmpresa(
        idEmpresaEmpleadora,
      );

    return {
      message: 'Empleados evaluados por empresa.',
      data: result, // { total, empleados }
    };
  }
}
