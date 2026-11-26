import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import {
  Alcance,
  ADMINISTRADORES,
  empresaDelListado,
} from 'src/autorizacion/alcance';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { opcionesArchivo } from 'src/common/interceptors/cloudinary.evidencias.interceptor';
import { RegistroProcesoService } from './registro-proceso.service';
import {
  CrearListaDto,
  HitoDto,
  NuevoHitoDto,
} from './dto/registro-proceso.dto';

/**
 * Registros del proceso por campaña: RR. HH. y TeamWork. Todo lo que no es
 * GET es escritura (las cuentas de solo lectura las bloquea el RolesGuard).
 * La empresa va en la query: con ella se comprueba que el hito sea suyo.
 */
@ApiTags('Registros del proceso')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('registros-proceso')
export class RegistroProcesoController {
  constructor(private readonly service: RegistroProcesoService) {}

  private empresa(alcance: Alcance, pedida: string) {
    const id = Number(empresaDelListado(alcance, pedida));
    if (!Number.isInteger(id) || id <= 0)
      throw new BadRequestException('Indique la empresa.');
    return id;
  }

  @Get()
  @ApiOperation({ summary: 'Hitos de una campaña con sus archivos' })
  async panel(
    @AlcanceActual() alcance: Alcance,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @Query('idCampanaEvaluacion') idCampana?: string,
  ) {
    return {
      message: 'Registros del proceso.',
      data: await this.service.panel(
        this.empresa(alcance, idEmpresa),
        idCampana ? Number(idCampana) : undefined,
      ),
    };
  }

  @Post('lista')
  @ApiOperation({ summary: 'Crear la lista: sugerida (FONAFE) o la anterior' })
  async lista(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @Body() dto: CrearListaDto,
  ) {
    return {
      message: 'Lista de hitos creada.',
      data: await this.service.crearLista(
        user,
        this.empresa(alcance, idEmpresa),
        dto.idCampanaEvaluacion,
        dto.origen,
      ),
    };
  }

  @Post('hitos')
  @ApiOperation({ summary: 'Agregar un hito' })
  async crear(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @Body() dto: NuevoHitoDto,
  ) {
    return {
      message: 'Hito agregado.',
      data: await this.service.crearHito(
        user,
        this.empresa(alcance, idEmpresa),
        dto.idCampanaEvaluacion,
        dto,
      ),
    };
  }

  @Patch('hitos/:id')
  @ApiOperation({ summary: 'Editar un hito' })
  async editar(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @Body() dto: HitoDto,
  ) {
    return {
      message: 'Hito actualizado.',
      data: await this.service.editarHito(
        user,
        this.empresa(alcance, idEmpresa),
        id,
        dto,
      ),
    };
  }

  @Delete('hitos/:id')
  @ApiOperation({ summary: 'Quitar un hito' })
  async quitar(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
  ) {
    return {
      message: 'Hito quitado.',
      data: await this.service.quitarHito(
        user,
        this.empresa(alcance, idEmpresa),
        id,
      ),
    };
  }

  @Post('hitos/:id/archivos')
  @UseInterceptors(
    FileInterceptor('file', opcionesArchivo('registros-proceso')),
  )
  @ApiOperation({ summary: 'Adjuntar el registro de un hito' })
  async adjuntar(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
    @UploadedFile()
    file:
      | {
          path: string;
          filename: string;
          originalname: string;
          mimetype: string;
        }
      | undefined,
  ) {
    if (!file) throw new BadRequestException('Adjunte un archivo.');
    return {
      message: 'Registro adjuntado.',
      data: await this.service.adjuntar(
        user,
        this.empresa(alcance, idEmpresa),
        id,
        file,
      ),
    };
  }

  @Delete('archivos/:id')
  @ApiOperation({ summary: 'Quitar un archivo de un hito' })
  async quitarArchivo(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Query('idEmpresaEmpleadora') idEmpresa: string,
  ) {
    return {
      message: 'Archivo quitado.',
      data: await this.service.quitarArchivo(
        user,
        this.empresa(alcance, idEmpresa),
        id,
      ),
    };
  }
}
