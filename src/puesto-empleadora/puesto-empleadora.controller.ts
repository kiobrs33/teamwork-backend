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
import { PuestoEmpleadoraService } from './puesto-empleadora.service';
import { CreatePuestoEmpleadoraDto } from './dto/create-puesto-empleadora.dto';
import { UpdatePuestoEmpleadoraDto } from './dto/update-puesto-empleadora.dto';

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
import { PuestoQueryDto } from './dto/puesto-query.dto';

import { Response } from 'express';
import { Res } from '@nestjs/common';

@ApiTags('Puesto Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('puesto-empleadora')
export class PuestoEmpleadoraController {
  constructor(
    private readonly puestoEmpleadoraService: PuestoEmpleadoraService,
    private readonly alcances: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo puesto empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Puesto empleadora creado exitosamente.',
  })
  async create(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreatePuestoEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'empresa', dto.idEmpresaEmpleadora);
    const puesto = await this.puestoEmpleadoraService.create(user, dto);
    return {
      message: 'Puesto empleadora creado exitosamente.',
      data: { puesto },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los puestos empleadora' })
  @ApiResponse({ status: 200, description: 'Lista de puestos empleadora.' })
  @Roles(...TODOS)
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query() query: PuestoQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    // const resp = await this.puestoEmpleadoraService.findAll({
    //   page: query.page ?? 1,
    //   limit: query.limit ?? 0,
    //   search: query.search,
    // });

    const resp = await this.puestoEmpleadoraService.findAll(query);

    return {
      message: 'Lista de puestos empleadora.',
      data: { puestos: resp.data, meta: resp.meta },
    };
  }

  @Get('empresa/:id')
  @ApiOperation({ summary: 'Listar puestos empleadoras de una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de los puestos de la empresa especificada.',
  })
  @Roles(...TODOS)
  async findByEmpresa(
    @AlcanceActual() alcance: Alcance,
    @Param('id') id: string,
  ) {
    await this.alcances.verificar(alcance, 'empresa', Number(id));
    const puestos = await this.puestoEmpleadoraService.findByEmpresaId(
      Number(id),
    );
    return {
      message: 'Lista de puestos empleadoras de la empresa.',
      data: { puestos },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener puesto empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID del puesto empleadora' })
  @ApiResponse({ status: 200, description: 'Puesto empleadora encontrado.' })
  @Roles(...TODOS)
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'puesto', id);
    const puesto = await this.puestoEmpleadoraService.findOne(id);
    return {
      message: 'Puesto empleadora encontrado.',
      data: { puesto },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar puesto empleadora' })
  @ApiParam({ name: 'id', description: 'ID del puesto empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Puesto empleadora actualizado correctamente.',
  })
  async update(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePuestoEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'puesto', id);
    // No se puede mudar el registro a una empresa fuera de su alcance.
    if (dto.idEmpresaEmpleadora !== undefined)
      verificarEmpresa(alcance, Number(dto.idEmpresaEmpleadora), 'Empresa');
    const puesto = await this.puestoEmpleadoraService.update(user, id, dto);
    return {
      message: `Puesto empleadora con ID ${id} actualizado correctamente.`,
      data: { puesto },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar puesto empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del puesto empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Puesto empleadora eliminado correctamente.',
  })
  async remove(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'puesto', id);
    const puesto = await this.puestoEmpleadoraService.remove(user, id);
    return {
      message: `Puesto empleadora con ID ${id} eliminado correctamente.`,
      data: { puesto },
    };
  }

  @Post('import')
  @ApiBody({ type: [CreatePuestoEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar Puesto empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Importacion de puesto empleadora creada exitosamente.',
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
        items: CreatePuestoEmpleadoraDto,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    )
    data: CreatePuestoEmpleadoraDto[],
  ) {
    for (const fila of data)
      verificarEmpresa(alcance, Number(fila.idEmpresaEmpleadora), 'Empresa');
    const { count, omitidas } = await this.puestoEmpleadoraService.importData(
      user,
      data,
    );
    return {
      message: 'Puestos empleadora creados exitosamente.',
      data: { count, omitidas },
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar puestos empleadoras a Excel' })
  async exportExcel(
    @AlcanceActual() alcance: Alcance,
    @Query() query: PuestoQueryDto,
    @Res() res: Response,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    const buffer = await this.puestoEmpleadoraService.exportExcel(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=puestos-empleadoras.xlsx`,
    );

    res.send(buffer);
  }
}
