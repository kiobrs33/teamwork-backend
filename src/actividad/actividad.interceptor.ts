import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActividadService } from './actividad.service';

/** Recurso de la URL → modelo de Prisma y su clave, para el antes/después. */
const MODELOS: Record<string, { modelo: string; id: string; nombre: string }> =
  {
    empleado: { modelo: 'empleado', id: 'idEmpleado', nombre: 'trabajador' },
    'area-empleadora': {
      modelo: 'areaEmpleadora',
      id: 'idAreaEmpleadora',
      nombre: 'área',
    },
    'gerencia-empleadora': {
      modelo: 'gerenciaEmpleadora',
      id: 'idGerenciaEmpleadora',
      nombre: 'gerencia',
    },
    'puesto-empleadora': {
      modelo: 'puestoEmpleadora',
      id: 'idPuestoEmpleadora',
      nombre: 'puesto',
    },
    'unidad-ocupacional-empleadora': {
      modelo: 'unidadOcupacionalEmpleadora',
      id: 'idUnidadOcupacionalEmpleadora',
      nombre: 'grupo ocupacional',
    },
    'empresa-empleadora': {
      modelo: 'empresaEmpleadora',
      id: 'idEmpresaEmpleadora',
      nombre: 'empresa',
    },
    campana: {
      modelo: 'campanaEvaluacion',
      id: 'idCampanaEvaluacion',
      nombre: 'campaña',
    },
    competencia: {
      modelo: 'competencia',
      id: 'idCompetencia',
      nombre: 'competencia',
    },
    objetivo: { modelo: 'objetivo', id: 'idObjetivo', nombre: 'objetivo' },
    empleo: { modelo: 'empleo', id: 'idEmpleo', nombre: 'oferta de empleo' },
  };

/**
 * Cuentas de usuario (equipo de TeamWork y RR. HH.): se leen con un select
 * propio, sin la contraseña cifrada y con las empresas asignadas como texto,
 * para que el «qué cambió» las muestre.
 */
const CUENTAS = new Set(['equipo-teamwork', 'administradores']);

const NOMBRES_RECURSO: Record<string, string> = {
  auth: 'sesión',
  administradores: 'administrador de empresa',
  'equipo-teamwork': 'cuenta del equipo',
  evidencias: 'evidencia',
  calibracion: 'calibración',
  retroalimentacion: 'retroalimentación',
  'registros-proceso': 'registro del proceso',
  'retroalimentacion-detalle': 'retroalimentación',
  reporte: 'reporte',
  plataforma: 'configuración de la plataforma',
};

/** Campos que no aportan al "qué cambió". */
const RUIDO = new Set([
  'fechaModificacion',
  'actualizadoPorId',
  'fechaCreacion',
  'creadoPorId',
  'contrasena',
]);

/** Para los intentos rechazados: "Intento rechazado: editar empresa…". */
const INFINITIVOS: Record<string, string> = {
  CREAR: 'crear',
  EDITAR: 'editar',
  ELIMINAR: 'eliminar',
  CAMBIAR_SITUACION: 'cambiar la situación de',
  ASIGNAR: 'cambiar las competencias asignadas al',
  IMPORTAR: 'importar',
  CALIFICAR: 'calificar',
  CERRAR_CAMPANA: 'cerrar',
  REABRIR_CAMPANA: 'reabrir',
  CAMBIAR_CONTRASENA: 'cambiar la contraseña de',
  RESTABLECER_CONTRASENA: 'restablecer la contraseña de',
  DESACTIVAR_CUENTA: 'desactivar',
  REACTIVAR_CUENTA: 'reactivar',
  ARCHIVAR: 'archivar',
  RESTAURAR: 'restaurar',
  OTRA: 'modificar',
};

