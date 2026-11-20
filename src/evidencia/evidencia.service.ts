import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { construirLibroExcel } from 'src/common/excel/libro-excel';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { normalizarPeriodo } from 'src/common/resultados/resultados-evaluacion';

import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { EvidenciaQueryDto, TIPOS_EVIDENCIA } from './dto/evidencia-query.dto';

import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

import { v2 as cloudinary } from 'cloudinary';

/**
 * Qué evidencias puede ver o tocar quien hace la petición. Se deriva SIEMPRE
 * del token, nunca de un parámetro:
 * - ADMIN: todas.
 * - JEFE: las de sus subordinados directos (lectura y escritura) y las suyas
 *   (solo lectura).
 * - EMPLEADO: solo las suyas, en lectura.
 */
type Alcance =
  | { todo: true }
  | {
      todo: false;
      /** Empleados cuyas evidencias puede ver. */
      lectura: number[];
      /** Empleados para los que puede subir o eliminar evidencias. */
      escritura: number[];
    };

const includeListado = {
  empleado: {
    select: {
      idEmpleado: true,
      codigoEmpleado: true,
      nombres: true,
      apellidos: true,
      documento: true,
      codigoEmpleadoJefe: true,
      idEmpresaEmpleadora: true,
      empresaEmpleadora: {
        select: { idEmpresaEmpleadora: true, nombreEmpresa: true },
      },
    },
  },
  evaluacion: {
    select: {
      idEvaluacionCompetencia: true,
      periodoEvaluacion: true,
      competencia: { select: { idCompetencia: true, titulo: true } },
    },
  },
  objetivo: { select: { idObjetivo: true } },
} satisfies Prisma.EvidenciaInclude;

type EvidenciaListado = Prisma.EvidenciaGetPayload<{
  include: typeof includeListado;
}>;

@Injectable()
export class EvidenciaService {
  private readonly logger = new Logger(EvidenciaService.name);

  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────── alcance ───────────────────────────────

