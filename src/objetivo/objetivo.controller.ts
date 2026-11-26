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
import { enviarExcel } from 'src/common/excel/libro-excel';
import { ObjetivoExportQueryDto } from './dto/objetivo-export-query.dto';
import type { Response } from 'express';
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
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ObjetivoService } from './objetivo.service';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { CreateObjetivoConDetallesDto } from './dto/create-objetivo-detalle.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CreateObjetivosMasivosDto } from './dto/create-objetivo-masivo.dto';
import { EvaluarObjetivoDto } from './dto/evaluar-objetivo.dto';

@ApiTags('Objetivo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('objetivo')
export class ObjetivoController {
  constructor(
    private readonly objetivoService: ObjetivoService,
    private readonly alcances: AlcanceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los objetivos' })
  @ApiResponse({ status: 200, description: 'Lista de objetivos.' })
  @ApiQuery({
    name: 'idEmpresaEmpleadora',
    required: false,
    description: 'Solo los objetivos de los trabajadores de esa empresa.',
  })
  @ApiQuery({
    name: 'idCampanaEvaluacion',
    required: false,
    description:
      'Los de esa campaña (p. ej. una cerrada, para consultarlos). Sin él, los de la campaña en curso.',
  })
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresaEmpleadora?: string,
    @Query('idCampanaEvaluacion') idCampanaEvaluacion?: string,
  ) {
    idEmpresaEmpleadora = String(
      empresaDelListado(alcance, idEmpresaEmpleadora) ?? '',
    );
    // Opcional: sin él devuelve todos, como antes. Lo usa el selector de
    // empresa del front, que trabaja con una empresa a la vez.
    const idEmpresa = Number(idEmpresaEmpleadora);
    // Una campaña concreta solo si es de una empresa a la que se tiene acceso.
    const idCampana = Number(idCampanaEvaluacion);
    const conCampana = Number.isInteger(idCampana) && idCampana > 0;
    if (conCampana)
      await this.alcances.verificar(alcance, 'campana', idCampana);
    const objetivos = await this.objetivoService.findAll(
      Number.isInteger(idEmpresa) && idEmpresa > 0 ? idEmpresa : undefined,
      conCampana ? idCampana : undefined,
    );
    return { message: 'Lista de objetivos', data: { objetivos } };
  }

  @Get('export/excel')
  @ApiOperation({
    summary:
      'Exportar objetivos (formato de la carga masiva) y retroalimentación',
  })
  async exportExcel(
    @AlcanceActual() alcance: Alcance,
    @Query() query: ObjetivoExportQueryDto,
    @Res() res: Response,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    enviarExcel(
      res,
      await this.objetivoService.exportExcel(query),
      'objetivos',
    );
  }

  @Get('subordinados/:id')
  @ApiOperation({
    summary: 'Listar los objetivos de todos los subordinados de un jefe',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de objetivos de todos los subordinados',
  })
  @Roles(Rol.JEFE, ...ADMINISTRADORES)
  async findAllByJefe(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarTrabajador(alcance, id);
    const objetivos = await this.objetivoService.findAllByJefe(id);
    return {
      message: `Objetivos de subordinados del jefe ${id}`,
      data: {
        objetivos,
      },
    };
  }

  @Patch(':id/evaluar')
  @ApiOperation({
    summary: 'Calificar (evaluar) un objetivo de un subordinado',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Objetivo evaluado correctamente',
  })
  @Roles(Rol.JEFE, ...ADMINISTRADORES)
  async evaluarObjetivo(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
    @Body() dto: EvaluarObjetivoDto,
  ) {
    await this.alcances.verificarObjetivo(alcance, id);
    await this.alcances.verificarVigencia(alcance, 'evaluacion');
    const objetivo = await this.objetivoService.evaluarObjetivo(id, user, dto);

    return {
      message: `Objetivo ${id} evaluado correctamente`,
      data: {
        objetivo,
      },
    };
  }

  // Antes de `:id`, que si no lo atraparía.
  @Get('mios')
  @Roles(Rol.JEFE, Rol.EMPLEADO)
  @ApiOperation({ summary: 'Mis objetivos de la campaña en curso' })
  async mios(@User() user: AuthUser) {
    return {
      message: 'Mis objetivos.',
      data: await this.objetivoService.misObjetivos(user),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener objetivo por ID' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(Rol.JEFE, ...ADMINISTRADORES)
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarObjetivo(alcance, id);
    const objetivo = await this.objetivoService.findOne(id);
    return { message: 'Objetivo encontrado', data: { objetivo } };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar objetivo y sus detalles' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(Rol.JEFE, ...ADMINISTRADORES)
  async update(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthUser,
    @Body() dto: UpdateObjetivoDto,
  ) {
    await this.alcances.verificarObjetivo(alcance, id);
    // Tampoco se puede reasignar el objetivo a alguien fuera de su alcance.
    if (dto.idEmpleado !== undefined)
      await this.alcances.verificarDueñoDeObjetivos(alcance, dto.idEmpleado);
    await this.alcances.verificarVigencia(alcance, 'objetivos');
    const objetivo = await this.objetivoService.update(id, user, dto);
    return { message: `Objetivo ${id} actualizado`, data: { objetivo } };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar objetivo (soft delete)' })
  @ApiParam({ name: 'id', example: 1 })
  @Roles(Rol.JEFE, ...ADMINISTRADORES)
  async remove(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificarObjetivo(alcance, id);
    await this.alcances.verificarVigencia(alcance, 'objetivos');
    const objetivo = await this.objetivoService.remove(user, id);
    return { message: `Objetivo ${id} eliminado`, data: { objetivo } };
  }

  @Post('con-detalles')
  @ApiOperation({ summary: 'Crear objetivo con detalles' })
  @Roles(Rol.JEFE, ...ADMINISTRADORES)
  async createConDetalles(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreateObjetivoConDetallesDto,
  ) {
    await this.alcances.verificarDueñoDeObjetivos(alcance, dto.idEmpleado);
    await this.alcances.verificarVigencia(alcance, 'objetivos');
    const objetivo = await this.objetivoService.createConDetalles(user, dto);
    return { message: 'Objetivo creado exitosamente', data: { objetivo } };
  }

  @Post('masivo')
  @ApiOperation({ summary: 'Crear objetivos masivamente' })
  async createMasivo(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreateObjetivosMasivosDto,
  ) {
    // El código de empleado es único por empresa: hace falta saber cuál.
    const idEmpresa = Number(
      empresaDelListado(alcance, dto.idEmpresaEmpleadora),
    );
    if (!Number.isInteger(idEmpresa) || idEmpresa <= 0)
      throw new BadRequestException('Indique la empresa de los objetivos.');
    // La empresa ya está dentro del alcance (`empresaDelListado` da -1 si
    // no). Los códigos que no existen los informa el servicio por fila,
    // junto con los demás errores del archivo.
    const objetivos = await this.objetivoService.createMasivo(user, {
      ...dto,
      idEmpresaEmpleadora: idEmpresa,
    });
    const fichas = (n: number) =>
      n === 1 ? '1 trabajador' : `${n} trabajadores`;
    return {
      message: objetivos.omitidos
        ? `Objetivos importados para ${fichas(objetivos.count)}. Ya tenían objetivos y se omitieron: ${fichas(objetivos.omitidos)}.`
        : `Objetivos importados para ${fichas(objetivos.count)}.`,
      data: objetivos,
    };
  }

  @Get('empresa/:idEmpresa/empleados-evaluados')
  @ApiOperation({
    summary:
      'Listar empleados evaluados por empresa con sus objetivos y su jefe evaluador',
  })
  @ApiParam({
    name: 'idEmpresa',
    description: 'ID de la empresa empleadora',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de empleados evaluados, su evaluador (JEFE) y objetivos',
  })
  async empleadosEvaluadosPorEmpresa(
    @AlcanceActual() alcance: Alcance,
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ) {
    await this.alcances.verificar(alcance, 'empresa', idEmpresa);
    const resultado =
      await this.objetivoService.empleadosObjetivosEvaluadosPorEmpresa(
        idEmpresa,
      );

    return {
      message: 'Empleados evaluados por empresa',
      data: {
        ...resultado,
      },
    };
  }
}