const VERBOS: Record<string, string> = {
  CREAR: 'Creó',
  EDITAR: 'Editó',
  ELIMINAR: 'Eliminó',
  CAMBIAR_SITUACION: 'Cambió la situación de',
  ASIGNAR: 'Cambió las competencias asignadas al',
  IMPORTAR: 'Importó',
  CALIFICAR: 'Calificó',
  CERRAR_CAMPANA: 'Cerró',
  REABRIR_CAMPANA: 'Reabrió',
  CAMBIAR_CONTRASENA: 'Cambió la contraseña de',
  RESTABLECER_CONTRASENA: 'Restableció la contraseña de',
  DESACTIVAR_CUENTA: 'Desactivó',
  REACTIVAR_CUENTA: 'Reactivó',
  ARCHIVAR: 'Archivó',
  RESTAURAR: 'Restauró',
  INICIAR_SESION: 'Inició sesión',
  INICIO_FALLIDO: 'Intento fallido de inicio de sesión',
  OTRA: 'Modificó',
};

const accionDe = (metodo: string, ruta: string): string => {
  if (ruta === '/auth/login') return 'INICIAR_SESION';
  if (ruta.endsWith('/contrasena')) return 'CAMBIAR_CONTRASENA';
  if (ruta.endsWith('/situacion')) return 'CAMBIAR_SITUACION';
  // Guardar la asignación de un grupo no crea nada: se registraba como
  // «Creó grupo ocupacional».
  if (ruta.endsWith('/asignar')) return 'ASIGNAR';
  if (ruta.endsWith('/cerrar')) return 'CERRAR_CAMPANA';
  if (ruta.endsWith('/reabrir')) return 'REABRIR_CAMPANA';
  if (ruta.endsWith('/archivar')) return 'ARCHIVAR';
  if (ruta.endsWith('/restaurar')) return 'RESTAURAR';
  // La ruta anterior de "eliminar" empresa ahora archiva.
  if (metodo === 'DELETE' && /^\/empresa-empleadora\/\d+$/.test(ruta))
    return 'ARCHIVAR';
  if (/masivo|import/.test(ruta) && metodo === 'POST') return 'IMPORTAR';
  if (/evaluar|calificar|evaluaciones\/.*item/.test(ruta)) return 'CALIFICAR';
  if (metodo === 'POST') return 'CREAR';
  if (metodo === 'PATCH' || metodo === 'PUT') return 'EDITAR';
  if (metodo === 'DELETE') return 'ELIMINAR';
  return 'OTRA';
};

/** Lo que distingue a un registro en una línea de texto. */
const etiqueta = (r: Record<string, unknown> | null | undefined) => {
  if (!r) return '';
  if (r.nombres || r.apellidos)
    return `${r.nombres ?? ''} ${r.apellidos ?? ''}`.trim();
  return String(
    r.nombreEmpresa ??
      // El título antes que `nombre`: en las competencias `nombre` es la
      // definición, y la bitácora decía «Eliminó competencia «Capacidad
      // para orientar al equipo…»».
      r.titulo ??
      r.nombre ??
      r.nombreCompleto ??
      r.descripcion ??
      r.codigoUsuario ??
      '',
  );
};

/** Solo los campos simples que cambiaron, con su valor antes y después. */
const diferencias = (
  antes: Record<string, unknown> | null,
  despues: Record<string, unknown> | null,
) => {
  if (!antes || !despues) return undefined;
  const norm = (v: unknown) => (v instanceof Date ? v.toISOString() : v);
  const cambios: Record<string, { antes: unknown; despues: unknown }> = {};
  for (const k of Object.keys({ ...antes, ...despues })) {
    if (RUIDO.has(k)) continue;
    const a = norm(antes[k]);
    const d = norm(despues[k]);
    if (typeof a === 'object' && a !== null) continue;
    if (typeof d === 'object' && d !== null) continue;
    if (a !== d) cambios[k] = { antes: a, despues: d };
  }
  return Object.keys(cambios).length ? cambios : undefined;
};

