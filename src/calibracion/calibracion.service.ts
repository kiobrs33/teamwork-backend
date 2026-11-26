import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompetenciaService } from 'src/competencia/competencia.service';
import { campanaEnCurso } from 'src/common/resultados/campana';
import {
  clasificarResultadoFinal,
  redondear,
} from 'src/common/resultados/resultados-evaluacion';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { AjusteCalibracionDto } from './dto/ajuste-calibracion.dto';

/** Las cinco bandas de la escala, de la más alta a la más baja. */
const NIVELES = [
  'Sobresaliente',
  'Altamente Efectivo',
  'Efectivo',
  'Parcialmente Efectivo',
  'Necesita Mejora',
] as const;

/**
 * Color y rango de cada nivel en el acta: los mismos de la escala en la
 * aplicación (`bandasEscala.ts` del front, colores de antd).
 */
const COLOR_NIVEL: Record<string, string> = {
  Sobresaliente: '#faad14',
  'Altamente Efectivo': '#52c41a',
  Efectivo: '#1677ff',
  'Parcialmente Efectivo': '#fa8c16',
  'Necesita Mejora': '#f5222d',
};
const RANGO_NIVEL: Record<string, string> = {
  Sobresaliente: '105 a más',
  'Altamente Efectivo': '95 – 104',
  Efectivo: '75 – 94',
  'Parcialmente Efectivo': '50 – 74',
  'Necesita Mejora': '0 – 49',
};

/**
 * Calibración (guía FONAFE, p. 32): antes de cerrar la campaña, el comité
 * revisa los resultados, ajusta los inconsistentes con un motivo y deja un
 * acta. Los resultados salen del MISMO cálculo que el Excel y el PDF
 * (`CompetenciaService.resultadosDeEmpresa`); el ajuste se aplica con
 * `aplicarCalibracion`, así que las tres salidas coinciden.
 */
