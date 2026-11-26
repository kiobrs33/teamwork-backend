import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Rol } from 'src/empleado/types/empleadoTypes';
import { PdfRendererService } from './pdf/pdf-renderer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CAMPANA_CERRADA,
  CAMPANA_EN_CURSO,
  campanaEnCurso,
  filtroEvaluacionesDeCampana,
} from 'src/common/resultados/campana';
import {
  calcularResultados,
  clasificarDesempeno,
  DESEMPENO_SIN_EVALUAR,
  clasificarObjetivos,
  aplicarCalibracion,
  clasificarResultadoFinal,
  notaDeEvaluacion,
  notasVacias,
  origenDeEvaluacion,
  pesosDeEmpresa,
  hayBrecha,
  redondear,
  resultadoDeCompetenciasAsignadas,
  resultadoDeObjetivo,
  SIN_EVALUAR_TEXTO,
  evaluadoSinJefe,
  type NotasDeEvaluado,
} from 'src/common/resultados/resultados-evaluacion';

/** Ordena poniendo primero las evaluaciones del jefe (las que puntúan). */
const primeroDelJefe = (
  a: { tipoEvaluador: string | null },
  b: { tipoEvaluador: string | null },
) => Number(a.tipoEvaluador !== 'JEFE') - Number(b.tipoEvaluador !== 'JEFE');

@Injectable()
export class ReporteService {
  constructor(
    private readonly pdfRenderer: PdfRendererService,
    private prisma: PrismaService,
  ) {}

  // ─────────────────────────── acceso ───────────────────────────

  /**
   * Quién puede ver los resultados de quién. Lo decide el token, no la URL:
   * - ADMIN: todo.
   * - JEFE: cualquier campaña de sus subordinados directos actuales.
   * - Uno mismo: solo campañas CERRADAS. La vigente sigue en curso y sus
   *   cifras cambian cada vez que alguien califica (decisión del cliente:
   *   el trabajador evalúa la vigente y consulta las anteriores).
   */
  async verificarAcceso(
    user: AuthUser,
    idEmpleado: number,
    idCampana?: number | null,
  ) {
    if (user.rol === Rol.ADMIN) return;

    // Equipo de TeamWork: los informes de trabajadores de sus empresas.
    if (user.rol === Rol.EQUIPO) {
      const [usuario, trabajador] = await Promise.all([
        this.prisma.usuario.findUnique({
          where: { idUsuario: Number(user.idUsuario) },
          select: {
            todasLasEmpresas: true,
            empresasAsignadas: { select: { idEmpresaEmpleadora: true } },
          },
        }),
        this.prisma.empleado.findUnique({
          where: { idEmpleado },
          select: { idEmpresaEmpleadora: true },
        }),
      ]);
      if (!trabajador) throw new NotFoundException('Empleado no encontrado');
      if (usuario?.todasLasEmpresas) return;
      const suyas = new Set(
        usuario?.empresasAsignadas.map((a) => a.idEmpresaEmpleadora) ?? [],
      );
      if (!suyas.has(trabajador.idEmpresaEmpleadora)) {
        throw new NotFoundException('Empleado no encontrado');
      }
      return;
    }

    // Administrador de empresa: los informes de cualquier trabajador de su
    // empresa, de cualquier campaña; de otra empresa, como si no existiera.
    if (user.rol === Rol.ADMIN_EMPRESA) {
      const [usuario, trabajador] = await Promise.all([
        this.prisma.usuario.findUnique({
          where: { idUsuario: Number(user.idUsuario) },
          select: { idEmpresaEmpleadora: true },
        }),
        this.prisma.empleado.findUnique({
          where: { idEmpleado },
          select: { idEmpresaEmpleadora: true },
        }),
      ]);
      if (
        !usuario?.idEmpresaEmpleadora ||
        trabajador?.idEmpresaEmpleadora !== usuario.idEmpresaEmpleadora
      ) {
        throw new NotFoundException('Empleado no encontrado');
      }
      return;
    }

    const [yo, objetivo] = await Promise.all([
      this.prisma.empleado.findFirst({
        where: { idUsuario: user.idUsuario, estado: true },
        select: { idEmpleado: true, codigoEmpleado: true },
      }),
      this.prisma.empleado.findUnique({
        where: { idEmpleado },
        select: { codigoEmpleadoJefe: true, idEmpresaEmpleadora: true },
      }),
    ]);
    if (!yo || !objetivo) {
      throw new NotFoundException('Empleado no encontrado');
    }

    if (yo.idEmpleado === idEmpleado) {
      const campana = idCampana
        ? await this.prisma.campanaEvaluacion.findUnique({
            where: { idCampanaEvaluacion: Number(idCampana) },
            select: { estado: true },
          })
        : null;
      // Sin campaña pedida = la en curso; y una en curso no se muestra.
      if (!campana || campana.estado !== CAMPANA_CERRADA) {
        throw new ForbiddenException(
          'Los resultados de la campaña en curso estarán disponibles cuando se cierre.',
        );
      }
      return;
    }

    if (
      user.rol === Rol.JEFE &&
      objetivo.codigoEmpleadoJefe === yo.codigoEmpleado
    ) {
      return;
    }

    // Igual que con las evidencias: sin acceso, como si no existiera.
    throw new NotFoundException('Empleado no encontrado');
  }

