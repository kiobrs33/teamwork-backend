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
// empresa-empleadora.controller.ts
import {
  BadRequestException,
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
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { EmpresaEmpleadoraService } from './empresa-empleadora.service';
import { CreateEmpresaEmpleadoraDto } from './dto/create-empresa-empleadora.dto';
import { UpdateEmpresaEmpleadoraDto } from './dto/update-empresa-empleadora.dto';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { EmpresaQueryDto } from './dto/empresa-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { empresaLogoUploadOptions } from '../common/interceptors/cloudinary.empresas.interceptor';

// Lo que CloudinaryStorage deja en `file`: `path` es la URL pública y
// `filename` el public_id que hace falta para borrar el logo anterior.
interface ArchivoLogoSubido {
  path?: string;
  filename?: string;
}

@ApiTags('Empresas Empleadoras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
@Controller('empresa-empleadora')
export class EmpresaEmpleadoraController {
  constructor(
    private readonly service: EmpresaEmpleadoraService,
    private readonly alcances: AlcanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Empresa empleadora creada exitosamente.',
  })
  async create(
    @User() user: AuthUser,
    @Body() dto: CreateEmpresaEmpleadoraDto,
  ) {
    const empresa = await this.service.create(user, dto);
    return {
      message: 'Empresa empleadora creada exitosamente.',
      data: { empresa },
    };
  }

  @Post(':id/logo')
  @ApiOperation({
    summary: 'Subir el logo de una empresa empleadora',
    description:
      'Segundo paso de la creación: Cloudinary necesita el id de la empresa ya creada.',
  })
  @ApiParam({ name: 'id', description: 'ID de la empresa empleadora' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Logo subido correctamente.' })
  @UseInterceptors(FileInterceptor('file', empresaLogoUploadOptions))
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: ArchivoLogoSubido | undefined,
  ) {
    // Sin archivo, `file` llega undefined y leer `file.path` reventaba en un 500.
    if (!file?.path) {
      throw new BadRequestException(
        'Debes adjuntar una imagen en el campo file.',
      );
    }

    const url = file.path;
    const publicId = file.filename ?? '';

    const empresa = await this.service.updateLogo(id, url, publicId);

    return {
      message: 'Logo subido correctamente',
      data: empresa,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las empresas empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de empresas empleadoras.' })
  @Roles(...ADMINISTRADORES)
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query() query: EmpresaQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    // Pasar la query completa: destructurarla dejaba fuera los filtros por
    // columna y el ordenamiento que el servicio sí sabe aplicar.
    const resp = await this.service.findAll(query);

    return {
      message: 'Lista de empresas empleadoras.',
      data: { empresas: resp.data, meta: resp.meta },
    };
  }

  // Antes de ':id', o 'export' entra como id y el ParseIntPipe responde 400.
  @Get('export/excel')
  @ApiOperation({
    summary: 'Exportar empresas a Excel (mismos filtros que el listado)',
  })
  @Roles(...ADMINISTRADORES)
  async exportExcel(
    @AlcanceActual() alcance: Alcance,
    @Query() query: EmpresaQueryDto,
    @Res() res: Response,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    enviarExcel(res, await this.service.exportExcel(query), 'empresas');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID de la empresa empleadora' })
  @ApiResponse({ status: 200, description: 'Empresa empleadora encontrada.' })
  @Roles(...TODOS)
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'empresa', id);
    const empresa = await this.service.findOne(id);
    return {
      message: 'Empresa empleadora encontrada.',
      data: { empresa },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar empresa empleadora' })
  @ApiParam({ name: 'id', description: 'ID de la empresa empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Empresa empleadora actualizada correctamente.',
  })
  async update(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpresaEmpleadoraDto,
  ) {
    const empresa = await this.service.update(user, id, dto);
    return {
      message: `Empresa empleadora con ID ${id} actualizada correctamente.`,
      data: { empresa },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empresa empleadora (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID de la empresa empleadora' })
  @ApiResponse({
    status: 200,
    description: 'Empresa empleadora eliminada correctamente.',
  })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const empresa = await this.service.remove(user, id);
    return {
      message: `Empresa empleadora con ID ${id} eliminada correctamente.`,
      data: { empresa },
    };
  }
}
