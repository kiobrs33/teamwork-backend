import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { borrarArchivo } from 'src/config/cloudinary';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { campanaEnCurso } from 'src/common/resultados/campana';
import { HitoDto } from './dto/registro-proceso.dto';

/** Etapas del proceso, en orden (guía FONAFE). */
export const ETAPAS = [
  'Planificación',
  'Establecimiento',
  'Seguimiento',
  'Evaluación',
  'Calibración',
  'Retroalimentación',
  'Otros',
] as const;

/**
 * Hitos sugeridos por la guía FONAFE (pp. 36–39). Es un punto de partida:
 * cada empresa lo ajusta. Donde TeamWork ya genera el documento, el registro
 * dice dónde descargarlo.
 */
const SUGERIDOS_FONAFE: { etapa: string; nombre: string; registro: string }[] =
  [
    {
      etapa: 'Planificación',
      nombre: 'Lineamiento o política de gestión del desempeño',
      registro: 'Lineamiento o política aprobada por la Gerencia General.',
    },
    {
      etapa: 'Planificación',
      nombre: 'Plan de trabajo',
      registro: 'Cronograma con cada actividad y sus fechas de inicio y fin.',
    },
    {
      etapa: 'Planificación',
      nombre: 'Capacitación al personal en gestión del desempeño',
      registro:
        'Videos, afiches o actas de asistencia que muestren que el personal recibió la capacitación.',
    },
    {
      etapa: 'Planificación',
      nombre: 'Aplicación del modelo de evaluación',
      registro:
        'Matriz de participantes con el tipo de evaluación (90° o 180°). En TeamWork: Trabajadores → Exportar.',
    },
    {
      etapa: 'Establecimiento',
      nombre: 'Establecimiento de objetivos de desempeño',
      registro:
        'Matriz de objetivos aprobada por la Gerencia General. En TeamWork: Objetivos → Exportar.',
    },
    {
      etapa: 'Establecimiento',
      nombre: 'Establecimiento de competencias organizacionales',
      registro:
        'Diccionario de competencias aprobado por la Gerencia General. En TeamWork: Competencias → Exportar.',
    },
    {
      etapa: 'Establecimiento',
      nombre: 'Difusión de competencias',
      registro:
        'Videos, afiches o actas que muestren que los trabajadores conocen las competencias a evaluar.',
    },
    {
      etapa: 'Seguimiento',
      nombre: 'Seguimiento de objetivos y competencias',
      registro: 'Actas de las sesiones de seguimiento a mitad del periodo.',
    },
    {
      etapa: 'Evaluación',
      nombre: 'Comunicación del inicio de la evaluación',
      registro:
        'Correos, afiches o actas con la fecha de inicio de la evaluación.',
    },
    {
      etapa: 'Evaluación',
      nombre: 'Aplicación de la evaluación',
      registro:
        'Reporte preliminar del 100 % de participantes. En TeamWork: Resumen → Exportar reportes → Resultados.',
    },
    {
      etapa: 'Calibración',
      nombre: 'Calibración de resultados',
      registro:
        'Actas de las sesiones de calibración, firmadas. En TeamWork: Calibración → Acta de calibración.',
    },
    {
      etapa: 'Calibración',
      nombre: 'Generación de resultados',
      registro:
        'Reporte final de resultados con su distribución (campana de Gauss). En TeamWork: Calibración y Exportar reportes.',
    },
    {
      etapa: 'Retroalimentación',
      nombre: 'Sesión de retroalimentación y plan de acción',
      registro:
        'Formatos de retroalimentación y plan de acción. En TeamWork: Retroalimentación.',
    },
    {
      etapa: 'Retroalimentación',
      nombre: 'Sustentación del componente',
      registro:
        'Presentación con el total de hitos del componente (ficha técnica de sustentación).',
    },
  ];

/**
 * Registros del proceso por campaña (guía FONAFE, pp. 36–39): la empresa
 * deja constancia de cada etapa con documentos. Sirve para ordenar el
 * proceso y, a las empresas de FONAFE, para sustentarlo.
 */
