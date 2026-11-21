import { Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { TODOS } from 'src/autorizacion/alcance';
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { enviarExcel } from 'src/common/excel/libro-excel';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

import { EvidenciaService } from './evidencia.service';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { EvidenciaQueryDto } from './dto/evidencia-query.dto';

import { evidenciaStorage } from 'src/common/interceptors/cloudinary.evidencias.interceptor';

@ApiTags('Evidencias')
@ApiBearerAuth()
// El alcance fino (qué trabajadores) lo decide `alcanceDe` en el servicio.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...TODOS)
@Controller('evidencias')
export class EvidenciaController {
  constructor(private readonly service: EvidenciaService) {}

  // 📌 SUBIR EVIDENCIA
  @Post()
  @ApiOperation({ summary: 'Subir evidencia (PDF, DOCX, etc)' })
  @ApiResponse({ status: 201, description: 'Evidencia creada correctamente' })
  @UseInterceptors(FileInterceptor('file', { storage: evidenciaStorage }))
  async create(
    @User() user: AuthUser,
    @UploadedFile() file: any,
    @Body() dto: CreateEvidenciaDto,
  ) {
    if (!file) {
      throw new BadRequestException('Debe subir un archivo');
    }

    const evidencia = await this.service.create(
      user,
      dto,
      file.path, // URL Cloudinary
      file.filename, // public_id
      file,
    );

    return {
      message: 'Evidencia subida correctamente',
      data: { evidencia },
    };
  }

  // 📌 LISTAR
  @Get()
  @ApiOperation({
    summary: 'Listar evidencias',
    description:
      'ADMIN ve todas; JEFE, las de sus subordinados y las suyas; EMPLEADO, solo las suyas.',
  })
  async findAll(@User() user: AuthUser, @Query() query: EvidenciaQueryDto) {
    const resp = await this.service.findAll(user, query);

    return {
      message: 'Lista de evidencias',
      data: resp,
    };
  }

  @Get('export/excel')
  @ApiOperation({
    summary:
      'Exportar evidencias (mismos filtros y alcance por rol que el listado)',
  })
  async exportExcel(
    @User() user: AuthUser,
    @Query() query: EvidenciaQueryDto,
    @Res() res: Response,
  ) {
    enviarExcel(res, await this.service.exportExcel(user, query), 'evidencias');
  }

  @Get('/empleado/:idEmpleado')
  @ApiOperation({
    summary: 'Obtener evidencias por empleado',
  })
  async findByEmpleado(
    @User() user: AuthUser,
    @Param('idEmpleado', ParseIntPipe)
    idEmpleado: number,
  ) {
    const evidencias = await this.service.findByEmpleado(user, idEmpleado);

    return {
      message: 'Lista de evidencias del empleado',
      data: { evidencias },
    };
  }

  // 📌 OBTENER UNA
  @Get(':id')
  @ApiOperation({ summary: 'Obtener evidencia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la evidencia' })
  async findOne(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const evidencia = await this.service.findOne(user, id);

    return {
      message: 'Evidencia encontrada',
      data: { evidencia },
    };
  }

  // 📌 ELIMINAR (soft + cloudinary)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar evidencia' })
  async remove(@User() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const evidencia = await this.service.remove(user, id);

    return {
      message: 'Evidencia eliminada correctamente',
      data: { evidencia },
    };
  }
}
