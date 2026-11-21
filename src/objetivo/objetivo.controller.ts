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
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresaEmpleadora?: string,
  ) {
    idEmpresaEmpleadora = String(
      empresaDelListado(alcance, idEmpresaEmpleadora) ?? '',
    );
    // Opcional: sin él devuelve todos, como antes. Lo usa el selector de
    // empresa del front, que trabaja con una empresa a la vez.
    const idEmpresa = Number(idEmpresaEmpleadora);
    const objetivos = await this.objetivoService.findAll(
      Number.isInteger(idEmpresa) && idEmpresa > 0 ? idEmpresa : undefined,
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
    const objetivo = await this.objetivoService.evaluarObjetivo(id, user, dto);

    return {
      message: `Objetivo ${id} evaluado correctamente`,
      data: {
        objetivo,
      },
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
    await this.alcances.verificarCodigos(
      alcance,
      dto.objetivos.map((o) => o.codigoEmpleado),
    );
    const objetivos = await this.objetivoService.createMasivo(user, dto);
    return { message: 'Objetivos creados masivamente', data: { objetivos } };
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
