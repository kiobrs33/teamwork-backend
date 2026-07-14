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
@UseGuards(JwtAuthGuard)
@Controller('puesto-empleadora')
export class PuestoEmpleadoraController {
  constructor(
    private readonly puestoEmpleadoraService: PuestoEmpleadoraService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo puesto empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Puesto empleadora creado exitosamente.',
  })
  async create(@User() user: AuthUser, @Body() dto: CreatePuestoEmpleadoraDto) {
    const puesto = await this.puestoEmpleadoraService.create(user, dto);
    return {
      message: 'Puesto empleadora creado exitosamente.',
      data: { puesto },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los puestos empleadora' })
  @ApiResponse({ status: 200, description: 'Lista de puestos empleadora.' })
  async findAll(@Query() query: PuestoQueryDto) {
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
  async findByEmpresa(@Param('id') id: string) {
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
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
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePuestoEmpleadoraDto,
  ) {
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
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const puesto = await this.puestoEmpleadoraService.remove(user, id);
    return {
      message: `Puesto empleadora con ID ${id} eliminado correctamente.`,
      data: { puesto },
    };
  }

  @Post('import')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: [CreatePuestoEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar Puesto empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Importacion de puesto empleadora creada exitosamente.',
  })
  async importExcelData(
    @User() user: AuthUser,
    @Body() data: CreatePuestoEmpleadoraDto[],
  ) {
    const { count } = await this.puestoEmpleadoraService.importData(user, data);
    return {
      message: 'Puestos empleadora creados exitosamente.',
      data: { count },
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar puestos empleadoras a Excel' })
  async exportExcel(@Query() query: PuestoQueryDto, @Res() res: Response) {
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
