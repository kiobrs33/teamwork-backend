// empresa-empleadora.controller.ts
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
} from '@nestjs/common';
import { EmpresaEmpleadoraService } from './empresa-empleadora.service';
import { CreateEmpresaEmpleadoraDto } from './dto/create-empresa-empleadora.dto';
import { UpdateEmpresaEmpleadoraDto } from './dto/update-empresa-empleadora.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@ApiTags('Empresas Empleadoras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empresa-empleadora')
export class EmpresaEmpleadoraController {
  constructor(private readonly service: EmpresaEmpleadoraService) {}

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

  @Get()
  @ApiOperation({ summary: 'Listar todas las empresas empleadoras' })
  @ApiResponse({ status: 200, description: 'Lista de empresas empleadoras.' })
  async findAll() {
    const empresas = await this.service.findAll();
    return {
      message: 'Lista de empresas empleadoras.',
      data: { empresas },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa empleadora por ID' })
  @ApiParam({ name: 'id', description: 'ID de la empresa empleadora' })
  @ApiResponse({ status: 200, description: 'Empresa empleadora encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
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