  private async alcanceDe(user: AuthUser): Promise<Alcance> {
    if (user.rol === Rol.ADMIN) return { todo: true };

    const empleado = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: { idEmpleado: true, codigoEmpleado: true },
    });
    if (!empleado) return { todo: false, lectura: [], escritura: [] };

    if (user.rol === Rol.JEFE) {
      const subordinados = await this.prisma.empleado.findMany({
        where: { codigoEmpleadoJefe: empleado.codigoEmpleado, estado: true },
        select: { idEmpleado: true },
      });
      const ids = subordinados.map((s) => s.idEmpleado);
      return {
        todo: false,
        lectura: [...ids, empleado.idEmpleado],
        escritura: ids,
      };
    }

    return { todo: false, lectura: [empleado.idEmpleado], escritura: [] };
  }

  private puedeLeer(alcance: Alcance, idEmpleado: number) {
    return alcance.todo || alcance.lectura.includes(idEmpleado);
  }

  private puedeEscribir(alcance: Alcance, idEmpleado: number) {
    return alcance.todo || alcance.escritura.includes(idEmpleado);
  }

  /** Quien subió cada evidencia: `creadoPorId` es un idUsuario sin relación. */
  private async conAutor(evidencias: EvidenciaListado[]) {
    const ids = [...new Set(evidencias.map((e) => e.creadoPorId))];
    const usuarios = ids.length
      ? await this.prisma.usuario.findMany({
          where: { idUsuario: { in: ids } },
          select: {
            idUsuario: true,
            codigoUsuario: true,
            rol: true,
            empleado: { select: { nombres: true, apellidos: true } },
          },
        })
      : [];
    const porId = new Map(usuarios.map((u) => [u.idUsuario, u]));

    // `PurgeResponseInterceptor` borra `fechaCreacion` y `creadoPorId` de toda
    // respuesta: se exponen con otro nombre para que lleguen al front.
    return evidencias.map((e) => {
      const autor = porId.get(e.creadoPorId);
      return {
        ...e,
        tipo: e.idObjetivo ? 'OBJETIVO' : e.idEvaluacionCompetencia ? 'COMPETENCIA' : null,
        fechaSubida: e.fechaCreacion,
        subidoPor: autor
          ? {
              codigoUsuario: autor.codigoUsuario,
              rol: autor.rol,
              nombre: autor.empleado
                ? `${autor.empleado.nombres} ${autor.empleado.apellidos}`
                : autor.codigoUsuario,
            }
          : null,
      };
    });
  }

  // ─────────────────────────────── create ────────────────────────────────

  async create(
    user: AuthUser,
    dto: CreateEvidenciaDto,
    url: string,
    publicId: string,
    file: any,
  ) {
    try {
      const idEmpleado = Number(dto.idEmpleado);
      const idObjetivo = dto.idObjetivo ? Number(dto.idObjetivo) : undefined;
      const idEvaluacionCompetencia = dto.idEvaluacionCompetencia
        ? Number(dto.idEvaluacionCompetencia)
        : undefined;

      if (idEvaluacionCompetencia && idObjetivo) {
        throw new BadRequestException(
          'No puedes asociar evidencia a evaluación y objetivo al mismo tiempo',
        );
      }

      const alcance = await this.alcanceDe(user);
      if (!this.puedeEscribir(alcance, idEmpleado)) {
        throw new ForbiddenException(
          'Solo puedes subir evidencias de tus subordinados directos',
        );
      }

      // El objetivo o la evaluación tienen que ser del mismo trabajador. De
      // ellos sale también la campaña de la evidencia.
      let periodoEvaluacion: string | null = null;
      if (idObjetivo) {
        const objetivo = await this.prisma.objetivo.findFirst({
          where: { idObjetivo, idEmpleado, estado: true },
          select: { idObjetivo: true, periodoEvaluacion: true },
        });
        if (!objetivo) {
          throw new BadRequestException(
            'El objetivo no pertenece al trabajador indicado',
          );
        }
        periodoEvaluacion = objetivo.periodoEvaluacion;
      }
      if (idEvaluacionCompetencia) {
        const evaluacion = await this.prisma.evaluacionCompetencia.findFirst({
          where: { idEvaluacionCompetencia, idEvaluado: idEmpleado },
          select: { idEvaluacionCompetencia: true, periodoEvaluacion: true },
        });
        if (!evaluacion) {
          throw new BadRequestException(
            'La evaluación no pertenece al trabajador indicado',
          );
        }
        periodoEvaluacion = evaluacion.periodoEvaluacion;
      }
      if (!periodoEvaluacion) {
        const empleado = await this.prisma.empleado.findUnique({
          where: { idEmpleado },
          select: { empresaEmpleadora: { select: { periodoEvaluacion: true } } },
        });
        periodoEvaluacion = normalizarPeriodo(
          empleado?.empresaEmpleadora?.periodoEvaluacion,
        );
      }

      return await this.prisma.evidencia.create({
        data: {
          idEmpleado,
          idEvaluacionCompetencia,
          idObjetivo,

          nombreArchivo: file.originalname,
          urlArchivo: url,
          publicId: publicId,
          tipoArchivo: file.mimetype,
          periodoEvaluacion,

          creadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      // El archivo ya se subió en el interceptor: si no se guarda, se borra.
      if (publicId) {
        await cloudinary.uploader
          .destroy(publicId, { resource_type: 'auto' } as any)
          .catch(() => undefined);
      }
      this.logger.error('Error al crear evidencia', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  // ─────────────────────────────── listado ───────────────────────────────

  /** Filtro del listado; lo comparte la exportación. */
  private construirWhere(
    alcance: Alcance,
    query: EvidenciaQueryDto,
  ): Prisma.EvidenciaWhereInput {
    // Con `transform` desactivado en el ValidationPipe, todo llega como texto.
    const idEmpleado = query.idEmpleado ? Number(query.idEmpleado) : undefined;
    const idEmpresa = query.idEmpresaEmpleadora
      ? Number(query.idEmpresaEmpleadora)
      : undefined;
    const search = query.search?.trim();
    const tipo = TIPOS_EVIDENCIA.includes(query.tipo as any)
      ? query.tipo
      : undefined;

    const and: Prisma.EvidenciaWhereInput[] = [{ estado: true }];

    if (!alcance.todo) and.push({ idEmpleado: { in: alcance.lectura } });
    if (idEmpleado) and.push({ idEmpleado });

    const empleadoWhere: Prisma.EmpleadoWhereInput = {};
    if (idEmpresa) empleadoWhere.idEmpresaEmpleadora = idEmpresa;
    if (query.codigoEmpleadoJefe?.trim()) {
      empleadoWhere.codigoEmpleadoJefe = query.codigoEmpleadoJefe.trim();
    }
    if (Object.keys(empleadoWhere).length) {
      and.push({ empleado: empleadoWhere });
    }

    if (search) {
      // Cada palabra tiene que aparecer en algún campo del trabajador o en
      // el nombre del archivo: "perez juan" encuentra a "Juan Perez".
      for (const palabra of search.split(/\s+/)) {
        const c = { contains: palabra, mode: 'insensitive' as const };
        and.push({
          OR: [
            { nombreArchivo: c },
            { empleado: { nombres: c } },
            { empleado: { apellidos: c } },
            { empleado: { codigoEmpleado: c } },
            { empleado: { documento: c } },
          ],
        });
      }
    }

    const periodo = normalizarPeriodo(query.periodoEvaluacion);
    if (periodo) and.push({ periodoEvaluacion: periodo });

    if (tipo === 'OBJETIVO') and.push({ idObjetivo: { not: null } });
    if (tipo === 'COMPETENCIA') {
      and.push({ idEvaluacionCompetencia: { not: null } });
    }

    if (query.fechaDesde || query.fechaHasta) {
      const rango: Prisma.DateTimeFilter = {};
      if (query.fechaDesde) rango.gte = new Date(`${query.fechaDesde}T00:00:00-05:00`);
      if (query.fechaHasta) rango.lte = new Date(`${query.fechaHasta}T23:59:59.999-05:00`);
      and.push({ fechaCreacion: rango });
    }

    return { AND: and };
  }


  async findAll(user: AuthUser, query: EvidenciaQueryDto) {
    try {
      const alcance = await this.alcanceDe(user);

      const where = this.construirWhere(alcance, query);
      const limit = Number(query.limit ?? 10);

      if (limit === 0) {
        const data = await this.prisma.evidencia.findMany({
          where,
          include: includeListado,
          orderBy: { fechaCreacion: 'desc' },
        });
        return {
          data: await this.conAutor(data),
          meta: { total: data.length, page: 1, limit: 0, totalPages: 1 },
        };
      }

      const safeLimit = Math.min(limit || 10, 100);
      const safePage = Math.max(Number(query.page) || 1, 1);

      const [total, data] = await Promise.all([
        this.prisma.evidencia.count({ where }),
        this.prisma.evidencia.findMany({
          where,
          skip: (safePage - 1) * safeLimit,
          take: safeLimit,
          include: includeListado,
          orderBy: { fechaCreacion: 'desc' },
        }),
      ]);

      return {
        data: await this.conAutor(data),
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      this.logger.error('Error al listar evidencias', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  async exportExcel(user: AuthUser, query: EvidenciaQueryDto) {
    try {
      const alcance = await this.alcanceDe(user);
      const data = await this.prisma.evidencia.findMany({
        where: this.construirWhere(alcance, query),
        include: includeListado,
        orderBy: { fechaCreacion: 'desc' },
      });
      const evidencias = await this.conAutor(data);

      return await construirLibroExcel([
        {
          nombre: 'Evidencias',
          columnas: [
            { header: 'ID', key: 'idEvidencia', width: 8 },
            { header: 'Archivo', key: 'nombreArchivo', width: 36 },
            { header: 'Tipo de archivo', key: 'tipoArchivo', width: 20 },
            { header: 'Enlace', key: 'urlArchivo', width: 50 },
            { header: 'Código de empleado', key: 'codigoEmpleado', tipo: 'texto' },
            { header: 'Trabajador', key: 'trabajador', width: 28 },
            { header: 'Documento', key: 'documento', tipo: 'texto' },
            { header: 'Empresa', key: 'empresa', width: 26 },
            { header: 'Sustenta', key: 'sustenta', width: 14 },
            { header: 'Competencia', key: 'competencia', width: 26 },
            { header: 'Periodo', key: 'periodo' },
            { header: 'Subido por', key: 'subidoPor', width: 26 },
            { header: 'Rol de quien subió', key: 'rol' },
            { header: 'Fecha de subida', key: 'fechaSubida', tipo: 'fecha' },
          ],
          filas: evidencias.map((e) => ({
            idEvidencia: e.idEvidencia,
            nombreArchivo: e.nombreArchivo,
            tipoArchivo: e.tipoArchivo,
            urlArchivo: e.urlArchivo,
            codigoEmpleado: e.empleado.codigoEmpleado,
            trabajador: `${e.empleado.nombres} ${e.empleado.apellidos}`,
            documento: e.empleado.documento,
            empresa: e.empleado.empresaEmpleadora?.nombreEmpresa,
            sustenta:
              e.tipo === 'OBJETIVO'
                ? 'Objetivos'
                : e.tipo === 'COMPETENCIA'
                  ? 'Competencia'
                  : 'Sin asociar',
            competencia: e.evaluacion?.competencia.titulo,
            periodo: e.evaluacion?.periodoEvaluacion,
            subidoPor: e.subidoPor?.nombre,
            rol: e.subidoPor?.rol,
            fechaSubida: e.fechaSubida,
          })),
        },
      ]);
    } catch (error) {
      this.logger.error('Error al exportar evidencias', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  async findByEmpleado(user: AuthUser, idEmpleado: number) {
    try {
      const alcance = await this.alcanceDe(user);
      if (!this.puedeLeer(alcance, idEmpleado)) {
        throw new ForbiddenException(
          'No tienes acceso a las evidencias de este trabajador',
        );
      }

      const evidencias = await this.prisma.evidencia.findMany({
        where: { idEmpleado, estado: true },
        select: {
          idEvidencia: true,
          nombreArchivo: true,
          urlArchivo: true,
          tipoArchivo: true,
          fechaCreacion: true,
        },
        orderBy: { fechaCreacion: 'desc' },
      });

      return evidencias.map((e) => ({ ...e, fechaSubida: e.fechaCreacion }));
    } catch (error) {
      this.logger.error('Error obteniendo evidencias por empleado', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  async findOne(user: AuthUser, id: number) {
    try {
      const evidencia = await this.prisma.evidencia.findFirst({
        where: { idEvidencia: id, estado: true },
        include: includeListado,
      });

      // Sin acceso responde igual que si no existiera: no confirma ids ajenos.
      const alcance = await this.alcanceDe(user);
      if (!evidencia || !this.puedeLeer(alcance, evidencia.idEmpleado)) {
        throw new NotFoundException('Evidencia no encontrada');
      }

      const [conAutor] = await this.conAutor([evidencia]);
      return conAutor;
    } catch (error) {
      this.logger.error('Error al obtener evidencia', error);
      handlePrismaError(error, 'evidencia');
    }
  }

  // ─────────────────────────────── remove ────────────────────────────────

  /** Soft delete en la base + borrado del archivo en Cloudinary. */
  async remove(user: AuthUser, id: number) {
    try {
      const evidencia = await this.prisma.evidencia.findFirst({
        where: { idEvidencia: id, estado: true },
      });

      const alcance = await this.alcanceDe(user);
      if (!evidencia || !this.puedeLeer(alcance, evidencia.idEmpleado)) {
        throw new NotFoundException('Evidencia no encontrada');
      }
      if (!this.puedeEscribir(alcance, evidencia.idEmpleado)) {
        throw new ForbiddenException(
          'Solo el jefe directo o un administrador puede eliminar esta evidencia',
        );
      }

      const eliminada = await this.prisma.evidencia.update({
        where: { idEvidencia: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });

      // Después de la baja: si Cloudinary falla, la evidencia igual deja de
      // verse y queda registrado quién la quitó.
      if (evidencia.publicId) {
        await cloudinary.uploader
          .destroy(evidencia.publicId, { resource_type: 'auto' } as any)
          .catch((e) =>
            this.logger.warn(`No se pudo borrar ${evidencia.publicId} en Cloudinary: ${e}`),
          );
      }

      return eliminada;
    } catch (error) {
      this.logger.error('Error al eliminar evidencia', error);
      handlePrismaError(error, 'evidencia');
    }
  }
}
