import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Alcance, empresasDelAlcance } from 'src/autorizacion/alcance';
import { ActividadQueryDto } from './dto/actividad-query.dto';
import { construirLibroExcel } from 'src/common/excel/libro-excel';

export interface EventoActividad {
  idUsuario?: number | null;
  usuarioCodigo?: string | null;
  usuarioNombre?: string | null;
  usuarioRol?: string | null;
  idEmpresaEmpleadora?: number | null;
  accion: string;
  entidad: string;
  idEntidad?: string | null;
  descripcion: string;
  detalle?: unknown;
  metodo?: string;
  ruta?: string;
  resultado: 'OK' | 'ERROR';
  codigoHttp?: number;
  ip?: string | null;
  userAgent?: string | null;
}

/** Claves que nunca se guardan en la bitácora, a ninguna profundidad. */
const SENSIBLE = /contrasen|password|token|secret|hash/i;

/** Quita lo sensible y acota lo voluminoso (una importación de 300 filas). */
export const limpiarParaBitacora = (
  valor: unknown,
  profundidad = 0,
): unknown => {
  if (valor === null || valor === undefined) return valor;
  if (profundidad > 4) return '…';
  if (Array.isArray(valor)) {
    if (valor.length > 20) {
      return {
        cantidad: valor.length,
        muestra: valor
          .slice(0, 3)
          .map((v) => limpiarParaBitacora(v, profundidad + 1)),
      };
    }
    return valor.map((v) => limpiarParaBitacora(v, profundidad + 1));
  }
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>)
        .filter(([k]) => !SENSIBLE.test(k))
        .map(([k, v]) => [k, limpiarParaBitacora(v, profundidad + 1)]),
    );
  }
  if (typeof valor === 'string' && valor.length > 500) {
    return `${valor.slice(0, 500)}…`;
  }
  return valor;
};

/**
 * El PurgeResponseInterceptor borra toda clave `estado` de las respuestas,
 * también dentro del detalle: «Desactivó…» llegaba sin su cambio. En el
 * detalle viaja como `activo` (en la base sigue tal cual).
 */
const sinClaveEstado = (valor: unknown): unknown => {
  if (Array.isArray(valor)) return valor.map(sinClaveEstado);
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([k, v]) => [
        k === 'estado' ? 'activo' : k,
        sinClaveEstado(v),
      ]),
    );
  }
  return valor;
};

/**
 * Bitácora de actividad: quién hizo qué, cuándo, en qué empresa y con qué
 * resultado. Solo se agrega (un trigger de la base rechaza UPDATE y DELETE).
 * Registrar nunca rompe la operación que se está registrando.
 */
