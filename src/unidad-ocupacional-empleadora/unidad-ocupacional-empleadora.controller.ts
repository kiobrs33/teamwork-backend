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
import { UnidadOcupacionalEmpleadoraService } from './unidad-ocupacional-empleadora.service';
import { CreateUnidadOcupacionalEmpleadoraDto } from './dto/create-unidad-ocupacional-empleadora.dto';
import { UpdateUnidadOcupacionalEmpleadoraDto } from './dto/update-unidad-ocupacional-empleadora.dto';

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
import { AsignarCompetenciasLoteDto } from './dto/asignar-competencias-a-unidad-ocupacional-empleadora.dto';
import { CreateAreaEmpleadoraDto } from '../area-empleadora/dto/create-area-empleadora.dto';
import { AsignarCompetenciasDto } from './dto/create-unidad-competencia.dto';
import { UnidadOcupacionalQueryDto } from './dto/unidad-ocupacional-query.dto';

import { Response } from 'express';
import { PdfRendererService } from 'src/reporte/pdf/pdf-renderer.service';
import { Res } from '@nestjs/common';

@ApiTags('Unidad Ocupacional Empleadora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ADMINISTRADORES)
@Controller('unidad-ocupacional-empleadora')
export class UnidadOcupacionalEmpleadoraController {
  constructor(
    private readonly unidadOcupacionalEmpleadoraService: UnidadOcupacionalEmpleadoraService,
    private readonly alcances: AlcanceService,
    private readonly pdf: PdfRendererService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva unidad ocupacional empleadora' })
  @ApiResponse({
    status: 201,
    description: 'Grupo ocupacional creado.',
  })
  async create(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: CreateUnidadOcupacionalEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'empresa', dto.idEmpresaEmpleadora);
    const unidad = await this.unidadOcupacionalEmpleadoraService.create(
      user,
      dto,
    );
    return {
      message: 'Grupo ocupacional creado.',
      data: { unidad },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las unidades ocupacionales empleadoras',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos ocupacionales.',
  })
  @Roles(...TODOS)
  async findAll(
    @AlcanceActual() alcance: Alcance,
    @Query() query: UnidadOcupacionalQueryDto,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    // const resp = await this.unidadOcupacionalEmpleadoraService.findAll({
    //   page: query.page ?? 1,
    //   limit: query.limit ?? 0,
    //   search: query.search,
    // });

    const resp = await this.unidadOcupacionalEmpleadoraService.findAll(query);
    return {
      message: 'Lista de grupos ocupacionales.',
      data: { unidades: resp.data, meta: resp.meta },
    };
  }

  @Get('empresa/:id')
  @ApiOperation({
    summary: 'Listar todas las unidades ocupacionales empleadoras por Empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos ocupacionales de la empresa.',
  })
  @Roles(...TODOS)
  async findAllByCompany(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'empresa', Number(id));
    const unidades =
      await this.unidadOcupacionalEmpleadoraService.findAllByCompany(id);
    return {
      message: 'Lista de grupos ocupacionales de la empresa.',
      data: { unidades },
    };
  }

  @Get('empresa/:id/unidades-competencias')
  @ApiOperation({
    summary:
      'Obtener todas las unidades ocupacionales con todas las competencias y niveles de una empresa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la empresa empleadora',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description:
      'Mapa completo de unidades ocupacionales con competencias y niveles.',
  })
  @Roles(...TODOS)
  async obtenerMapaUnidadesPorEmpresa(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'empresa', Number(id));
    const unidades =
      await this.unidadOcupacionalEmpleadoraService.obtenerUnidadesConCompetenciasPorEmpresa(
        id,
      );

    return {
      message: 'Mapa generado correctamente.',
      data: { unidades },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener unidad ocupacional empleadora por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad ocupacional empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo ocupacional encontrado.',
  })
  @Roles(...TODOS)
  async findOne(
    @AlcanceActual() alcance: Alcance,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'unidad', id);
    const unidad = await this.unidadOcupacionalEmpleadoraService.findOne(id);
    return {
      message: 'Grupo ocupacional encontrado.',
      data: { unidad },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar unidad ocupacional empleadora' })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad ocupacional empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad ocupacional empleadora actualizada correctamente.',
  })
  async update(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnidadOcupacionalEmpleadoraDto,
  ) {
    await this.alcances.verificar(alcance, 'unidad', id);
    // No se puede mudar el registro a una empresa fuera de su alcance.
    if (dto.idEmpresaEmpleadora !== undefined)
      verificarEmpresa(alcance, Number(dto.idEmpresaEmpleadora), 'Empresa');
    const unidad = await this.unidadOcupacionalEmpleadoraService.update(
      user,
      id,
      dto,
    );
    return {
      message: `Grupo ocupacional con ID ${id} actualizado.`,
      data: { unidad },
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar unidad ocupacional empleadora (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad ocupacional empleadora',
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad ocupacional empleadora eliminada correctamente.',
  })
  async remove(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.alcances.verificar(alcance, 'unidad', id);
    const unidad = await this.unidadOcupacionalEmpleadoraService.remove(
      user,
      id,
    );
    return {
      message: `Grupo ocupacional con ID ${id} eliminado.`,
      data: { unidad },
    };
  }

  // @Post('asignar-competencias')
  // @ApiOperation({
  //   summary: 'Asignar competencias a unidad ocupacional empleadora',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Importacion de gerencia empleadora creada exitosamente.',
  // })
  // async asignarCompetenciasLote(
  //   @User() user: AuthUser,
  //   @Body() dto: AsignarCompetenciasLoteDto,
  // ) {
  //   const asignacionCompetencia =
  //     await this.unidadOcupacionalEmpleadoraService.asignarCompetenciasLote(
  //       user,
  //       dto,
  //     );
  //   return {
  //     message: 'Gerencia empleadora creadas exitosamente.',
  //     data: { asignacionCompetencia },
  //   };
  // }

  @Post('import')
  @ApiBody({ type: [CreateUnidadOcupacionalEmpleadoraDto] })
  @ApiOperation({ summary: 'Importar unidad ocupacional empleadora' })
  @ApiResponse({
    status: 201,
    description:
      'Importacion de unidad ocupacional empleadora creada exitosamente.',
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
        items: CreateUnidadOcupacionalEmpleadoraDto,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    )
    data: CreateUnidadOcupacionalEmpleadoraDto[],
  ) {
    for (const fila of data)
      verificarEmpresa(alcance, Number(fila.idEmpresaEmpleadora), 'Empresa');
    const { count, omitidas } =
      await this.unidadOcupacionalEmpleadoraService.importData(user, data);
    return {
      message: 'Grupos ocupacionales importados.',
      data: { count, omitidas },
    };
  }

  // Va antes de guardar, no en lugar de guardar: la pantalla pregunta primero
  // qué se perdería, avisa si hay notas en juego y solo entonces llama a
  // `asignar`. No escribe nada.
  @Post('asignar/impacto')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: AsignarCompetenciasDto })
  @ApiOperation({
    summary:
      'Qué evaluaciones abiertas se anularían al guardar esta asignación',
  })
  @ApiResponse({ status: 201, description: 'Impacto calculado.' })
  async impactoAsignacion(
    @AlcanceActual() alcance: Alcance,
    @Body() dto: AsignarCompetenciasDto,
  ) {
    await this.alcances.verificarVarios(
      alcance,
      'unidad',
      dto.unidades.map((u) => u.idUnidadOcupacionalEmpleadora),
    );
    await this.alcances.verificarVarios(
      alcance,
      'competencia',
      dto.unidades.flatMap((u) => u.competencias.map((c) => c.idCompetencia)),
    );
    const impacto =
      await this.unidadOcupacionalEmpleadoraService.calcularImpactoAsignacion(
        dto.unidades,
      );

    return { message: 'Impacto calculado.', data: impacto };
  }

  // La misma consulta que `asignar/impacto`, con nombres y en PDF: se
  // descarga desde la confirmación para avisar a quienes deben volver a
  // calificar. No escribe.
  @Post('asignar/impacto/pdf')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: AsignarCompetenciasDto })
  @ApiOperation({
    summary:
      'PDF con las evaluaciones que se anularían y quién debe recalificar',
  })
  async impactoAsignacionPdf(
    @AlcanceActual() alcance: Alcance,
    @Body() dto: AsignarCompetenciasDto,
    @Res() res: Response,
  ) {
    await this.alcances.verificarVarios(
      alcance,
      'unidad',
      dto.unidades.map((u) => u.idUnidadOcupacionalEmpleadora),
    );
    await this.alcances.verificarVarios(
      alcance,
      'competencia',
      dto.unidades.flatMap((u) => u.competencias.map((c) => c.idCompetencia)),
    );
    const detalle =
      await this.unidadOcupacionalEmpleadoraService.detalleImpactoAsignacion(
        dto.unidades,
      );
    const fecha = new Date().toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      dateStyle: 'short',
      timeStyle: 'short',
    });
    const pdf = await this.pdf.render('impacto-asignacion', {
      ...detalle,
      fecha,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename=cambios-asignacion-competencias.pdf',
    });
    res.end(pdf);
  }

  @Post('asignar')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiBody({ type: AsignarCompetenciasDto })
  @ApiOperation({
    summary:
      'Asignar competencias a unidades ocupacionales y devolver mapa actualizado',
  })
  @ApiResponse({
    status: 201,
    description:
      'Competencias asignadas correctamente y se devuelve el mapa actualizado por unidad.',
  })
  async asignarCompetencias(
    @AlcanceActual() alcance: Alcance,
    @User() user: AuthUser,
    @Body() dto: AsignarCompetenciasDto,
  ) {
    await this.alcances.verificarVarios(
      alcance,
      'unidad',
      dto.unidades.map((u) => u.idUnidadOcupacionalEmpleadora),
    );
    await this.alcances.verificarVarios(
      alcance,
      'competencia',
      dto.unidades.flatMap((u) => u.competencias.map((c) => c.idCompetencia)),
    );
    const resultado =
      await this.unidadOcupacionalEmpleadoraService.asignarCompetenciasRetornarMapa(
        user,
        dto.unidades, // ← importante: la data interna está en "unidades"
      );

    return {
      message: 'Competencias asignadas correctamente.',
      data: resultado,
    };
  }

  @Get('export/excel')
  @ApiOperation({
    summary: 'Exportar unidades ocupacionales empleadoras a Excel',
  })
  async exportExcel(
    @AlcanceActual() alcance: Alcance,
    @Query() query: UnidadOcupacionalQueryDto,
    @Res() res: Response,
  ) {
    query.idEmpresaEmpleadora = empresaDelListado(
      alcance,
      query.idEmpresaEmpleadora,
    );
    const buffer =
      await this.unidadOcupacionalEmpleadoraService.exportExcel(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=grupos-ocupacionales.xlsx`,
    );

    res.send(buffer);
  }
}
