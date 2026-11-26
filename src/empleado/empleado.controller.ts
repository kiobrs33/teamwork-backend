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
  Query,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EliminarEmpleadosDto } from './dto/eliminar-empleados.dto';
import { CambiarSituacionDto } from './dto/cambiar-situacion.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { AvanceQueryDto } from './dto/avance-query.dto';

import { Response } from 'express';
import { Res } from '@nestjs/common';

/**
 * Valida cada fila de la importación con las reglas del alta individual.
 *
 * Con el tipo `CreateEmpleadoDto[]` el ValidationPipe global no valida los
 * elementos del arreglo (solo ve un Array), así que las filas entraban sin
 * pasar por ninguna regla. Se hace a mano para juntar **todos** los problemas
 * y anteponer el índice de la fila ("[3] …"): el front lo traduce a la fila
 * del Excel.
 */
const validarFilas = async (crudo: unknown): Promise<CreateEmpleadoDto[]> => {
  if (!Array.isArray(crudo) || crudo.length === 0) {
    throw new BadRequestException('El archivo no trae filas para importar.');
  }
  const filas = crudo.map((f) => plainToInstance(CreateEmpleadoDto, f));
  const errores = await Promise.all(
    filas.map((f) => validate(f, { whitelist: true })),
  );
  const problemas = errores.flatMap((errs, i) =>
    errs.flatMap((e) =>
      Object.values(e.constraints ?? {}).map((m) => `[${i}] ${m}`),
    ),
  );
  if (problemas.length) {
    throw new BadRequestException({
      message: `No se importó nada: hay ${problemas.length} problema(s) en el archivo.`,
      errors: problemas,
    });
  }
  return filas;
};

