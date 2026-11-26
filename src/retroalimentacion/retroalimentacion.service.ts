import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReporteService } from 'src/reporte/reporte.service';
import { CompetenciaService } from 'src/competencia/competencia.service';
import { campanaEnCurso } from 'src/common/resultados/campana';
import {
  clasificarDesempeno,
  clasificarResultadoFinal,
} from 'src/common/resultados/resultados-evaluacion';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import {
  ConformidadDto,
  SesionRetroalimentacionDto,
} from './dto/retroalimentacion.dto';

type Fila = Awaited<
  ReturnType<CompetenciaService['resultadosDeEmpresa']>
>['filas'][number];

/**
 * Retroalimentación con conformidad (guía FONAFE, pp. 33–34). El jefe
 * registra la sesión (fortalezas, oportunidades, compromisos) y el
 * trabajador, al verla, responde si está conforme. Los resultados que se
 * enseñan son los del Excel y el PDF, ya calibrados
 * (`CompetenciaService.resultadosDeEmpresa`).
 */
@Injectable()
export class RetroalimentacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly competencias: CompetenciaService,
    private readonly reportes: ReporteService,
  ) {}

  /** Resultado legible de una fila del cálculo. */
  private resultado(f: Fila | undefined) {
    if (!f || f.resultado.sinEvaluar) return null;
    return {
      competencias:
        f.calculado.competenciasSinEvaluar && !f.ajuste?.competencias
          ? null
          : f.resultado.competencias,
      objetivos:
        f.calculado.objetivosSinEvaluar && !f.ajuste?.objetivos
          ? null
          : f.resultado.objetivos,
      final: f.resultado.final,
      nivel: clasificarResultadoFinal(f.resultado.final).nivel,
      calibrado: Boolean(f.ajuste),
    };
  }

  private sesionPublica(
    s: {
      fechaSesion: Date;
      fortalezas: string;
      oportunidades: string;
      compromisos: string;
      conformidad: string;
      comentarioTrabajador: string | null;
      fechaRespuesta: Date | null;
    } | null,
  ) {
    return s
      ? {
          fechaSesion: s.fechaSesion.toISOString().slice(0, 10),
          fortalezas: s.fortalezas,
          oportunidades: s.oportunidades,
          compromisos: s.compromisos,
          conformidad: s.conformidad,
          comentarioTrabajador: s.comentarioTrabajador,
          fechaRespuesta: s.fechaRespuesta,
        }
      : null;
  }

  /**
   * El plan de acción de cada trabajador en la campaña (`RetroalimentacionDetalle`,
   * colgado de su ficha de objetivos): objetivo de desarrollo, actividad,
   * plazo y estado. Es la segunda parte del formato de retroalimentación de
   * FONAFE; antes se registraba aparte, en «Reportes».
   */
  private async planesDe(idsEmpleado: number[], idCampana: number) {
    const fichas = await this.prisma.objetivo.findMany({
      where: {
        idEmpleado: { in: idsEmpleado },
        idCampanaEvaluacion: idCampana,
        estado: true,
      },
      select: {
        idObjetivo: true,
        idEmpleado: true,
        retroalimentacionDetalles: {
          where: { estado: true },
          orderBy: { idRetroalimentacionDetalle: 'asc' },
          select: {
            idRetroalimentacionDetalle: true,
            descripcionObjetivo: true,
            descripcionActividad: true,
            descripcionFecha: true,
            descripcionEstado: true,
          },
        },
      },
    });
    return new Map(
      fichas.map((f) => [
        f.idEmpleado,
        { idObjetivo: f.idObjetivo, acciones: f.retroalimentacionDetalles },
      ]),
    );
  }

  // ── Jefe ────────────────────────────────────────────────────────────
  /** Su equipo directo en la campaña en curso, con resultado y sesión. */
  async equipo(user: AuthUser) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: {
        idEmpleado: true,
        codigoEmpleado: true,
        idEmpresaEmpleadora: true,
      },
    });
    if (!yo) throw new ForbiddenException('Su cuenta no es de un trabajador.');
    const campana = await campanaEnCurso(this.prisma, yo.idEmpresaEmpleadora);
    if (!campana) return { campana: null, equipo: [] };
    const subordinados = await this.prisma.empleado.findMany({
      where: {
        codigoEmpleadoJefe: yo.codigoEmpleado,
        idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
        estado: true,
      },
      select: {
        idEmpleado: true,
        codigoEmpleado: true,
        nombres: true,
        apellidos: true,
        puestoEmpleadora: { select: { descripcion: true } },
      },
      orderBy: { apellidos: 'asc' },
    });
    const [{ filas, empresa }, sesiones, planes] = await Promise.all([
      this.competencias.resultadosDeEmpresa(
        yo.idEmpresaEmpleadora,
        campana.idCampanaEvaluacion,
      ),
      this.prisma.sesionRetroalimentacion.findMany({
        where: {
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          idEmpleado: { in: subordinados.map((s) => s.idEmpleado) },
        },
      }),
      this.planesDe(
        subordinados.map((s) => s.idEmpleado),
        campana.idCampanaEvaluacion,
      ),
    ]);
    const fila = new Map(filas.map((f) => [f.idEmpleado, f]));
    const sesion = new Map(sesiones.map((s) => [s.idEmpleado, s]));
    return {
      // Los pesos encabezan las columnas Competencias y Objetivos.
      campana: {
        nombre: campana.nombre,
        porcentajeCompetencias: campana.porcentajeCompetecias,
        porcentajeObjetivos: campana.porcentajeObjetivos,
      },
      equipo: subordinados.map((s) => ({
        idEmpleado: s.idEmpleado,
        codigo: s.codigoEmpleado,
        nombre: `${s.nombres} ${s.apellidos}`.trim(),
        puesto: s.puestoEmpleadora?.descripcion ?? null,
        resultado: this.resultado(fila.get(s.idEmpleado)),
        // Clasificación de la nota de competencias (la usa «Competencias del
        // equipo»), con la escala de la campaña.
        nivelCompetencias: (() => {
          const nota = this.resultado(fila.get(s.idEmpleado))?.competencias;
          return nota == null
            ? null
            : clasificarDesempeno(nota, empresa?.tipoCalificacionCompetencia)
                .nivel;
        })(),
        sesion: this.sesionPublica(sesion.get(s.idEmpleado) ?? null),
        // Sin ficha de objetivos no hay dónde colgar el plan (null).
        idObjetivo: planes.get(s.idEmpleado)?.idObjetivo ?? null,
        plan: planes.get(s.idEmpleado)?.acciones ?? [],
      })),
    };
  }

  /**
   * Para preparar la sesión de un subordinado directo: cada competencia con
   * su nota frente a lo esperado (y la autoevaluación, si se aleja) y cada
   * objetivo con su cumplimiento. Mismo cálculo que el informe PDF
   * (`ReporteService.datosReporte`), así lo que se conversa cuadra con lo
   * que el trabajador recibe.
   */
  async apoyo(user: AuthUser, idEmpleado: number) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: { codigoEmpleado: true, idEmpresaEmpleadora: true },
    });
    if (!yo) throw new ForbiddenException('Su cuenta no es de un trabajador.');
    const suyo = await this.prisma.empleado.findFirst({
      where: {
        idEmpleado,
        codigoEmpleadoJefe: yo.codigoEmpleado,
        idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
        estado: true,
      },
      select: { idEmpleado: true },
    });
    if (!suyo) throw new NotFoundException('No está en su equipo.');
    const d = await this.reportes.datosReporte(idEmpleado);
    return {
      esperado: d.competenciasDetalle[0]?.competenciaResultadoEsperado ?? null,
      competencias: d.competenciasDetalle.map((c) => ({
        nombre: c.competencia,
        nivel: c.nivel,
        nota: c.noEvaluada ? null : c.resultadoFinal,
        autoevaluacion: c.brecha ? c.autoevaluacion : null,
      })),
      objetivos: d.objetivosDetalle.map((o) => ({
        descripcion: o.descripcion,
        peso: o.pesoEspecifico,
        cumplimiento:
          typeof o.porcentajeLogrado === 'string' &&
          o.porcentajeLogrado.endsWith('%')
            ? Number(o.porcentajeLogrado.slice(0, -1))
            : null,
      })),
    };
  }

  /** El jefe registra o corrige la sesión de un subordinado directo. */
  async registrarSesion(user: AuthUser, dto: SesionRetroalimentacionDto) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: {
        idEmpleado: true,
        codigoEmpleado: true,
        idEmpresaEmpleadora: true,
      },
    });
    if (!yo) throw new ForbiddenException('Su cuenta no es de un trabajador.');
    const trabajador = await this.prisma.empleado.findFirst({
      where: {
        idEmpleado: dto.idEmpleado,
        codigoEmpleadoJefe: yo.codigoEmpleado,
        idEmpresaEmpleadora: yo.idEmpresaEmpleadora,
        estado: true,
      },
      select: { idEmpleado: true },
    });
    if (!trabajador) {
      throw new NotFoundException(
        'Solo puede registrar la retroalimentación de su equipo directo.',
      );
    }
    const campana = await campanaEnCurso(this.prisma, yo.idEmpresaEmpleadora);
    if (!campana) {
      throw new BadRequestException(
        'No hay una campaña en curso: la retroalimentación se registra antes de cerrarla.',
      );
    }
    const { filas } = await this.competencias.resultadosDeEmpresa(
      yo.idEmpresaEmpleadora,
      campana.idCampanaEvaluacion,
    );
    if (!this.resultado(filas.find((f) => f.idEmpleado === dto.idEmpleado))) {
      throw new BadRequestException(
        'El trabajador todavía no tiene resultado: califíquelo antes de la retroalimentación.',
      );
    }
    const fecha = new Date(`${dto.fechaSesion}T00:00:00Z`);
    if (Number.isNaN(fecha.getTime()) || fecha.getTime() > Date.now()) {
      throw new BadRequestException(
        'Indique la fecha de la sesión (no puede ser futura).',
      );
    }
    const datos = {
      fechaSesion: fecha,
      fortalezas: dto.fortalezas.trim(),
      oportunidades: dto.oportunidades.trim(),
      compromisos: dto.compromisos.trim(),
    };
    const existente = await this.prisma.sesionRetroalimentacion.findUnique({
      where: {
        idCampanaEvaluacion_idEmpleado: {
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          idEmpleado: dto.idEmpleado,
        },
      },
    });
    if (existente) {
      // Si el jefe cambia lo conversado, la respuesta anterior ya no vale:
      // el trabajador vuelve a responder sobre lo nuevo.
      const cambio =
        existente.fortalezas !== datos.fortalezas ||
        existente.oportunidades !== datos.oportunidades ||
        existente.compromisos !== datos.compromisos;
      return this.prisma.sesionRetroalimentacion.update({
        where: {
          idSesionRetroalimentacion: existente.idSesionRetroalimentacion,
        },
        data: {
          ...datos,
          ...(cambio
            ? {
                conformidad: 'PENDIENTE',
                comentarioTrabajador: null,
                fechaRespuesta: null,
              }
            : {}),
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });
    }
    return this.prisma.sesionRetroalimentacion.create({
      data: {
        ...datos,
        idCampanaEvaluacion: campana.idCampanaEvaluacion,
        idEmpleado: dto.idEmpleado,
        idJefe: yo.idEmpleado,
        creadoPorId: user.idUsuario,
      },
    });
  }

  // ── Trabajador ──────────────────────────────────────────────────────
  /** Su resultado de la campaña en curso, solo si ya tuvo la sesión. */
  async mia(user: AuthUser) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: { idEmpleado: true, idEmpresaEmpleadora: true },
    });
    if (!yo) return { campana: null, sesion: null, resultado: null };
    const campana = await campanaEnCurso(this.prisma, yo.idEmpresaEmpleadora);
    if (!campana) return { campana: null, sesion: null, resultado: null };
    const sesion = await this.prisma.sesionRetroalimentacion.findUnique({
      where: {
        idCampanaEvaluacion_idEmpleado: {
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          idEmpleado: yo.idEmpleado,
        },
      },
      include: { jefe: { select: { nombres: true, apellidos: true } } },
    });
    // El resultado se enseña cuando el jefe lo comunica en la sesión, no
    // antes: así lo plantea la guía (evaluar → calibrar → retroalimentar).
    if (!sesion) {
      return {
        campana: { nombre: campana.nombre },
        sesion: null,
        resultado: null,
      };
    }
    const [{ filas }, planes] = await Promise.all([
      this.competencias.resultadosDeEmpresa(
        yo.idEmpresaEmpleadora,
        campana.idCampanaEvaluacion,
      ),
      this.planesDe([yo.idEmpleado], campana.idCampanaEvaluacion),
    ]);
    return {
      campana: { nombre: campana.nombre },
      plan: planes.get(yo.idEmpleado)?.acciones ?? [],
      sesion: {
        ...this.sesionPublica(sesion),
        jefe: `${sesion.jefe.nombres} ${sesion.jefe.apellidos}`.trim(),
      },
      resultado: this.resultado(
        filas.find((f) => f.idEmpleado === yo.idEmpleado),
      ),
    };
  }

  async responder(user: AuthUser, dto: ConformidadDto) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: { idEmpleado: true, idEmpresaEmpleadora: true },
    });
    if (!yo) throw new ForbiddenException('Su cuenta no es de un trabajador.');
    const campana = await campanaEnCurso(this.prisma, yo.idEmpresaEmpleadora);
    if (!campana) {
      throw new BadRequestException('No hay una campaña en curso.');
    }
    const sesion = await this.prisma.sesionRetroalimentacion.findUnique({
      where: {
        idCampanaEvaluacion_idEmpleado: {
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          idEmpleado: yo.idEmpleado,
        },
      },
    });
    if (!sesion) {
      throw new BadRequestException(
        'Su jefe todavía no registra la sesión de retroalimentación.',
      );
    }
    const comentario = String(dto.comentario ?? '').trim();
    if (!dto.conforme && comentario.length < 10) {
      throw new BadRequestException(
        'Explique en qué no está de acuerdo (al menos 10 caracteres).',
      );
    }
    return this.prisma.sesionRetroalimentacion.update({
      where: { idSesionRetroalimentacion: sesion.idSesionRetroalimentacion },
      data: {
        conformidad: dto.conforme ? 'CONFORME' : 'NO_CONFORME',
        comentarioTrabajador: comentario || null,
        fechaRespuesta: new Date(),
        actualizadoPorId: user.idUsuario,
      },
    });
  }

  // ── RR. HH. ─────────────────────────────────────────────────────────
  /** Seguimiento de la empresa: quién tiene sesión y qué respondió. */
  async empresa(idEmpresa: number) {
    const campana = await campanaEnCurso(this.prisma, idEmpresa);
    if (!campana) return { campana: null, filas: [], resumen: null };
    const [{ filas }, sesiones] = await Promise.all([
      this.competencias.resultadosDeEmpresa(
        idEmpresa,
        campana.idCampanaEvaluacion,
      ),
      this.prisma.sesionRetroalimentacion.findMany({
        where: { idCampanaEvaluacion: campana.idCampanaEvaluacion },
        include: { jefe: { select: { nombres: true, apellidos: true } } },
      }),
    ]);
    const evaluados = filas.filter((f) => !f.resultado.sinEvaluar);
    const personas = await this.prisma.empleado.findMany({
      where: { idEmpleado: { in: evaluados.map((f) => f.idEmpleado) } },
      select: {
        idEmpleado: true,
        codigoEmpleadoJefe: true,
        areaEmpleadora: { select: { descripcion: true } },
      },
    });
    const jefes = await this.prisma.empleado.findMany({
      where: {
        idEmpresaEmpleadora: idEmpresa,
        codigoEmpleado: {
          in: [
            ...new Set(
              personas
                .map((p) => p.codigoEmpleadoJefe)
                .filter((c): c is string => !!c),
            ),
          ],
        },
      },
      select: { codigoEmpleado: true, nombres: true, apellidos: true },
    });
    const persona = new Map(personas.map((p) => [p.idEmpleado, p]));
    const jefe = new Map(
      jefes.map((j) => [j.codigoEmpleado, `${j.nombres} ${j.apellidos}`]),
    );
    const sesion = new Map(sesiones.map((s) => [s.idEmpleado, s]));
    const lista = evaluados.map((f) => {
      const p = persona.get(f.idEmpleado);
      const s = sesion.get(f.idEmpleado);
      return {
        idEmpleado: f.idEmpleado,
        codigo: f.codigo,
        nombre: f.nombre,
        area: p?.areaEmpleadora?.descripcion ?? null,
        jefe: p?.codigoEmpleadoJefe
          ? (jefe.get(p.codigoEmpleadoJefe) ?? p.codigoEmpleadoJefe)
          : null,
        resultado: this.resultado(f),
        // No `estado`: el PurgeResponseInterceptor borra esa clave.
        situacion: !s ? 'SIN_SESION' : s.conformidad,
        sesion: this.sesionPublica(s ?? null),
      };
    });
    const cuenta = (e: string) => lista.filter((l) => l.situacion === e).length;
    return {
      campana: { nombre: campana.nombre },
      filas: lista,
      resumen: {
        evaluados: lista.length,
        sinSesion: cuenta('SIN_SESION'),
        pendientes: cuenta('PENDIENTE'),
        conformes: cuenta('CONFORME'),
        noConformes: cuenta('NO_CONFORME'),
      },
    };
  }
}