  /** El empleado del usuario conectado (para "Mis resultados"). */
  async idEmpleadoDe(user: AuthUser) {
    const yo = await this.prisma.empleado.findFirst({
      where: { idUsuario: user.idUsuario, estado: true },
      select: { idEmpleado: true },
    });
    if (!yo)
      throw new NotFoundException(
        'Su usuario no tiene un trabajador asociado.',
      );
    return yo.idEmpleado;
  }

  // ─────────────────────────── historial ───────────────────────────

  /**
   * Las campañas de un trabajador con su resultado: las cerradas de su
   * empresa más cualquiera en la que tenga evaluaciones u objetivos, y la
   * vigente. `soloCerradas` es para cuando lo consulta el propio trabajador.
   */
  async campanasDeEmpleado(idEmpleado: number, soloCerradas = false) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { idEmpleado },
      select: { idEmpresaEmpleadora: true },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    const [deEvaluaciones, deObjetivos, enCurso] = await Promise.all([
      this.prisma.evaluacionCompetencia.findMany({
        where: {
          idEvaluado: idEmpleado,
          estado: true,
          idCampanaEvaluacion: { not: null },
        },
        distinct: ['idCampanaEvaluacion'],
        select: { idCampanaEvaluacion: true },
      }),
      this.prisma.objetivo.findMany({
        where: { idEmpleado, estado: true, idCampanaEvaluacion: { not: null } },
        distinct: ['idCampanaEvaluacion'],
        select: { idCampanaEvaluacion: true },
      }),
      campanaEnCurso(this.prisma, empleado.idEmpresaEmpleadora),
    ]);

    // Las campañas en las que participó (aunque sean de otra empresa, si se
    // cambió) y la en curso de su empresa actual.
    const ids = new Set<number>(
      [...deEvaluaciones, ...deObjetivos]
        .map((x) => x.idCampanaEvaluacion)
        .filter((id): id is number => !!id),
    );
    if (enCurso) ids.add(enCurso.idCampanaEvaluacion);

    const campanas = await this.prisma.campanaEvaluacion.findMany({
      where: {
        idCampanaEvaluacion: { in: [...ids] },
        ...(soloCerradas && { estado: CAMPANA_CERRADA }),
      },
      orderBy: { periodoDesde: 'desc' },
    });
    // La en curso primero.
    campanas.sort(
      (a, b) =>
        Number(b.estado === CAMPANA_EN_CURSO) -
        Number(a.estado === CAMPANA_EN_CURSO),
    );