/**
 * Registra en la bitácora toda operación que cambia datos (POST, PUT, PATCH,
 * DELETE), con quién, cuándo, en qué empresa, el resultado y, cuando la ruta
 * apunta a un registro (`/recurso/:id`), qué campos cambiaron (antes y
 * después). Las lecturas no se registran. El inicio de sesión se registra sin
 * el cuerpo (lleva la contraseña); nada sensible se guarda en ningún caso.
 */
@Injectable()
export class ActividadInterceptor implements NestInterceptor {
  constructor(
    private readonly actividad: ActividadService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (ctx.getType() !== 'http') return next.handle();
    const req = ctx.switchToHttp().getRequest<Request & { user?: any }>();
    const metodo = req.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(metodo)) {
      return next.handle();
    }

    const ruta: string =
      (req.baseUrl ?? '') +
      ((req.route as { path?: string })?.path ?? req.path);
    // Los cálculos de impacto (`…/impacto`, `…/impacto-edicion`) son POST
    // porque llevan un cuerpo, pero solo consultan: no son una acción.
    if (/\/impacto(-[a-z]+)?(\/pdf)?$/.test(ruta)) return next.handle();
    // Las cuentas de RR. HH. cuelgan de la empresa en la URL, pero no son
    // la empresa: se registran como su propio recurso.
    const recurso = ruta.includes('/administradores')
      ? 'administradores'
      : (ruta.split('/').filter(Boolean)[0] ?? '');
    const esCuenta = CUENTAS.has(recurso);
    const cuerpo: any = req.body ?? {};
    // En una cuenta, el mismo PATCH sirve para tres cosas distintas: se
    // registran con su nombre, no como una «edición» más.
    const accion =
      esCuenta && metodo === 'PATCH' && cuerpo.activo === false
        ? 'DESACTIVAR_CUENTA'
        : esCuenta && metodo === 'PATCH' && cuerpo.activo === true
          ? 'REACTIVAR_CUENTA'
          : esCuenta && metodo === 'PATCH' && cuerpo.contrasena
            ? 'RESTABLECER_CONTRASENA'
            : accionDe(metodo, ruta);
    const esLogin = accion === 'INICIAR_SESION';
    const modelo = MODELOS[recurso];
    const idParam =
      (req.params?.id as string | undefined) ??
      (req.params?.idCampana as string | undefined) ??
      (req.params?.idUsuario as string | undefined);
    const conRegistro =
      (!!modelo || esCuenta) &&
      !!idParam &&
      (['PATCH', 'PUT', 'DELETE'].includes(metodo) ||
        // Archivar y restaurar son POST, pero cambian un registro que existe.
        accion === 'ARCHIVAR' ||
        accion === 'RESTAURAR');

    const leer = async () => {
      if (!conRegistro) return null;
      if (esCuenta) {
        const u = await this.prisma.usuario
          .findUnique({
            where: { idUsuario: Number(idParam) },
            select: {
              codigoUsuario: true,
              nombreCompleto: true,
              estado: true,
              todasLasEmpresas: true,
              idEmpresaEmpleadora: true,
              empresasAsignadas: {
                select: {
                  empresaEmpleadora: { select: { nombreEmpresa: true } },
                },
              },
            },
          })
          .catch(() => null);
        if (!u) return null;
        const { empresasAsignadas, ...resto } = u;
        return {
          ...resto,
          empresasAsignadas:
            empresasAsignadas
              .map((a) => a.empresaEmpleadora.nombreEmpresa)
              .sort()
              .join(', ') || null,
        };
      }
      try {
        const delegado = (this.prisma as any)[modelo.modelo];
        return (await delegado.findUnique({
          where: { [modelo.id]: Number(idParam) },
        })) as Record<string, unknown> | null;
      } catch {
        return null;
      }
    };

