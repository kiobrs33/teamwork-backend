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
} from '@nestjs/common';

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
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Listar evidencias' })
  async findAll(@Query() query: EvidenciaQueryDto) {
    const resp = await this.service.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      idEmpleado: query.idEmpleado,
    });

    return {
      message: 'Lista de evidencias',
      data: resp,
    };
  }

  @Get('/empleado/:idEmpleado')
  @ApiOperation({
    summary: 'Obtener evidencias por empleado',
  })
  async findByEmpleado(
    @Param('idEmpleado', ParseIntPipe)
    idEmpleado: number,
  ) {
    const evidencias = await this.service.findByEmpleado(idEmpleado);

    return {
      message: 'Lista de evidencias del empleado',
      data: { evidencias },
    };
  }

  // 📌 OBTENER UNA
  @Get(':id')
  @ApiOperation({ summary: 'Obtener evidencia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la evidencia' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const evidencia = await this.service.findOne(id);

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