    return Promise.all(
      campanas.map(async (c) => {
        const d = await this.datosReporte(idEmpleado, c.idCampanaEvaluacion);
        return {
          idCampanaEvaluacion: c.idCampanaEvaluacion,
          nombre: c.nombre,
          periodoDesde: c.periodoDesde,
          periodoHasta: c.periodoHasta,
          vigente: c.estado === CAMPANA_EN_CURSO,
          fechaCierre: c.fechaCierre,
          sinEvaluar: d.sinEvaluar,
          resultadoFinal: d.resultadosTexto.evaluacionFinal,
          resultadoCompetencias: d.resultadosTexto.competencias,
          resultadoObjetivos: d.resultadosTexto.objetivos,
          // "Desempeño" va junto al resultado final: es el nivel del
          // resultado final, no solo el de competencias.
          clasificacion: d.clasificacionFinal,
          competencias: d.competenciasDetalle.length,
          objetivos: d.objetivosDetalle.length,
        };
      }),
    );
  }

  /** PDF individual de una campaña (la en curso si no se indica). */
  async obtenerDataReporteEvaluacion(idEmpleado: number, idCampana?: number) {
    const data = await this.datosReporte(idEmpleado, idCampana);
    return this.pdfRenderer.render('evaluacion', data);
  }

  /**
   * Todo lo que necesita el informe de una campaña. Separado del render para
   * que el historial ("Mis resultados") calcule con exactamente lo mismo que
   * el PDF.
   *
   * Una campaña cerrada se arma con lo que quedó de ella, no con el estado
   * actual: la configuración guardada al cerrarla (`CampanaEvaluacion`), las
   * competencias que se le evaluaron (su unidad pudo cambiar) y la foto de
   * puesto/área/unidad que lleva cada evaluación.
   */
  async datosReporte(idEmpleado: number, idCampana?: number | null) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { idEmpleado },
      include: {
        puestoEmpleadora: true,
        gerenciaEmpleadora: true,
        areaEmpleadora: true,
        unidadOcupacionalEmpleadora: true,
        empresaEmpleadora: true,
      },
    });

    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // La campaña pedida o la en curso de su empresa. Puede ser de otra
    // empresa si el trabajador se cambió: se busca por id, sin exigir que
    // sea de la actual.
    const campana = idCampana
      ? await this.prisma.campanaEvaluacion.findUnique({
          where: { idCampanaEvaluacion: Number(idCampana) },
        })
      : await campanaEnCurso(this.prisma, empleado.idEmpresaEmpleadora);
    const cerrada = campana?.estado === CAMPANA_CERRADA;

    // Datos de la empresa (nombre, logo) + configuración de ESA campaña.
    const empresa = {
      ...empleado.empresaEmpleadora,
      ...(campana && {
        modeloEmpresa: campana.modeloEmpresa,
        porcentajeCompetecias: campana.porcentajeCompetecias,
        porcentajeObjetivos: campana.porcentajeObjetivos,
        porcentajeEvaluacionJefeCompetencia:
          campana.porcentajeEvaluacionJefeCompetencia,
        porcentajeEvaluacionSubordinadoCompetencia:
          campana.porcentajeEvaluacionSubordinadoCompetencia,
        tipoCalificacionCompetencia: campana.tipoCalificacionCompetencia,
        competenciaResultadoEsperado: campana.competenciaResultadoEsperado,
      }),
      // Se decide al leer las evaluaciones (más abajo).
      evaluadoSinJefe: false,
    };
    const peso = pesosDeEmpresa(empresa);

    // ==============================
    // EVALUACIONES DE LA CAMPAÑA
    // ==============================
    // Solo las vigentes: sin las anuladas y solo del periodo de la empresa.
    // Sin este filtro el informe promediaba evaluaciones que se anularon al
    // cambiar el nivel de la unidad, y listaba competencias que al trabajador
    // ya no le tocaban. El Excel por empresa sí lo hacía, así que los dos
    // documentos daban cifras distintas del mismo trabajador.
    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        ...filtroEvaluacionesDeCampana(campana?.idCampanaEvaluacion),
        idEvaluado: idEmpleado,
      },
      include: {
        evaluador: {
          select: {
            idEmpleado: true,
            codigoEmpleado: true,
            // Para confirmar que quien evalúa "desde abajo" depende de verdad
            // del evaluado y no es un tercero cualquiera.
            codigoEmpleadoJefe: true,
            nombres: true,
            apellidos: true,
          },
        },
        competencia: true,
        nivel: true,
        itemsEvaluados: {
          where: { estado: true },
          select: { calificacion: true },
        },
      },
    });

    // ==============================
    // COMPETENCIAS ASIGNADAS
    // ==============================
    // Las competencias de un trabajador salen de su unidad ocupacional, no de
    // que alguien haya abierto su panel de evaluación. El informe se armaba
    // recorriendo las evaluaciones, así que una competencia asignada y sin
    // evaluar no aparecía: ni como fila de la tabla ni como esquina del radar.
    // Una trabajadora con dos competencias asignadas y una evaluada dibujaba
    // un radar de una sola punta.
    //
    // En una campaña cerrada, en cambio, le tocaba lo que se le evaluó en
    // ella: la unidad de hoy puede ser otra.
    // En una cerrada, lo que le tocaba es la foto guardada al cerrarla
    // (CampanaAsignacion); sin foto (cerradas antes de existir), lo que se le
    // evaluó en ella.
    const foto =
      cerrada && campana
        ? await this.prisma.campanaAsignacion.findMany({
            where: {
              idCampanaEvaluacion: campana.idCampanaEvaluacion,
              idEmpleado,
            },
            orderBy: { idCompetencia: 'asc' },
          })
        : [];
    const asignadas =
      cerrada && foto.length
        ? await Promise.all(
            foto.map(async (f) => ({
              idCompetencia: f.idCompetencia,
              competencia: await this.prisma.competencia.findUniqueOrThrow({
                where: { idCompetencia: f.idCompetencia },
              }),
              competenciaNivel:
                await this.prisma.competenciaNivel.findUniqueOrThrow({
                  where: { idCompetenciaNivel: f.idCompetenciaNivel },
                }),
            })),
          )
        : cerrada
          ? [
              ...new Map(
                [...evaluaciones]
                  // La del jefe primero: su nivel es el que manda si difieren.
                  .sort(primeroDelJefe)
                  .map((ev) => [
                    ev.idCompetencia,
                    {
                      idCompetencia: ev.idCompetencia,
                      competencia: ev.competencia,
                      competenciaNivel: ev.nivel,
                    },
                  ]),
              ).values(),
            ].sort((a, b) => a.idCompetencia - b.idCompetencia)
          : await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
              where: {
                idUnidadOcupacionalEmpleadora:
                  empleado.idUnidadOcupacionalEmpleadora,
                competencia: { estado: true },
                competenciaNivel: { estado: true },
              },
              include: { competencia: true, competenciaNivel: true },
              orderBy: { idCompetencia: 'asc' },
            });

    // La cabeza de la empresa (sin jefe): en 180° la califican solo sus
    // subordinados, al 100 %.
    empresa.evaluadoSinJefe = evaluadoSinJefe({
      cerrada,
      codigoJefeActual: empleado.codigoEmpleadoJefe,
      fotosJefe: evaluaciones.map((ev) => ev.codigoJefeEvaluado),
    });

    // Las notas vigentes, indexadas por competencia.
    const notasPorCompetencia = new Map<number, NotasDeEvaluado>();
    const notasGlobales: NotasDeEvaluado = notasVacias();

    for (const ev of evaluaciones) {
      // `null` es sin evaluar: una evaluación abierta sin ninguna nota puesta
      // no cuenta como nota.
      const nota = notaDeEvaluacion(ev.itemsEvaluados);
      if (nota === null) continue;

      const origen = origenDeEvaluacion({
        tipoEvaluador: ev.tipoEvaluador,
        idEvaluado: ev.idEvaluado,
        idEvaluador: ev.idEvaluador,
        codigoEvaluado: empleado.codigoEmpleado,
        codigoEvaluador: ev.evaluador?.codigoEmpleado,
        codigoEmpleadoJefe: empleado.codigoEmpleadoJefe,
        codigoJefeDelEvaluador: ev.evaluador?.codigoEmpleadoJefe,
      });

      // Quien no es ni el evaluado, ni su jefe, ni alguien a su cargo no tiene
      // sitio en el modelo: su nota no entra.
      if (origen === 'otro') continue;

      const destino =
        origen === 'auto'
          ? 'autoEvaluaciones'
          : origen === 'jefe'
            ? 'evaluacionesJefe'
            : 'evaluacionesSubordinados';

      if (!notasPorCompetencia.has(ev.idCompetencia)) {
        notasPorCompetencia.set(ev.idCompetencia, notasVacias());
      }

      notasPorCompetencia.get(ev.idCompetencia)![destino].push(nota);
      notasGlobales[destino].push(nota);
    }

    // ==============================
    // OBJETIVOS
    // ==============================
    const objetivos = await this.prisma.objetivo.findMany({
      where: {
        estado: true,
        idEmpleado,
        // Solo los de esta campaña: antes se mezclaban todos los ciclos.
        idCampanaEvaluacion: campana?.idCampanaEvaluacion ?? -1,
      },
      include: {
        objetivoDetalles: {
          where: { estado: true },
          orderBy: { secuencial: 'asc' },
          select: {
            descripcion: true,
            metaObjetivo: true,
            metaAlcanzada: true,
            porcentajeLogrado: true,
            pesoEspecifico: true,
          },
        },
        retroalimentacionDetalles: {
          where: { estado: true },
          select: {
            descripcionObjetivo: true,
            descripcionActividad: true,
            descripcionFecha: true,
            descripcionEstado: true,
          },
        },
      },
    });

    const objetivosDetalle: any[] = [];
    const retroalimentaciones: any[] = [];

    // La sesión de retroalimentación de esta campaña (lo conversado y la
    // respuesta del trabajador): llena «Comentarios finales». Sin sesión,
    // esos recuadros quedan en blanco para llenarlos a mano.
    const sesionDb = campana
      ? await this.prisma.sesionRetroalimentacion.findUnique({
          where: {
            idCampanaEvaluacion_idEmpleado: {
              idCampanaEvaluacion: campana.idCampanaEvaluacion,
              idEmpleado,
            },
          },
        })
      : null;
    const RESPUESTA: Record<string, string> = {
      PENDIENTE: 'Todavía no responde',
      CONFORME: 'Conforme',
      NO_CONFORME: 'No conforme',
    };
    const sesion = sesionDb && {
      fecha: sesionDb.fechaSesion
        .toISOString()
        .slice(0, 10)
        .split('-')
        .reverse()
        .join('/'),
      fortalezas: sesionDb.fortalezas,
      oportunidades: sesionDb.oportunidades,
      compromisos: sesionDb.compromisos,
      respuesta: RESPUESTA[sesionDb.conformidad] ?? sesionDb.conformidad,
      comentario: sesionDb.comentarioTrabajador,
    };

    let contadorObj = 1;

    for (const obj of objetivos) {
      const retro = obj.retroalimentacionDetalles.map((r, index) => ({
        orden: `Actividad ${index + 1}`,
        descripcionObjetivo: r.descripcionObjetivo,
        descripcionActividad: r.descripcionActividad,
        descripcionFecha: r.descripcionFecha,
        descripcionEstado: r.descripcionEstado,
      }));

      retroalimentaciones.push({
        objetivoId: obj.idObjetivo,
        retroalimentacion: retro,
      });

      for (const det of obj.objetivoDetalles) {
        const sinCalificar =
          det.porcentajeLogrado === null || det.porcentajeLogrado === undefined;

        objetivosDetalle.push({
          orden: `Objetivo ${contadorObj}`,
          descripcion: det.descripcion,
          metaObjetivo: det.metaObjetivo,
          // Un detalle sin calificar se dice, no se pinta como un cero.
          metaAlcanzada: det.metaAlcanzada ?? SIN_EVALUAR_TEXTO,
          porcentajeLogrado: sinCalificar
            ? SIN_EVALUAR_TEXTO
            : `${redondear(det.porcentajeLogrado!, 2)}%`,
          pesoEspecifico: det.pesoEspecifico,
        });

        contadorObj++;
      }

      // El resultado del objetivo ya viene ponderado por `pesoEspecifico`; el
      // promedio de los objetivos lo hace `calcularResultados`. Es la misma
      // cadena que usa el Excel por empresa, que antes daba otro número
      // porque el PDF mezclaba los detalles de todos los objetivos en una
      // sola media ponderada.
      const resultado = resultadoDeObjetivo(obj.objetivoDetalles);
      if (resultado !== null) notasGlobales.objetivos.push(resultado);
    }

    // ==============================
    // RESULTADOS
    // ==============================
    const resultadosBase = calcularResultados(empresa, notasGlobales);

    const competenciasDetalle = asignadas.map((asignada, indice) => {
      const notas =
        notasPorCompetencia.get(asignada.idCompetencia) ?? notasVacias();

      const r = calcularResultados(empresa, notas);

      // Una competencia asignada y sin evaluar vale 0 y entra al promedio,
      // pero el informe lo dice: un 0 que nadie puso no significa lo mismo que
      // un 0 que puso el jefe. En la base no hay nota; el 0 es solo de cara al
      // cálculo y a la lectura.
      const noEvaluada = r.competenciasSinEvaluar;
      const resultadoFinal = noEvaluada ? 0 : r.resultadoCompetencias;

      let superavit: number | null = null;
      let oportunidadMejora: number | null = null;
      let resultadoTexto = `${resultadoFinal}%`;

      if (resultadoFinal > peso.resultadoEsperado) {
        superavit = redondear(resultadoFinal - peso.resultadoEsperado, 2);
        resultadoTexto = `${resultadoFinal}% (+${superavit})`;
      }

      if (resultadoFinal < peso.resultadoEsperado) {
        oportunidadMejora = redondear(
          peso.resultadoEsperado - resultadoFinal,
          2,
        );
        resultadoTexto = `${resultadoFinal}% (-${oportunidadMejora})`;
      }

      // La autoevaluación no puntúa, sirve para esto: si el trabajador se pone
      // 100 y el jefe le pone 20, la fila se marca para que alguien lo mire.
      const notaJefe = notas.evaluacionesJefe.length ? r.promedioJefe : null;
      const notaAuto = notas.autoEvaluaciones.length ? r.promedioAuto : null;
      const brecha = hayBrecha(notaAuto, notaJefe);

      const notaSubordinados = notas.evaluacionesSubordinados.length
        ? r.promedioSubordinados
        : null;
      const conPorcentaje = (n: number | null) => (n === null ? '—' : `${n}%`);

      return {
        orden: `Competencia ${indice + 1}`,
        competencia: asignada.competencia.titulo,
        nivel: asignada.competenciaNivel.nivel,
        // Lo que puso cada uno, para que se vea de dónde sale el resultado
        // («—»: no calificó).
        // 180° con jefe: los subordinados calificaron y el jefe no; su parte
        // cuenta 0 y la fila lo dice (si no, el 30 % no se entiende).
        faltaJefe:
          !noEvaluada &&
          notaJefe === null &&
          notaSubordinados !== null &&
          !empresa.evaluadoSinJefe,
        // Para el radar: `null` = nadie calificó (sin punto en el 0).
        notaJefe,
        notaAuto,
        notaSubordinados,
        autoTexto: conPorcentaje(notaAuto),
        jefeTexto: conPorcentaje(notaJefe),
        subordinadosTexto: conPorcentaje(notaSubordinados),

        autoevaluacion: notaAuto ?? 0,
        evaluacionJefe: notaJefe ?? 0,
        evaluacionSubordinados: r.promedioSubordinados,

        resultadoFinal,
        resultadoTexto,

        noEvaluada,
        brecha,
        diferencia: brecha
          ? redondear(Math.abs((notaAuto ?? 0) - (notaJefe ?? 0)), 2)
          : null,

        superavit,
        oportunidadMejora,

        competenciaResultadoEsperado: empresa.competenciaResultadoEsperado,
      };
    });

    // El resultado de competencias es el promedio de las ASIGNADAS, contando
    // como 0 las que nadie evaluó. Antes promediaba solo las que tenían nota,
    // así que evaluar una de cinco daba el mismo resultado que evaluarlas
    // todas con esa nota.
    const deAsignadas = resultadoDeCompetenciasAsignadas(
      empresa,
      asignadas.map((a) => a.idCompetencia),
      notasPorCompetencia,
    );

    const resultados = {
      ...resultadosBase,
      resultadoCompetencias: deAsignadas.resultado,
      competenciasSinEvaluar: deAsignadas.sinEvaluar,
    };

    resultados.resultadoFinal = redondear(
      resultados.resultadoCompetencias * peso.competencias +
        resultados.promedioObjetivos * peso.objetivos,
      2,
    );

    resultados.sinEvaluar =
      resultados.competenciasSinEvaluar && resultados.objetivosSinEvaluar;

    // Calibración: si el comité ajustó a este trabajador en esta campaña,
    // manda el ajuste (misma regla que el Excel y la pantalla de calibración).
    const ajuste = campana
      ? await this.prisma.ajusteCalibracion.findUnique({
          where: {
            idCampanaEvaluacion_idEmpleado: {
              idCampanaEvaluacion: campana.idCampanaEvaluacion,
              idEmpleado: empleado.idEmpleado,
            },
          },
        })
      : null;
    Object.assign(resultados, aplicarCalibracion(resultados, ajuste, empresa));

    // Con autoevaluación pero sin notas de quien califica, «no se ha
    // registrado ninguna evaluación» no era cierto.
    const desempeno = resultados.competenciasSinEvaluar
      ? resultados.sinEvaluar
        ? DESEMPENO_SIN_EVALUAR
        : {
            nivel: SIN_EVALUAR_TEXTO,
            mensaje:
              'Todavía no tiene calificaciones de competencias en esta campaña: mientras tanto cuentan como 0.',
          }
      : clasificarDesempeno(
          resultados.resultadoCompetencias,
          empresa.tipoCalificacionCompetencia,
        );
    // La guía clasifica también la nota de objetivos y el puntaje global.
    const desempenoObjetivos = resultados.objetivosSinEvaluar
      ? DESEMPENO_SIN_EVALUAR
      : clasificarObjetivos(resultados.promedioObjetivos);
    const desempenoFinal = resultados.sinEvaluar
      ? DESEMPENO_SIN_EVALUAR
      : clasificarResultadoFinal(resultados.resultadoFinal);

    const porcentajeCompetencias = Math.min(
      resultados.resultadoCompetencias,
      100,
    );

    const competenciasDoughnutChart = {
      porcentaje: redondear(porcentajeCompetencias, 2),
      restante: redondear(100 - porcentajeCompetencias, 2),
    };

    // El radar enseña las tres miradas del modelo, no el resultado ya mezclado:
    // la del líder (la que puntúa), la del propio trabajador (referencia) y,
    // solo en 180°, la de quienes dependen de él. Pintando el resultado
    // combinado no se veía el contraste, que es justo para lo que sirve.
    // Las puntas llevan el nombre de la competencia (partido en renglones):
    // «Competencia 1…6» obligaba a ir a la tabla para saber cuál era cuál.
    const enRenglones = (texto: string, largo = 16) =>
      texto.split(/\s+/).reduce<string[]>((lineas, palabra) => {
        const ultima = lineas[lineas.length - 1];
        if (ultima && `${ultima} ${palabra}`.length <= largo)
          lineas[lineas.length - 1] = `${ultima} ${palabra}`;
        else lineas.push(palabra);
        return lineas;
      }, []);
    // Una mirada sin ninguna nota no se dibuja (un jefe que no existe no es
    // un jefe que puso 0), y una competencia sin nota de alguien no lleva
    // punto en el centro.
    const miradas = [
      {
        label: 'Jefe inmediato',
        data: competenciasDetalle.map((c) => c.notaJefe),
        color: '#2f80ed',
        fondo: 'rgba(47,128,237,0.25)',
      },
      {
        label: 'Autoevaluación',
        data: competenciasDetalle.map((c) => c.notaAuto),
        color: '#f2994a',
        fondo: 'rgba(242,153,74,0.25)',
      },
      ...(empresa.modeloEmpresa === '180'
        ? [
            {
              label: 'Subordinados',
              data: competenciasDetalle.map((c) => c.notaSubordinados),
              color: '#27ae60',
              fondo: 'rgba(39,174,96,0.20)',
            },
          ]
        : []),
    ];
    const competenciasRadarChart = {
      labels: competenciasDetalle.map((c) => enRenglones(c.competencia)),
      datasets: miradas
        .filter((m) => m.data.some((v) => v !== null))
        .map((m) => ({
          label: m.label,
          data: m.data,
          borderColor: m.color,
          backgroundColor: m.fondo,
          pointBackgroundColor: m.color,
          pointBorderColor: '#ffffff',
          borderWidth: 2,
          spanGaps: true,
        })),
    };

    const objetivosChart = {
      labels: objetivosDetalle.map((o) => o.orden),
      datasets: [
        {
          label: 'Programada',
          data: objetivosDetalle.map(() => 100),
          backgroundColor: '#8c8c8c',
        },
        {
          label: 'Alcanzado',
          data: objetivosDetalle.map((o) =>
            o.porcentajeLogrado === SIN_EVALUAR_TEXTO
              ? 0
              : parseFloat(o.porcentajeLogrado),
          ),
          backgroundColor: '#1890ff',
        },
      ],
    };

    // Las listas cualitativas solo miran competencias evaluadas. Una sin
    // evaluar cuenta como 0 para el promedio, pero llamarla "oportunidad de
    // desarrollo" sería afirmar algo que nadie ha mirado.
    const evaluadas = competenciasDetalle.filter((c) => !c.noEvaluada);

    const fortalezas = evaluadas.filter(
      (c) => c.resultadoFinal >= peso.resultadoEsperado,
    );

    const debilidades = evaluadas.filter(
      (c) => c.resultadoFinal < peso.resultadoEsperado,
    );

    // Las que hay que conversar con el jefe antes de cerrar la evaluación.
    const brechas = competenciasDetalle.filter((c) => c.brecha);

    // "Evaluación anual 2026 · 01/01/2026 – 31/12/2026": el nombre de la
    // campaña y el periodo que se evalúa. Antes era el mes de un campo de la
    // empresa ("Septiembre de 2026"), que no coincidía con las fechas reales.
    // Se formatea en UTC: las fechas se guardan a medianoche UTC y en hora de
    // Lima saldrían un día antes.
    const fecha = (d: Date) =>
      d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    const newPeriodoEvaluacion = campana
      ? `${campana.nombre} · ${fecha(campana.periodoDesde)} – ${fecha(campana.periodoHasta)}`
      : 'Sin campaña en curso';

    // ==============================
    // DATA PARA EL REPORTE
    // ==============================
    // Las cifras van dos veces: `resultados` en número, que es lo que comen
    // los gráficos, y `resultadosTexto` ya formateado, que es lo que se
    // imprime en las tablas. Así el informe de alguien sin evaluar puede decir
    // "Sin evaluar" donde antes ponía un 0 que se leía como un suspenso.
    const texto = (valor: number, vacio: boolean) =>
      vacio ? SIN_EVALUAR_TEXTO : String(valor);

    // Puesto, área, gerencia y unidad: los de la campaña. En una cerrada
    // salen de la foto guardada en sus evaluaciones (la del jefe primero);
    // la cabecera de hoy diría dónde está ahora, no dónde estaba.
    const cabecera = {
      puesto: empleado.puestoEmpleadora.descripcion,
      gerencia: empleado.gerenciaEmpleadora.descripcion,
      area: empleado.areaEmpleadora.descripcion,
      grupo: empleado.unidadOcupacionalEmpleadora.descripcion,
    };
    const fotoCabecera = cerrada
      ? ([...evaluaciones]
          .sort(primeroDelJefe)
          .find((ev) => ev.idUnidadEvaluado) ?? null)
      : null;
    if (fotoCabecera) {
      const [puesto, gerencia, area, unidad] = await Promise.all([
        fotoCabecera.idPuestoEvaluado
          ? this.prisma.puestoEmpleadora.findUnique({
              where: { idPuestoEmpleadora: fotoCabecera.idPuestoEvaluado },
            })
          : null,
        fotoCabecera.idGerenciaEvaluado
          ? this.prisma.gerenciaEmpleadora.findUnique({
              where: { idGerenciaEmpleadora: fotoCabecera.idGerenciaEvaluado },
            })
          : null,
        fotoCabecera.idAreaEvaluado
          ? this.prisma.areaEmpleadora.findUnique({
              where: { idAreaEmpleadora: fotoCabecera.idAreaEvaluado },
            })
          : null,
        fotoCabecera.idUnidadEvaluado
          ? this.prisma.unidadOcupacionalEmpleadora.findUnique({
              where: {
                idUnidadOcupacionalEmpleadora: fotoCabecera.idUnidadEvaluado,
              },
            })
          : null,
      ]);
      cabecera.puesto = puesto?.descripcion ?? cabecera.puesto;
      cabecera.gerencia = gerencia?.descripcion ?? cabecera.gerencia;
      cabecera.area = area?.descripcion ?? cabecera.area;
      cabecera.grupo = unidad?.descripcion ?? cabecera.grupo;
    }

    // Cómo se llega a la nota de competencias, en una frase: depende del
    // modelo y de si tiene jefe o gente a cargo que lo califique.
    const conSubordinados = notasGlobales.evaluacionesSubordinados.length > 0;
    const es180 = empresa.modeloEmpresa === '180';
    const tieneACargo =
      es180 &&
      !conSubordinados &&
      (await this.prisma.empleado.count({
        where: {
          codigoEmpleadoJefe: empleado.codigoEmpleado,
          idEmpresaEmpleadora: empleado.idEmpresaEmpleadora,
          estado: true,
        },
      })) > 0;
    const comoSeCalcula = !es180
      ? empresa.evaluadoSinJefe
        ? 'Modelo 90°. No tiene jefe inmediato: su resultado de competencias se define en la calibración.'
        : 'Modelo 90°: las competencias las califica su jefe inmediato (100 %). La autoevaluación no suma.'
      : empresa.evaluadoSinJefe
        ? conSubordinados
          ? 'Modelo 180°. No tiene jefe inmediato: las competencias las califican sus subordinados (100 %). La autoevaluación no suma.'
          : 'Modelo 180°. No tiene jefe inmediato: su resultado de competencias se define en la calibración.'
        : conSubordinados
          ? `Modelo 180°: competencias = jefe inmediato ${peso.jefe * 100} % + subordinados ${peso.subordinado * 100} %. La autoevaluación no suma.`
          : tieneACargo
            ? `Modelo 180°: jefe inmediato ${peso.jefe * 100} % + subordinados ${peso.subordinado * 100} %; mientras nadie a su cargo califique, cuenta solo su jefe (100 %). La autoevaluación no suma.`
            : 'Modelo 180°: no tiene personas a cargo, así que las competencias las califica solo su jefe inmediato (100 %). La autoevaluación no suma.';

    const data = {
      comoSeCalcula,
      es180,
      campana: {
        nombre: campana?.nombre ?? null,
        cerrada,
      },
      sinEvaluar: resultados.sinEvaluar,
      competenciasSinEvaluar: resultados.competenciasSinEvaluar,
      objetivosSinEvaluar: resultados.objetivosSinEvaluar,

      empresa: {
        nombre: empresa.nombreEmpresa,
        logo: empresa.urlLogo,
        modelo: empresa.modeloEmpresa,
        pesoCompetencias: peso.competencias * 100,
        pesoObjetivos: peso.objetivos * 100,
        periodoEvaluacion: newPeriodoEvaluacion,
      },

      evaluado: {
        nombres: empleado.nombres,
        apellidos: empleado.apellidos,
        codigoEmpleado: empleado.codigoEmpleado,
      },

      empleado: cabecera,

      resultados: {
        competencias: resultados.resultadoCompetencias,
        objetivos: resultados.promedioObjetivos,
        evaluacionFinal: resultados.resultadoFinal,
      },

      resultadosTexto: {
        // Las competencias asignadas y sin evaluar cuentan como 0, así que la
        // cifra se enseña: el "por qué es 0" lo dice cada fila de la tabla.
        // Solo se calla cuando no hay absolutamente nada evaluado, que es el
        // informe "sin evaluar" completo.
        competencias: texto(
          resultados.resultadoCompetencias,
          resultados.sinEvaluar,
        ),
        objetivos: texto(
          resultados.promedioObjetivos,
          resultados.objetivosSinEvaluar,
        ),
        evaluacionFinal: texto(
          resultados.resultadoFinal,
          resultados.sinEvaluar,
        ),
      },

      clasificacionCompetencias: desempeno,
      calibracion: ajuste
        ? {
            // La plantilla solo tiene #if/#each: el texto va armado.
            texto: [
              ajuste.competencias !== null
                ? `competencias ${ajuste.competenciasOriginal ?? '—'} → ${ajuste.competencias}`
                : null,
              ajuste.objetivos !== null
                ? `objetivos ${ajuste.objetivosOriginal ?? '—'} → ${ajuste.objetivos}`
                : null,
            ]
              .filter(Boolean)
              .join(' · '),
            motivo: ajuste.motivo,
            competenciasOriginal: ajuste.competenciasOriginal,
            objetivosOriginal: ajuste.objetivosOriginal,
            competencias: ajuste.competencias,
            objetivos: ajuste.objetivos,
          }
        : null,
      clasificacionObjetivos: desempenoObjetivos,
      clasificacionFinal: desempenoFinal,

      competenciasDetalle,
      fortalezas,
      debilidades,
      brechas,
      hayBrechas: brechas.length > 0,

      competenciasDoughnutChart,
      competenciasRadarChart,

      objetivosDetalle,
      retroalimentaciones,
      // Antes la plantilla miraba `retroalimentaciones.retroalimentacion`,
      // que no existe, y agregaba filas en blanco aunque hubiera plan.
      hayPlan: retroalimentaciones.some((r) => r.retroalimentacion.length > 0),
      sesion,
      objetivosChart,

      chartData: {
        labels: competenciasDetalle.map((c) => c.competencia),
        datasets: [
          {
            label: 'Resultado (%)',
            data: competenciasDetalle.map((c) => c.resultadoFinal),
          },
        ],
      },
    };

    return data;
  }
}
