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
import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { AlcanceService } from 'src/autorizacion/alcance.service';
import { ADMINISTRADORES, Alcance } from 'src/autorizacion/alcance';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { AdministradorEmpresaService } from './administrador-empresa.service';
import {
  ActualizarAdministradorDto,
  CrearAdministradorDto,
} from './dto/administrador.dto';

/**
 * Las cuentas de RR. HH. de cada empresa. Las gestiona el superadministrador
 * (cualquier empresa) y el propio RR. HH. (solo la suya, para sumar a sus
 * compañeros).
 */
@ApiTags('Administradores de empresa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('empresa-empleadora/:idEmpresa/administradores')
export class AdministradorEmpresaController {
  constructor(
    private readonly service: AdministradorEmpresaService,
    private readonly alcances: AlcanceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Administradores de la empresa' })
  async listar(
    @AlcanceActual() alcance: Alcance,
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ) {
    await this.alcances.verificar(alcance, 'empresa', idEmpresa);
    return {
      message: 'Administradores de la empresa.',
      data: { administradores: await this.service.listar(idEmpresa) },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un administrador de la empresa' })
  async crear(
    @AlcanceActual() alcance: Alcance,
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    @Body() dto: CrearAdministradorDto,
  ) {
    await this.alcances.verificar(alcance, 'empresa', idEmpresa);
    return {
      message: 'Administrador creado.',
      data: {
        administrador: await this.service.crear(
          alcance.idUsuario,
          idEmpresa,
          dto,
        ),
      },
    };
  }

  @Patch(':idUsuario')
  @ApiOperation({
    summary: 'Editar, restablecer la contraseña o desactivar un administrador',
  })
  async actualizar(
    @AlcanceActual() alcance: Alcance,
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Body() dto: ActualizarAdministradorDto,
  ) {
    await this.alcances.verificar(alcance, 'empresa', idEmpresa);
    return {
      message: 'Administrador actualizado.',
      data: {
        administrador: await this.service.actualizar(
          alcance.idUsuario,
          idEmpresa,
          idUsuario,
          dto,
        ),
      },
    };
  }
}

/**
 * Todas las cuentas de empresa (pestaña "Empresas" de Usuarios, en la
 * consola). Solo el superadministrador: cada empresa gestiona las suyas en
 * su espacio (`…/administradores`).
 */
@ApiTags('Administradores de empresa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
@Controller('administradores-empresa')
export class AdministradoresTodasController {
  constructor(private readonly servicio: AdministradorEmpresaService) {}

  @Get()
  @ApiOperation({ summary: 'Todas las cuentas de empresa, con su nivel' })
  async listar() {
    return {
      message: 'Cuentas de empresa.',
      data: { administradores: await this.servicio.listarTodas() },
    };
  }
}