    const registrar = async (
      resultado: 'OK' | 'ERROR',
      codigoHttp: number,
      antes: Record<string, unknown> | null,
      respuesta?: unknown,
      error?: unknown,
    ) => {
      const despues = resultado === 'OK' ? await leer() : null;
      const body: any = cuerpo;

      // Autor: el del token; en el login, el usuario que intentó entrar.
      const usuarioCodigo: string | null =
        req.user?.codigoUsuario ??
        (esLogin ? body.codigoUsuario : null) ??
        null;
      let idUsuario: number | null = req.user?.idUsuario ?? null;
      let usuarioNombre: string | null = null;
      let usuarioRol: string | null = req.user?.rol ?? null;
      let empresaDelAutor: number | null = null;
      if (usuarioCodigo) {
        // El usuario ya no es único en todo el sistema (las cuentas de
        // trabajadores son por empresa): con sesión, por su id; en el login,
        // por la cuenta elegida si llegó, o la primera con ese usuario.
        const idElegido =
          req.user?.idUsuario ?? (esLogin ? body.idUsuario : null);
        const u = await this.prisma.usuario
          .findFirst({
            where: idElegido
              ? { idUsuario: Number(idElegido) }
              : { codigoUsuario: usuarioCodigo },
            select: {
              idUsuario: true,
              rol: true,
              nombreCompleto: true,
              idEmpresaEmpleadora: true,
              empleado: {
                select: {
                  nombres: true,
                  apellidos: true,
                  idEmpresaEmpleadora: true,
                },
              },
            },
          })
          .catch(() => null);
        if (u) {
          idUsuario = u.idUsuario;
          usuarioRol = u.rol;
          usuarioNombre =
            u.nombreCompleto ??
            (u.empleado
              ? `${u.empleado.nombres} ${u.empleado.apellidos}`
              : null);
          empresaDelAutor =
            u.empleado?.idEmpresaEmpleadora ?? u.idEmpresaEmpleadora ?? null;
        }
      }

      // Empresa del hecho: la del registro, la del cuerpo o la del autor.
      const ref = despues ?? antes;
      let idEmpresa: number | null =
        (recurso === 'empresa-empleadora' && idParam
          ? Number(idParam)
          : null) ?? null;
      idEmpresa ??=
        (ref?.idEmpresaEmpleadora as number | undefined) ??
        (Number(body.idEmpresaEmpleadora) || null) ??
        (Number(req.params?.idEmpresa) || null) ??
        // DELETE y algunas acciones llevan la empresa en la query.
        (Number(req.query?.idEmpresaEmpleadora) || null);
      if (!idEmpresa && Array.isArray(body)) {
        idEmpresa = Number(body[0]?.idEmpresaEmpleadora) || null;
      }
      if (!idEmpresa && Array.isArray(body.ids) && modelo) {
        const primero = await (this.prisma as any)[modelo.modelo]
          .findUnique({
            where: { [modelo.id]: Number(body.ids[0]) },
            select: { idEmpresaEmpleadora: true },
          })
          .catch(() => null);
        idEmpresa = primero?.idEmpresaEmpleadora ?? null;
      }
      // Acciones POST sobre un registro que ya existe (cerrar o reabrir una
      // campaña…) no lo leen antes: su empresa se busca en el registro. Sin
      // esto caían en la empresa del autor (el cierre de EGEMSA quedó en la
      // de admin y el RR. HH. de EGEMSA no lo veía).
      if (!idEmpresa && modelo && idParam && Number(idParam)) {
        const registro = await (this.prisma as any)[modelo.modelo]
          .findUnique({
            where: { [modelo.id]: Number(idParam) },
            select: { idEmpresaEmpleadora: true },
          })
          .catch(() => null);
        idEmpresa = registro?.idEmpresaEmpleadora ?? null;
      }
      // Las cuentas del equipo no son de ninguna empresa: sin esto, el hecho
      // caería en la empresa del autor y lo vería su RR. HH.
      if (recurso !== 'equipo-teamwork') idEmpresa ??= empresaDelAutor;

      const nombreRecurso =
        modelo?.nombre ?? NOMBRES_RECURSO[recurso] ?? recurso;
      const cuantos = Array.isArray(body)
        ? body.length
        : Array.isArray(body.ids)
          ? body.ids.length
          : null;
      const accionFinal =
        esLogin && resultado === 'ERROR' ? 'INICIO_FALLIDO' : accion;
      const quien = etiqueta(
        ref ??
          (respuesta as any)?.data?.[
            Object.keys((respuesta as any)?.data ?? {})[0]
          ],
      );
      let descripcion =
        accionFinal === 'INICIAR_SESION' || accionFinal === 'INICIO_FALLIDO'
          ? VERBOS[accionFinal]
          : `${resultado === 'ERROR' ? `Intento rechazado: ${INFINITIVOS[accionFinal] ?? 'modificar'}` : (VERBOS[accionFinal] ?? 'Modificó')} ${cuantos && cuantos > 1 ? `${cuantos} registros de ${nombreRecurso}` : nombreRecurso}${quien ? ` «${quien}»` : ''}${idParam ? ` (#${idParam})` : ''}`;
      if (accionFinal === 'CAMBIAR_SITUACION' && body.situacion) {
        descripcion += ` → ${String(body.situacion).toLowerCase()}${body.motivo ? ` (${body.motivo})` : ''}`;
      }
      // Cambio excepcional de una campaña (modelo o escala con notas
      // puestas): el motivo va en la descripción, a la vista en la lista.
      const motivoExcepcional =
        recurso === 'campana' &&
        typeof body.motivoCambioExcepcional === 'string'
          ? body.motivoCambioExcepcional.trim()
          : '';
      if (motivoExcepcional && resultado === 'OK') {
        descripcion += ` — cambio excepcional: ${motivoExcepcional}`;
      }
      if (resultado === 'ERROR') {
        const msg =
          error instanceof HttpException
            ? ((error.getResponse() as any)?.message ?? error.message)
            : (error as Error)?.message;
        descripcion += ` — ${Array.isArray(msg) ? msg[0] : msg}`;
      }

      await this.actividad.registrar({
        idUsuario,
        usuarioCodigo,
        usuarioNombre,
        usuarioRol,
        idEmpresaEmpleadora: idEmpresa,
        accion: accionFinal,
        entidad: nombreRecurso,
        idEntidad: idParam ?? null,
        descripcion,
        detalle: esLogin
          ? undefined
          : conRegistro && resultado === 'OK'
            ? {
                // La contraseña no se guarda nunca, ni cifrada: solo consta
                // que se cambió.
                cambios:
                  accionFinal === 'RESTABLECER_CONTRASENA'
                    ? {
                        ...diferencias(antes, despues),
                        // La clave no puede decir «contraseña»: la limpieza la quitaría.
                        acceso: {
                          antes: 'La anterior',
                          despues: 'Una nueva',
                        },
                      }
                    : (diferencias(antes, despues) ?? null),
                // Notas que un cambio excepcional a Likert vació, con su
                // valor anterior: es la única copia que queda de ellas.
                ...(motivoExcepcional &&
                  (respuesta as any)?.data?.notasVaciadas?.length && {
                    notasVaciadas: (respuesta as any).data.notasVaciadas,
                  }),
              }
            : { enviado: body },
        metodo,
        ruta,
        resultado,
        codigoHttp,
        ip:
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
          req.ip,
        userAgent: req.headers['user-agent'] ?? null,
      });
    };

    return from(leer()).pipe(
      switchMap((antes) =>
        next.handle().pipe(
          tap((respuesta) => {
            const codigo = ctx.switchToHttp().getResponse().statusCode ?? 200;
            void registrar('OK', codigo, antes, respuesta);
          }),
          catchError((error) => {
            const codigo =
              error instanceof HttpException ? error.getStatus() : 500;
            void registrar('ERROR', codigo, antes, undefined, error);
            return throwError(() => error);
          }),
        ),
      ),
    );
  }
}
