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
// unidad-empleadora.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseArrayPipe,
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
import { GerenciaEmpleadoraService } from './gerencia-empleadora.service';
import { CreateGerenciaEmpleadoraDto } from './dto/create-gerencia-empleadora.dto';
import { UpdateGerenciaEmpleadoraDto } from './dto/update-gerencia-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { GerenciaQueryDto } from './dto/gerencia-query.dto';

import { Response } from 'express';
import { Res } from '@nestjs/common';

@ApiTags('Gerencia Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('gerencia-empleadora')
export class GerenciaEmpleadoraController {
  constructor(
    private readonly gerenciaEmpleadoraService: GerenciaEmpleadoraService,
    private readonly alcances: AlcanceService,
  ) {}

  // Crear gerencia empleadora
  @Post()
  @ApiOperation({ summary: 'Crear una nueva gerencia empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Gerencia empleadora creada exitosamente.',
  })
  async create(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreateGerenciaEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'empresa', dto.idEmpresaEmpleadora);
    const gerencia = await this.gerenciaEmpleadoraService.create(user, dto);
    return {
      message: 'Gerencia empleadora creada exitosamente.',
      data: { gerencia },
    };
  }

  // Listar todas las gerencias empleadoras
  @Get()
  @ApiOperation({ summary: 'Listar todas las gerencias empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de gerencias empleadoras.' })
  @Roles(...TODOS)
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query() query: GerenciaQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    // const resp = await this.gerenciaEmpleadoraService.findAll({
    //   page: query.page ?? 1,
    //   limit: query.limit ?? 0,
    //   search: query.search,
    // });

    const resp = await this.gerenciaEmpleadoraService.findAll(query);
    return {
      message: 'Lista de gerencias empleadoras.',
      data: { gerencias: resp.data, meta: resp.meta },
    };
  }

  // Listar gerencias por empresa
  @Get('empresa/:id')
  @ApiOperation({ summary: 'Listar gerencias empleadoras de una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gerencias de la empresa especificada.',
  })
  @Roles(...TODOS)
  async findByEmpresa(
    @AlcanceActual() alcance: Alcance,
    @Param('id') id: string,
  ) {
    await this.alcances.verificar(alcance, 'empresa', Number(id));
    const gerencias = await this.gerenciaEmpleadoraService.findByEmpresaId(
      Number(id),
    );

    return {
      message: 'Lista de gerencias empleadoras de la empresa.',
      data: { gerencias },
    };
  }

  // Obtener gerencia empleadora por ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener gerencia empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({ status: 200, description: 'Gerencia empleadora encontrada.' })
  @Roles(...TODOS)
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'gerencia', id);
    const gerencia = await this.gerenciaEmpleadoraService.findOne(id);
    return {
      message: 'Gerencia empleadora encontrada.',
      data: { gerencia },
    };
  }

  // Actualizar gerencia empleadora
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar gerencia empleadora' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Gerencia empleadora actualizada correctamente.',
  })
  async update(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGerenciaEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'gerencia', id);
    // No se puede mudar el registro a una empresa fuera de su alcance.
    if (dto.idEmpresaEmpleadora !== undefined)
      verificarEmpresa(alcance, Number(dto.idEmpresaEmpleadora), 'Empresa');
    const gerencia = await this.gerenciaEmpleadoraService.update(user, id, dto);
    return {
      message: `Gerencia empleadora con ID ${id} actualizada correctamente.`,
      data: { gerencia },
    };
  }

  // Eliminar gerencia empleadora (soft delete)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar gerencia empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la gerencia empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Gerencia empleadora eliminada correctamente.',
  })
  async remove(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'gerencia', id);
    const gerencia = await this.gerenciaEmpleadoraService.remove(user, id);
    return {
      message: `Gerencia empleadora con ID ${id} eliminada correctamente.`,
      data: { gerencia },
    };
  }

  // Importar gerencias empleadoras desde Excel
  @Post('import')
  @ApiBody({ type: [CreateGerenciaEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar Gerencia empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Importacion de gerencia empleadora creada exitosamente.',
  })
  async importExcelData(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    // `ParseArrayPipe` valida cada fila con el DTO: con el tipo arreglo,
    // el `ValidationPipe` no mira los elementos y entraba cualquier cosa.
    @Body(
      new ParseArrayPipe({
        // Todos los errores, cada uno con su fila («[i] …»): sin esto Nest
        // se detiene en el primero y sin índice, y el front no sabe de qué fila es.
        stopAtFirstError: false,
        items: CreateGerenciaEmpleadoraDto,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    )
    data: CreateGerenciaEmpleadoraDto[],
  ) {
    for (const fila of data)
      verificarEmpresa(alcance, Number(fila.idEmpresaEmpleadora), 'Empresa');
    const { count, omitidas } = await this.gerenciaEmpleadoraService.importData(
      user,
      data,
    );
    return {
      message: 'Gerencias empleadora creadas exitosamente.',
      data: { count, omitidas },
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar gerencias empleadoras a Excel' })
  async exportExcel(
    @AlcanceActual() alcance: Alcance,
    @Query() query: GerenciaQueryDto,
    @Res() res: Response,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    const buffer = await this.gerenciaEmpleadoraService.exportExcel(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=gerencias-empleadoras.xlsx`,
    );

    res.send(buffer);
  }
}
