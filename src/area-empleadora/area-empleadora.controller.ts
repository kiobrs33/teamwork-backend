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
import { AreaEmpleadoraService } from './area-empleadora.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { AreaQueryDto } from './dto/area-query.dto';

import { Response } from 'express';
import { Res } from '@nestjs/common';

@ApiTags('Área Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('area-empleadora')
export class AreaEmpleadoraController {
  constructor(
    private readonly areaEmpleadoraService: AreaEmpleadoraService,
    private readonly alcances: AlcanceService,
  ) {}

  // Crear área empleadora
  @Post()
  @ApiOperation({ summary: 'Crear una nueva área empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Área empleadora creada exitosamente.',
  })
  async create(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreateAreaEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'empresa', dto.idEmpresaEmpleadora);
    const area = await this.areaEmpleadoraService.create(user, dto);
    return {
      message: 'Área empleadora creada exitosamente.',
      data: { area },
    };
  }

  // Listar todas las áreas empleadoras
  @Get()
  @ApiOperation({ summary: 'Listar todas las áreas empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de áreas empleadoras.' })
  @Roles(...TODOS)
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query() query: AreaQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    // const resp = await this.areaEmpleadoraService.findAll({
    //   page: query.page ?? 1,
    //   limit: query.limit ?? 0,
    //   search: query.search,
    // });

    const resp = await this.areaEmpleadoraService.findAll(query);

    return {
      message: 'Lista de áreas empleadoras.',
      data: { areas: resp.data, meta: resp.meta },
    };
  }

  // Listar áreas empleadoras por empresa
  @Get('empresa/:id')
  @ApiOperation({ summary: 'Listar areas empleadoras de una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de areas de la empresa especificada.',
  })
  @Roles(...TODOS)
  async findByEmpresa(
    @AlcanceActual() alcance: Alcance,
    @Param('id') id: string,
  ) {
    await this.alcances.verificar(alcance, 'empresa', Number(id));
    const areas = await this.areaEmpleadoraService.findByEmpresaId(Number(id));

    return {
      message: 'Lista de areas empleadoras de la empresa.',
      data: { areas },
    };
  }

  // Obtener área empleadora por ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener área empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({ status: 200, description: 'Área empleadora encontrada.' })
  @Roles(...TODOS)
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'area', id);
    const area = await this.areaEmpleadoraService.findOne(id);
    return {
      message: 'Área empleadora encontrada.',
      data: { area },
    };
  }

  // Actualizar área empleadora
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar área empleadora' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Área empleadora actualizada correctamente.',
  })
  async update(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreaEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'area', id);
    // No se puede mudar el registro a una empresa fuera de su alcance.
    if (dto.idEmpresaEmpleadora !== undefined)
      verificarEmpresa(alcance, Number(dto.idEmpresaEmpleadora), 'Empresa');
    const area = await this.areaEmpleadoraService.update(user, id, dto);
    return {
      message: `Área empleadora con ID ${id} actualizada correctamente.`,
      data: { area },
    };
  }

  // Eliminar área empleadora (soft delete)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar área empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del área empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Área empleadora eliminada correctamente.',
  })
  async remove(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'area', id);
    const area = await this.areaEmpleadoraService.remove(user, id);
    return {
      message: `Área empleadora con ID ${id} eliminada correctamente.`,
      data: { area },
    };
  }

  // Importar áreas empleadoras desde Excel
  @Post('import')
  @ApiBody({ type: [CreateAreaEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar Area empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Importacion de area empleadora creada exitosamente.',
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
        items: CreateAreaEmpleadoraDto,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    )
    data: CreateAreaEmpleadoraDto[],
  ) {
    for (const fila of data)
      verificarEmpresa(alcance, Number(fila.idEmpresaEmpleadora), 'Empresa');
    const { count, omitidas } = await this.areaEmpleadoraService.importData(
      user,
      data,
    );
    return {
      message: 'Areas empleadora creadas exitosamente.',
      data: { count, omitidas },
    };
  }

  // Exportar áreas empleadoras a Excel
  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar áreas empleadoras a Excel' })
  async exportExcel(
    @AlcanceActual() alcance: Alcance,
    @Query() query: AreaQueryDto,
    @Res() res: Response,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    const buffer = await this.areaEmpleadoraService.exportExcel(query);

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
