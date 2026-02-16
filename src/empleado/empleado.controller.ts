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
  Query,
} from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { EmployeeQueryDto } from './dto/employee-query.dto';

@ApiTags('Empleados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  // CREAR EMPLEADO
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente.' })
  @ApiBody({ type: CreateEmpleadoDto })
  async create(@User() user: AuthUser, @Body() body: CreateEmpleadoDto) {
    const empleado = await this.empleadoService.create(user, body);
    return {
      message: 'Empleado creado exitosamente.',
      data: { empleado },
    };
  }

  // CREAR EMPLEADOS MASIVOS
  @Post('masivo')
  @ApiOperation({ summary: 'Crear varios empleados de forma masiva' })
  @ApiResponse({
    status: 201,
    description: 'Empleados creados exitosamente.',
  })
  @ApiBody({
    type: CreateEmpleadoDto,
    isArray: true,
    description: 'Lista de empleados a crear de forma masiva',
  })
  async createMany(@User() user: AuthUser, @Body() body: CreateEmpleadoDto[]) {
    // console.log('CONTROLLLER MASIVO', body);
    const resp = await this.empleadoService.createMany(user, body);
    return {
      message: 'Empleados creados exitosamente.',
      data: {
        empleados: resp.empleados,
        totalInsertados: resp.totalInsertados,
      },
    };
  }

  // LISTAR TODOS
  @Get()
  @ApiOperation({ summary: 'Listar empleados (paginado o todos)' })
  @ApiResponse({ status: 200, description: 'Lista de empleados.' })
  async findAll(@Query() query: EmployeeQueryDto) {
    const resp = await this.empleadoService.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 0,
      search: query.search,
    });

    return {
      message: 'Lista de empleados.',
      data: { empleados: resp.data, meta: resp.meta },
    };
  }

  // OBTENER EMPLEADOS POR ID DE EMPRESA EMPLEADORA
  @Get('empresa/:id')
  @ApiOperation({
    summary: 'Obtener empleados por empresa empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados obtenidos correctamente.',
  })
  async findByEmpresa(@Param('id', ParseIntPipe) id: number) {
    const empleados = await this.empleadoService.findByEmpresa(id);

    return {
      message: `Empleados de la empresa ${id} obtenidos correctamente.`,
      data: { empleados },
    };
  }

  // OBTENER POR ID USUARIO
  @Get('by-user/:id')
  @ApiOperation({ summary: 'Obtener empleado por ID de usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado.' })
  async findOneByUsuario(@Param('id', ParseIntPipe) id: number) {
    const empleado = await this.empleadoService.findOneByUsuario(id);
    return {
      message: 'Empleado encontrado.',
      data: { empleado },
    };
  }

  // COMPETENCIAS ASIGNADAS DE UN EMPLEADO (POR ID EMPLEADO)
  @Get('competencias/:id')
  @ApiOperation({
    summary:
      'Obtener las competencias asignadas a un empleado según su Unidad Ocupacional',
  })
  @ApiResponse({
    status: 200,
    description: 'Competencias asignadas obtenidas correctamente.',
  })
  async findCompetenciasByEmpleado(@Param('id', ParseIntPipe) id: number) {
    const empleado = await this.empleadoService.findCompetenciasByEmpleado(id);

    return {
      message: `Competencias asignadas obtenidas correctamente para el empleado ${id}.`,
      data: { empleado },
    };
  }

  // OBTENER POR ID EMPLEADO
  @Get(':id')
  @ApiOperation({ summary: 'Obtener empleado por ID' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const empleado = await this.empleadoService.findOne(id);
    return {
      message: 'Empleado encontrado.',
      data: { empleado },
    };
  }

  // ACTUALIZAR EMPLEADO
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar empleado' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado correctamente.',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    const empleado = await this.empleadoService.update(user, id, dto);
    return {
      message: `Empleado con ID ${id} actualizado correctamente.`,
      data: { empleado },
    };
  }

  // ELIMINAR EMPLEADO (SOFT DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empleado (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({
    status: 200,
    description: 'Empleado eliminado correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const empleado = await this.empleadoService.remove(user, id);
    return {
      message: `Empleado con ID ${id} eliminado correctamente.`,
      data: { empleado },
    };
  }

  // OBTENER SUBORDINADOS POR ID USUARIO
  @Get('subordinados/by-user/:id')
  @ApiOperation({
    summary: 'Obtener empleados subordinados del usuario logueado',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario logueado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de subordinados obtenida exitosamente.',
  })
  async findSubordinadosByUsuario(@Param('id', ParseIntPipe) id: number) {
    const subordinados =
      await this.empleadoService.findSubordinadosByUsuario(id);
    return {
      message: 'Subordinados obtenidos correctamente.',
      data: { subordinados },
    };
  }

  // SUBORDINADOS POR ID JEFE + COMPETENCIAS DE LA UNIDAD OCUPACIONAL
  @Get('subordinados/competencias/:id')
  @ApiOperation({
    summary:
      'Listar subordinados por ID de jefe y sus competencias asignadas según su Unidad Ocupacional',
  })
  @ApiResponse({
    status: 200,
    description:
      'Subordinados con sus competencias asignadas obtenidos correctamente.',
  })
  async findSubordinadosWithCompetenciasByJefe(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const subordinados =
      await this.empleadoService.findSubordinadosWithCompetenciasByJefe(id);

    return {
      message: `Subordinados y competencias obtenidos correctamente para el jefe ${id}.`,
      data: { subordinados },
    };
  }

  // OBTENER JEFE DEL EMPLEADO + COMPETENCIAS (POR ID USUARIO)
  @Get('jefe/competencias/by-user/:id')
  @ApiOperation({
    summary:
      'Obtener el jefe del empleado y sus competencias según su Unidad Ocupacional a partir del ID de usuario',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario del empleado',
  })
  @ApiResponse({
    status: 200,
    description: 'Jefe y competencias obtenidos correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'El empleado no tiene jefe asignado o no existe.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno al obtener el jefe con competencias.',
  })
  async findJefeWithCompetenciasByUsuario(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const jefeConCompetencias =
      await this.empleadoService.findJefeWithCompetenciasByUsuario(id);

    return {
      message: 'Jefe y competencias obtenidos correctamente.',
      data: { jefeConCompetencias },
    };
  }
}
