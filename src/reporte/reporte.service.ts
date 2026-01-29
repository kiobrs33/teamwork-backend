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

  // async obtenerDataReporteEvaluacion(idEmpleado: number) {
  //   // ============================================================
  //   // 1. OBTENER EMPLEADO COMPLETO
  //   // ============================================================
  //   const empleado = await this.prisma.empleado.findUnique({
  //     where: {
  //       idEmpleado: idEmpleado,
  //     },
  //     include: {
  //       puestoEmpleadora: true,
  //       gerenciaEmpleadora: true,
  //       areaEmpleadora: true,
  //       unidadOcupacionalEmpleadora: true,
  //       empresaEmpleadora: true,
  //     },
  //   });

  //   if (!empleado) {
  //     throw new NotFoundException('Empleado no encontrado');
  //   }

  //   // ============================================================
  //   // 2. OBTENER EVALUACIONES DE COMPETENCIAS (CERRADAS)
  //   // ============================================================
  //   const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
  //     where: {
  //       idEvaluado: idEmpleado,
  //       estado: true,
  //       // estadoEvaluacion: 'PROCESO',
  //     },
  //     include: {
  //       competencia: true,
  //       evaluador: true,
  //       itemsEvaluados: true,
  //     },
  //   });

  //   // console.log('EVALUCIONS', evaluaciones);

  //   // ============================================================
  //   // 3. PROCESAR COMPETENCIAS
  //   // ============================================================
  //   // let totalPonderadoCompetencias = 0;
  //   // let totalResultadoCompetencias = 0;

  //   // const competenciasEvaluadas = evaluaciones.map((ev) => {
  //   //   const totalItems = ev.itemsEvaluados.length;

  //   //   const sumaCalificaciones = ev.itemsEvaluados.reduce(
  //   //     (sum, item) => sum + (item.calificacion ?? 0),
  //   //     0,
  //   //   );

  //   //   const resultadoObtenido =
  //   //     totalItems > 0 ? sumaCalificaciones / totalItems : 0;

  //   //   const ponderado = 1; // ⚠️ Ajusta si manejas peso por competencia

  //   //   totalPonderadoCompetencias += ponderado;
  //   //   totalResultadoCompetencias += resultadoObtenido * ponderado;

  //   //   return {
  //   //     tituloCompetencia: ev.competencia.titulo,
  //   //     evaluador: ev.evaluador
  //   //       ? `${ev.evaluador.nombres} ${ev.evaluador.apellidos}`
  //   //       : 'Autoevaluación',
  //   //     ponderado,
  //   //     resultadoObtenido: Number(resultadoObtenido.toFixed(2)),
  //   //   };
  //   // });

  //   // const resultadoCompetencias =
  //   //   totalPonderadoCompetencias > 0
  //   //     ? totalResultadoCompetencias / totalPonderadoCompetencias
  //   //     : 0;

  //   // ============================================================
  //   // 3. PROCESAR COMPETENCIAS (MEJORADO)
  //   // ============================================================
  //   const competenciasMap = new Map<number, any>();

  //   for (const ev of evaluaciones) {
  //     const competenciaId = ev.competencia.idCompetencia;

  //     if (!competenciasMap.has(competenciaId)) {
  //       competenciasMap.set(competenciaId, {
  //         idCompetencia: competenciaId,
  //         titulo: ev.competencia.titulo,
  //         evaluaciones: [],
  //         totalResultado: 0,
  //         totalPonderado: 0,
  //       });
  //     }

  //     const competencia = competenciasMap.get(competenciaId);

  //     const totalItems = ev.itemsEvaluados.length;
  //     const itemsCalificados = ev.itemsEvaluados.filter(
  //       (i) => i.calificacion !== null && i.calificacion > 0,
  //     ).length;

  //     const sumaCalificaciones = ev.itemsEvaluados.reduce(
  //       (sum, item) => sum + (item.calificacion ?? 0),
  //       0,
  //     );

  //     const promedio = totalItems > 0 ? sumaCalificaciones / totalItems : 0;

  //     // Tipo evaluador
  //     let tipoEvaluador = 'SIN EVALUADOR';
  //     if (ev.evaluador && ev.evaluador.idEmpleado === idEmpleado) {
  //       tipoEvaluador = 'AUTOEVALUACIÓN';
  //     } else if (ev.evaluador) {
  //       tipoEvaluador = 'EVALUADOR';
  //     }

  //     const ponderado = 1; // ⚠️ Ajustable

  //     competencia.totalResultado += promedio * ponderado;
  //     competencia.totalPonderado += ponderado;

  //     competencia.evaluaciones.push({
  //       evaluador: ev.evaluador
  //         ? `${ev.evaluador.nombres} ${ev.evaluador.apellidos}`
  //         : 'Autoevaluación',
  //       tipoEvaluador,
  //       promedio: Number(promedio.toFixed(2)),
  //       detalleCalificacion: {
  //         totalItems,
  //         itemsCalificados,
  //         itemsSinCalificar: totalItems - itemsCalificados,
  //       },
  //       fechaEvaluacion: ev.fechaCreacion,
  //     });
  //   }

  //   // ============================================================
  //   // 4. NORMALIZAR COMPETENCIAS
  //   // ============================================================
  //   const competenciasEvaluadas = Array.from(competenciasMap.values()).map(
  //     (comp) => ({
  //       titulo: comp.titulo,
  //       evaluaciones: comp.evaluaciones,
  //       resultadoFinal:
  //         comp.totalPonderado > 0
  //           ? Number((comp.totalResultado / comp.totalPonderado).toFixed(2))
  //           : 0,
  //     }),
  //   );

  //   // ============================================================
  //   // 5. RESULTADO GLOBAL DE COMPETENCIAS
  //   // ============================================================
  //   const resultadoCompetencias =
  //     competenciasEvaluadas.length > 0
  //       ? Number(
  //           (
  //             competenciasEvaluadas.reduce(
  //               (sum, c) => sum + c.resultadoFinal,
  //               0,
  //             ) / competenciasEvaluadas.length
  //           ).toFixed(2),
  //         )
  //       : 0;

  //   const totalPonderadoCompetencias = competenciasEvaluadas.length;

  //   // ============================================================
  //   // 4. OBJETIVOS (SI EXISTEN)
  //   // ============================================================
  //   const objetivos = await this.prisma.objetivo.findMany({
  //     where: {
  //       idEmpleado,
  //       estado: true,
  //     },
  //     include: {
  //       objetivoDetalles: {
  //         where: { estado: true },
  //       },
  //     },
  //   });

  //   let totalPonderadoObjetivos = 0;
  //   let totalResultadoObjetivos = 0;

  //   objetivos.forEach((obj) => {
  //     obj.objetivoDetalles.forEach((det) => {
  //       totalPonderadoObjetivos += det.pesoEspecifico;
  //       totalResultadoObjetivos +=
  //         (det.porcentajeLogrado ?? 0) * det.pesoEspecifico;
  //     });
  //   });

  //   const resultadoObjetivos =
  //     totalPonderadoObjetivos > 0
  //       ? totalResultadoObjetivos / totalPonderadoObjetivos
  //       : 0;

  //   // ============================================================
  //   // 5. RESULTADO GENERAL
  //   // ============================================================
  //   const resultadoGeneral =
  //     competenciasEvaluadas.length && objetivos.length
  //       ? Number(((resultadoCompetencias + resultadoObjetivos) / 2).toFixed(2))
  //       : Number(resultadoCompetencias.toFixed(2));

  //   // const logoBase64 = await this.imageToBase64(
  //   //   empleado.empresaEmpleadora.urlLogo,
  //   // );

  //   // ============================================================
  //   // 6. DATA FINAL PARA EL PDF
  //   // ============================================================
  //   const data = {
  //     fechaEvaluacion: new Date().toLocaleDateString('es-PE'),
  //     empresa: {
  //       nombre: empleado.empresaEmpleadora.nombreEmpresa,
  //       logo: empleado.empresaEmpleadora.urlLogo,
  //     },
  //     empleado: {
  //       apellidos: empleado.apellidos,
  //       nombres: empleado.nombres,
  //       puesto: empleado.puestoEmpleadora.descripcion,
  //       gerencia: empleado.gerenciaEmpleadora.descripcion,
  //       area: empleado.areaEmpleadora.descripcion,
  //       grupo: empleado.unidadOcupacionalEmpleadora.descripcion,
  //     },
  //     resumen: {
  //       competencias: {
  //         ponderado: totalPonderadoCompetencias,
  //         resultadoObtenido: Number(resultadoCompetencias.toFixed(2)),
  //       },
  //       objetivos: {
  //         ponderado: totalPonderadoObjetivos,
  //         resultadoObtenido: Number(resultadoObjetivos.toFixed(2)),
  //       },
  //       resultadoGeneral,
  //     },

  //     competencias: competenciasEvaluadas,
  //   };

  //   competenciasEvaluadas.map((comp) => {
  //     console.log('ITEM', comp, comp.resultadoFinal);
  //   });

  //   return this.pdfRenderer.render('evaluacion', data);
  // }

  // async imageToBase64(url: string): Promise<string> {
  //   const response = await axios.get(url, { responseType: 'arraybuffer' });
  //   const base64 = Buffer.from(response.data).toString('base64');
  //   return `data:image/png;base64,${base64}`;
  // }

  async obtenerDataReporteEvaluacion(idEmpleado: number): Promise<Buffer> {
    // ======================================================
    // 1. OBTENER EMPLEADO COMPLETO
    // ======================================================
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

    // ======================================================
    // 2. OBTENER TODAS LAS EVALUACIONES DEL EMPLEADO
    // ======================================================
    const evaluaciones = await this.prisma.evaluacionCompetencia.findMany({
      where: {
        estado: true,
        idEvaluado: idEmpleado,
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
          select: {
            calificacion: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'asc',
      },
    });

    // ======================================================
    // 3. AGRUPAR POR EVALUADOR Y NIVEL (MISMA LÓGICA EMPRESA)
    // ======================================================
    const evaluacionesPorEvaluador = new Map<number, any>();

    for (const ev of evaluaciones) {
      if (!ev.evaluado) continue;

      const totalItems = ev.itemsEvaluados.length;
      const itemsCalificados = ev.itemsEvaluados.filter(
        (i) => i.calificacion !== null && i.calificacion > 0,
      ).length;

      const nivelCalificado = itemsCalificados > 0;

      // -----------------------------
      // Tipo de evaluador
      // -----------------------------
      let tipoEvaluador = 'SIN EVALUADOR';

      if (ev.idEvaluador && ev.idEvaluador === ev.idEvaluado) {
        tipoEvaluador = 'AUTOEVALUACIÓN';
      } else if (ev.idEvaluador) {
        tipoEvaluador = 'EVALUADOR';
      }

      const evaluadorId = ev.evaluador?.idEmpleado ?? 0;

      // -----------------------------
      // Inicializar evaluador
      // -----------------------------
      if (!evaluacionesPorEvaluador.has(evaluadorId)) {
        evaluacionesPorEvaluador.set(evaluadorId, {
          evaluador: ev.evaluador
            ? { ...ev.evaluador, tipo: tipoEvaluador }
            : null,
          niveles: new Map<number, any>(),
        });
      }

      const evaluador = evaluacionesPorEvaluador.get(evaluadorId);
      const nivelId = ev.nivel.idCompetenciaNivel;

      // -----------------------------
      // Inicializar nivel
      // -----------------------------
      if (!evaluador.niveles.has(nivelId)) {
        evaluador.niveles.set(nivelId, {
          nivel: ev.nivel,
          evaluaciones: [],
        });
      }

      // -----------------------------
      // Agregar evaluación
      // -----------------------------
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
    // 5. DATA FINAL PARA TEMPLATE / PDF
    // ======================================================
    const data = {
      fechaEvaluacion: new Date().toLocaleDateString('es-PE'),
      empresa: {
        nombre: empleado.empresaEmpleadora.nombreEmpresa,
        logo: empleado.empresaEmpleadora.urlLogo,
      },
      evaluado: {
        idEmpleado: empleado.idEmpleado,
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
      evaluacionesPorEvaluador: Array.from(
        evaluacionesPorEvaluador.values(),
      ).map((ev) => ({
        evaluador: ev.evaluador,
        niveles: Array.from(ev.niveles.values()),
      })),
    };

    // ======================================================
    // 6. RENDER PDF
    // ======================================================
    // return this.pdfRenderer.render('evaluacion', data);

    // 🔹 Ejemplo (reemplaza con BD real)
    const competencias = [
      { nombre: 'Trabajo en equipo', resultado: 75 },
      { nombre: 'Comunicación', resultado: 80 },
      { nombre: 'Responsabilidad', resultado: 90 },
      { nombre: 'Liderazgo', resultado: 70 },
    ];

    const chartData = {
      labels: competencias.map((c) => c.nombre),
      datasets: [
        {
          label: 'Resultado (%)',
          data: competencias.map((c) => c.resultado),
          backgroundColor: '#1890ff',
        },
      ],
    };

    return this.pdfRenderer.render('evaluacion', {
      chartData,
    });
  }
}