@Injectable()
export class RegistroProcesoService {
  private readonly logger = new Logger(RegistroProcesoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Campaña pedida (de la empresa) o la en curso. */
  private async campana(idEmpresa: number, idCampana?: number) {
    const campana = idCampana
      ? await this.prisma.campanaEvaluacion.findFirst({
          where: {
            idCampanaEvaluacion: idCampana,
            idEmpresaEmpleadora: idEmpresa,
          },
        })
      : await campanaEnCurso(this.prisma, idEmpresa);
    if (idCampana && !campana) {
      throw new NotFoundException(
        'La campaña no existe o no es de esta empresa.',
      );
    }
    return campana;
  }

  /** Hito de la empresa (404 si no existe o es de otra). */
  private async hitoDe(idEmpresa: number, idHito: number) {
    const hito = await this.prisma.hitoCampana.findFirst({
      where: {
        idHitoCampana: idHito,
        estado: true,
        campana: { idEmpresaEmpleadora: idEmpresa },
      },
    });
    if (!hito) throw new NotFoundException('Hito no encontrado.');
    return hito;
  }

  async panel(idEmpresa: number, idCampana?: number) {
    const campanas = await this.prisma.campanaEvaluacion.findMany({
      where: { idEmpresaEmpleadora: idEmpresa },
      select: { idCampanaEvaluacion: true, nombre: true, estado: true },
      orderBy: { periodoDesde: 'desc' },
    });
    const campana = await this.campana(idEmpresa, idCampana);
    if (!campana) {
      return {
        campanas,
        campana: null,
        hitos: [],
        cumplidos: 0,
        anterior: false,
      };
    }
    const hitos = await this.prisma.hitoCampana.findMany({
      where: { idCampanaEvaluacion: campana.idCampanaEvaluacion, estado: true },
      orderBy: [{ orden: 'asc' }, { idHitoCampana: 'asc' }],
      include: {
        archivos: {
          where: { estado: true },
          orderBy: { fechaCreacion: 'asc' },
        },
      },
    });
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        idUsuario: {
          in: [
            ...new Set(
              hitos.flatMap((h) => h.archivos.map((a) => a.creadoPorId)),
            ),
          ],
        },
      },
      select: { idUsuario: true, nombreCompleto: true, codigoUsuario: true },
    });
    const autor = new Map(
      usuarios.map((u) => [u.idUsuario, u.nombreCompleto || u.codigoUsuario]),
    );
    // ¿Hay otra campaña con hitos para copiar?
    const anterior = await this.prisma.hitoCampana.count({
      where: {
        estado: true,
        campana: {
          idEmpresaEmpleadora: idEmpresa,
          idCampanaEvaluacion: { not: campana.idCampanaEvaluacion },
        },
      },
    });
    const lista = hitos.map((h) => ({
      idHitoCampana: h.idHitoCampana,
      etapa: h.etapa,
      nombre: h.nombre,
      registro: h.registro,
      archivos: h.archivos.map((a) => ({
        idRegistroHito: a.idRegistroHito,
        nombreArchivo: a.nombreArchivo,
        urlArchivo: a.urlArchivo,
        subidoPor: autor.get(a.creadoPorId) ?? null,
        fecha: a.fechaCreacion,
      })),
    }));
    return {
      campanas,
      campana: {
        idCampanaEvaluacion: campana.idCampanaEvaluacion,
        nombre: campana.nombre,
        // `estado` lo borra el PurgeResponseInterceptor.
        estadoCampana: campana.estado,
      },
      hitos: lista,
      cumplidos: lista.filter((h) => h.archivos.length > 0).length,
      anterior: anterior > 0,
    };
  }

  /** Crea la lista de la campaña: la sugerida de FONAFE o la de la anterior. */
  async crearLista(
    user: AuthUser,
    idEmpresa: number,
    idCampana: number,
    origen: 'FONAFE' | 'ANTERIOR',
  ) {
    const campana = await this.campana(idEmpresa, idCampana);
    if (!campana) throw new NotFoundException('Campaña no encontrada.');
    const yaTiene = await this.prisma.hitoCampana.count({
      where: { idCampanaEvaluacion: campana.idCampanaEvaluacion, estado: true },
    });
    if (yaTiene) {
      throw new ConflictException(
        'Esta campaña ya tiene su lista de hitos: agregue o edite los hitos uno por uno.',
      );
    }
    let base: { etapa: string; nombre: string; registro: string }[] =
      SUGERIDOS_FONAFE;
    if (origen === 'ANTERIOR') {
      const ultima = await this.prisma.hitoCampana.findFirst({
        where: {
          estado: true,
          campana: {
            idEmpresaEmpleadora: idEmpresa,
            idCampanaEvaluacion: { not: campana.idCampanaEvaluacion },
          },
        },
        orderBy: { campana: { periodoDesde: 'desc' } },
        select: { idCampanaEvaluacion: true },
      });
      if (!ultima) {
        throw new BadRequestException(
          'No hay otra campaña con hitos para copiar.',
        );
      }
      base = await this.prisma.hitoCampana.findMany({
        where: {
          idCampanaEvaluacion: ultima.idCampanaEvaluacion,
          estado: true,
        },
        orderBy: [{ orden: 'asc' }, { idHitoCampana: 'asc' }],
        select: { etapa: true, nombre: true, registro: true },
      });
    }
    await this.prisma.hitoCampana.createMany({
      data: base.map((h, i) => ({
        ...h,
        orden: i + 1,
        idCampanaEvaluacion: campana.idCampanaEvaluacion,
        creadoPorId: user.idUsuario,
      })),
    });
    return { creados: base.length };
  }

  async crearHito(
    user: AuthUser,
    idEmpresa: number,
    idCampana: number,
    dto: HitoDto,
  ) {
    const campana = await this.campana(idEmpresa, idCampana);
    if (!campana) throw new NotFoundException('Campaña no encontrada.');
    const ultimo = await this.prisma.hitoCampana.aggregate({
      where: { idCampanaEvaluacion: campana.idCampanaEvaluacion },
      _max: { orden: true },
    });
    return this.prisma.hitoCampana.create({
      data: {
        etapa: dto.etapa,
        nombre: dto.nombre.trim(),
        registro: dto.registro.trim(),
        orden: (ultimo._max.orden ?? 0) + 1,
        idCampanaEvaluacion: campana.idCampanaEvaluacion,
        creadoPorId: user.idUsuario,
      },
    });
  }

  async editarHito(
    user: AuthUser,
    idEmpresa: number,
    id: number,
    dto: HitoDto,
  ) {
    await this.hitoDe(idEmpresa, id);
    return this.prisma.hitoCampana.update({
      where: { idHitoCampana: id },
      data: {
        etapa: dto.etapa,
        nombre: dto.nombre.trim(),
        registro: dto.registro.trim(),
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
  }

  /** Quita el hito (y sus archivos dejan de verse). */
  async quitarHito(user: AuthUser, idEmpresa: number, id: number) {
    await this.hitoDe(idEmpresa, id);
    const ahora = new Date();
    await this.prisma.$transaction([
      this.prisma.registroHito.updateMany({
        where: { idHitoCampana: id, estado: true },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: ahora,
        },
      }),
      this.prisma.hitoCampana.update({
        where: { idHitoCampana: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: ahora,
        },
      }),
    ]);
    return { idHitoCampana: id };
  }

  async adjuntar(
    user: AuthUser,
    idEmpresa: number,
    id: number,
    archivo: {
      path: string;
      filename: string;
      originalname: string;
      mimetype: string;
    },
  ) {
    try {
      await this.hitoDe(idEmpresa, id);
      return await this.prisma.registroHito.create({
        data: {
          idHitoCampana: id,
          nombreArchivo: archivo.originalname,
          urlArchivo: archivo.path,
          publicId: archivo.filename || null,
          tipoArchivo: archivo.mimetype,
          creadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      // Si no se pudo registrar, el archivo no queda huérfano en Cloudinary.
      await borrarArchivo(archivo.filename);
      throw error;
    }
  }

  async quitarArchivo(user: AuthUser, idEmpresa: number, idArchivo: number) {
    const archivo = await this.prisma.registroHito.findFirst({
      where: {
        idRegistroHito: idArchivo,
        estado: true,
        hito: { campana: { idEmpresaEmpleadora: idEmpresa } },
      },
    });
    if (!archivo) throw new NotFoundException('Archivo no encontrado.');
    await this.prisma.registroHito.update({
      where: { idRegistroHito: idArchivo },
      data: {
        estado: false,
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
    await borrarArchivo(archivo.publicId);
    return { idRegistroHito: idArchivo };
  }
}
