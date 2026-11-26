import { aplicarCabecera } from 'src/common/excel/estilo-excel';
import { construirLibroExcel } from 'src/common/excel/libro-excel';
import {
  CAMPANA_CERRADA,
  CAMPANA_EN_CURSO,
  campanaEnCurso,
  filtroEvaluacionesDeCampana,
  resolverCampana,
} from 'src/common/resultados/campana';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompetenciaDto } from './dto/update-competencia.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CreateCompetenciaNivelesItemsDto } from './dto/create-competencia-nivel-item.dto';
import { IniciarEvaluacionDto } from './dto/init-evaluation.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluation-item.dto';
// import { CreateCompetenciaConDetallesDto } from './dto/create-competencia-con-detalles.dto';

import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';
import { CompetenciaQueryDto } from './dto/competencia-query.dto';
import { ExportEmpresaQueryDto } from './dto/export-empresa-query.dto';
import { Prisma } from '@prisma/client';
import { styleText } from 'util';
import {
  calcularResultados,
  calificacionValida,
  CALIFICACION_MAXIMA_MANUAL,
  OPCIONES_LIKERT,
  notaDeEvaluacion,
  notasVacias,
  origenDeEvaluacion,
  TIPO_POR_ORIGEN,
  redondear,
  resultadoDeCompetenciasAsignadas,
  resultadoDeCompetencia,
  resultadoDeObjetivo,
  clasificarDesempeno,
  clasificarResultadoFinal,
  promedio,
  aplicarCalibracion,
  pesosDeEmpresa,
  evaluadoSinJefe,
  type ConfiguracionEmpresa,
  type NotasDeEvaluado,
} from 'src/common/resultados/resultados-evaluacion';

/** Lo que llega de una competencia, con los textos recortados. */
type CompetenciaEntrada = {
  codigo?: string;
  titulo?: string;
  nombre?: string;
  niveles?: {
    nivel: number;
    items: { enunciado: string; idCompetenciaNivelItem?: number }[];
  }[];
};

/**
 * Recorta los textos: el `ValidationPipe` global no transforma, así que el
 * `@Transform` del DTO solo sirve para validar. Sin esto " A01" y "A01"
 * serían dos códigos.
 */
const normalizarCompetencia = <T extends CompetenciaEntrada>(dto: T): T => ({
  ...dto,
  ...(dto.codigo !== undefined && { codigo: String(dto.codigo).trim() }),
  ...(dto.titulo !== undefined && { titulo: String(dto.titulo).trim() }),
  ...(dto.nombre !== undefined && { nombre: String(dto.nombre).trim() }),
  ...(dto.niveles && {
    niveles: dto.niveles.map((n) => ({
      ...n,
      items: n.items.map((i) => ({
        ...i,
        enunciado: String(i.enunciado ?? '').trim(),
      })),
    })),
  }),
});

/** Un número de nivel no se repite dentro de la competencia. */
const exigirNivelesUnicos = (niveles: { nivel: number }[] = []) => {
  const numeros = niveles.map((n) => Number(n.nivel));
  if (new Set(numeros).size !== numeros.length) {
    throw new BadRequestException('Hay niveles repetidos.');
  }
};

/** Lo que usa el Excel de la campaña de `EmpleadoService.avance`. */
export interface AvanceParaExcel {
  resumen: {
    trabajadores: number;
    porEstado: Record<string, number>;
    cumplimiento: number | null;
    items: {
      compTotal: number;
      compJefe: number;
      compAuto: number;
      objTotal: number;
      objHechas: number;
    };
  };
  trabajadores: {
    codigoEmpleado: string;
    documento?: string | null;
    nombres: string;
    apellidos: string;
    gerencia: string | null;
    area: string | null;
    unidad: string | null;
    puesto: string | null;
    jefe: string | null;
    competencias: { total: number; hechasJefe: number; hechasAuto: number };
    objetivos: { total: number; hechas: number };
    estadoAvance: string;
  }[];
}

