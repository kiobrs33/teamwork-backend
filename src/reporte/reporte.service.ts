import { Injectable, NotFoundException } from '@nestjs/common';
import { PdfRendererService } from './pdf/pdf-renderer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  calcularResultados,
  clasificarDesempeno,
  DESEMPENO_SIN_EVALUAR,
  filtroEvaluacionesVigentes,
  notaDeEvaluacion,
  notasVacias,
  origenDeEvaluacion,
  pesosDeEmpresa,
  hayBrecha,
  redondear,
  resultadoDeCompetenciasAsignadas,
  resultadoDeObjetivo,
  SIN_EVALUAR_TEXTO,
  type NotasDeEvaluado,
} from 'src/common/resultados/resultados-evaluacion';

@Injectable()
export class ReporteService {
  constructor(
    private readonly pdfRenderer: PdfRendererService,
    private prisma: PrismaService,
  ) {}

  async obtenerDataReporteEvaluacion(idEmpleado: number) {
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

    const empresa = empleado.empresaEmpleadora;
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
        ...filtroEvaluacionesVigentes(empresa.periodoEvaluacion),
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
    const asignadas =
      await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
        where: {
          idUnidadOcupacionalEmpleadora:
            empleado.idUnidadOcupacionalEmpleadora,
          competencia: { estado: true },
          competenciaNivel: { estado: true },
        },
        include: { competencia: true, competenciaNivel: true },
        orderBy: { idCompetencia: 'asc' },
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
      },
      include: {
        objetivoDetalles: {
          where: { estado: true },
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
      const notaJefe = notas.evaluacionesJefe.length
        ? r.promedioJefe
        : null;
      const notaAuto = notas.autoEvaluaciones.length ? r.promedioAuto : null;
      const brecha = hayBrecha(notaAuto, notaJefe);

      return {
        orden: `Competencia ${indice + 1}`,
        competencia: asignada.competencia.titulo,
        nivel: asignada.competenciaNivel.nivel,

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

    const desempeno = resultados.competenciasSinEvaluar
      ? DESEMPENO_SIN_EVALUAR
      : clasificarDesempeno(resultados.resultadoCompetencias);

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
    const competenciasRadarChart = {
      labels: competenciasDetalle.map((c) => c.orden),
      datasets: [
        {
          label: 'Líder inmediato',
          data: competenciasDetalle.map((c) => c.evaluacionJefe),
          borderColor: '#2f80ed',
          backgroundColor: 'rgba(47,128,237,0.25)',
          pointBackgroundColor: '#2f80ed',
          pointBorderColor: '#ffffff',
          borderWidth: 2,
        },
        {
          label: 'Autoevaluación',
          data: competenciasDetalle.map((c) => c.autoevaluacion),
          borderColor: '#f2994a',
          backgroundColor: 'rgba(242,153,74,0.25)',
          pointBackgroundColor: '#f2994a',
          pointBorderColor: '#ffffff',
          borderWidth: 2,
        },
        ...(empresa.modeloEmpresa === '180'
          ? [
              {
                label: 'Subordinados',
                data: competenciasDetalle.map(
                  (c) => c.evaluacionSubordinados,
                ),
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39,174,96,0.20)',
                pointBackgroundColor: '#27ae60',
                pointBorderColor: '#ffffff',
                borderWidth: 2,
              },
            ]
          : []),
      ],
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

    // Fecha periodo evaluación. `periodoEvaluacion` se guarda como "YYYY-MM":
    // pasarlo por `new Date()` lo interpreta en UTC y, con el offset negativo
    // de Lima, devolvía el mes anterior. Se parte el texto a mano y se formatea
    // en UTC. El regex también toma el prefijo de los valores viejos, que
    // quedaron guardados como ISO completo.
    const periodo = /^(\d{4})-(\d{2})/.exec(empresa.periodoEvaluacion ?? '');
    const hoy = new Date();
    const anio = periodo ? Number(periodo[1]) : hoy.getFullYear();
    const mesIndice = periodo ? Number(periodo[2]) - 1 : hoy.getMonth();

    const mes = new Date(Date.UTC(anio, mesIndice, 1)).toLocaleDateString(
      'es-ES',
      { month: 'long', timeZone: 'UTC' },
    );
    const newPeriodoEvaluacion = `${mes.charAt(0).toUpperCase() + mes.slice(1)} de ${anio}`;

    // ==============================
    // DATA PARA EL REPORTE
    // ==============================
    // Las cifras van dos veces: `resultados` en número, que es lo que comen
    // los gráficos, y `resultadosTexto` ya formateado, que es lo que se
    // imprime en las tablas. Así el informe de alguien sin evaluar puede decir
    // "Sin evaluar" donde antes ponía un 0 que se leía como un suspenso.
    const texto = (valor: number, vacio: boolean) =>
      vacio ? SIN_EVALUAR_TEXTO : String(valor);

    const data = {
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

      empleado: {
        puesto: empleado.puestoEmpleadora.descripcion,
        gerencia: empleado.gerenciaEmpleadora.descripcion,
        area: empleado.areaEmpleadora.descripcion,
        grupo: empleado.unidadOcupacionalEmpleadora.descripcion,
      },

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

      competenciasDetalle,
      fortalezas,
      debilidades,
      brechas,
      hayBrechas: brechas.length > 0,

      competenciasDoughnutChart,
      competenciasRadarChart,

      objetivosDetalle,
      retroalimentaciones,
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

    return this.pdfRenderer.render('evaluacion', data);
  }
}