@ApiTags('Empleados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('empleado')
export class EmpleadoController {
  constructor(
    private readonly empleadoService: EmpleadoService,
    private readonly alcances: AlcanceService,
  ) {}

  // CREAR EMPLEADO
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente.' })
  @ApiBody({ type: CreateEmpleadoDto })
  async create(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() body: CreateEmpleadoDto,
  ) {
    await this.alcances.verificar(alcance, 'empresa', body.idEmpresaEmpleadora);
    this.alcances.verificarRolAsignable(alcance, body.rol);
    const { empleado, acceso } = await this.empleadoService.create(user, body);
    return {
      message: 'Empleado creado exitosamente.',
      // `acceso` (usuario y contraseña inicial) se entrega solo ahora.
      data: { empleado, acceso },
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
  async createMany(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() crudo: unknown[],
  ) {
    const body = await validarFilas(crudo);
    for (const fila of body) {
      verificarEmpresa(alcance, Number(fila.idEmpresaEmpleadora), 'Empresa');
      this.alcances.verificarRolAsignable(alcance, fila.rol);
    }
    // console.log('CONTROLLLER MASIVO', body);
    const resp = await this.empleadoService.createMany(user, body);
    return {
      message: 'Empleados creados exitosamente.',
      data: {
        empleados: resp.empleados,
        totalInsertados: resp.totalInsertados,
        accesos: resp.accesos,
      },
    };
  }

  // LISTAR TODOS
  @Get()
  @ApiOperation({ summary: 'Listar empleados (paginado o todos)' })
  @ApiResponse({ status: 200, description: 'Lista de empleados.' })
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query() query: EmployeeQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    // const resp = await this.empleadoService.findAll({
    //   page: query.page ?? 1,
    //   limit: query.limit ?? 0,
    //   search: query.search,
    // });

    const resp = await this.empleadoService.findAll(query);
    return {
      message: 'Lista de empleados.',
      data: { empleados: resp.data, meta: resp.meta },
    };
  }

  // Panel del jefe: solo su equipo directo, por su propia cuenta.
  @Get('avance/mi-equipo')
  @Roles(Rol.JEFE)
  @ApiOperation({
    summary:
      'Panel del jefe: avance de la evaluación de su equipo directo y su autoevaluación',
  })
  async avanceDeMiEquipo(@User() user: AuthUser) {
    return {
      message: 'Avance de su equipo.',
      data: await this.empleadoService.avanceDeMiEquipo(user.idUsuario),
    };
  }

  // Resumen del trabajador (también el jefe, para lo suyo): su propia
  // evaluación en la campaña en curso, sin notas.
  @Get('avance/mio')
  @Roles(Rol.JEFE, Rol.EMPLEADO)
  @ApiOperation({
    summary:
      'Resumen del trabajador: lo que le falta hacer en su evaluación (sin notas)',
  })
  async avanceMio(@User() user: AuthUser) {
    return {
      message: 'Su evaluación.',
      data: await this.empleadoService.avanceMio(user.idUsuario),
    };
  }

  // OBTENER EMPLEADOS POR ID DE EMPRESA EMPLEADORA
  // Antes de ':id': si no, 'avance' entra como id y el ParseIntPipe da 400.
  @Get('avance')
  @ApiOperation({
    summary:
      'Avance consolidado de la evaluación: indicadores, desglose por jefe/área/gerencia y estado por trabajador',
  })
  async avance(
    @AlcanceActual() alcance: Alcance,
    @Query() query: AvanceQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    return {
      message: 'Avance de la evaluación.',
      data: await this.empleadoService.avance(query),
    };
  }

  @Get('empresa/:id')
  @ApiOperation({
    summary: 'Obtener empleados por empresa empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados obtenidos correctamente.',
  })
  async findByEmpresa(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'empresa', id);
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
  @Roles(...TODOS)
  async findOneByUsuario(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarUsuario(alcance, id);
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
  @Roles(...TODOS)
  async findCompetenciasByEmpleado(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarTrabajador(alcance, id);
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
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'empleado', id);
    const empleado = await this.empleadoService.findOne(id);
    return {
      message: 'Empleado encontrado.',
      data: { empleado },
    };
  }

  /**
   * Suspender, cesar o reactivar a uno o varios trabajadores (todo o nada).
   * Va antes de las rutas con `:id`.
   */
  @Patch('situacion')
  @ApiOperation({ summary: 'Cambiar la situación laboral de trabajadores' })
  @ApiBody({ type: CambiarSituacionDto })
  async cambiarSituacion(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() body: CambiarSituacionDto,
  ) {
    await this.alcances.verificarVarios(alcance, 'empleado', body.ids);
    const resp = await this.empleadoService.cambiarSituacion(user, body);
    const n = resp?.ids.length ?? 0;
    const verbo =
      body.situacion === 'ACTIVO'
        ? 'reactivado'
        : body.situacion === 'SUSPENDIDO'
          ? 'suspendido'
          : 'cesado';
    return {
      message:
        n === 1 ? `Trabajador ${verbo}.` : `${n} trabajadores ${verbo}s.`,
      data: resp,
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
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    await this.alcances.verificar(alcance, 'empleado', id);
    if (dto.idEmpresaEmpleadora !== undefined)
      verificarEmpresa(alcance, Number(dto.idEmpresaEmpleadora), 'Empresa');
    this.alcances.verificarRolAsignable(alcance, dto.rol);
    const empleado = await this.empleadoService.update(user, id, dto);
    return {
      message: `Empleado con ID ${id} actualizado correctamente.`,
      data: { empleado },
    };
  }

  // ESTADO DETALLADO DE LA EVALUACIÓN
  @Get(':id/impacto-grupo')
  @Roles(...ADMINISTRADORES)
  @ApiOperation({
    summary: 'Qué cambia en la campaña en curso si pasa a otro grupo',
    description:
      'Competencias que deja de tener (y si ya tienen notas), nuevas y con otro nivel. No escribe.',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiQuery({ name: 'idUnidad', description: 'Grupo ocupacional nuevo' })
  async impactoGrupo(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
    @Query('idUnidad', ParseIntPipe) idUnidad: number,
  ) {
    await this.alcances.verificar(alcance, 'empleado', id);
    const data = await this.empleadoService.impactoCambioGrupo(id, idUnidad);
    return { message: 'Impacto del cambio de grupo.', data };
  }

  @Get(':id/estado-evaluacion')
  @ApiOperation({
    summary: 'Detalle del avance de evaluación de un trabajador',
    description:
      'Competencias asignadas con sus ítems pendientes, competencias anuladas y estado de los objetivos.',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado' })
  @ApiResponse({ status: 200, description: 'Estado de evaluación.' })
  async estadoEvaluacion(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'empleado', id);
    const estado = await this.empleadoService.estadoEvaluacion(id);
    return { message: 'Estado de evaluación.', data: estado };
  }

  // ELIMINAR VARIOS EMPLEADOS (SOFT DELETE)
  //
  // Va ANTES de `@Delete(':id')` a propósito: declarado después, 'masivo'
  // entraría por la ruta con parámetro y el ParseIntPipe respondería un 400.
  @Delete('masivo')
  @ApiOperation({ summary: 'Eliminar varios empleados (soft delete)' })
  @ApiBody({ type: EliminarEmpleadosDto })
  @ApiResponse({
    status: 200,
    description: 'Empleados eliminados correctamente.',
  })
  async removeMany(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() body: EliminarEmpleadosDto,
  ) {
    await this.alcances.verificarVarios(alcance, 'empleado', body.ids);
    const resp = await this.empleadoService.removeMany(user, body.ids);
    const cuantos = resp?.eliminados.length ?? 0;

    return {
      message:
        cuantos === 1
          ? 'Trabajador eliminado correctamente.'
          : `${cuantos} trabajadores eliminados correctamente.`,
      data: resp,
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
  async remove(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'empleado', id);
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
  @Roles(...TODOS)
  async findSubordinadosByUsuario(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarUsuario(alcance, id);
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
  @Roles(...TODOS)
  async findSubordinadosWithCompetenciasByJefe(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarTrabajador(alcance, id);
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
  @Roles(...TODOS)
  async findJefeWithCompetenciasByUsuario(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarUsuario(alcance, id);
    const jefeConCompetencias =
      await this.empleadoService.findJefeWithCompetenciasByUsuario(id);

    return {
      message: 'Jefe y competencias obtenidos correctamente.',
      data: { jefeConCompetencias },
    };
  }

  // Dos tramos a propósito: un solo tramo lo atraparía `@Get(':id')`.
  @Get('importacion/plantilla')
  @ApiOperation({
    summary: 'Plantilla de importación de trabajadores de una empresa',
  })
  async plantillaImportacion(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @Res() res: Response,
  ) {
    const id = Number(empresaDelListado(alcance, idEmpresa));
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Indique la empresa.');
    const buffer = await this.empleadoService.plantillaImportacion(id);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=plantilla-trabajadores.xlsx',
    );
    res.send(buffer);
  }

  // Lo justo para la revisión de la importación: quién ya está registrado
  // (por documento y por código), en cualquier situación.
  @Get('importacion/registrados')
  @ApiOperation({
    summary:
      'Trabajadores ya registrados en una empresa, para la revisión de la importación',
  })
  async registradosParaImportar(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
  ) {
    const id = Number(empresaDelListado(alcance, idEmpresa));
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Indique la empresa.');
    return {
      message: 'Trabajadores registrados.',
      data: {
        registrados: await this.empleadoService.registradosParaImportar(id),
      },
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar empleados a Excel' })
  async exportExcel(
    @AlcanceActual() alcance: Alcance,
    @Query() query: EmployeeQueryDto,
    @Res() res: Response,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    const buffer = await this.empleadoService.exportExcel(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader('Content-Disposition', `attachment; filename=empleados.xlsx`);

    res.send(buffer);
  }
}