@Injectable()
export class CompetenciaService {
  private readonly logger = new Logger(CompetenciaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Catálogo de competencias en Excel, con los mismos filtros que el listado.
   * Las hojas "Competencias" y "Comportamientos" son las de la plantilla de
   * importación, así que el archivo vuelve a entrar tal cual por
   * `POST /competencia/import`. "Asignaciones" dice qué nivel pide cada unidad
   * ocupacional, que no se veía en ningún reporte.
   */
  async exportCatalogoExcel(query: CompetenciaQueryDto) {
    try {
      const { data: competencias } = await this.findAll(
        { ...query, limit: 0 },
        { completo: true },
      );
      const ids = competencias.map((c) => c.idCompetencia);

      const asignaciones = ids.length
        ? await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
            where: {
              idCompetencia: { in: ids },
              unidadOcupacionalEmpleadora: { estado: true },
            },
            include: {
              competencia: { select: { codigo: true, titulo: true } },
              competenciaNivel: { select: { nivel: true } },
              unidadOcupacionalEmpleadora: {
                select: {
                  idUnidadOcupacionalEmpleadora: true,
                  descripcion: true,
                  empresaEmpleadora: { select: { nombreEmpresa: true } },
                  _count: {
                    select: { empleados: { where: { estado: true } } },
                  },
                },
              },
            },
            orderBy: [
              { idUnidadOcupacionalEmpleadora: 'asc' },
              { idCompetencia: 'asc' },
            ],
          })
        : [];

      // Se exporta desde el espacio de una empresa (el front manda la
      // activa): una columna «Empresa» repetiría el mismo nombre en cada
      // fila. Solo aparece si el archivo mezcla varias empresas.
      const variasEmpresas =
        !query.idEmpresaEmpleadora &&
        new Set(
          competencias.map(
            (c: { idEmpresaEmpleadora: number }) => c.idEmpresaEmpleadora,
          ),
        ).size > 1;
      const columnaEmpresa = variasEmpresas
        ? [{ header: 'Empresa', key: 'empresa', width: 28 }]
        : [];

      // Mismo formato que la plantilla de importación (dos hojas unidas por
      // el código), así el archivo vuelve a entrar tal cual.
      const comportamientos = competencias.flatMap((c: any) =>
        c.niveles.flatMap((n: any) =>
          n.items.map((i: any) => ({
            codigo: c.codigo,
            nivel: n.nivel,
            secuencial: i.secuencial,
            enunciado: i.enunciado,
          })),
        ),
      );

      return await construirLibroExcel([
        {
          nombre: 'Competencias',
          columnas: [
            {
              header: 'Código',
              key: 'codigo',
              tipo: 'texto',
              width: 14,
              breve: 'Único en la empresa',
            },
            {
              header: 'Título',
              key: 'titulo',
              width: 34,
              breve: 'Hasta 150 caracteres',
            },
            {
              header: 'Definición',
              key: 'nombre',
              width: 60,
              breve: 'Qué es la competencia',
            },
            ...columnaEmpresa,
          ],
          filas: competencias.map((c: any) => ({
            codigo: c.codigo,
            titulo: c.titulo,
            nombre: c.nombre,
            empresa: c.empresaEmpleadora?.nombreEmpresa,
          })),
        },
        {
          nombre: 'Comportamientos',
          columnas: [
            {
              header: 'Código',
              key: 'codigo',
              tipo: 'texto',
              width: 14,
              breve: 'El de la hoja «Competencias»',
            },
            { header: 'Nivel', key: 'nivel', width: 10, breve: 'De 1 a 10' },
            {
              header: 'Comportamiento',
              key: 'enunciado',
              width: 70,
              breve: 'Uno por fila',
            },
            { header: 'Orden', key: 'secuencial', width: 8 },
          ],
          filas: comportamientos,
        },
        {
          nombre: 'Asignaciones',
          columnas: [
            ...columnaEmpresa,
            { header: 'ID grupo ocupacional', key: 'idUnidad' },
            { header: 'Grupo ocupacional', key: 'unidad', width: 30 },
            { header: 'Trabajadores en el grupo', key: 'trabajadores' },
            { header: 'Código competencia', key: 'codigo', tipo: 'texto' },
            { header: 'Competencia', key: 'competencia', width: 28 },
            { header: 'Nivel requerido', key: 'nivel' },
          ],
          filas: asignaciones.map((a) => ({
            empresa:
              a.unidadOcupacionalEmpleadora.empresaEmpleadora.nombreEmpresa,
            idUnidad:
              a.unidadOcupacionalEmpleadora.idUnidadOcupacionalEmpleadora,
            unidad: a.unidadOcupacionalEmpleadora.descripcion,
            trabajadores: a.unidadOcupacionalEmpleadora._count.empleados,
            codigo: a.competencia.codigo,
            competencia: a.competencia.titulo,
            nivel: a.competenciaNivel.nivel,
          })),
        },
      ]);
    } catch (error) {
      handlePrismaError(error, 'competencia');
    }
  }

  /**
   * El código identifica la competencia en la empresa (importación,
   * reportes, hoja de asignaciones): no se repite. Compara sin mayúsculas.
   */
  private async exigirCodigoLibre(
    tx: Prisma.TransactionClient | PrismaService,
    idEmpresa: number,
    codigo: string,
    excluirId?: number,
  ) {
    const otra = await tx.competencia.findFirst({
      where: {
        estado: true,
        idEmpresaEmpleadora: idEmpresa,
        codigo: { equals: codigo, mode: 'insensitive' },
        ...(excluirId && { idCompetencia: { not: excluirId } }),
      },
      select: { titulo: true },
    });
    if (otra) {
      throw new ConflictException(
        `El código ${codigo} ya lo usa la competencia «${otra.titulo}» en esta empresa.`,
      );
    }
  }

  /**
   * Qué arrastra eliminar una competencia (no escribe): grupos ocupacionales
   * que la tienen asignada, cuántos trabajadores la tienen en su evaluación y
   * cuántas evaluaciones abiertas y notas se anularían.
   */
  /**
   * Qué pasaría con las evaluaciones EN CURSO si se guarda esta edición (no
   * escribe). Empareja los comportamientos con la misma regla que `update`
   * (por id; sin id, por texto idéntico) y, por cada nivel, cuenta:
   * evaluaciones abiertas, las completas que volverían a quedar pendientes
   * (se agrega un comportamiento) y las calificaciones que dejarían de contar
   * (se quita un comportamiento ya calificado). Los niveles que se quitan
   * estando asignados a un grupo se informan aparte: `update` los rechaza.
   * Antes se editaba en plena campaña sin saber nada de esto.
   */
  async impactoEdicion(id: number, entrada: UpdateCompetenciaDto) {
    const dto = normalizarCompetencia(entrada);
    const nivelesActuales = await this.prisma.competenciaNivel.findMany({
      where: { idCompetencia: id, estado: true },
      include: {
        items: {
          where: { estado: true },
          select: { idCompetenciaNivelItem: true, enunciado: true },
        },
      },
    });
    const enviados = dto.niveles ?? [];
    const numerosEnviados = new Set(enviados.map((n) => Number(n.nivel)));

    const nivelesBloqueados: { nivel: number; grupos: string[] }[] = [];
    for (const n of nivelesActuales.filter(
      (x) => !numerosEnviados.has(x.nivel),
    )) {
      const asignados =
        await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
          where: {
            idCompetenciaNivel: n.idCompetenciaNivel,
            unidadOcupacionalEmpleadora: { estado: true },
          },
          select: {
            unidadOcupacionalEmpleadora: { select: { descripcion: true } },
          },
        });
      if (asignados.length)
        nivelesBloqueados.push({
          nivel: n.nivel,
          grupos: asignados.map(
            (a) => a.unidadOcupacionalEmpleadora.descripcion,
          ),
        });
    }

    const porNivel: {
      nivel: number;
      agregados: number;
      quitados: number;
      reescritos: number;
      evaluacionesEnCurso: number;
      completasQueSeReabren: number;
      calificacionesQueDejanDeContar: number;
    }[] = [];

    for (const nivelDto of enviados) {
      const actual = nivelesActuales.find(
        (n) => n.nivel === Number(nivelDto.nivel),
      );
      if (!actual) continue; // nivel nuevo: nadie lo evalúa todavía
      const disponibles = new Map(
        actual.items.map((i) => [i.idCompetenciaNivelItem, i]),
      );
      const conservados = new Set<number>();
      let agregados = 0;
      let reescritos = 0;
      for (const item of nivelDto.items) {
        const idEnviado = item.idCompetenciaNivelItem
          ? Number(item.idCompetenciaNivelItem)
          : undefined;
        const par = idEnviado
          ? disponibles.get(idEnviado)
          : actual.items.find(
              (i) =>
                !conservados.has(i.idCompetenciaNivelItem) &&
                i.enunciado === item.enunciado,
            );
        if (!par) {
          agregados += 1;
          continue;
        }
        conservados.add(par.idCompetenciaNivelItem);
        if (par.enunciado !== item.enunciado) reescritos += 1;
      }
      const idsQuitados = actual.items
        .map((i) => i.idCompetenciaNivelItem)
        .filter((i) => !conservados.has(i));
      if (!agregados && !idsQuitados.length && !reescritos) continue;

      const abiertas = await this.prisma.evaluacionCompetencia.findMany({
        where: {
          idCompetenciaNivel: actual.idCompetenciaNivel,
          estado: true,
          estadoEvaluacion: 'PROCESO',
        },
        select: {
          itemsEvaluados: {
            where: { estado: true },
            select: { idCompetenciaNivelItem: true, calificacion: true },
          },
        },
      });
      const vigentes = new Set(
        actual.items.map((i) => i.idCompetenciaNivelItem),
      );
      const quitados = new Set(idsQuitados);
      let completas = 0;
      let notas = 0;
      for (const ev of abiertas) {
        const calificados = new Set(
          ev.itemsEvaluados
            .filter((i) => i.calificacion !== null)
            .map((i) => i.idCompetenciaNivelItem),
        );
        const completa =
          vigentes.size > 0 && [...vigentes].every((i) => calificados.has(i));
        if (completa && agregados > 0) completas += 1;
        notas += [...calificados].filter((i) => quitados.has(i)).length;
      }
      porNivel.push({
        nivel: actual.nivel,
        agregados,
        quitados: idsQuitados.length,
        reescritos,
        evaluacionesEnCurso: abiertas.length,
        completasQueSeReabren: completas,
        calificacionesQueDejanDeContar: notas,
      });
    }

    const total = (k: keyof (typeof porNivel)[number]) =>
      porNivel.reduce((t, n) => t + Number(n[k]), 0);
    const completasQueSeReabren = total('completasQueSeReabren');
    const calificacionesQueDejanDeContar = total(
      'calificacionesQueDejanDeContar',
    );
    return {
      porNivel,
      nivelesBloqueados,
      evaluacionesEnCurso: total('evaluacionesEnCurso'),
      completasQueSeReabren,
      calificacionesQueDejanDeContar,
      // Preguntar solo si alguien pierde algo: notas que dejan de contar o
      // evaluaciones terminadas que vuelven a quedar pendientes.
      requiereConfirmacion:
        completasQueSeReabren > 0 || calificacionesQueDejanDeContar > 0,
    };
  }

  async impactoEliminacion(id: number) {
    const asignaciones =
      await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
        where: {
          idCompetencia: id,
          unidadOcupacionalEmpleadora: { estado: true },
        },
        select: {
          unidadOcupacionalEmpleadora: {
            select: {
              descripcion: true,
              _count: { select: { empleados: { where: { estado: true } } } },
            },
          },
        },
      });
    const abiertas = await this.prisma.evaluacionCompetencia.findMany({
      where: { idCompetencia: id, estado: true, estadoEvaluacion: 'PROCESO' },
      select: {
        _count: {
          select: {
            itemsEvaluados: {
              where: { estado: true, calificacion: { not: null } },
            },
          },
        },
      },
    });
    return {
      grupos: asignaciones.map(
        (a) => a.unidadOcupacionalEmpleadora.descripcion,
      ),
      trabajadores: asignaciones.reduce(
        (t, a) => t + a.unidadOcupacionalEmpleadora._count.empleados,
        0,
      ),
      evaluacionesAbiertas: abiertas.length,
      notasPuestas: abiertas.reduce((t, e) => t + e._count.itemsEvaluados, 0),
    };
  }

  /**
   * Estadísticas de cada competencia de una empresa en la campaña en curso,
   * para la tabla del catálogo: a cuántos trabajadores les toca (activos o
   * suspendidos de los grupos donde está asignada), cuántos ya tienen nota y
   * el promedio. La nota es la oficial (`resultadoDeCompetencia`, la misma
   * del informe y la calibración), así que el promedio cuadra con los
   * reportes.
   */
  async estadisticasDeCatalogo(idEmpresaEmpleadora: number) {
    const [asignaciones, porUnidad, resultados] = await Promise.all([
      this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
        where: {
          unidadOcupacionalEmpleadora: { estado: true, idEmpresaEmpleadora },
          competencia: { estado: true, idEmpresaEmpleadora },
        },
        select: { idCompetencia: true, idUnidadOcupacionalEmpleadora: true },
      }),
      this.prisma.empleado.groupBy({
        by: ['idUnidadOcupacionalEmpleadora'],
        where: {
          idEmpresaEmpleadora,
          estado: true,
          situacion: { not: 'CESADO' },
        },
        _count: { _all: true },
      }),
      this.construirResultadosEmpresa(idEmpresaEmpleadora),
    ]);
    const trabajadoresDeUnidad = new Map(
      porUnidad.map((u) => [u.idUnidadOcupacionalEmpleadora, u._count._all]),
    );
    const trabajadores = new Map<number, number>();
    for (const a of asignaciones) {
      trabajadores.set(
        a.idCompetencia,
        (trabajadores.get(a.idCompetencia) ?? 0) +
          (trabajadoresDeUnidad.get(a.idUnidadOcupacionalEmpleadora) ?? 0),
      );
    }
    const escala = resultados.empresa?.tipoCalificacionCompetencia;
    const ids = new Set([
      ...trabajadores.keys(),
      ...resultados.notasPorCompetencia.keys(),
    ]);
    return {
      campana: resultados.campana
        ? { nombre: resultados.campana.nombre }
        : null,
      competencias: [...ids].map((idCompetencia) => {
        const notas = resultados.notasPorCompetencia.get(idCompetencia) ?? [];
        const media = notas.length ? redondear(promedio(notas), 1) : null;
        return {
          idCompetencia,
          trabajadores: trabajadores.get(idCompetencia) ?? 0,
          conNota: notas.length,
          promedio: media,
          nivel:
            media === null ? null : clasificarDesempeno(media, escala).nivel,
        };
      }),
    };
  }

  /**
   * Listado de competencias. Para la tabla (`completo` falso) no trae los
   * enunciados —solo se contaban—: trae los niveles, `totalComportamientos` y
   * `grupos` (los grupos ocupacionales donde está asignada). La exportación
   * pide `completo` para escribir cada enunciado.
   */
  async findAll(
    {
      page,
      limit,
      search,
      idCompetencia,
      codigo,
      titulo,
      nombreEmpresaEmpleadora,
      idEmpresaEmpleadora,
      ruc,
      sortBy,
      sortOrder,
    }: CompetenciaQueryDto,
    { completo = false }: { completo?: boolean } = {},
  ) {
    try {
      // Los filtros de empresa se arman juntos: si se escribieran como dos
      // spreads de `empresaEmpleadora`, el segundo pisaría al primero.
      const empresaFiltro: Prisma.EmpresaEmpleadoraWhereInput = {
        ...(nombreEmpresaEmpleadora && {
          nombreEmpresa: {
            contains: nombreEmpresaEmpleadora,
            mode: 'insensitive' as const,
          },
        }),
        ...(ruc && { ruc: { contains: ruc } }),
      };

      const where: Prisma.CompetenciaWhereInput = {
        estado: true,

        // La empresa del selector del front (columna directa, no por nombre).
        ...(idEmpresaEmpleadora && {
          idEmpresaEmpleadora: Number(idEmpresaEmpleadora),
        }),

        // ============ FILTROS POR COLUMNA (se combinan con AND) ============
        ...(idCompetencia && { idCompetencia: Number(idCompetencia) }),

        ...(codigo && {
          codigo: { contains: codigo, mode: 'insensitive' },
        }),

        ...(titulo && {
          titulo: { contains: titulo, mode: 'insensitive' },
        }),

        ...(Object.keys(empresaFiltro).length > 0 && {
          empresaEmpleadora: empresaFiltro,
        }),

        // ============ BÚSQUEDA GLOBAL ============
        ...(search && {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { titulo: { contains: search, mode: 'insensitive' } },
            { codigo: { contains: search, mode: 'insensitive' } },
            // Nombre y RUC van en ramas separadas: dentro de un mismo filtro
            // de relación, Prisma los combinaría con AND y nunca coincidirían.
            {
              empresaEmpleadora: {
                nombreEmpresa: { contains: search, mode: 'insensitive' },
              },
            },
            {
              empresaEmpleadora: { ruc: { contains: search } },
            },
          ],
        }),
      };

      const include: Prisma.CompetenciaInclude = {
        empresaEmpleadora: true,
        niveles: {
          where: { estado: true },
          orderBy: { nivel: 'asc' },
          include: completo
            ? {
                items: {
                  where: { estado: true },
                  orderBy: { secuencial: 'asc' },
                },
              }
            : { _count: { select: { items: { where: { estado: true } } } } },
        },
        ...(!completo && {
          unidadOcupacionalCompetenciaNivels: {
            where: { unidadOcupacionalEmpleadora: { estado: true } },
            select: {
              unidadOcupacionalEmpleadora: { select: { descripcion: true } },
            },
          },
        }),
      };
      const orderBy: Prisma.CompetenciaOrderByWithRelationInput[] = sortBy
        ? [
            { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' },
            { idCompetencia: 'asc' },
          ]
        : [{ fechaCreacion: 'desc' }];
      // Para la tabla: conteos y grupos en vez de los enunciados.
      const resumir = (lista: any[]) =>
        completo
          ? lista
          : lista.map(
              ({ niveles, unidadOcupacionalCompetenciaNivels, ...c }) => ({
                ...c,
                niveles: niveles.map((n: any) => ({
                  idCompetenciaNivel: n.idCompetenciaNivel,
                  nivel: n.nivel,
                  comportamientos: n._count.items,
                })),
                totalComportamientos: niveles.reduce(
                  (t: number, n: any) => t + n._count.items,
                  0,
                ),
                grupos: (unidadOcupacionalCompetenciaNivels ?? [])
                  .map((a: any) => a.unidadOcupacionalEmpleadora.descripcion)
                  .sort((a: string, b: string) => a.localeCompare(b)),
              }),
            );

      if (Number(limit) === 0) {
        const data = resumir(
          await this.prisma.competencia.findMany({ where, include, orderBy }),
        );

        return {
          data,
          meta: {
            total: data.length,
            page: 1,
            limit: 0,
            totalPages: 1,
          },
        };
      }

      const safeLimit = Math.min(Number(limit) || 10, 100);
      const safePage = Math.max(Number(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;

      const [total, filas] = await Promise.all([
        this.prisma.competencia.count({ where }),
        this.prisma.competencia.findMany({
          where,
          skip,
          take: safeLimit,
          include,
          orderBy,
        }),
      ]);
      const data = resumir(filas);

      return {
        data,
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      this.logger.error('Error al obtener los empleados:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                 GET ONE BY ID
  // ======================================================
  async findOne(id: number) {
    try {
      const competencia = await this.prisma.competencia.findFirst({
        where: { idCompetencia: id, estado: true },
        // Solo lo vigente: con los ítems retirados, el formulario de edición
        // los mostraba y al guardar volvían a entrar como nuevos.
        include: {
          niveles: {
            where: { estado: true },
            orderBy: { nivel: 'asc' },
            include: {
              items: {
                where: { estado: true },
                orderBy: { secuencial: 'asc' },
              },
            },
          },
        },
      });
      if (!competencia) {
        throw new NotFoundException(`Competencia con ID ${id} no encontrada.`);
      }
      return competencia;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error al obtener competencia con ID ${id}:`, error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                      UPDATE
  // ======================================================
  async update(id: number, user: AuthUser, entrada: UpdateCompetenciaDto) {
    const dto = normalizarCompetencia(entrada);
    const competencia = await this.prisma.competencia.findUnique({
      where: { idCompetencia: id, estado: true },
    });

    if (!competencia) throw new NotFoundException('Competencia no encontrada');

    if (dto.codigo !== undefined || dto.idEmpresaEmpleadora !== undefined) {
      await this.exigirCodigoLibre(
        this.prisma,
        Number(dto.idEmpresaEmpleadora ?? competencia.idEmpresaEmpleadora),
        dto.codigo ?? competencia.codigo,
        id,
      );
    }

    if (!dto.niveles || dto.niveles.length === 0) {
      throw new BadRequestException('niveles no puede estar vacío');
    }

    const niveles = dto.niveles;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const fechaModificacion = new Date();

        // 1. Actualizar solo los campos enviados.
        await tx.competencia.update({
          where: { idCompetencia: id },
          data: {
            ...(dto.nombre !== undefined && { nombre: dto.nombre }),
            ...(dto.titulo !== undefined && { titulo: dto.titulo }),
            ...(dto.codigo !== undefined && { codigo: dto.codigo }),
            ...(dto.idEmpresaEmpleadora !== undefined && {
              idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
            }),
            actualizadoPorId: user.idUsuario,
            fechaModificacion,
          },
        });

        // 2. No se eliminan niveles ni items: pueden estar referenciados por
        // evaluaciones históricas. Se mantienen sus IDs y se usa estado para
        // controlar qué estructura estará disponible para nuevas evaluaciones.
        const nivelesActuales = await tx.competenciaNivel.findMany({
          where: { idCompetencia: id },
          include: { items: { where: { estado: true } } },
        });

        const nivelesEnviados = new Set<number>(niveles.map((n) => n.nivel));
        if (nivelesEnviados.size !== niveles.length) {
          throw new BadRequestException('Hay niveles repetidos.');
        }

        // Quitar un nivel que alguna unidad ocupacional tiene asignado dejaba
        // a sus ocupantes evaluándose contra un nivel inactivo, y el Excel los
        // descartaba en silencio. Hay que reasignar la unidad primero.
        const nivelesQueSeRetiran = nivelesActuales.filter(
          (n) => n.estado && !nivelesEnviados.has(n.nivel),
        );
        if (nivelesQueSeRetiran.length) {
          const asignados = await tx.unidadOcupacionalCompetenciaNivel.findMany(
            {
              where: {
                idCompetenciaNivel: {
                  in: nivelesQueSeRetiran.map((n) => n.idCompetenciaNivel),
                },
                unidadOcupacionalEmpleadora: { estado: true },
              },
              select: {
                competenciaNivel: { select: { nivel: true } },
                unidadOcupacionalEmpleadora: { select: { descripcion: true } },
              },
            },
          );
          if (asignados.length) {
            const detalle = asignados
              .map(
                (a) =>
                  `nivel ${a.competenciaNivel.nivel} en "${a.unidadOcupacionalEmpleadora.descripcion}"`,
              )
              .join(', ');
            throw new BadRequestException(
              `No se puede quitar un nivel asignado a grupos ocupacionales (${detalle}). Reasigne esos grupos a otro nivel primero.`,
            );
          }
        }

        for (const nivelDto of niveles) {
          const nivelActual = nivelesActuales.find(
            (nivel) => nivel.nivel === nivelDto.nivel,
          );

          const nivel = nivelActual
            ? await tx.competenciaNivel.update({
                where: {
                  idCompetenciaNivel: nivelActual.idCompetenciaNivel,
                },
                data: {
                  estado: true,
                  actualizadoPorId: user.idUsuario,
                  fechaModificacion,
                },
              })
            : await tx.competenciaNivel.create({
                data: {
                  idCompetencia: id,
                  nivel: nivelDto.nivel,
                  creadoPorId: user.idUsuario,
                },
              });

          // Solo los ítems VIGENTES: con los retirados mezclados, el
          // emparejamiento podía reactivar uno viejo o duplicar el reemplazo.
          const itemsActuales = nivelActual?.items ?? [];
          const disponibles = new Map(
            itemsActuales.map((item) => [item.idCompetenciaNivelItem, item]),
          );
          const conservados = new Set<number>();

          // El ítem se identifica por su id, NO por su posición. Emparejando
          // por posición, borrar o reordenar un ítem intermedio hacía que los
          // siguientes "cambiaran de texto" y sus notas en PROCESO pasaran a un
          // enunciado que nadie calificó.
          // Sin id (clientes de la API que no lo mandan) solo se reconoce el
          // ítem si el texto es idéntico; si no, es un ítem nuevo.
          const emparejar = (itemDto: {
            idCompetenciaNivelItem?: number;
            enunciado: string;
          }) => {
            const idEnviado = itemDto.idCompetenciaNivelItem
              ? Number(itemDto.idCompetenciaNivelItem)
              : undefined;
            if (idEnviado) {
              if (conservados.has(idEnviado)) {
                throw new BadRequestException(
                  `El comportamiento ${idEnviado} del nivel ${nivelDto.nivel} está repetido.`,
                );
              }
              return disponibles.get(idEnviado);
            }
            return itemsActuales.find(
              (item) =>
                !conservados.has(item.idCompetenciaNivelItem) &&
                item.enunciado === itemDto.enunciado,
            );
          };

          for (const [index, itemDto] of nivelDto.items.entries()) {
            const secuencial = index + 1;
            const itemActual = emparejar(itemDto);

            if (!itemActual) {
              const creado = await tx.competenciaNivelItem.create({
                data: {
                  idCompetenciaNivel: nivel.idCompetenciaNivel,
                  enunciado: itemDto.enunciado,
                  secuencial,
                  creadoPorId: user.idUsuario,
                },
              });
              conservados.add(creado.idCompetenciaNivelItem);
              continue;
            }

            conservados.add(itemActual.idCompetenciaNivelItem);

            const cambiaTexto = itemActual.enunciado !== itemDto.enunciado;
            const itemTieneHistorial = cambiaTexto
              ? await tx.evaluacionCompetenciaItem.count({
                  where: {
                    idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
                  },
                })
              : 0;

            if (!cambiaTexto || itemTieneHistorial === 0) {
              await tx.competenciaNivelItem.update({
                where: {
                  idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
                },
                data: {
                  enunciado: itemDto.enunciado,
                  secuencial,
                  actualizadoPorId: user.idUsuario,
                  fechaModificacion,
                },
              });
              continue;
            }

            // Cambió el texto de un ítem ya calificado: se retira y nace un
            // reemplazo, para que las evaluaciones CERRADAS y ANULADAS sigan
            // apuntando al enunciado que realmente se calificó.
            await tx.competenciaNivelItem.update({
              where: {
                idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
              },
              data: {
                estado: false,
                actualizadoPorId: user.idUsuario,
                fechaModificacion,
              },
            });

            const reemplazo = await tx.competenciaNivelItem.create({
              data: {
                idCompetenciaNivel: nivel.idCompetenciaNivel,
                enunciado: itemDto.enunciado,
                secuencial,
                creadoPorId: user.idUsuario,
              },
            });
            conservados.add(reemplazo.idCompetenciaNivelItem);

            // Las evaluaciones que siguen en PROCESO tienen que apuntar al
            // ítem nuevo. Si se quedan con el que acabamos de dar de baja,
            // su avance ya no cierra nunca: el progreso solo cuenta ítems
            // vigentes del nivel, así que la evaluación queda congelada en
            // "0 de N" sin ninguna forma de terminarla desde la interfaz.
            // Se conserva la calificación y se actualiza el enunciado, que
            // es el texto que el evaluador está viendo ahora (es el MISMO
            // ítem, emparejado por id, con el texto corregido).
            //
            // Las CERRADAS y ANULADAS no se tocan a propósito: para eso
            // existe el snapshot `textoItemEvaluado`.
            await tx.evaluacionCompetenciaItem.updateMany({
              where: {
                idCompetenciaNivelItem: itemActual.idCompetenciaNivelItem,
                estado: true,
                evaluacion: {
                  estado: true,
                  estadoEvaluacion: 'PROCESO',
                },
              },
              data: {
                idCompetenciaNivelItem: reemplazo.idCompetenciaNivelItem,
                textoItemEvaluado: itemDto.enunciado,
                actualizadoPorId: user.idUsuario,
                fechaModificacion,
              },
            });
          }

          // Los vigentes que no llegaron en el formulario se retiran.
          await tx.competenciaNivelItem.updateMany({
            where: {
              idCompetenciaNivel: nivel.idCompetenciaNivel,
              estado: true,
              idCompetenciaNivelItem: { notIn: Array.from(conservados) },
            },
            data: {
              estado: false,
              actualizadoPorId: user.idUsuario,
              fechaModificacion,
            },
          });

          // Editar el nivel en plena campaña dejaba a las evaluaciones ya
          // abiertas con la lista de ítems vieja.
          await this.sincronizarItemsDeNivel(
            tx,
            user,
            nivel.idCompetenciaNivel,
          );
        }

        await tx.competenciaNivel.updateMany({
          where: {
            idCompetencia: id,
            nivel: { notIn: Array.from(nivelesEnviados) },
          },
          data: {
            estado: false,
            actualizadoPorId: user.idUsuario,
            fechaModificacion,
          },
        });

        // Misma forma que el listado (solo lo vigente, ordenado, con empresa):
        // el front reemplaza la fila con esto. Devolviendo todo, la tabla
        // mostraba ítems retirados y al volver a editar se reactivaban.
        return await tx.competencia.findUnique({
          where: { idCompetencia: id },
          include: {
            empresaEmpleadora: true,
            niveles: {
              where: { estado: true },
              orderBy: { nivel: 'asc' },
              include: {
                items: {
                  where: { estado: true },
                  orderBy: { secuencial: 'asc' },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                      DELETE
  // ======================================================
  async remove(user: AuthUser, id: number) {
    try {
      const competencia = await this.prisma.competencia.findFirst({
        where: { idCompetencia: id },
      });

      if (!competencia || !competencia.estado) {
        throw new NotFoundException(`Competencia con ID ${id} no encontrada.`);
      }

      // Dar de baja solo la competencia y sus niveles dejaba la eliminación a
      // medias: los ítems seguían activos, la asignación por unidad ocupacional
      // seguía en pie —así que la competencia borrada continuaba apareciendo
      // como pendiente para todo el que ocupara esa unidad— y las evaluaciones
      // abiertas seguían promediando en el Excel de resultados.
      return await this.prisma.$transaction(async (tx) => {
        const fechaModificacion = new Date();
        const auditoria = {
          actualizadoPorId: user.idUsuario,
          fechaModificacion,
        };

        const niveles = await tx.competenciaNivel.findMany({
          where: { idCompetencia: id },
          select: { idCompetenciaNivel: true },
        });

        await tx.competenciaNivelItem.updateMany({
          where: {
            idCompetenciaNivel: {
              in: niveles.map((n) => n.idCompetenciaNivel),
            },
          },
          data: { estado: false, ...auditoria },
        });

        await tx.competenciaNivel.updateMany({
          where: { idCompetencia: id },
          data: { estado: false, ...auditoria },
        });

        // Esta tabla no tiene soft delete, así que la asignación se borra.
        await tx.unidadOcupacionalCompetenciaNivel.deleteMany({
          where: { idCompetencia: id },
        });

        // Nadie puede terminar de calificar una competencia que ya no existe.
        await tx.evaluacionCompetencia.updateMany({
          where: {
            idCompetencia: id,
            estado: true,
            estadoEvaluacion: 'PROCESO',
          },
          data: { estadoEvaluacion: 'ANULADA', ...auditoria },
        });

        return await tx.competencia.update({
          where: { idCompetencia: id },
          data: { estado: false, ...auditoria },
        });
      });
    } catch (error) {
      this.logger.error(`Error al eliminar competencia con ID ${id}:`, error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //            CREATE CON NIVELES E ITEMS
  // ======================================================
  async createConDetalles(
    user: AuthUser,
    entrada: CreateCompetenciaNivelesItemsDto,
  ) {
    const dto = normalizarCompetencia(entrada);
    exigirNivelesUnicos(dto.niveles);
    await this.exigirCodigoLibre(
      this.prisma,
      Number(dto.idEmpresaEmpleadora),
      dto.codigo,
    );
    try {
      return await this.prisma.$transaction(async (tx) => {
        const nueva = await tx.competencia.create({
          data: {
            nombre: dto.nombre,
            titulo: dto.titulo,
            codigo: dto.codigo,
            idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
            creadoPorId: user.idUsuario,
            niveles: {
              create: dto.niveles.map((nivel) => ({
                nivel: nivel.nivel,
                creadoPorId: user.idUsuario,
                items: {
                  createMany: {
                    data: nivel.items.map((item, index) => ({
                      enunciado: item.enunciado,
                      secuencial: index + 1,
                      creadoPorId: user.idUsuario,
                    })),
                  },
                },
              })),
            },
          },
          include: {
            niveles: { include: { items: true } },
            empresaEmpleadora: true,
          },
        });

        return nueva;
      });
    } catch (error) {
      this.logger.error('Error creando competencia con niveles:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //       IMPORTAR MUCHAS COMPETENCIAS COMPLETAS
  // ======================================================
  /**
   * Importa competencias completas (ya agrupadas por código en el front).
   * Todo o nada: una con niveles repetidos o un código repetido en el archivo
   * frena la carga con el número de cada una (`[i] …`). Las que ya existen
   * en la empresa (mismo código) **se omiten**, como en la estructura: así el
   * Excel de «Exportar» se puede volver a subir sin duplicar el catálogo.
   */
  async importData(
    user: AuthUser,
    entrada: CreateCompetenciaNivelesItemsDto[],
  ) {
    const data = entrada.map((c) => normalizarCompetencia(c));
    const problemas: string[] = [];
    const vistos = new Map<string, number>();
    data.forEach((c, i) => {
      const numeros = c.niveles.map((n) => Number(n.nivel));
      if (new Set(numeros).size !== numeros.length)
        problemas.push(`[${i}] La competencia ${c.codigo} repite un nivel.`);
      const clave = `${c.idEmpresaEmpleadora}|${c.codigo.toLowerCase()}`;
      if (vistos.has(clave))
        problemas.push(
          `[${i}] El código ${c.codigo} se repite en el archivo con otro título.`,
        );
      else vistos.set(clave, i);
    });
    if (problemas.length) {
      throw new BadRequestException({
        message: 'Revise las competencias del archivo.',
        errors: problemas,
      });
    }

    const existentes = await this.prisma.competencia.findMany({
      where: {
        estado: true,
        idEmpresaEmpleadora: {
          in: [...new Set(data.map((c) => Number(c.idEmpresaEmpleadora)))],
        },
      },
      select: { codigo: true, idEmpresaEmpleadora: true },
    });
    const yaEstan = new Set(
      existentes.map(
        (e) => `${e.idEmpresaEmpleadora}|${e.codigo.trim().toLowerCase()}`,
      ),
    );
    // Las filas de ejemplo de la plantilla («… (Ejemplo)») no se importan.
    const nuevas = data.filter(
      (c) =>
        !/\(\s*ejemplo\s*\)\s*$/i.test(c.titulo ?? '') &&
        !yaEstan.has(`${c.idEmpresaEmpleadora}|${c.codigo.toLowerCase()}`),
    );

    try {
      const creadas = await this.prisma.$transaction(async (tx) => {
        const resultado: unknown[] = [];
        for (const row of nuevas) {
          resultado.push(
            await tx.competencia.create({
              data: {
                nombre: row.nombre,
                titulo: row.titulo,
                codigo: row.codigo,
                idEmpresaEmpleadora: row.idEmpresaEmpleadora,
                creadoPorId: user.idUsuario,
                niveles: {
                  create: row.niveles.map((nivel) => ({
                    nivel: nivel.nivel,
                    creadoPorId: user.idUsuario,
                    items: {
                      createMany: {
                        data: nivel.items.map((item, index) => ({
                          enunciado: item.enunciado,
                          secuencial: index + 1,
                          creadoPorId: user.idUsuario,
                        })),
                      },
                    },
                  })),
                },
              },
              select: { idCompetencia: true, codigo: true },
            }),
          );
        }
        return resultado;
      });
      return {
        count: creadas.length,
        omitidas: data.length - nuevas.length,
      };
    } catch (error) {
      this.logger.error('Error al importar competencias:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  async findAllByCompany(id: number) {
    try {
      const competencias = await this.prisma.competencia.findMany({
        where: { estado: true, idEmpresaEmpleadora: id },
        include: {
          niveles: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return competencias;
    } catch (error) {
      console.error('Error al obtener unidades ocupacionales:', error);
      handlePrismaError(error, 'competencia');
    }
  }

  // POST /evaluaciones/iniciar
  // GET /evaluaciones/:id
  // PUT /evaluaciones/:id
  // PATCH /evaluaciones/:id/cerrar
  // PATCH /evaluaciones/:id/anular

  // ======================================================
  //          SINCRONIZAR ÍTEMS DE EVALUACIONES ABIERTAS
  // ======================================================
  /**
   * Alinea las evaluaciones en PROCESO de un nivel con sus ítems vigentes.
   *
   * El enunciado se congela en `textoItemEvaluado` para que editar el catálogo
   * no reescriba evaluaciones antiguas, pero la lista de "lo que falta por
   * calificar" se arma contra los ítems vigentes del nivel. Cuando el nivel
   * gana o pierde un ítem en plena campaña, las evaluaciones ya abiertas se
   * quedan con la foto vieja y el avance deja de cuadrar: o piden calificar
   * algo que ya no existe, o nunca llegan al 100 % porque les falta un ítem
   * que nunca se les creó.
   *
   * Solo toca evaluaciones en PROCESO y nunca borra calificaciones puestas.
   */
  private async sincronizarItemsDeNivel(
    tx: Prisma.TransactionClient,
    user: AuthUser,
    idCompetenciaNivel: number,
  ) {
    const evaluaciones = await tx.evaluacionCompetencia.findMany({
      where: {
        idCompetenciaNivel,
        estado: true,
        estadoEvaluacion: 'PROCESO',
      },
      select: {
        idEvaluacionCompetencia: true,
        itemsEvaluados: {
          where: { estado: true },
          select: { idCompetenciaNivelItem: true },
        },
      },
    });

    if (evaluaciones.length === 0) return;

    const itemsVigentes = await tx.competenciaNivelItem.findMany({
      where: { idCompetenciaNivel, estado: true },
      select: { idCompetenciaNivelItem: true, enunciado: true },
      orderBy: { secuencial: 'asc' },
    });

    const idsEvaluaciones = evaluaciones.map((e) => e.idEvaluacionCompetencia);
    const idsVigentes = itemsVigentes.map((i) => i.idCompetenciaNivelItem);
    const fechaModificacion = new Date();

    // 1) Fuera lo que el nivel ya no tiene. Si el nivel se quedó sin ítems
    // vigentes no hay ninguno que conservar, y el filtro se omite en vez de
    // depender de cómo interpreta Prisma un `notIn` vacío.
    await tx.evaluacionCompetenciaItem.updateMany({
      where: {
        idEvaluacionCompetencia: { in: idsEvaluaciones },
        estado: true,
        ...(idsVigentes.length > 0 && {
          idCompetenciaNivelItem: { notIn: idsVigentes },
        }),
      },
      data: {
        estado: false,
        actualizadoPorId: user.idUsuario,
        fechaModificacion,
      },
    });

    // 2) Y dentro lo que se agregó después de abrir la evaluación.
    const faltantes = evaluaciones.flatMap((ev) => {
      const yaTiene = new Set(
        ev.itemsEvaluados.map((i) => i.idCompetenciaNivelItem),
      );

      return itemsVigentes
        .filter((item) => !yaTiene.has(item.idCompetenciaNivelItem))
        .map((item) => ({
          idEvaluacionCompetencia: ev.idEvaluacionCompetencia,
          idCompetenciaNivelItem: item.idCompetenciaNivelItem,
          textoItemEvaluado: item.enunciado,
          calificacion: null,
          creadoPorId: user.idUsuario,
        }));
    });

    if (faltantes.length > 0) {
      await tx.evaluacionCompetenciaItem.createMany({ data: faltantes });
    }
  }

  /**
   * Campañas de la empresa para los selectores (exportación, avance,
   * historial): la en curso primero, después las cerradas de la más reciente
   * a la más vieja.
   */
  async campanasDeEmpresa(idEmpresaEmpleadora: number) {
    const empresa = await this.prisma.empresaEmpleadora.findUnique({
      where: { idEmpresaEmpleadora },
      select: { idEmpresaEmpleadora: true },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    const campanas = await this.prisma.campanaEvaluacion.findMany({
      where: { idEmpresaEmpleadora },
      orderBy: [{ periodoDesde: 'desc' }],
      select: {
        idCampanaEvaluacion: true,
        nombre: true,
        estado: true,
        periodoDesde: true,
        periodoHasta: true,
        fechaCierre: true,
      },
    });

    // `estado` lo borra el PurgeResponseInterceptor: viaja como estadoCampana.
    const conEstado = campanas.map((c) => ({ ...c, estadoCampana: c.estado }));

    return {
      enCurso:
        campanas.find((c) => c.estado === CAMPANA_EN_CURSO)
          ?.idCampanaEvaluacion ?? null,
      campanas: [
        ...conEstado.filter((c) => c.estado === CAMPANA_EN_CURSO),
        ...conEstado.filter((c) => c.estado !== CAMPANA_EN_CURSO),
      ],
    };
  }

  /**
   * La campaña en curso de la empresa del evaluado: es la que separa una
   * ronda de evaluación de la siguiente en `EvaluacionCompetencia`.
   */
  private async campanaDeEvaluado(idEvaluado?: number | null) {
    if (!idEvaluado) return null;

    const empleado = await this.prisma.empleado.findFirst({
      where: { idEmpleado: idEvaluado },
      select: { idEmpresaEmpleadora: true },
    });
    return empleado
      ? campanaEnCurso(this.prisma, empleado.idEmpresaEmpleadora)
      : null;
  }

  /** Foto de la estructura que se guarda con cada evaluación nueva. */
  private async fotoDeEvaluacion(
    idEvaluado?: number | null,
    idEvaluador?: number | null,
  ) {
    const [evaluado, evaluador] = await Promise.all([
      idEvaluado
        ? this.prisma.empleado.findUnique({
            where: { idEmpleado: idEvaluado },
            select: {
              codigoEmpleado: true,
              codigoEmpleadoJefe: true,
              idUnidadOcupacionalEmpleadora: true,
              idPuestoEmpleadora: true,
              idAreaEmpleadora: true,
              idGerenciaEmpleadora: true,
            },
          })
        : null,
      idEvaluador
        ? this.prisma.empleado.findUnique({
            where: { idEmpleado: idEvaluador },
            select: { codigoEmpleado: true, codigoEmpleadoJefe: true },
          })
        : null,
    ]);

    const origen = origenDeEvaluacion({
      idEvaluado: idEvaluado ?? null,
      idEvaluador: idEvaluador ?? null,
      codigoEvaluado: evaluado?.codigoEmpleado,
      codigoEvaluador: evaluador?.codigoEmpleado,
      codigoEmpleadoJefe: evaluado?.codigoEmpleadoJefe,
      codigoJefeDelEvaluador: evaluador?.codigoEmpleadoJefe,
    });

    return {
      tipoEvaluador: TIPO_POR_ORIGEN[origen],
      codigoJefeEvaluado: evaluado?.codigoEmpleadoJefe ?? null,
      idUnidadEvaluado: evaluado?.idUnidadOcupacionalEmpleadora ?? null,
      idPuestoEvaluado: evaluado?.idPuestoEmpleadora ?? null,
      idAreaEvaluado: evaluado?.idAreaEmpleadora ?? null,
      idGerenciaEvaluado: evaluado?.idGerenciaEmpleadora ?? null,
    };
  }

  // ======================================================
  //                  INICIAR EVALUACIÓN
  // ======================================================
  async iniciarEvaluacion(user: AuthUser, dto: IniciarEvaluacionDto) {
    const { idEvaluado, idEvaluador, idCompetencia, idCompetenciaNivel } = dto;

    try {
      const campana = await this.campanaDeEvaluado(idEvaluado);
      if (!campana) {
        throw new BadRequestException(
          'La empresa no tiene una campaña de evaluación en curso.',
        );
      }

      // 1) Buscar una evaluación en PROCESO **de esta campaña**.
      //
      // Antes se buscaba sin campaña: al abrir la siguiente aparecía la
      // evaluación anterior y el evaluador terminaba sobrescribiendo sus
      // calificaciones.
      let evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
        where: {
          idEvaluado,
          idEvaluador,
          idCompetencia,
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          estadoEvaluacion: 'PROCESO',
          estado: true,
        },
        include: {
          itemsEvaluados: {
            // Sin este filtro volverían los ítems dados de baja al
            // sincronizar el nivel, y la pantalla los pintaría como
            // filas por calificar.
            where: { estado: true },
            include: { item: true },
            orderBy: { idEvaluacionCompetenciaItem: 'asc' },
          },
        },
      });

      if (evaluacion) {
        // El nivel asignado a la unidad ocupacional puede haber cambiado desde
        // que se abrió. Reutilizar la evaluación del nivel viejo mezclaría dos
        // niveles en el mismo periodo, así que se anula y se abre una nueva.
        if (evaluacion.idCompetenciaNivel !== idCompetenciaNivel) {
          await this.prisma.evaluacionCompetencia.update({
            where: {
              idEvaluacionCompetencia: evaluacion.idEvaluacionCompetencia,
            },
            data: {
              estadoEvaluacion: 'ANULADA',
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        } else {
          const idNivel = evaluacion.idCompetenciaNivel;

          await this.prisma.$transaction((tx) =>
            this.sincronizarItemsDeNivel(tx, user, idNivel),
          );

          return this.obtenerEvaluacion(evaluacion.idEvaluacionCompetencia);
        }
      }

      // 2) Validar que el nivel pertenece a la competencia
      const nivel = await this.prisma.competenciaNivel.findFirst({
        where: {
          idCompetenciaNivel,
          idCompetencia,
          estado: true,
        },
        include: { items: true },
      });

      if (!nivel) {
        throw new BadRequestException('Nivel de competencia no válido.');
      }

      // 3) Crear la evaluación, con la foto de la estructura de hoy: quién
      // evalúa (jefe, auto, subordinado) y dónde estaba el evaluado. Si
      // mañana cambia su jefe o su unidad, esta evaluación sigue contando
      // como lo que fue.
      const foto = await this.fotoDeEvaluacion(idEvaluado, idEvaluador);
      // No se abre una evaluación que no va a contar. "OTRO" (un compañero o
      // alguien sin vínculo) no puntúa en ningún modelo, y la de un
      // subordinado solo existe en 180°. Antes se podían crear igual —por
      // URL o desde administración— y quien las llenaba trabajaba en balde.
      if (foto.tipoEvaluador === TIPO_POR_ORIGEN.otro) {
        throw new BadRequestException(
          'Solo puede evaluarse a sí mismo, a un subordinado o a su jefe inmediato.',
        );
      }
      if (
        foto.tipoEvaluador === TIPO_POR_ORIGEN.subordinado &&
        campana.modeloEmpresa !== '180'
      ) {
        throw new BadRequestException(
          'En el modelo de 90° los subordinados no evalúan a su jefe.',
        );
      }

      evaluacion = await this.prisma.evaluacionCompetencia.create({
        data: {
          idEvaluado,
          idEvaluador,
          idCompetencia,
          idCompetenciaNivel,
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          // Heredado: solo las campañas migradas tienen "YYYY-MM".
          periodoEvaluacion: campana.periodoEvaluacion,
          ...foto,
          estadoEvaluacion: 'PROCESO',
          creadoPorId: user.idUsuario,
        },
        // El include mantiene el tipo de `evaluacion` igual al de la búsqueda
        // de arriba; recién creada no tiene ítems todavía.
        include: {
          itemsEvaluados: {
            where: { estado: true },
            include: { item: true },
            orderBy: { idEvaluacionCompetenciaItem: 'asc' },
          },
        },
      });

      // 4) Crear ítems evaluados con snapshot
      await this.prisma.evaluacionCompetenciaItem.createMany({
        // data: nivel.items.map((it) => ({
        //   idEvaluacionCompetencia: evaluacion.idEvaluacionCompetencia,
        //   idCompetenciaNivelItem: it.idCompetenciaNivelItem,
        //   textoItemEvaluado: it.enunciado,
        //   calificacion: null,
        //   creadoPorId: user.idUsuario,
        // })),
        data: nivel.items
          .filter((it) => it.estado === true) // 👈 FILTRO AQUÍ
          .map((it) => ({
            idEvaluacionCompetencia: evaluacion.idEvaluacionCompetencia,
            idCompetenciaNivelItem: it.idCompetenciaNivelItem,
            textoItemEvaluado: it.enunciado,
            calificacion: null,
            creadoPorId: user.idUsuario,
          })),
      });

      return this.obtenerEvaluacion(evaluacion.idEvaluacionCompetencia);
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                OBTENER EVALUACIÓN COMPLETA
  // ======================================================
  async obtenerEvaluacion(id: number) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: id, estado: true },
      include: {
        evaluado: true,
        evaluador: true,
        competencia: true,
        nivel: true,
        itemsEvaluados: {
          // Sin este filtro volverían los ítems dados de baja al
          // sincronizar el nivel, y la pantalla los pintaría como
          // filas por calificar.
          where: { estado: true },
          include: { item: true },
          orderBy: { idEvaluacionCompetenciaItem: 'asc' },
        },
      },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    return evaluacion;
  }

  // ======================================================
  //                ACTUALIZAR EVALUACIÓN
  // ======================================================
  async actualizarEvaluacion(
    user: AuthUser,
    idEvaluacion: number,
    dto: UpdateEvaluacionDto,
  ) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: idEvaluacion, estado: true },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    if (evaluacion.estadoEvaluacion !== 'PROCESO') {
      throw new BadRequestException(
        'La evaluación está cerrada y no puede ser modificada.',
      );
    }

    // La escala la fija la empresa del evaluado, y hasta ahora nadie la
    // comprobaba: por la API entraban un 9999 o un -500 y se guardaban tal
    // cual, arrastrando el promedio de la competencia entera.
    // La escala es la de la campaña de la evaluación, no la actual de la
    // empresa.
    const campanaDeLaEvaluacion = evaluacion.idCampanaEvaluacion
      ? await this.prisma.campanaEvaluacion.findUnique({
          where: { idCampanaEvaluacion: evaluacion.idCampanaEvaluacion },
          select: { tipoCalificacionCompetencia: true },
        })
      : null;

    const tipoCalificacion = campanaDeLaEvaluacion?.tipoCalificacionCompetencia;

    const fueraDeEscala = (dto.items ?? []).filter(
      (i) => !calificacionValida(i.calificacion, tipoCalificacion),
    );

    if (fueraDeEscala.length > 0) {
      throw new BadRequestException(
        tipoCalificacion === 'LIKERT'
          ? `Con la escala LIKERT la calificación solo puede ser ${OPCIONES_LIKERT.join(', ')}.`
          : `La calificación debe estar entre 0 y ${CALIFICACION_MAXIMA_MANUAL}.`,
      );
    }

    // Los ítems llegan identificados por su id suelto, sin nada que los ate a
    // la evaluación de la URL: mandando ids ajenos se calificaba la evaluación
    // de cualquier otro trabajador.
    const items = dto.items ?? [];
    const idsEnviados = new Set(
      items.map((it) => it.idEvaluacionCompetenciaItem),
    );

    if (idsEnviados.size > 0) {
      const propios = await this.prisma.evaluacionCompetenciaItem.count({
        where: {
          idEvaluacionCompetenciaItem: { in: [...idsEnviados] },
          idEvaluacionCompetencia: idEvaluacion,
        },
      });

      if (propios !== idsEnviados.size) {
        throw new BadRequestException(
          'Alguno de los comportamientos enviados no pertenece a esta evaluación.',
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) Actualizar comentario general si existe
        if (dto.comentarioGeneral !== undefined) {
          await tx.evaluacionCompetencia.update({
            where: { idEvaluacionCompetencia: idEvaluacion },
            data: {
              comentarioGeneral: dto.comentarioGeneral,
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        }

        // 2) Actualizar calificación por ítem.
        //
        // `updateMany` con la evaluación en el `where` en vez de `update` por
        // id: así el ítem no se puede calificar desde otra evaluación ni
        // revivir uno dado de baja porque el nivel cambió mientras la pantalla
        // estaba abierta. Lo que ya no está vigente simplemente no se escribe.
        for (const it of items) {
          await tx.evaluacionCompetenciaItem.updateMany({
            where: {
              idEvaluacionCompetenciaItem: it.idEvaluacionCompetenciaItem,
              idEvaluacionCompetencia: idEvaluacion,
              estado: true,
            },
            data: {
              calificacion: it.calificacion,
              actualizadoPorId: user.idUsuario,
              fechaModificacion: new Date(),
            },
          });
        }

        // ✅ 3) DEVOLVER DATOS ACTUALIZADOS USANDO TX
        return await tx.evaluacionCompetencia.findFirst({
          where: { idEvaluacionCompetencia: idEvaluacion, estado: true },
          include: {
            evaluado: true,
            evaluador: true,
            competencia: true,
            nivel: true,
            itemsEvaluados: {
              // Sin este filtro volverían los ítems dados de baja al
              // sincronizar el nivel, y la pantalla los pintaría como
              // filas por calificar.
              where: { estado: true },
              include: { item: true },
              orderBy: { idEvaluacionCompetenciaItem: 'asc' },
            },
          },
        });
      });
    } catch (error) {
      console.error(error);
      handlePrismaError(error, 'competencia');
    }
  }

  // ======================================================
  //                    CERRAR EVALUACIÓN
  // ======================================================
  async cerrarEvaluacion(id: number, user: AuthUser) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: id, estado: true },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    if (evaluacion.estadoEvaluacion === 'CERRADA') {
      throw new BadRequestException('La evaluación ya está cerrada.');
    }

    return await this.prisma.evaluacionCompetencia.update({
      where: { idEvaluacionCompetencia: id },
      data: {
        estadoEvaluacion: 'CERRADA',
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
  }

  // ======================================================
  //                    ANULAR EVALUACIÓN
  // ======================================================
  async anularEvaluacion(id: number, user: AuthUser) {
    const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
      where: { idEvaluacionCompetencia: id, estado: true },
    });

    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada.');

    return await this.prisma.evaluacionCompetencia.update({
      where: { idEvaluacionCompetencia: id },
      data: {
        estadoEvaluacion: 'ANULADA',
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
  }

  async empleadosEvaluadosPorEmpresa(idEmpresaEmpleadora: number) {
    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        estado: true,
        // Solo la campaña en curso: antes mezclaba todas. Las anuladas sí
        // entran, porque el panel las cuenta aparte.
        campana: { estado: CAMPANA_EN_CURSO },
        idEvaluado: { not: null },
        evaluado: {
          idEmpresaEmpleadora,
          estado: true,
        },
      },
      include: {
        evaluado: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
          },
        },
        evaluador: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
          },
        },
        competencia: {
          select: {
            idCompetencia: true,
            nombre: true,
          },
        },
        nivel: {
          select: {
            idCompetenciaNivel: true,
            nivel: true,
          },
        },
        itemsEvaluados: {
          // Los ítems dados de baja (porque el nivel cambió durante la
          // campaña) inflaban el total y la evaluación no llegaba nunca a
          // aparecer como completa.
          where: { estado: true },
          select: {
            calificacion: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    // ======================================================
    // AGRUPACIÓN
    // ======================================================
    const empleadosMap = new Map<number, any>();

    for (const ev of evaluaciones) {
      // Skip if evaluado is null
      if (!ev.evaluado) continue;

      const totalItems = ev.itemsEvaluados.length;
      // `null` es SIN CALIFICAR; 0 es una calificación real. El criterio
      // anterior (`> 0`) contaba un 0 como pendiente.
      const itemsCalificados = ev.itemsEvaluados.filter(
        (i) => i.calificacion !== null,
      ).length;

      // "Calificada" es la evaluación completa, no la que tiene un ítem
      // suelto: con el criterio anterior bastaba una nota para que la pantalla
      // la diera por terminada. Es el mismo criterio que el indicador de
      // avance del jefe.
      const nivelCalificado = totalItems > 0 && itemsCalificados === totalItems;

      // Tipo de evaluador
      let tipoEvaluador = 'SIN EVALUADOR';
      if (ev.idEvaluador && ev.idEvaluador === ev.idEvaluado) {
        tipoEvaluador = 'AUTOEVALUACIÓN';
      } else if (ev.idEvaluador) {
        tipoEvaluador = 'EVALUADOR';
      }

      // ==============================
      // ESTRUCTURAS BASE
      // ==============================
      if (!empleadosMap.has(ev.evaluado.idEmpleado)) {
        empleadosMap.set(ev.evaluado.idEmpleado, {
          evaluado: ev.evaluado,
          evaluacionesPorEvaluador: new Map<number, any>(),
        });
      }

      const empleado = empleadosMap.get(ev.evaluado.idEmpleado);

      const evaluadorId = ev.evaluador?.idEmpleado ?? 0;

      if (!empleado.evaluacionesPorEvaluador.has(evaluadorId)) {
        empleado.evaluacionesPorEvaluador.set(evaluadorId, {
          evaluador: ev.evaluador
            ? { ...ev.evaluador, tipo: tipoEvaluador }
            : null,
          niveles: new Map<number, any>(),
        });
      }

      const evaluador = empleado.evaluacionesPorEvaluador.get(evaluadorId);

      const nivelId = ev.nivel.idCompetenciaNivel;

      if (!evaluador.niveles.has(nivelId)) {
        evaluador.niveles.set(nivelId, {
          nivel: ev.nivel,
          evaluaciones: [],
        });
      }

      evaluador.niveles.get(nivelId).evaluaciones.push({
        evaluacionId: ev.idEvaluacionCompetencia,
        competencia: ev.competencia,
        nivelCalificado,
        detalleCalificacion: {
          totalItems,
          itemsCalificados,
          itemsSinCalificar: totalItems - itemsCalificados,
        },
        estadoEvaluacion: ev.estadoEvaluacion,
        fechaEvaluacion: ev.fechaCreacion,
      });
    }

    // ======================================================
    // NORMALIZAR MAPS A ARRAYS
    // ======================================================
    const empleados = Array.from(empleadosMap.values()).map((emp) => ({
      evaluado: emp.evaluado,
      evaluacionesPorEvaluador: Array.from(
        emp.evaluacionesPorEvaluador.values(),
      ).map((ev: { evaluador: any; niveles: Map<number, any> }) => ({
        evaluador: ev.evaluador,
        niveles: Array.from(ev.niveles.values()),
      })),
    }));

    return {
      totalEmpleadosEvaluados: empleados.length,
      empleados,
    };
  }

  // TODO: Metodos para obtener resultados finales por empleado (promedios ponderados) y exportar a Excel/PDF
  // ===============================
  // 🔹 UTILIDAD DE REDONDEO GLOBAL
  // ===============================
  private round(num: number, decimals = 2): number {
    return redondear(num, decimals);
  }

  // ===============================
  // 🔹 CÁLCULO DE RESULTADOS
  // ===============================
  /**
   * Conservado como puerta de entrada del Excel; la regla vive en
   * `src/common/resultados`, que es de donde la lee también el PDF individual.
   */
  public calcularResultadosEmpleadoDesdeAgrupado(
    empresa: ConfiguracionEmpresa,
    emp: NotasDeEvaluado,
  ) {
    return calcularResultados(empresa, emp);
  }

  /**
   * Filtro sobre el empleado que comparten los tres reportes Excel.
   *
   * Se aplica a la relación (`evaluado` en competencias, `empleado` en
   * objetivos), así que se devuelve suelto para incrustarlo donde toque.
   */
  private filtroEmpleadoExport(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
  ): Prisma.EmpleadoWhereInput {
    const search = filtros.search?.trim();

    return {
      idEmpresaEmpleadora,
      estado: true,
      ...(filtros.idGerenciaEmpleadora && {
        idGerenciaEmpleadora: Number(filtros.idGerenciaEmpleadora),
      }),
      ...(filtros.idAreaEmpleadora && {
        idAreaEmpleadora: Number(filtros.idAreaEmpleadora),
      }),
      ...(filtros.idUnidadOcupacionalEmpleadora && {
        idUnidadOcupacionalEmpleadora: Number(
          filtros.idUnidadOcupacionalEmpleadora,
        ),
      }),
      ...(filtros.idPuestoEmpleadora && {
        idPuestoEmpleadora: Number(filtros.idPuestoEmpleadora),
      }),
      ...(filtros.codigoJefe?.trim() && {
        codigoEmpleadoJefe: filtros.codigoJefe.trim(),
      }),
      ...(search && {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { codigoEmpleado: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
  }

  /**
   * El Excel de una campaña, un libro con una hoja por tema: «Resumen»
   * (la campaña y sus cifras), «Avance» (solo la en curso: qué le falta a
   * cada trabajador), «Resultados», «Competencias» y «Objetivos». Las tres
   * últimas son las mismas de los reportes sueltos, con los mismos filtros.
   * `avance` lo arma `EmpleadoService.avance` con los filtros de la pantalla.
   */
  async exportarCampanaExcel(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto,
    avance: AvanceParaExcel | null,
  ) {
    const libro = new ExcelJS.Workbook();
    libro.creator = 'TeamWork';
    // Las hojas salen en el orden en que se crean: el resumen primero.
    const hojaResumen = libro.addWorksheet('Resumen');
    const hojaAvance = avance ? libro.addWorksheet('Avance') : null;
    const { filas, campana, empresa } = await this.construirResultadosEmpresa(
      idEmpresaEmpleadora,
      filtros,
      libro,
    );
    await this.exportarCompetenciasPorEmpresaExcel(
      idEmpresaEmpleadora,
      filtros,
      libro,
    );
    await this.exportarObjetivosPorEmpresaExcel(
      idEmpresaEmpleadora,
      filtros,
      libro,
    );

    // ── Resumen: dos columnas, dato y valor, en bloques con subtítulo.
    hojaResumen.columns = [
      { header: 'Dato', key: 'dato', width: 38 },
      { header: 'Valor', key: 'valor', width: 52 },
    ];
    const fecha = (d?: Date | null) =>
      d ? new Date(d).toLocaleDateString('es-PE', { timeZone: 'UTC' }) : '—';
    const bloque = (titulo: string, datos: [string, string | number][]) => {
      const t = hojaResumen.addRow({ dato: titulo });
      t.font = { bold: true, size: 12 };
      t.getCell(1).border = {
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
      for (const [dato, valor] of datos) hojaResumen.addRow({ dato, valor });
      hojaResumen.addRow({});
    };
    const c = campana as (typeof campana & Record<string, unknown>) | null;
    bloque('Campaña', [
      ['Empresa', empresa.nombreEmpresa],
      ['Campaña', c?.nombre ?? '—'],
      ['Estado', c?.estado === CAMPANA_CERRADA ? 'Cerrada' : 'En curso'],
      [
        'Periodo evaluado',
        `${fecha(c?.periodoDesde as Date)} – ${fecha(c?.periodoHasta as Date)}`,
      ],
      [
        'Calificación',
        `${fecha(empresa.fechaVigenciaInicio)} – ${fecha(empresa.fechaVigenciaFin)}`,
      ],
      ['Modelo', `${empresa.modeloEmpresa}°`],
      ['Peso de competencias', `${empresa.porcentajeCompetecias ?? 80} %`],
      ['Peso de objetivos', `${empresa.porcentajeObjetivos ?? 20} %`],
      [
        'Generado el',
        new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
      ],
    ]);
    const filtrosTexto = [
      filtros.idGerenciaEmpleadora && 'gerencia',
      filtros.idAreaEmpleadora && 'área',
      filtros.idUnidadOcupacionalEmpleadora && 'grupo ocupacional',
      filtros.idPuestoEmpleadora && 'puesto',
      filtros.codigoJefe && 'equipo de un jefe',
      filtros.search && `búsqueda «${filtros.search}»`,
    ].filter(Boolean);
    if (filtrosTexto.length)
      bloque('Filtros aplicados', [['Recortado por', filtrosTexto.join(', ')]]);
    if (avance) {
      const r = avance.resumen;
      const pct = (n: number | null) => (n === null ? '—' : `${n} %`);
      bloque('Avance', [
        ['Trabajadores', r.trabajadores],
        ['Completos', r.porEstado.COMPLETO],
        ['En curso', r.porEstado.EN_CURSO],
        ['Sin iniciar', r.porEstado.SIN_INICIAR],
        ['Sin asignación', r.porEstado.SIN_ASIGNACION],
        ['Cumplimiento (lo que puntúa)', pct(r.cumplimiento)],
        [
          'Competencias calificadas por el jefe',
          `${r.items.compJefe} de ${r.items.compTotal}`,
        ],
        [
          'Objetivos calificados',
          `${r.items.objHechas} de ${r.items.objTotal}`,
        ],
        [
          'Autoevaluación (no puntúa)',
          `${r.items.compAuto} de ${r.items.compTotal}`,
        ],
      ]);
    }
    const evaluados = filas.filter((f) => !f.resultado.sinEvaluar);
    const porNivel = new Map<string, number>();
    for (const f of evaluados) {
      const n = clasificarResultadoFinal(f.resultado.final).nivel;
      porNivel.set(n, (porNivel.get(n) ?? 0) + 1);
    }
    bloque('Resultados finales', [
      ['Evaluados', evaluados.length],
      ['Sin evaluar', filas.length - evaluados.length],
      ['Calibrados', filas.filter((f) => f.ajuste).length],
      ...[
        'Sobresaliente',
        'Altamente Efectivo',
        'Efectivo',
        'Parcialmente Efectivo',
        'Necesita Mejora',
      ].map((n): [string, string] => {
        const k = porNivel.get(n) ?? 0;
        return [
          n,
          `${k}${evaluados.length ? ` (${Math.round((k / evaluados.length) * 1000) / 10} %)` : ''}`,
        ];
      }),
    ]);
    // Sin autofiltro: es una ficha, no una tabla.
    aplicarCabecera(hojaResumen, [], { autofiltro: false });

    // ── Avance: una fila por trabajador, con lo que le falta.
    if (hojaAvance && avance) {
      const ESTADO: Record<string, string> = {
        COMPLETO: 'Completo',
        EN_CURSO: 'En curso',
        SIN_INICIAR: 'Sin iniciar',
        SIN_ASIGNACION: 'Sin asignación',
      };
      hojaAvance.columns = [
        { header: 'Código', key: 'codigo', width: 12 },
        { header: 'Documento', key: 'documento', width: 13 },
        { header: 'Trabajador', key: 'nombre', width: 34 },
        { header: 'Gerencia', key: 'gerencia', width: 28 },
        { header: 'Área', key: 'area', width: 28 },
        { header: 'Grupo ocupacional', key: 'grupo', width: 22 },
        { header: 'Puesto', key: 'puesto', width: 28 },
        { header: 'Jefe', key: 'jefe', width: 32 },
        { header: 'Competencias asignadas', key: 'compTotal', width: 14 },
        { header: 'Calificadas por el jefe', key: 'compJefe', width: 14 },
        { header: 'Autoevaluadas', key: 'compAuto', width: 14 },
        { header: 'Objetivos', key: 'objTotal', width: 13 },
        { header: 'Objetivos calificados', key: 'objHechas', width: 13 },
        { header: 'Estado', key: 'estado', width: 15 },
      ];
      for (const t of avance.trabajadores) {
        const fila = hojaAvance.addRow({
          codigo: t.codigoEmpleado,
          documento: t.documento ?? '',
          nombre: `${t.nombres} ${t.apellidos}`.trim(),
          gerencia: t.gerencia ?? '',
          area: t.area ?? '',
          grupo: t.unidad ?? '',
          puesto: t.puesto ?? '',
          jefe: t.jefe ?? 'Sin jefe',
          compTotal: t.competencias.total,
          compJefe: t.competencias.hechasJefe,
          compAuto: t.competencias.hechasAuto,
          objTotal: t.objetivos.total,
          objHechas: t.objetivos.hechas,
          estado: ESTADO[t.estadoAvance] ?? t.estadoAvance,
        });
        // Texto: como número pierden los ceros a la izquierda.
        fila.getCell('codigo').numFmt = '@';
        fila.getCell('documento').numFmt = '@';
      }
      aplicarCabecera(hojaAvance, [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'Las de su grupo',
        'Puntúan',
        'No puntúa',
        'Puntúan',
        undefined,
      ]);
    }

    return libro;
  }

  // TODO: Resultados COMPETENCIAS + OBJETIVOS
  /** Excel de resultados de la empresa (con la calibración aplicada). */
  async exportarResultadosEmpresaExcel(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
  ) {
    return (await this.construirResultadosEmpresa(idEmpresaEmpleadora, filtros))
      .workbook;
  }

  /**
   * Resultados de cada trabajador de la campaña, el MISMO cálculo que el
   * Excel: lo usa la calibración para que su pantalla, el Excel y el PDF den
   * la misma cifra.
   */
  async resultadosDeEmpresa(
    idEmpresaEmpleadora: number,
    idCampanaEvaluacion?: number,
  ) {
    const { filas, campana, empresa } = await this.construirResultadosEmpresa(
      idEmpresaEmpleadora,
      { idCampanaEvaluacion } as ExportEmpresaQueryDto,
    );
    return { filas, campana, empresa };
  }

  private async construirResultadosEmpresa(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
    /** Libro al que agregar la hoja (el Excel de la campaña); si no, uno nuevo. */
    libro?: ExcelJS.Workbook,
  ) {
    const empresaBase = await this.prisma.empresaEmpleadora.findFirst({
      where: {
        idEmpresaEmpleadora,
        estado: true,
      },
    });

    if (!empresaBase) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // La campaña pedida o la en curso. Se calcula con SU configuración: una
    // cerrada conserva la que tenía, aunque la de la empresa haya cambiado.
    const campana = await resolverCampana(
      this.prisma,
      idEmpresaEmpleadora,
      filtros.idCampanaEvaluacion,
    );
    const empresa = { ...empresaBase, ...(campana ?? {}) };
    const campanaCerrada = campana?.estado === CAMPANA_CERRADA;

    // ===============================
    // 1️⃣ OBTENER DATA
    // ===============================
    const whereEmpleado = this.filtroEmpleadoExport(
      idEmpresaEmpleadora,
      filtros,
    );

    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        ...filtroEvaluacionesDeCampana(campana?.idCampanaEvaluacion),
        evaluado: whereEmpleado,
      },
      include: {
        evaluado: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
            codigoEmpleadoJefe: true,
            idUnidadOcupacionalEmpleadora: true,
          },
        },
        evaluador: {
          select: {
            idEmpleado: true,
            codigoEmpleado: true,
            codigoEmpleadoJefe: true,
          },
        },
        itemsEvaluados: {
          where: { estado: true },
          select: { calificacion: true },
        },
      },
    });

    // Misma campaña que las evaluaciones: los objetivos de otra no entran.
    const objetivos = await this.prisma.objetivo.findMany({
      where: {
        estado: true,
        idCampanaEvaluacion: campana?.idCampanaEvaluacion ?? -1,
        empleado: whereEmpleado,
      },
      include: {
        empleado: {
          select: {
            idEmpleado: true,
            nombres: true,
            apellidos: true,
            codigoEmpleado: true,
            idUnidadOcupacionalEmpleadora: true,
          },
        },
        objetivoDetalles: {
          where: { estado: true },
          orderBy: { secuencial: 'asc' },
          select: {
            porcentajeLogrado: true,
            pesoEspecifico: true,
          },
        },
      },
    });

    // ===============================
    // 2️⃣ AGRUPAR POR EMPLEADO
    // ===============================
    const empleados = new Map<number, any>();

    for (const ev of evaluaciones) {
      if (!ev.evaluado) continue;

      if (!empleados.has(ev.evaluado.idEmpleado)) {
        empleados.set(ev.evaluado.idEmpleado, {
          empleado: ev.evaluado,
          porCompetencia: new Map<number, NotasDeEvaluado>(),
          ...notasVacias(),
        });
      }

      const emp = empleados.get(ev.evaluado.idEmpleado);
      // Foto del jefe al iniciar cada evaluación: en una campaña cerrada
      // dice si no tenía jefe (`evaluadoSinJefe`).
      (emp.fotosJefe ??= []).push(ev.codigoJefeEvaluado);

      // `null` es sin evaluar: una evaluación abierta pero sin ninguna nota
      // puesta no entra al promedio.
      const nota = notaDeEvaluacion(ev.itemsEvaluados);
      if (nota === null) continue;

      const origen = origenDeEvaluacion({
        tipoEvaluador: ev.tipoEvaluador,
        idEvaluado: ev.idEvaluado,
        idEvaluador: ev.idEvaluador,
        codigoEvaluado: ev.evaluado.codigoEmpleado,
        codigoEvaluador: ev.evaluador?.codigoEmpleado,
        codigoEmpleadoJefe: ev.evaluado.codigoEmpleadoJefe,
        codigoJefeDelEvaluador: ev.evaluador?.codigoEmpleadoJefe,
      });

      // Ni evaluado, ni jefe, ni a su cargo: fuera del modelo, no puntúa.
      if (origen === 'otro') continue;

      if (origen === 'auto') emp.autoEvaluaciones.push(nota);
      else if (origen === 'jefe') emp.evaluacionesJefe.push(nota);
      else emp.evaluacionesSubordinados.push(nota);

      // También por competencia: el resultado se promedia sobre las que tiene
      // ASIGNADAS su unidad, contando 0 las que nadie evaluó. Igual que el PDF
      // individual; promediando solo las evaluadas, evaluar una de cinco daba
      // el mismo resultado que evaluarlas las cinco con esa nota.
      if (!emp.porCompetencia.has(ev.idCompetencia)) {
        emp.porCompetencia.set(ev.idCompetencia, notasVacias());
      }

      const deCompetencia = emp.porCompetencia.get(ev.idCompetencia);

      if (origen === 'auto') deCompetencia.autoEvaluaciones.push(nota);
      else if (origen === 'jefe') deCompetencia.evaluacionesJefe.push(nota);
      else deCompetencia.evaluacionesSubordinados.push(nota);
    }

    // ===============================
    // 3️⃣ OBJETIVOS
    // ===============================
    for (const obj of objetivos) {
      // Quien tiene objetivos pero ninguna evaluación de competencias vigente
      // no estaba en el mapa —se llenaba solo recorriendo evaluaciones— y se
      // caía del reporte entero, con sus objetivos calificados y todo.
      if (!empleados.has(obj.empleado.idEmpleado)) {
        empleados.set(obj.empleado.idEmpleado, {
          empleado: obj.empleado,
          porCompetencia: new Map<number, NotasDeEvaluado>(),
          ...notasVacias(),
        });
      }

      const emp = empleados.get(obj.empleado.idEmpleado);

      // `null` cuando ninguno de sus detalles está calificado: antes entraba
      // como un 0 y hundía el promedio de quien no tenía nada puesto todavía.
      const resultado = resultadoDeObjetivo(obj.objetivoDetalles);
      if (resultado === null) continue;

      emp.objetivos.push(resultado);
    }

    // ===============================
    // PESOS
    // ===============================
    // Los mismos pesos (y valores por defecto) que el cálculo de la nota:
    // con `?? 0` una campaña sin pesos escritos titulaba "Resultado
    // Competencias 0 %" sobre columnas calculadas al 80 %.
    const pesos = pesosDeEmpresa(empresa);
    const jefePeso = pesos.jefe;
    const subordinadoPeso = pesos.subordinado;
    const competenciaPeso = pesos.competencias;
    const objetivoPeso = pesos.objetivos;

    // ===============================
    // CREAR EXCEL
    // ===============================
    const workbook = libro ?? new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Resultados');
    const es180 = empresa.modeloEmpresa === '180';
    const pct = (n: number) => `${Math.round(n * 100)} %`;
    // El peso va en la línea gris, no en el título. En 90° el reparto
    // jefe/subordinado no se aplica: la nota del jefe vale el 100 %.
    sheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Trabajador', key: 'empleado', width: 35 },
      { header: 'Autoevaluación', key: 'auto', width: 18 },
      { header: 'Evaluación del jefe', key: 'jefe', width: 22 },
      { header: 'Evaluación de subordinados', key: 'subordinados', width: 26 },
      { header: 'Resultado de competencias', key: 'competencias', width: 26 },
      { header: 'Resultado de objetivos', key: 'objetivos', width: 24 },
      { header: 'Resultado final', key: 'final', width: 18 },
      { header: 'Observación', key: 'observacion', width: 45 },
    ];
    const brevesResultados = [
      undefined,
      undefined,
      'Referencia: no puntúa',
      es180 ? `Pesa ${pct(jefePeso)} de competencias` : '100 % de competencias',
      es180
        ? `Pesa ${pct(subordinadoPeso)} de competencias`
        : 'No aplica en 90°',
      `Pesa ${pct(competenciaPeso)} del final`,
      `Pesa ${pct(objetivoPeso)} del final`,
      'Nivel esperado: 75 o más',
      undefined,
    ];

    // ===============================
    // RESULTADOS
    // ===============================
    // Las competencias que le tocan a cada quien salen de su unidad
    // ocupacional. Una consulta para todas las unidades en juego, no una por
    // trabajador.
    const unidades = [
      ...new Set(
        [...empleados.values()]
          .map((e) => e.empleado.idUnidadOcupacionalEmpleadora)
          .filter((id): id is number => !!id),
      ),
    ];

    const asignadas =
      await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
        where: {
          idUnidadOcupacionalEmpleadora: { in: unidades },
          competencia: { estado: true },
          competenciaNivel: { estado: true },
        },
        select: {
          idUnidadOcupacionalEmpleadora: true,
          idCompetencia: true,
        },
      });

    const competenciasPorUnidad = new Map<number, number[]>();

    for (const a of asignadas) {
      const lista =
        competenciasPorUnidad.get(a.idUnidadOcupacionalEmpleadora) ?? [];
      lista.push(a.idCompetencia);
      competenciasPorUnidad.set(a.idUnidadOcupacionalEmpleadora, lista);
    }

    // En una campaña cerrada, lo que le tocaba a cada quien es la foto
    // guardada al cerrarla (CampanaAsignacion): su unidad pudo cambiar
    // después. Sin foto (cerradas antes de existir), lo que se le evaluó.
    const evaluadasPorEmpleado = new Map<number, Set<number>>();
    const foto =
      campanaCerrada && campana
        ? await this.prisma.campanaAsignacion.findMany({
            where: { idCampanaEvaluacion: campana.idCampanaEvaluacion },
            select: { idEmpleado: true, idCompetencia: true },
          })
        : [];
    const origenCerrada = foto.length
      ? foto.map((f) => ({
          idEvaluado: f.idEmpleado,
          idCompetencia: f.idCompetencia,
        }))
      : evaluaciones;
    for (const ev of origenCerrada) {
      if (!ev.idEvaluado) continue;
      const set = evaluadasPorEmpleado.get(ev.idEvaluado) ?? new Set<number>();
      set.add(ev.idCompetencia);
      evaluadasPorEmpleado.set(ev.idEvaluado, set);
    }

    // Ajustes de calibración de la campaña: mandan sobre el cálculo.
    const ajustes = new Map(
      campana
        ? (
            await this.prisma.ajusteCalibracion.findMany({
              where: { idCampanaEvaluacion: campana.idCampanaEvaluacion },
            })
          ).map((a) => [a.idEmpleado, a])
        : [],
    );
    const filas: {
      idEmpleado: number;
      codigo: string;
      nombre: string;
      /** Lo que da el cálculo, sin calibrar. */
      calculado: {
        competencias: number;
        objetivos: number;
        final: number;
        competenciasSinEvaluar: boolean;
        objetivosSinEvaluar: boolean;
      };
      /** Lo que vale (calibrado si hay ajuste). */
      resultado: {
        competencias: number;
        objetivos: number;
        final: number;
        sinEvaluar: boolean;
      };
      ajuste: (typeof ajustes extends Map<number, infer A> ? A : never) | null;
    }[] = [];
    // Nota de cada competencia por trabajador (solo las asignadas y con
    // nota), con la fórmula oficial: alimenta las estadísticas del catálogo.
    const notasPorCompetencia = new Map<number, number[]>();

    for (const emp of empleados.values()) {
      // La cabeza de la empresa (sin jefe): en 180° la califican solo sus
      // subordinados. Igual que el PDF individual.
      const empresaDelEvaluado: ConfiguracionEmpresa = {
        ...empresa,
        evaluadoSinJefe: evaluadoSinJefe({
          cerrada: campanaCerrada,
          codigoJefeActual: emp.empleado.codigoEmpleadoJefe,
          fotosJefe: emp.fotosJefe ?? [],
        }),
      };
      const base = this.calcularResultadosEmpleadoDesdeAgrupado(
        empresaDelEvaluado,
        emp,
      );

      // Mismo criterio que el PDF individual: se promedia sobre las asignadas,
      // contando 0 las que nadie evaluó.
      const deAsignadas = resultadoDeCompetenciasAsignadas(
        empresaDelEvaluado,
        campanaCerrada
          ? [...(evaluadasPorEmpleado.get(emp.empleado.idEmpleado) ?? [])]
          : (competenciasPorUnidad.get(
              emp.empleado.idUnidadOcupacionalEmpleadora,
            ) ?? []),
        emp.porCompetencia,
      );

      for (const idCompetencia of campanaCerrada
        ? [...(evaluadasPorEmpleado.get(emp.empleado.idEmpleado) ?? [])]
        : (competenciasPorUnidad.get(
            emp.empleado.idUnidadOcupacionalEmpleadora,
          ) ?? [])) {
        const nota = resultadoDeCompetencia(
          empresaDelEvaluado,
          emp.porCompetencia.get(idCompetencia),
        );
        if (nota === null) continue;
        const lista = notasPorCompetencia.get(idCompetencia) ?? [];
        lista.push(nota);
        notasPorCompetencia.set(idCompetencia, lista);
      }

      const r = {
        ...base,
        resultadoCompetencias: deAsignadas.resultado,
        competenciasSinEvaluar: deAsignadas.sinEvaluar,
        resultadoFinal: redondear(
          (deAsignadas.resultado * (empresa.porcentajeCompetecias ?? 80)) /
            100 +
            base.promedioObjetivos *
              ((empresa.porcentajeObjetivos ?? 20) / 100),
          2,
        ),
      };

      r.sinEvaluar = r.competenciasSinEvaluar && r.objetivosSinEvaluar;

      const calculado = {
        competencias: r.resultadoCompetencias,
        objetivos: r.promedioObjetivos,
        final: r.resultadoFinal,
        competenciasSinEvaluar: r.competenciasSinEvaluar,
        objetivosSinEvaluar: r.objetivosSinEvaluar,
      };
      const ajuste = ajustes.get(emp.empleado.idEmpleado) ?? null;
      Object.assign(r, aplicarCalibracion(r, ajuste, empresa));
      filas.push({
        idEmpleado: emp.empleado.idEmpleado,
        codigo: emp.empleado.codigoEmpleado,
        nombre: `${emp.empleado.nombres} ${emp.empleado.apellidos}`.trim(),
        calculado,
        resultado: {
          competencias: r.resultadoCompetencias,
          objetivos: r.promedioObjetivos,
          final: r.resultadoFinal,
          sinEvaluar: r.sinEvaluar,
        },
        ajuste,
      });

      // Celda vacía, no 0, cuando no hay nada evaluado. En una hoja de cálculo
      // el vacío es "sin dato" y el 0 es un cero: escribir 0 hacía que alguien
      // con la evaluación abierta y sin notas apareciera como un suspenso, y
      // además falseaba cualquier promedio hecho sobre la columna. Es lo mismo
      // que el PDF resuelve escribiendo "Sin evaluar".
      const oVacio = (valor: number, sinEvaluar: boolean) =>
        sinEvaluar ? null : valor;

      // Una competencia asignada y sin evaluar vale 0 y ese 0 cuenta, así que
      // la celda lleva el número. Lo que no se puede es dejarlo sin explicar:
      // la columna de observación dice por qué es 0, que es lo que separa "le
      // pusieron cero" de "nadie lo evaluó".
      const observaciones: string[] = [];

      if (deAsignadas.asignadas === 0) {
        observaciones.push(
          'Su grupo ocupacional no tiene competencias asignadas',
        );
      } else if (deAsignadas.ningunaEvaluada) {
        observaciones.push(
          `${deAsignadas.asignadas} competencias sin evaluar, cuentan como 0`,
        );
      }

      const soloSubordinados =
        empresa.modeloEmpresa === '180' &&
        empresaDelEvaluado.evaluadoSinJefe &&
        r.promedioSubordinados !== undefined &&
        emp.evaluacionesSubordinados.length > 0;
      if (soloSubordinados)
        observaciones.push(
          'Sin jefe inmediato: competencias = subordinados al 100 %',
        );
      if (r.objetivosSinEvaluar) observaciones.push('Objetivos sin evaluar');
      if (ajuste) observaciones.push(`Calibrado: ${ajuste.motivo}`);

      sheet.addRow({
        codigo: emp.empleado.codigoEmpleado,
        empleado: `${emp.empleado.nombres} ${emp.empleado.apellidos}`,
        auto: oVacio(r.promedioAuto, r.competenciasSinEvaluar),
        // Sin jefe no hay nota del jefe: vacío, no un 0.
        jefe: oVacio(
          r.promedioJefe,
          r.competenciasSinEvaluar || !!empresaDelEvaluado.evaluadoSinJefe,
        ),
        // En 90° la columna dice "no aplica": una nota de subordinados que
        // exista (evaluaciones al jefe hechas igual) no puntúa y no se enseña.
        subordinados: oVacio(
          r.promedioSubordinados,
          r.competenciasSinEvaluar || empresa.modeloEmpresa !== '180',
        ),
        // Mismo criterio que el PDF: el 0 de una competencia sin evaluar se
        // enseña —la observación explica por qué— y solo se deja en blanco a
        // quien no tiene absolutamente nada evaluado.
        competencias: oVacio(r.resultadoCompetencias, r.sinEvaluar),
        objetivos: oVacio(r.promedioObjetivos, r.objetivosSinEvaluar),
        final: oVacio(r.resultadoFinal, r.sinEvaluar),
        observacion: observaciones.join(' · '),
      });
    }

    aplicarCabecera(sheet, brevesResultados);
    return { workbook, filas, campana, empresa, notasPorCompetencia };
  }

  // Competencias

  async exportarCompetenciasPorEmpresaExcel(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
    libro?: ExcelJS.Workbook,
  ) {
    const empresa = await this.prisma.empresaEmpleadora.findFirst({
      where: { idEmpresaEmpleadora, estado: true },
      select: { idEmpresaEmpleadora: true },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const campana = await resolverCampana(
      this.prisma,
      idEmpresaEmpleadora,
      filtros.idCampanaEvaluacion,
    );

    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        // Igual que en el export de resultados: las anuladas no cuentan y
        // solo se exporta la campaña pedida.
        ...filtroEvaluacionesDeCampana(campana?.idCampanaEvaluacion),
        evaluado: {
          is: this.filtroEmpleadoExport(idEmpresaEmpleadora, filtros),
        },
        competencia: {
          estado: true,
        },
        nivel: {
          estado: true,
        },
      },
      include: {
        evaluado: {
          where: { estado: true },
          include: {
            empresaEmpleadora: true,
            areaEmpleadora: true,
            puestoEmpleadora: true,
            unidadOcupacionalEmpleadora: true,
            gerenciaEmpleadora: true,
          },
        },
        evaluador: {
          where: {
            estado: true, // evaluador activo
          },
        },
        competencia: true,
        nivel: true,
        itemsEvaluados: {
          where: { estado: true },
          include: {
            item: true,
          },
        },
      },
      orderBy: [
        { evaluado: { apellidos: 'asc' } },
        { competencia: { nombre: 'asc' } },
      ],
    });

    const workbook = libro ?? new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Competencias');

    sheet.columns = [
      { header: 'Empresa', key: 'empresa', width: 30 },
      { header: 'Codigo Empleado', key: 'codigoEmpleado', width: 35 },
      { header: 'Empleado', key: 'empleado', width: 35 },
      { header: 'Documento', key: 'documento', width: 15 },
      { header: 'Codigo Jefe', key: 'codigoJefe', width: 35 },
      { header: 'Evaluador', key: 'evaluador', width: 30 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Puesto', key: 'puesto', width: 25 },
      { header: 'Grupo ocupacional', key: 'unidad', width: 25 },
      { header: 'Gerencia', key: 'gerencia', width: 25 },
      { header: 'Competencia', key: 'competencia', width: 30 },
      { header: 'Nivel', key: 'nivel', width: 10 },
      { header: 'Comportamiento evaluado', key: 'item', width: 50 },
      { header: 'Calificación', key: 'calificacion', width: 15 },
    ];

    // evaluaciones.forEach((evaluacion) => {
    //   evaluacion.itemsEvaluados.forEach((item) => {
    //     sheet.addRow({
    //       empresa: evaluacion.evaluado?.empresaEmpleadora.nombreEmpresa,
    //       codigoEmpleado: evaluacion.evaluado?.codigoEmpleado,
    //       empleado: `${evaluacion.evaluado?.nombres} ${evaluacion.evaluado?.apellidos}`,
    //       documento: Number(evaluacion.evaluado?.documento),
    //       codigoJefe: evaluacion.evaluador
    //         ? evaluacion.evaluador?.codigoEmpleado
    //         : evaluacion.evaluado?.codigoEmpleado,
    //       evaluador: evaluacion.evaluador
    //         ? `${evaluacion.evaluador.nombres} ${evaluacion.evaluador.apellidos}`
    //         : 'Autoevaluación',
    //       area: evaluacion.evaluado?.areaEmpleadora.descripcion,
    //       puesto: evaluacion.evaluado?.puestoEmpleadora.descripcion,
    //       unidad: evaluacion.evaluado?.unidadOcupacionalEmpleadora.descripcion,
    //       gerencia: evaluacion.evaluado?.gerenciaEmpleadora.descripcion,
    //       competencia: evaluacion.competencia.titulo,
    //       nivel: evaluacion.nivel.nivel,
    //       item: item.textoItemEvaluado ?? item.item.enunciado,
    //       calificacion: item.calificacion,
    //     });
    //   });
    // });

    // TODO: solucion
    for (const evaluacion of evaluaciones) {
      for (const item of evaluacion.itemsEvaluados) {
        // ❗ Saltar si la calificación es null o undefined 10/03/2026
        // if (item.calificacion === null || item.calificacion === undefined) {
        //   continue;
        // }

        sheet.addRow({
          empresa: evaluacion.evaluado?.empresaEmpleadora?.nombreEmpresa,
          codigoEmpleado: evaluacion.evaluado?.codigoEmpleado,
          empleado: `${evaluacion.evaluado?.nombres} ${evaluacion.evaluado?.apellidos}`,
          documento: evaluacion.evaluado?.documento,
          codigoJefe:
            evaluacion.evaluador?.codigoEmpleado ??
            evaluacion.evaluado?.codigoEmpleado,
          evaluador: evaluacion.evaluador
            ? `${evaluacion.evaluador.nombres} ${evaluacion.evaluador.apellidos}`
            : 'Autoevaluación',
          area: evaluacion.evaluado?.areaEmpleadora?.descripcion,
          puesto: evaluacion.evaluado?.puestoEmpleadora?.descripcion,
          unidad: evaluacion.evaluado?.unidadOcupacionalEmpleadora?.descripcion,
          gerencia: evaluacion.evaluado?.gerenciaEmpleadora?.descripcion,
          competencia: evaluacion.competencia.titulo,
          nivel: evaluacion.nivel.nivel,
          item: item.textoItemEvaluado ?? item.item.enunciado,
          calificacion: item.calificacion,
        });
      }
    }

    aplicarCabecera(sheet);
    return workbook;
  }

  async exportarObjetivosPorEmpresaExcel(
    idEmpresaEmpleadora: number,
    filtros: ExportEmpresaQueryDto = {},
    libro?: ExcelJS.Workbook,
  ) {
    const campana = await resolverCampana(
      this.prisma,
      idEmpresaEmpleadora,
      filtros.idCampanaEvaluacion,
    );
    const objetivos = await this.prisma.objetivo.findMany({
      where: {
        estado: true,
        // La campaña pedida o la en curso: sin esto salían todas mezcladas.
        idCampanaEvaluacion: campana?.idCampanaEvaluacion ?? -1,
        empleado: this.filtroEmpleadoExport(idEmpresaEmpleadora, filtros),
      },
      include: {
        empleado: {
          include: {
            empresaEmpleadora: true,
            areaEmpleadora: true,
            puestoEmpleadora: true,
            unidadOcupacionalEmpleadora: true,
            gerenciaEmpleadora: true,
          },
        },
        objetivoDetalles: {
          where: { estado: true },
          orderBy: { secuencial: 'asc' },
        },
      },
      orderBy: [{ empleado: { apellidos: 'asc' } }],
    });

    /* ===============================
     1. Obtener códigos de jefes
     =============================== */
    const codigosJefe = [
      ...new Set(
        objetivos
          .map((o) => o.empleado.codigoEmpleadoJefe)
          .filter((code): code is string => code !== null),
      ),
    ];

    /* ===============================
     2. Buscar empleados evaluadores
     =============================== */
    const jefes = await this.prisma.empleado.findMany({
      where: {
        codigoEmpleado: { in: codigosJefe },
        // El código es único por empresa.
        idEmpresaEmpleadora,
      },
      select: {
        codigoEmpleado: true,
        nombres: true,
        apellidos: true,
      },
    });

    /* ===============================
     3. Crear mapa de evaluadores
     =============================== */
    const evaluadorMap = new Map(
      jefes.map((j) => [j.codigoEmpleado, `${j.nombres} ${j.apellidos}`]),
    );

    /* ===============================
     4. Excel
     =============================== */
    const workbook = libro ?? new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Objetivos');

    sheet.columns = [
      { header: 'Empresa', key: 'empresa', width: 30 },
      { header: 'Código Empleado', key: 'codigoEmpleado', width: 20 },
      { header: 'Empleado', key: 'empleado', width: 35 },
      {
        header: 'Documento',
        key: 'documento',
        width: 15,
        style: { numFmt: '@' },
      },
      { header: 'Código Jefe', key: 'codigoJefe', width: 20 },
      { header: 'Evaluador', key: 'evaluador', width: 35 },
      { header: 'Área', key: 'area', width: 25 },
      { header: 'Puesto', key: 'puesto', width: 25 },
      { header: 'Grupo ocupacional', key: 'unidad', width: 25 },
      { header: 'Gerencia', key: 'gerencia', width: 25 },
      { header: 'Objetivo', key: 'objetivo', width: 40 },
      { header: 'Iniciativa', key: 'iniciativa', width: 36 },
      { header: 'Tipo de cálculo', key: 'tipoCalculo', width: 16 },
      { header: 'Unidad de medida', key: 'unidadMedida', width: 16 },
      { header: 'Peso', key: 'peso', width: 10 },
      { header: 'Meta', key: 'meta', width: 12 },
      { header: 'Logrado', key: 'metaAlcanzada', width: 15 },
      { header: 'Cumplimiento (%)', key: 'porcentaje', width: 14 },
      { header: 'Fecha límite', key: 'fecha', width: 18 },
    ];

    objetivos.forEach((obj) => {
      obj.objetivoDetalles.forEach((det) => {
        sheet.addRow({
          empresa: obj.empleado.empresaEmpleadora.nombreEmpresa,
          codigoEmpleado: obj.empleado.codigoEmpleado,
          empleado: `${obj.empleado.nombres} ${obj.empleado.apellidos}`,
          // Texto, no número: `Number()` quitaba los ceros a la izquierda del
          // DNI y daba NaN con documentos alfanuméricos.
          documento: obj.empleado.documento ?? '',
          codigoJefe: obj.empleado.codigoEmpleadoJefe,
          evaluador: obj.empleado.codigoEmpleadoJefe
            ? evaluadorMap.get(obj.empleado.codigoEmpleadoJefe)
            : 'SIN JEFE',
          area: obj.empleado.areaEmpleadora.descripcion,
          puesto: obj.empleado.puestoEmpleadora.descripcion,
          unidad: obj.empleado.unidadOcupacionalEmpleadora.descripcion,
          gerencia: obj.empleado.gerenciaEmpleadora.descripcion,
          objetivo: det.descripcion,
          iniciativa: det.descripcionIniciativa,
          tipoCalculo: det.tipoCalculo,
          unidadMedida: det.unidadMedida,
          peso: det.pesoEspecifico,
          meta: det.metaObjetivo,
          metaAlcanzada: det.metaAlcanzada,
          porcentaje: det.porcentajeLogrado,
          fecha: det.fechaCulminacion,
        });
      });
    });

    aplicarCabecera(sheet);
    return workbook;
  }
}
