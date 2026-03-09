import { Injectable, NotFoundException } from '@nestjs/common';
import { EmpleadoService } from 'src/empleado/empleado.service';
import { PdfRendererService } from './pdf/pdf-renderer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ReporteService {
  constructor(
    private readonly empleadoService: EmpleadoService,
    private readonly pdfRenderer: PdfRendererService,
    private prisma: PrismaService,
  ) {}

  async generarReporteEvaluacionPDF(idEmpleado: number): Promise<Buffer> {
    // 1. Traer empleado
    const empleado = await this.empleadoService.findOne(idEmpleado);

    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // 2. Competencias
    const competencias =
      await this.empleadoService.findCompetenciasByEmpleado(idEmpleado);

    // 3. Armar data para el template
    const data = {
      empresa: {
        nombre: empleado.empresaEmpleadora.nombreEmpresa,
        logo: empleado.empresaEmpleadora.urlLogo,
      },
      empleado: {
        nombreCompleto: `${empleado.nombres} ${empleado.apellidos}`,
        puesto: empleado.idPuestoEmpleadora,
        area: empleado.idAreaEmpleadora,
        sede: empleado.sede,
      },
      competencias,
      fecha: new Date().toLocaleDateString(),
    };

    // 4. Generar PDF
    return this.pdfRenderer.render('evaluacion', data);
  }

  private obtenerMensajeDesempeno(resultado: number) {
    if (resultado >= 105) {
      return {
        nivel: 'Sobresaliente',
        mensaje: 'Siempre demuestra evidencias de todos los comportamientos.',
      };
    }

    if (resultado >= 95) {
      return {
        nivel: 'Altamente Efectivo',
        mensaje: 'Muy frecuentemente evidencia casi todos los comportamientos.',
      };
    }

    if (resultado >= 75) {
      return {
        nivel: 'Efectivo',
        mensaje: 'Usualmente evidencia la mayoría de los comportamientos.',
      };
    }

    if (resultado >= 50) {
      return {
        nivel: 'Parcialmente Efectivo',
        mensaje: 'En ocasiones evidencia los comportamientos.',
      };
    }

    return {
      nivel: 'Necesita Mejora',
      mensaje: 'Nunca evidencia los comportamientos.',
    };
  }

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

    // ==============================
    // PESOS
    // ==============================

    const pesoJefe = (empresa.porcentajeEvaluacionJefeCompetencia ?? 100) / 100;

    const pesoSub =
      (empresa.porcentajeEvaluacionSubordinadoCompetencia ?? 0) / 100;

    const pesoCompetencias = (empresa.porcentajeCompetecias ?? 80) / 100;

    const pesoObjetivos = (empresa.porcentajeObjetivos ?? 20) / 100;

    // ==============================
    // EVALUACIONES
    // ==============================

    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        estado: true,
        idEvaluado: idEmpleado,
      },
      include: {
        evaluador: {
          select: {
            idEmpleado: true,
            codigoEmpleado: true,
            nombres: true,
            apellidos: true,
          },
        },
        competencia: true,
        nivel: true,
        itemsEvaluados: {
          select: { calificacion: true },
        },
      },
    });

    // ==============================
    // AGRUPAR COMPETENCIAS
    // ==============================

    const mapaCompetencias = new Map();

    const promedio = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    let contadorComp = 1;
    for (const ev of evaluaciones) {
      const key = `${ev.idCompetencia}_${ev.idCompetenciaNivel}`;
      const orden = `Competencia ${contadorComp}`;

      if (!mapaCompetencias.has(key)) {
        mapaCompetencias.set(key, {
          orden,
          competencia: ev.competencia.titulo,
          nivel: ev.nivel.nivel,
          auto: [],
          jefe: [],
          subordinados: [],
        });

        contadorComp++;
      }

      const registro = mapaCompetencias.get(key);

      const calificaciones = ev.itemsEvaluados
        .map((i) => i.calificacion)
        .filter((c): c is number => c !== null);

      if (!calificaciones.length) continue;

      const promedioEvaluacion = promedio(calificaciones);

      if (ev.idEvaluador === idEmpleado) {
        registro.auto.push(promedioEvaluacion);
        continue;
      }

      if (ev.evaluador?.codigoEmpleado === empleado.codigoEmpleadoJefe) {
        registro.jefe.push(promedioEvaluacion);
      } else {
        registro.subordinados.push(promedioEvaluacion);
      }
    }

    // ==============================
    // RESULTADOS COMPETENCIAS
    // ==============================

    const competenciasDetalle: any[] = [];

    for (const comp of mapaCompetencias.values()) {
      const auto = promedio(comp.auto);
      const jefe = promedio(comp.jefe);
      const sub = promedio(comp.subordinados);

      let resultado = 0;

      if (empresa.modeloEmpresa === '90') {
        resultado = jefe;
      }

      if (empresa.modeloEmpresa === '180') {
        resultado = comp.subordinados.length
          ? jefe * pesoJefe + sub * pesoSub
          : jefe;
      }

      // competenciasDetalle.push({
      //   competencia: comp.competencia,
      //   nivel: comp.nivel,
      //   autoevaluacion: Number(auto.toFixed(2)),
      //   evaluacionJefe: Number(jefe.toFixed(2)),
      //   evaluacionSubordinados: Number(sub.toFixed(2)),
      //   resultadoFinal: Number(resultado.toFixed(2)),
      // });

      const resultadoFinal = Number(resultado.toFixed(2));

      let superavit: number | null = null;
      let oportunidadMejora: number | null = null;
      let resultadoTexto = `${resultadoFinal}%`;

      if (resultadoFinal > 100) {
        superavit = Number((resultadoFinal - 100).toFixed(2));
        resultadoTexto = `${resultadoFinal}% (+${superavit})`;
      }

      if (resultadoFinal < 100) {
        oportunidadMejora = Number((100 - resultadoFinal).toFixed(2));
        resultadoTexto = `${resultadoFinal}% (-${oportunidadMejora})`;
      }

      competenciasDetalle.push({
        orden: comp.orden,
        competencia: comp.competencia,
        nivel: comp.nivel,

        autoevaluacion: Number(auto.toFixed(2)),
        evaluacionJefe: Number(jefe.toFixed(2)),
        evaluacionSubordinados: Number(sub.toFixed(2)),

        resultadoFinal,
        resultadoTexto,

        superavit,
        oportunidadMejora,

        competenciaResultadoEsperado: empresa.competenciaResultadoEsperado,
      });
    }

    // ==============================
    // RESULTADO GLOBAL COMPETENCIAS
    // ==============================

    const resultadoCompetencias = promedio(
      competenciasDetalle.map((c) => c.resultadoFinal),
    );

    const desempeno = this.obtenerMensajeDesempeno(resultadoCompetencias);

    // const competenciasDoughnutChart = {
    //   porcentaje: Number(resultadoCompetencias.toFixed(2)),
    //   restante: Number((100 - resultadoCompetencias).toFixed(2)),
    // };

    // const competenciasRadarChart = {
    //   labels: competenciasDetalle.map((c) => c.competencia),
    //   datasets: [
    //     {
    //       label: 'Resultado Obtenido',
    //       data: competenciasDetalle.map((c) => c.resultadoFinal),
    //       borderColor: '#2f80ed',
    //       backgroundColor: 'rgba(47,128,237,0.2)',
    //       pointBackgroundColor: '#2f80ed',
    //     },
    //     {
    //       label: 'Autoevaluación',
    //       data: competenciasDetalle.map((c) => c.autoevaluacion),
    //       borderColor: '#f2994a',
    //       backgroundColor: 'rgba(242,153,74,0.2)',
    //       pointBackgroundColor: '#f2994a',
    //     },
    //   ],
    // };

    const porcentajeCompetencias = Math.min(resultadoCompetencias, 100);

    const competenciasDoughnutChart = {
      porcentaje: Number(porcentajeCompetencias.toFixed(2)),
      restante: Number((100 - porcentajeCompetencias).toFixed(2)),
    };

    const competenciasRadarChart = {
      labels: competenciasDetalle.map((c) => c.orden),
      datasets: [
        {
          label: 'Resultado Obtenido',
          data: competenciasDetalle.map((c) => c.resultadoFinal),
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
      ],
    };

    // ==============================
    // OBJETIVOS
    // ==============================

    // const objetivos = await this.prisma.objetivoDetalle.findMany({
    //   where: {
    //     estado: true,
    //     objetivo: {
    //       idEmpleado,
    //       estado: true,
    //     },
    //   },
    //   select: {
    //     porcentajeLogrado: true,
    //     pesoEspecifico: true,
    //   },
    // });

    // let totalPeso = 0;
    // let acumulado = 0;

    // for (const obj of objetivos) {
    //   if (obj.porcentajeLogrado === null) continue;

    //   acumulado += obj.porcentajeLogrado * obj.pesoEspecifico;
    //   totalPeso += obj.pesoEspecifico;
    // }

    // const resultadoObjetivos = totalPeso > 0 ? acumulado / totalPeso : 0;

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
      },
    });

    const objetivosDetalle: any[] = [];

    let totalPeso = 0;
    let acumulado = 0;
    let contadorObj = 1;

    for (const obj of objetivos) {
      for (const det of obj.objetivoDetalles) {
        const porcentaje = det.porcentajeLogrado ?? 0;
        const orden = `Objetivo ${contadorObj}`;

        objetivosDetalle.push({
          orden,
          descripcion: det.descripcion,
          metaObjetivo: det.metaObjetivo,
          metaAlcanzada: det.metaAlcanzada ?? 0,
          porcentajeLogrado: Number(porcentaje.toFixed(2)),
          pesoEspecifico: det.pesoEspecifico,
        });

        acumulado += porcentaje * det.pesoEspecifico;
        totalPeso += det.pesoEspecifico;
        contadorObj++;
      }
    }

    const resultadoObjetivos = totalPeso > 0 ? acumulado / totalPeso : 0;

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
          data: objetivosDetalle.map((o) => o.porcentajeLogrado),
          backgroundColor: '#1890ff',
        },
      ],
    };

    const fortalezas = competenciasDetalle.filter(
      (c) => c.resultadoFinal >= (empresa.competenciaResultadoEsperado ?? 100),
    );

    const debilidades = competenciasDetalle.filter(
      (c) => c.resultadoFinal < (empresa.competenciaResultadoEsperado ?? 100),
    );

    // Fecha periodo evaluación
    const datePeriodoEvaluacion = new Date(
      empresa.periodoEvaluacion ?? Date.now(),
    );

    const newPeriodoEvaluacion = datePeriodoEvaluacion
      .toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
      .toUpperCase();

    // ==============================
    // RESULTADO FINAL ED
    // ==============================

    const resultadoFinalED =
      resultadoCompetencias * pesoCompetencias +
      resultadoObjetivos * pesoObjetivos;

    // ==============================
    // DATA PARA EL REPORTE
    // ==============================
    const data = {
      empresa: {
        nombre: empresa.nombreEmpresa,
        logo: empresa.urlLogo,
        modelo: empresa.modeloEmpresa,
        pesoCompetencias: pesoCompetencias * 100,
        pesoObjetivos: pesoObjetivos * 100,
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
        competencias: Number(resultadoCompetencias.toFixed(2)),
        objetivos: Number(resultadoObjetivos.toFixed(2)),
        evaluacionFinal: Number(resultadoFinalED.toFixed(2)),
      },

      clasificacionCompetencias: desempeno,

      competenciasDetalle,
      fortalezas,
      debilidades,

      competenciasDoughnutChart,
      competenciasRadarChart,

      objetivosDetalle,
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

    console.log('DATA ===============================', data);

    return this.pdfRenderer.render('evaluacion', data);
  }
}