@Injectable()
export class CalibracionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly competencias: CompetenciaService,
  ) {}

  private async campanaAbierta(idEmpresa: number) {
    const campana = await campanaEnCurso(this.prisma, idEmpresa);
    if (!campana) {
      throw new BadRequestException(
        'La empresa no tiene una campaña en curso: solo se calibra antes de cerrarla.',
      );
    }
    return campana;
  }

  /** Resultados de la campaña en curso, con su ajuste y la distribución. */
  async panel(idEmpresa: number) {
    const campana = await campanaEnCurso(this.prisma, idEmpresa);
    if (!campana) return { campana: null, filas: [], distribucion: [] };
    const { filas } = await this.competencias.resultadosDeEmpresa(
      idEmpresa,
      campana.idCampanaEvaluacion,
    );
    const ids = filas.map((f) => f.idEmpleado);
    const [personas, usuarios] = await Promise.all([
      this.prisma.empleado.findMany({
        where: { idEmpleado: { in: ids } },
        select: {
          idEmpleado: true,
          codigoEmpleadoJefe: true,
          gerenciaEmpleadora: { select: { descripcion: true } },
          areaEmpleadora: { select: { descripcion: true } },
          unidadOcupacionalEmpleadora: { select: { descripcion: true } },
        },
      }),
      this.prisma.usuario.findMany({
        where: {
          idUsuario: {
            in: [
              ...new Set(
                filas.flatMap((f) =>
                  f.ajuste
                    ? [f.ajuste.actualizadoPorId ?? f.ajuste.creadoPorId]
                    : [],
                ),
              ),
            ],
          },
        },
        select: { idUsuario: true, nombreCompleto: true, codigoUsuario: true },
      }),
    ]);
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
    // Evidencias de la campaña por trabajador: el comité las revisa antes de
    // ajustar una nota.
    const conteo = await this.prisma.evidencia.groupBy({
      by: ['idEmpleado'],
      where: {
        idCampanaEvaluacion: campana.idCampanaEvaluacion,
        estado: true,
        idEmpleado: { in: ids },
      },
      _count: { _all: true },
    });
    const evidencias = new Map(
      conteo.map((c) => [c.idEmpleado, c._count._all]),
    );
    const persona = new Map(personas.map((p) => [p.idEmpleado, p]));
    const jefe = new Map(
      jefes.map((j) => [j.codigoEmpleado, `${j.nombres} ${j.apellidos}`]),
    );
    const usuario = new Map(
      usuarios.map((u) => [u.idUsuario, u.nombreCompleto || u.codigoUsuario]),
    );

    const lista = filas.map((f) => {
      const p = persona.get(f.idEmpleado);
      const nivel = f.resultado.sinEvaluar
        ? null
        : clasificarResultadoFinal(f.resultado.final).nivel;
      return {
        idEmpleado: f.idEmpleado,
        codigo: f.codigo,
        nombre: f.nombre,
        gerencia: p?.gerenciaEmpleadora?.descripcion ?? null,
        area: p?.areaEmpleadora?.descripcion ?? null,
        grupo: p?.unidadOcupacionalEmpleadora?.descripcion ?? null,
        jefe: p?.codigoEmpleadoJefe
          ? (jefe.get(p.codigoEmpleadoJefe) ?? p.codigoEmpleadoJefe)
          : null,
        calculado: f.calculado,
        resultado: f.resultado,
        nivel,
        evidencias: evidencias.get(f.idEmpleado) ?? 0,
        ajuste: f.ajuste && {
          competencias: f.ajuste.competencias,
          objetivos: f.ajuste.objetivos,
          competenciasOriginal: f.ajuste.competenciasOriginal,
          objetivosOriginal: f.ajuste.objetivosOriginal,
          motivo: f.ajuste.motivo,
          por:
            usuario.get(f.ajuste.actualizadoPorId ?? f.ajuste.creadoPorId) ??
            null,
          fecha: f.ajuste.fechaModificacion ?? f.ajuste.fechaCreacion,
        },
      };
    });

    // Cuántos hay en cada nivel: lo que el comité mira para ver si la
    // distribución es razonable (la "campana de Gauss" de la guía).
    const evaluados = lista.filter((f) => f.nivel);
    const distribucion = NIVELES.map((n) => {
      const cuantos = evaluados.filter((f) => f.nivel === n).length;
      return {
        nivel: n,
        cuantos,
        porcentaje: evaluados.length
          ? redondear((cuantos / evaluados.length) * 100, 1)
          : 0,
      };
    });

    return {
      campana: {
        idCampanaEvaluacion: campana.idCampanaEvaluacion,
        nombre: campana.nombre,
        modeloEmpresa: campana.modeloEmpresa,
        porcentajeCompetencias: campana.porcentajeCompetecias ?? 80,
        porcentajeObjetivos: campana.porcentajeObjetivos ?? 20,
      },
      filas: lista,
      distribucion,
    };
  }

  /** Crea o reemplaza el ajuste de un trabajador en la campaña en curso. */
  async ajustar(user: AuthUser, dto: AjusteCalibracionDto) {
    const competencias = dto.competencias ?? null;
    const objetivos = dto.objetivos ?? null;
    if (competencias === null && objetivos === null) {
      throw new BadRequestException(
        'Indique el resultado de competencias, el de objetivos o ambos.',
      );
    }
    const motivo = String(dto.motivo ?? '').trim();
    if (motivo.length < 10) {
      throw new BadRequestException(
        'El motivo debe tener al menos 10 caracteres.',
      );
    }
    const campana = await this.campanaAbierta(dto.idEmpresaEmpleadora);
    const empleado = await this.prisma.empleado.findFirst({
      where: {
        idEmpleado: dto.idEmpleado,
        idEmpresaEmpleadora: dto.idEmpresaEmpleadora,
      },
      select: { idEmpleado: true },
    });
    if (!empleado) throw new NotFoundException('Trabajador no encontrado.');

    // Lo que daba el cálculo al ajustar, para el acta.
    const { filas } = await this.competencias.resultadosDeEmpresa(
      dto.idEmpresaEmpleadora,
      campana.idCampanaEvaluacion,
    );
    const fila = filas.find((f) => f.idEmpleado === dto.idEmpleado);
    if (!fila) {
      throw new BadRequestException(
        'El trabajador no tiene evaluaciones ni objetivos en la campaña: no hay resultado que calibrar.',
      );
    }
    const datos = {
      competencias,
      objetivos,
      competenciasOriginal: fila.calculado.competenciasSinEvaluar
        ? null
        : fila.calculado.competencias,
      objetivosOriginal: fila.calculado.objetivosSinEvaluar
        ? null
        : fila.calculado.objetivos,
      motivo,
    };
    return this.prisma.ajusteCalibracion.upsert({
      where: {
        idCampanaEvaluacion_idEmpleado: {
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          idEmpleado: dto.idEmpleado,
        },
      },
      create: {
        ...datos,
        idCampanaEvaluacion: campana.idCampanaEvaluacion,
        idEmpleado: dto.idEmpleado,
        creadoPorId: user.idUsuario,
      },
      update: {
        ...datos,
        actualizadoPorId: user.idUsuario,
        fechaModificacion: new Date(),
      },
    });
  }

  /** Quita el ajuste: vuelve a mandar el cálculo. */
  async quitar(idEmpresa: number, idEmpleado: number) {
    const campana = await this.campanaAbierta(idEmpresa);
    const ajuste = await this.prisma.ajusteCalibracion.findUnique({
      where: {
        idCampanaEvaluacion_idEmpleado: {
          idCampanaEvaluacion: campana.idCampanaEvaluacion,
          idEmpleado,
        },
      },
    });
    if (!ajuste) throw new NotFoundException('Ese trabajador no tiene ajuste.');
    await this.prisma.ajusteCalibracion.delete({
      where: { idAjusteCalibracion: ajuste.idAjusteCalibracion },
    });
    return { idEmpleado };
  }

  /** Datos del acta de calibración (PDF). */
  async acta(idEmpresa: number, comite: string[]) {
    const empresa = await this.prisma.empresaEmpleadora.findUnique({
      where: { idEmpresaEmpleadora: idEmpresa },
      select: { nombreEmpresa: true, urlLogo: true },
    });
    const panel = await this.panel(idEmpresa);
    if (!panel.campana) {
      throw new BadRequestException(
        'La empresa no tiene una campaña en curso.',
      );
    }
    // Antes y después de cada cifra: el acta muestra el original tachado.
    const cambio = (antes: number | null, despues: number | null) =>
      despues === null
        ? { cambia: false, antes: null, despues: null }
        : { cambia: true, antes: antes ?? '—', despues };
    const ajustados = panel.filas
      .filter((f) => f.ajuste)
      .map((f, i) => {
        const nivelAntes = clasificarResultadoFinal(f.calculado.final).nivel;
        return {
          n: i + 1,
          nombre: f.nombre,
          codigo: f.codigo,
          area: f.area ?? '—',
          jefe: f.jefe ?? '—',
          competencias: cambio(
            f.ajuste!.competenciasOriginal,
            f.ajuste!.competencias,
          ),
          objetivos: cambio(f.ajuste!.objetivosOriginal, f.ajuste!.objetivos),
          finalAntes: f.calculado.final,
          finalDespues: f.resultado.final,
          nivelAntes,
          nivel: f.nivel ?? '—',
          cambiaNivel: !!f.nivel && f.nivel !== nivelAntes,
          color: COLOR_NIVEL[f.nivel ?? ''] ?? '#8c8c8c',
          motivo: f.ajuste!.motivo,
          por: f.ajuste!.por,
        };
      });
    const evaluados = panel.filas.filter((f) => !f.resultado.sinEvaluar);
    // Cada integrante llega como «Nombre · cargo» (el cargo es opcional).
    const integrantes = comite.map((c, i) => {
      const [nombre, ...cargo] = c.split(' · ');
      return {
        n: i + 1,
        nombre: nombre.trim(),
        cargo: cargo.join(' · ').trim(),
      };
    });
    return {
      empresa: empresa?.nombreEmpresa ?? '',
      logo: empresa?.urlLogo || null,
      campana: panel.campana.nombre,
      pesoCompetencias: panel.campana.porcentajeCompetencias,
      pesoObjetivos: panel.campana.porcentajeObjetivos,
      fecha: new Date().toLocaleDateString('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      comite: integrantes,
      hayComite: integrantes.length > 0,
      // Sin comité registrado, el acta deja dos firmas genéricas.
      firmas: integrantes.length
        ? integrantes
        : [
            { nombre: '', cargo: 'Gerente de Gestión Humana' },
            { nombre: '', cargo: 'Gerente o jefe del área' },
          ],
      evaluados: evaluados.length,
      sinEvaluar: panel.filas.length - evaluados.length,
      totalAjustes: ajustados.length,
      textoAjustes:
        ajustados.length === 0
          ? 'sin ajustes'
          : ajustados.length === 1
            ? '1 resultado ajustado'
            : `${ajustados.length} resultados ajustados`,
      ajustados,
      hayAjustes: ajustados.length > 0,
      distribucion: panel.distribucion.map((d) => ({
        ...d,
        rango: RANGO_NIVEL[d.nivel] ?? '',
        color: COLOR_NIVEL[d.nivel] ?? '#8c8c8c',
      })),
    };
  }
}
