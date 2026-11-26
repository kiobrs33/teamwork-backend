import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { User } from 'src/auth/auth.decorator';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { EquipoTeamworkService } from './equipo-teamwork.service';
import {
  ActualizarMiembroEquipoDto,
  CrearMiembroEquipoDto,
} from './dto/equipo.dto';

/** Cuentas del personal de TeamWork. Solo el dueño (ADMIN). */
@ApiTags('Equipo TeamWork')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
@Controller('equipo-teamwork')
export class EquipoTeamworkController {
  constructor(private readonly service: EquipoTeamworkService) {}

  @Get()
  @ApiOperation({ summary: 'Cuentas del dueño y del equipo de TeamWork' })
  async listar() {
    return {
      message: 'Equipo de TeamWork.',
      data: { miembros: await this.service.listar() },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una cuenta del equipo' })
  async crear(@User() user: AuthUser, @Body() dto: CrearMiembroEquipoDto) {
    return {
      message: 'Cuenta creada.',
      data: { miembro: await this.service.crear(user.idUsuario, dto) },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar una cuenta del equipo' })
  async actualizar(
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarMiembroEquipoDto,
  ) {
    return {
      message: 'Cuenta actualizada.',
      data: { miembro: await this.service.actualizar(user.idUsuario, id, dto) },
    };
  }
}