@Injectable()
export class ActividadService {
  private readonly logger = new Logger(ActividadService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(e: EventoActividad): Promise<void> {
    try {
      await this.prisma.registroActividad.create({
        data: {
          idUsuario: e.idUsuario ?? null,
          usuarioCodigo: e.usuarioCodigo ?? null,
          usuarioNombre: e.usuarioNombre ?? null,
          usuarioRol: e.usuarioRol ?? null,
          idEmpresaEmpleadora: e.idEmpresaEmpleadora ?? null,
          accion: e.accion,
          entidad: e.entidad,
          idEntidad: e.idEntidad ?? null,
          descripcion: e.descripcion.slice(0, 500),
          detalle:
            e.detalle === undefined
              ? undefined
              : (limpiarParaBitacora(e.detalle) as Prisma.InputJsonValue),
          metodo: e.metodo,
          ruta: e.ruta,
          resultado: e.resultado,
          codigoHttp: e.codigoHttp,
          ip: e.ip ?? null,
          userAgent: e.userAgent?.slice(0, 300) ?? null,
        },
      });
    } catch (error) {
      this.logger.error('No se pudo registrar la actividad', error as Error);
    }
  }

  /**
   * Lectura con el alcance del usuario: el dueño, todo; el equipo, sus
   * empresas (o todo); RR. HH., su empresa. Los eventos sin empresa (inicios
   * de sesión, cuentas internas) solo los ve quien ve todas las empresas.
   */
  /** El mismo recorte para la tabla y para el Excel. */
  private construirWhere(
    alcance: Alcance,
    q: ActividadQueryDto,
  ): Prisma.RegistroActividadWhereInput {
    const empresas = empresasDelAlcance(alcance);
    const pedida = Number(q.idEmpresaEmpleadora);
    const condiciones: Prisma.RegistroActividadWhereInput[] = [];

    if (empresas !== null) {
      condiciones.push({ idEmpresaEmpleadora: { in: empresas } });
    }
    if (Number.isInteger(pedida) && pedida > 0) {
      condiciones.push({ idEmpresaEmpleadora: pedida });
    }
    if (q.accion) condiciones.push({ accion: q.accion });
    // "Grupo ocupacional" se llamaba "unidad ocupacional": la bitácora no se
    // reescribe, así que el filtro busca con los dos nombres.
    if (q.entidad)
      condiciones.push(
        q.entidad === 'grupo ocupacional'
          ? { entidad: { in: ['grupo ocupacional', 'unidad ocupacional'] } }
          : { entidad: q.entidad },
      );
    if (q.resultado) condiciones.push({ resultado: q.resultado });
    if (q.usuario?.trim()) {
      const t = q.usuario.trim();
      condiciones.push({
        OR: [
          { usuarioCodigo: { contains: t, mode: 'insensitive' } },
          { usuarioNombre: { contains: t, mode: 'insensitive' } },
        ],
      });
    }
    if (q.search?.trim()) {
      condiciones.push({
        descripcion: { contains: q.search.trim(), mode: 'insensitive' },
      });
    }
    if (q.desde) condiciones.push({ fecha: { gte: new Date(q.desde) } });
    if (q.hasta) {
      const h = new Date(q.hasta);
      h.setUTCDate(h.getUTCDate() + 1);
      condiciones.push({ fecha: { lt: h } });
    }

    return { AND: condiciones };
  }

  async listar(alcance: Alcance, q: ActividadQueryDto) {
    const where = this.construirWhere(alcance, q);
    const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 100);
    const page = Math.max(Number(q.page) || 1, 1);

    const [total, registros, empresasNombre] = await Promise.all([
      this.prisma.registroActividad.count({ where }),
      this.prisma.registroActividad.findMany({
        where,
        orderBy: { fecha: q.sortOrder === 'asc' ? 'asc' : 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.empresaEmpleadora.findMany({
        select: { idEmpresaEmpleadora: true, nombreEmpresa: true },
      }),
    ]);
    const nombre = new Map(
      empresasNombre.map((e) => [e.idEmpresaEmpleadora, e.nombreEmpresa]),
    );

    return {
      registros: registros.map((r) => ({
        ...r,
        detalle: sinClaveEstado(r.detalle),
        empresa: r.idEmpresaEmpleadora
          ? (nombre.get(r.idEmpresaEmpleadora) ?? null)
          : null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * La bitácora en Excel, con los mismos filtros que la tabla (hasta 10 000
   * filas: para más, acotar por fechas). "Cambios" va como texto legible.
   */
  async exportar(alcance: Alcance, q: ActividadQueryDto) {
    const where = this.construirWhere(alcance, q);
    const [registros, empresas] = await Promise.all([
      this.prisma.registroActividad.findMany({
        where,
        orderBy: { fecha: q.sortOrder === 'asc' ? 'asc' : 'desc' },
        take: 10000,
      }),
      this.prisma.empresaEmpleadora.findMany({
        select: { idEmpresaEmpleadora: true, nombreEmpresa: true },
      }),
    ]);
    const nombre = new Map(
      empresas.map((e) => [e.idEmpresaEmpleadora, e.nombreEmpresa]),
    );
    const texto = (v: unknown) =>
      v === null || v === undefined || v === '' ? 'vacío' : String(v);
    const cambios = (d: unknown) => {
      const c = (
        d as { cambios?: Record<string, { antes: unknown; despues: unknown }> }
      )?.cambios;
      return c
        ? Object.entries(c)
            .map(([k, v]) => `${k}: ${texto(v.antes)} → ${texto(v.despues)}`)
            .join('; ')
        : '';
    };

    return construirLibroExcel([
      {
        nombre: 'Actividad',
        columnas: [
          { header: 'Fecha', key: 'fecha', width: 20, tipo: 'fecha' },
          { header: 'Usuario', key: 'usuarioCodigo', width: 22, tipo: 'texto' },
          { header: 'Nombre', key: 'usuarioNombre', width: 28 },
          { header: 'Rol', key: 'usuarioRol', width: 16 },
          { header: 'Empresa', key: 'empresa', width: 24 },
          { header: 'Acción', key: 'accion', width: 20 },
          { header: 'Sobre', key: 'entidad', width: 20 },
          { header: 'ID', key: 'idEntidad', width: 10, tipo: 'texto' },
          { header: 'Qué pasó', key: 'descripcion', width: 70 },
          { header: 'Resultado', key: 'resultado', width: 12 },
          { header: 'Cambios', key: 'cambios', width: 60 },
          { header: 'IP', key: 'ip', width: 16, tipo: 'texto' },
        ],
        filas: registros.map((r) => ({
          ...r,
          empresa: r.idEmpresaEmpleadora
            ? (nombre.get(r.idEmpresaEmpleadora) ?? '')
            : '',
          resultado: r.resultado === 'OK' ? 'Realizado' : 'Rechazado',
          cambios: cambios(r.detalle),
        })),
      },
    ]);
  }
}
