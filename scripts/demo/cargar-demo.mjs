/**
 * Empresa de demostración para capacitar a los trabajadores:
 * TEAM WORK CONSULTORES PERU S.A.C. (RUC 20454020538), 50 trabajadores y una
 * campaña en curso a medio avanzar (unos terminaron, otros no empezaron), para
 * que cada quien vea cómo se evalúa.
 *
 * Todo entra POR LA API, como lo haría una persona: respeta todas las reglas
 * (alcance por rol, vigencias, cálculo de resultados, bitácora). Sirve igual
 * contra local que contra producción.
 *
 *   API_URL=https://api.teamwork.com.pe \
 *   SUPERADMIN_USUARIO=... SUPERADMIN_CONTRASENA=... \
 *   node scripts/demo/cargar-demo.mjs
 *
 * Deja en SALIDA (por defecto ./demo-salida) un Excel con los accesos de los
 * 50 trabajadores y de RR. HH. Las contraseñas solo se ven ahí: guárdelo bien.
 * Si la empresa (por RUC) ya existe, no hace nada.
 */
import ExcelJS from 'exceljs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const API = (process.env.API_URL ?? 'http://localhost:4055').replace(/\/$/, '');
const SUPER_U = process.env.SUPERADMIN_USUARIO;
const SUPER_C = process.env.SUPERADMIN_CONTRASENA;
const SALIDA = process.env.SALIDA ?? './demo-salida';
const RUC = '20454020538';
const NOMBRE_EMPRESA = 'TEAM WORK CONSULTORES PERU S.A.C.';
if (!SUPER_U || !SUPER_C) {
  console.error('Faltan SUPERADMIN_USUARIO y SUPERADMIN_CONTRASENA.');
  process.exit(1);
}

// ---------------------------------------------------------------- utilidades
let semilla = 20454020538 % 2147483647;
/** Aleatorio con semilla: cada corrida genera los mismos datos. */
const azar = () => (semilla = (semilla * 48271) % 2147483647) / 2147483647;
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
const hoy = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const diasAtras = (n) => iso(new Date(hoy.getTime() - n * 86400000));

class ErrorApi extends Error {}
async function api(metodo, ruta, { token, cuerpo, formulario } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (formulario) body = formulario;
  else if (cuerpo !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(cuerpo);
  }
  const r = await fetch(API + ruta, { method: metodo, headers, body });
  const texto = await r.text();
  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    json = { message: texto };
  }
  if (!r.ok) {
    const detalle = json.errors ? ` ${JSON.stringify(json.errors).slice(0, 600)}` : '';
    throw new ErrorApi(`${metodo} ${ruta} → ${r.status}: ${json.message}${detalle}`);
  }
  return json.data;
}
const login = async (usuario, contrasena, empresa) =>
  (await api('POST', '/auth/login', { cuerpo: { codigoUsuario: usuario, contrasena, ...(empresa ? { empresa } : {}) } }));

const paso = (t) => console.log(`\n▸ ${t}`);
const contar = { evaluacionesCerradas: 0, evaluacionesEnProceso: 0, notas: 0, metasCalificadas: 0, evidencias: 0, sesiones: 0 };

/** PDF mínimo válido, para las evidencias y los hitos de ejemplo. */
function pdfDeEjemplo(titulo) {
  const texto = titulo.replace(/[()\\]/g, '');
  const contenido = `BT /F1 14 Tf 60 760 Td (${texto}) Tj 0 -24 Td /F1 10 Tf (Documento de ejemplo - empresa de demostracion TeamWork) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}
const archivo = (campos, nombre, titulo) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) f.append(k, String(v));
  f.append('file', pdfDeEjemplo(titulo), nombre);
  return f;
};

// -------------------------------------------------------------- datos base
const GERENCIAS = ['Gerencia General', 'Gerencia de Consultoría', 'Gerencia de Administración y Finanzas', 'Gerencia Comercial'];
const AREAS = ['Dirección', 'Evaluación de Talento', 'Provisión de Personal', 'Formación Profesional', 'Desarrollo Organizacional', 'Contabilidad y Finanzas', 'Tecnología de la Información', 'Ventas y Marketing'];
const GRUPOS = ['Directivos', 'Jefaturas', 'Profesionales', 'Técnicos y Asistentes'];
const PUESTOS = ['Gerente General', 'Gerente de Consultoría', 'Gerente de Administración y Finanzas', 'Gerente Comercial', 'Jefe de Evaluación de Talento', 'Jefe de Provisión de Personal', 'Jefe de Formación Profesional', 'Jefe de Desarrollo Organizacional', 'Jefe de Contabilidad', 'Jefe de Ventas', 'Consultor Senior', 'Consultor', 'Analista de Selección', 'Psicólogo Organizacional', 'Capacitador', 'Contador', 'Asistente Administrativo', 'Analista de Sistemas', 'Ejecutivo Comercial', 'Asistente de Marketing'];

/** Competencias con 4 niveles y 3 comportamientos por nivel. */
const COMPETENCIAS = [
  ['COR-01', 'Orientación a resultados', 'Capacidad para cumplir los objetivos con calidad y en el plazo previsto.', [
    ['Cumple las tareas asignadas en los plazos establecidos.', 'Pide ayuda oportunamente cuando un plazo está en riesgo.', 'Revisa su trabajo antes de entregarlo.'],
    ['Organiza su trabajo para cumplir las metas del área.', 'Propone mejoras para hacer las tareas en menos tiempo.', 'Mide su avance con indicadores sencillos.'],
    ['Fija metas desafiantes y realistas para su equipo.', 'Hace seguimiento del avance y corrige desviaciones a tiempo.', 'Prioriza los recursos según el impacto en los resultados.'],
    ['Alinea los objetivos de la organización con la estrategia.', 'Toma decisiones de alto impacto con base en datos.', 'Promueve una cultura de logro en toda la empresa.'],
  ]],
  ['COR-02', 'Trabajo en equipo', 'Colaborar con otras personas para lograr objetivos comunes.', [
    ['Comparte información útil con sus compañeros.', 'Respeta las opiniones de los demás.', 'Cumple los acuerdos del equipo.'],
    ['Ofrece apoyo a compañeros con carga de trabajo alta.', 'Participa activamente en las reuniones del equipo.', 'Resuelve los desacuerdos de manera constructiva.'],
    ['Integra a personas de distintas áreas en los proyectos.', 'Reconoce públicamente los aportes del equipo.', 'Fomenta un clima de confianza y colaboración.'],
    ['Construye alianzas entre gerencias para objetivos comunes.', 'Promueve la colaboración como valor de la organización.', 'Resuelve conflictos complejos entre equipos.'],
  ]],
  ['COR-03', 'Orientación al cliente', 'Entender y atender las necesidades del cliente interno y externo.', [
    ['Atiende con amabilidad y respeto a los clientes.', 'Responde las consultas en el tiempo acordado.', 'Registra los pedidos de los clientes correctamente.'],
    ['Identifica las necesidades reales del cliente.', 'Hace seguimiento hasta resolver cada caso.', 'Propone soluciones que agregan valor al cliente.'],
    ['Diseña mejoras al servicio a partir de la opinión del cliente.', 'Anticipa necesidades futuras de los clientes.', 'Mide la satisfacción del cliente y actúa sobre los resultados.'],
    ['Orienta la estrategia de la empresa hacia el cliente.', 'Desarrolla relaciones de largo plazo con clientes clave.', 'Promueve la cultura de servicio en toda la organización.'],
  ]],
  ['COR-04', 'Comunicación efectiva', 'Transmitir ideas de forma clara y escuchar activamente.', [
    ['Se expresa con claridad de forma oral y escrita.', 'Escucha con atención antes de responder.', 'Usa un lenguaje respetuoso en todo momento.'],
    ['Adapta su mensaje a la persona con quien habla.', 'Confirma que su mensaje fue entendido.', 'Redacta informes ordenados y fáciles de leer.'],
    ['Presenta propuestas de forma convincente.', 'Da retroalimentación clara y oportuna a su equipo.', 'Facilita reuniones productivas.'],
    ['Comunica la visión de la empresa e inspira a otros.', 'Maneja con transparencia la comunicación en situaciones críticas.', 'Representa a la empresa ante clientes y aliados.'],
  ]],
  ['LID-01', 'Liderazgo', 'Guiar y desarrollar a las personas para lograr los objetivos.', [
    ['Asigna tareas de forma clara a su equipo.', 'Da el ejemplo con su conducta.', 'Escucha las propuestas de su equipo.'],
    ['Delega responsabilidades según las capacidades de cada persona.', 'Hace seguimiento y apoya a su equipo.', 'Reconoce el buen desempeño.'],
    ['Desarrolla las capacidades de su equipo con planes concretos.', 'Toma decisiones difíciles cuando la situación lo requiere.', 'Mantiene al equipo motivado ante los cambios.'],
    ['Forma líderes dentro de la organización.', 'Conduce procesos de cambio en toda la empresa.', 'Inspira compromiso con la misión de la empresa.'],
  ]],
  ['TEC-01', 'Conocimiento técnico del puesto', 'Dominio de los conocimientos y herramientas propias del puesto.', [
    ['Conoce los procedimientos básicos de su puesto.', 'Usa correctamente las herramientas de trabajo.', 'Consulta cuando tiene dudas técnicas.'],
    ['Resuelve con autonomía los problemas técnicos habituales.', 'Se mantiene actualizado en su especialidad.', 'Comparte su conocimiento con sus compañeros.'],
    ['Resuelve problemas técnicos complejos.', 'Propone mejoras técnicas a los procesos.', 'Es referente técnico para otras áreas.'],
    ['Define estándares técnicos para la organización.', 'Incorpora nuevas metodologías y tecnologías.', 'Lidera proyectos técnicos de alto impacto.'],
  ]],
];
/** Qué competencias y en qué nivel tiene cada grupo ocupacional. */
const ASIGNACION = {
  Directivos: [['COR-01', 4], ['COR-02', 4], ['COR-03', 4], ['COR-04', 4], ['LID-01', 4]],
  Jefaturas: [['COR-01', 3], ['COR-02', 3], ['COR-03', 3], ['LID-01', 3], ['TEC-01', 3]],
  Profesionales: [['COR-01', 2], ['COR-02', 2], ['COR-03', 2], ['COR-04', 2], ['TEC-01', 2]],
  'Técnicos y Asistentes': [['COR-01', 1], ['COR-02', 1], ['COR-03', 1], ['TEC-01', 1]],
};

const NOMBRES_M = ['Carlos', 'José', 'Luis', 'Jorge', 'Miguel', 'Juan', 'Pedro', 'Ricardo', 'Fernando', 'Diego', 'Andrés', 'Raúl', 'César', 'Víctor', 'Hugo', 'Martín', 'Renzo', 'Alonso', 'Gonzalo', 'Iván'];
const NOMBRES_F = ['María', 'Rosa', 'Carmen', 'Ana', 'Lucía', 'Patricia', 'Sofía', 'Valeria', 'Gabriela', 'Milagros', 'Claudia', 'Diana', 'Andrea', 'Fiorella', 'Karina', 'Paola', 'Jimena', 'Elena', 'Silvia', 'Mónica'];
const APELLIDOS = ['Quispe', 'Flores', 'Sánchez', 'Rodríguez', 'García', 'Huamán', 'Mamani', 'Torres', 'Ramírez', 'Mendoza', 'Chávez', 'Vargas', 'Rojas', 'Castillo', 'Gutiérrez', 'Paredes', 'Salazar', 'Cáceres', 'Zevallos', 'Valdivia', 'Condori', 'Apaza', 'Herrera', 'Córdova', 'Medina'];

/**
 * Organigrama: 1 gerente general, 3 gerentes, 6 jefes de área y 40
 * colaboradores. Cada fila: código, puesto, área, gerencia, grupo, código del jefe.
 */
function organigrama() {
  const filas = [];
  const add = (cod, puesto, area, gerencia, grupo, jefe, rol) => filas.push({ cod, puesto, area, gerencia, grupo, jefe, rol });
  add('TW001', 'Gerente General', 'Dirección', 'Gerencia General', 'Directivos', null, 'JEFE');
  add('TW002', 'Gerente de Consultoría', 'Dirección', 'Gerencia de Consultoría', 'Directivos', 'TW001', 'JEFE');
  add('TW003', 'Gerente de Administración y Finanzas', 'Dirección', 'Gerencia de Administración y Finanzas', 'Directivos', 'TW001', 'JEFE');
  add('TW004', 'Gerente Comercial', 'Dirección', 'Gerencia Comercial', 'Directivos', 'TW001', 'JEFE');
  const jefes = [
    ['TW005', 'Jefe de Evaluación de Talento', 'Evaluación de Talento', 'Gerencia de Consultoría', 'TW002', ['Consultor Senior', 'Consultor', 'Psicólogo Organizacional']],
    ['TW006', 'Jefe de Provisión de Personal', 'Provisión de Personal', 'Gerencia de Consultoría', 'TW002', ['Analista de Selección', 'Consultor', 'Asistente Administrativo']],
    ['TW007', 'Jefe de Formación Profesional', 'Formación Profesional', 'Gerencia de Consultoría', 'TW002', ['Capacitador', 'Consultor', 'Asistente Administrativo']],
    ['TW008', 'Jefe de Desarrollo Organizacional', 'Desarrollo Organizacional', 'Gerencia de Consultoría', 'TW002', ['Consultor Senior', 'Psicólogo Organizacional', 'Consultor']],
    ['TW009', 'Jefe de Contabilidad', 'Contabilidad y Finanzas', 'Gerencia de Administración y Finanzas', 'TW003', ['Contador', 'Asistente Administrativo', 'Analista de Sistemas']],
    ['TW010', 'Jefe de Ventas', 'Ventas y Marketing', 'Gerencia Comercial', 'TW004', ['Ejecutivo Comercial', 'Asistente de Marketing', 'Ejecutivo Comercial']],
  ];
  for (const [cod, puesto, area, gerencia, jefe] of jefes) add(cod, puesto, area, gerencia, 'Jefaturas', jefe, 'JEFE');
  let n = 11;
  // 40 colaboradores repartidos entre los 6 jefes (7, 7, 7, 7, 6, 6).
  jefes.forEach(([codJefe, , area, gerencia, , puestos], i) => {
    const cuantos = i < 4 ? 7 : 6;
    for (let k = 0; k < cuantos; k++) {
      const puesto = puestos[k % puestos.length];
      const grupo = /Asistente/.test(puesto) ? 'Técnicos y Asistentes' : 'Profesionales';
      add(`TW${String(n++).padStart(3, '0')}`, puesto, area, gerencia, grupo, codJefe, 'EMPLEADO');
    }
  });
  return filas;
}

// --------------------------------------------------------------- programa
async function main() {
  console.log(`API: ${API}`);
  const sa = await login(SUPER_U, SUPER_C);
  const T = sa.token;

  const existentes = await api('GET', `/empresa-empleadora?limit=0&ruc=${RUC}`, { token: T });
  if ((existentes?.empresas ?? []).some((e) => e.ruc === RUC)) {
    console.log(`La empresa con RUC ${RUC} ya existe: no se carga nada.`);
    return;
  }

  paso('Empresa y campaña');
  const { empresa } = await api('POST', '/empresa-empleadora', {
    token: T,
    cuerpo: {
      nombreEmpresa: NOMBRE_EMPRESA,
      ruc: RUC,
      direccionEmpresa: 'Av. Ejército 101, Yanahuara, Arequipa',
      colorPrimario: '#d4880f',
      modeloEmpresa: '180',
      porcentajeCompetecias: 60,
      porcentajeObjetivos: 40,
      porcentajeEvaluacionJefeCompetencia: 70,
      porcentajeEvaluacionSubordinadoCompetencia: 30,
      tipoCalificacionCompetencia: 'LIKERT',
      competenciaResultadoEsperado: 100,
    },
  });
  const ID = empresa.idEmpresaEmpleadora;
  const anio = hoy.getFullYear();
  const finVigencia = iso(new Date(hoy.getTime() + 45 * 86400000));
  const { campana } = await api('POST', '/campana', {
    token: T,
    cuerpo: {
      idEmpresaEmpleadora: ID,
      nombre: `Evaluación de desempeño ${anio} (demostración)`,
      periodoDesde: `${anio}-01-01`,
      periodoHasta: `${anio}-12-31`,
      fechaVigenciaInicio: diasAtras(20),
      fechaVigenciaFin: finVigencia,
      fechaVigenciaInicioObjetivo: diasAtras(25),
      fechaVigenciaFinObjetivo: finVigencia,
      modeloEmpresa: '180',
      porcentajeCompetecias: 60,
      porcentajeObjetivos: 40,
      porcentajeEvaluacionJefeCompetencia: 70,
      porcentajeEvaluacionSubordinadoCompetencia: 30,
      tipoCalificacionCompetencia: 'LIKERT',
      competenciaResultadoEsperado: 100,
    },
  });
  const ID_CAMPANA = campana.idCampanaEvaluacion;
  console.log(`  empresa ${ID}, campaña ${ID_CAMPANA} (${campana.nombre})`);

  paso('Estructura');
  const ids = { gerencia: {}, area: {}, unidad: {}, puesto: {} };
  for (const d of GERENCIAS) ids.gerencia[d] = (await api('POST', '/gerencia-empleadora', { token: T, cuerpo: { descripcion: d, idEmpresaEmpleadora: ID } })).gerencia.idGerenciaEmpleadora;
  for (const d of AREAS) ids.area[d] = (await api('POST', '/area-empleadora', { token: T, cuerpo: { descripcion: d, idEmpresaEmpleadora: ID } })).area.idAreaEmpleadora;
  for (const d of GRUPOS) ids.unidad[d] = (await api('POST', '/unidad-ocupacional-empleadora', { token: T, cuerpo: { descripcion: d, idEmpresaEmpleadora: ID } })).unidad.idUnidadOcupacionalEmpleadora;
  for (const d of PUESTOS) ids.puesto[d] = (await api('POST', '/puesto-empleadora', { token: T, cuerpo: { descripcion: d, idEmpresaEmpleadora: ID } })).puesto.idPuestoEmpleadora;
  console.log(`  ${GERENCIAS.length} gerencias, ${AREAS.length} áreas, ${GRUPOS.length} grupos, ${PUESTOS.length} puestos`);

  paso('Competencias y asignación a grupos');
  const comp = {};
  for (const [codigo, titulo, nombre, niveles] of COMPETENCIAS) {
    const { competencia } = await api('POST', '/competencia/con-niveles', {
      token: T,
      cuerpo: { codigo, titulo, nombre, idEmpresaEmpleadora: ID, niveles: niveles.map((items, i) => ({ nivel: i + 1, items: items.map((enunciado) => ({ enunciado })) })) },
    });
    comp[codigo] = { id: competencia.idCompetencia, niveles: Object.fromEntries(competencia.niveles.map((n) => [n.nivel, n.idCompetenciaNivel])) };
  }
  await api('POST', '/unidad-ocupacional-empleadora/asignar', {
    token: T,
    cuerpo: {
      unidades: Object.entries(ASIGNACION).map(([grupo, lista]) => ({
        idUnidadOcupacionalEmpleadora: ids.unidad[grupo],
        competencias: lista.map(([c, nivel]) => ({ idCompetencia: comp[c].id, idCompetenciaNivel: comp[c].niveles[nivel] })),
      })),
    },
  });
  console.log(`  ${COMPETENCIAS.length} competencias asignadas a ${GRUPOS.length} grupos`);

  paso('Cuenta de RR. HH.');
  const claveRrhh = `Rrhh-Demo-${Math.floor(azar() * 9000 + 1000)}-Tw!`;
  await api('POST', `/empresa-empleadora/${ID}/administradores`, {
    token: T,
    cuerpo: { nombreCompleto: 'Recursos Humanos TeamWork (demo)', codigoUsuario: 'rrhh.demo', contrasena: claveRrhh },
  });

  paso('50 trabajadores');
  const usados = new Set();
  const filas = organigrama().map((f, i) => {
    const mujer = i % 2 === 1;
    let documento;
    do documento = String(40000000 + Math.floor(azar() * 39999999)); while (usados.has(documento));
    usados.add(documento);
    const ingreso = new Date(hoy.getTime() - Math.floor(200 + azar() * 3000) * 86400000);
    return {
      ...f,
      mujer,
      dto: {
        rol: f.rol,
        codigoEmpleado: f.cod,
        nombres: elegir(mujer ? NOMBRES_F : NOMBRES_M),
        apellidos: `${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`,
        tipoDocumento: 'DNI',
        documento,
        sede: f.area === 'Ventas y Marketing' ? 'Lima' : 'Arequipa',
        fechaIngreso: iso(ingreso),
        idEmpresaEmpleadora: ID,
        idAreaEmpleadora: ids.area[f.area],
        idPuestoEmpleadora: ids.puesto[f.puesto],
        idGerenciaEmpleadora: ids.gerencia[f.gerencia],
        idUnidadOcupacionalEmpleadora: ids.unidad[f.grupo],
        ...(f.jefe ? { codigoEmpleadoJefe: f.jefe } : {}),
      },
    };
  });
  const masivo = await api('POST', '/empleado/masivo', { token: T, cuerpo: filas.map((f) => f.dto) });
  const porCodigo = Object.fromEntries(masivo.empleados.map((e) => [e.codigoEmpleado, e]));
  const acceso = Object.fromEntries(masivo.accesos.map((a) => [a.codigoEmpleado, a]));
  const personas = filas.map((f) => ({ ...f, emp: porCodigo[f.cod], acceso: acceso[f.cod] }));
  console.log(`  ${masivo.totalInsertados} trabajadores`);

  paso('Objetivos (fichas de 3 metas)');
  const METAS = [
    ['Cumplir el plan de trabajo anual del área', 'ASCENDENTE', 'PORCENTAJE', 100],
    ['Atender las solicitudes de clientes dentro del plazo', 'ASCENDENTE', 'CANTIDAD', 120],
    ['Reducir los reprocesos en los entregables', 'DESCENDENTE', 'CANTIDAD', 10],
    ['Completar horas de capacitación', 'ASCENDENTE', 'HORAS', 40],
    ['Reducir el tiempo de respuesta a consultas', 'DESCENDENTE', 'DIAS', 3],
    ['Alcanzar el nivel de satisfacción del cliente', 'MANUAL', 'PUNTOS', 90],
  ];
  const conObjetivos = personas.filter((p) => p.jefe); // el gerente general no tiene jefe que lo califique
  const pesos = [40, 35, 25];
  await api('POST', '/objetivo/masivo', {
    token: T,
    cuerpo: {
      idEmpresaEmpleadora: ID,
      objetivos: conObjetivos.map((p, i) => ({
        codigoEmpleado: p.cod,
        objetivoDetalles: [0, 1, 2].map((k) => {
          const [descripcion, tipoCalculo, unidadMedida, meta] = METAS[(i + k * 2) % METAS.length];
          return { descripcion, tipoCalculo, unidadMedida, metaObjetivo: meta, pesoEspecifico: pesos[k], fechaCulminacion: `${anio}-12-15`, descripcionIniciativa: 'Seguimiento mensual con el jefe inmediato.' };
        }),
      })),
    },
  });
  const objetivos = (await api('GET', `/objetivo?idEmpresaEmpleadora=${ID}&limit=0`, { token: T })).objetivos;
  const fichaDe = Object.fromEntries(objetivos.map((o) => [o.idEmpleado, o]));
  console.log(`  ${objetivos.length} fichas`);

  // ------------------------------------------------ escenario de avance
  // Cada persona tiene un "desempeño" (cuánto suele puntuar) y un avance.
  // Los jefes TW008 y TW010 quedan SIN calificar a su equipo: sirven para
  // practicar la evaluación desde cero en la capacitación.
  const PRACTICA = new Set(['TW008', 'TW010']);
  // La mayoría alrededor de «Efectivo», unos pocos arriba y abajo.
  const perfil = Object.fromEntries(personas.map((p) => [p.cod, Math.min(1, Math.max(0.45, 0.8 + (azar() + azar() + azar() - 1.5) * 0.25))]));
  const nota = (cod) => {
    const v = perfil[cod] + (azar() - 0.5) * 0.35;
    return [0, 25, 50, 75, 100][Math.max(0, Math.min(4, Math.round(v * 4)))];
  };
  const sesion = {};
  const tokenDe = async (p) => {
    if (!sesion[p.cod]) sesion[p.cod] = (await login(p.acceso.usuario, p.acceso.contrasena, ID)).token;
    return sesion[p.cod];
  };

  /** Inicia, califica (todo o una parte) y, si se pide, cierra. */
  async function evaluar(token, evaluado, evaluador, asignada, codPerfil, { parcial = false, cerrar = true } = {}) {
    const { evaluacion } = await api('POST', '/competencia/evaluaciones/iniciar', {
      token,
      cuerpo: { idEvaluado: evaluado, idEvaluador: evaluador, idCompetencia: asignada.idCompetencia, idCompetenciaNivel: asignada.idCompetenciaNivel },
    });
    const items = evaluacion.itemsEvaluados.slice(0, parcial ? 1 : undefined);
    await api('PUT', `/competencia/evaluaciones/${evaluacion.idEvaluacionCompetencia}`, {
      token,
      cuerpo: {
        comentarioGeneral: parcial ? undefined : 'Evaluación de demostración.',
        items: items.map((it) => ({ idEvaluacionCompetenciaItem: it.idEvaluacionCompetenciaItem, calificacion: nota(codPerfil) })),
      },
    });
    contar.notas += items.length;
    if (cerrar && !parcial) {
      await api('PATCH', `/competencia/evaluaciones/${evaluacion.idEvaluacionCompetencia}/cerrar`, { token });
      contar.evaluacionesCerradas++;
    } else contar.evaluacionesEnProceso++;
    return evaluacion;
  }

  paso('Autoevaluaciones (≈70 % completas, algunas a medias)');
  for (const p of personas) {
    const r = azar();
    if (r > 0.85) continue; // no empezó
    const token = await tokenDe(p);
    const { empleado } = await api('GET', `/empleado/competencias/${p.emp.idEmpleado}`, { token });
    for (const [i, a] of empleado.competenciasAsignadas.entries()) {
      const aMedias = r > 0.7;
      if (aMedias && i > 1) break;
      await evaluar(token, p.emp.idEmpleado, p.emp.idEmpleado, a, p.cod, { parcial: aMedias && i === 1, cerrar: true });
    }
  }

  paso('Jefes evaluando a su equipo (competencias y objetivos)');
  const evaluadosCompletos = [];
  const jefesConEquipo = personas.filter((p) => p.rol === 'JEFE');
  for (const j of jefesConEquipo) {
    if (PRACTICA.has(j.cod)) continue;
    const token = await tokenDe(j);
    const { subordinados } = await api('GET', `/empleado/subordinados/competencias/${j.emp.idEmpleado}`, { token });
    for (const [k, s] of subordinados.entries()) {
      const id = s.subordinado.idEmpleado;
      const cod = s.subordinado.codigoEmpleado;
      // El último de cada equipo queda pendiente y el penúltimo a medias.
      const pendiente = k === subordinados.length - 1 && subordinados.length > 2;
      const aMedias = k === subordinados.length - 2 && subordinados.length > 3;
      if (pendiente) continue;
      for (const [i, a] of s.competenciasAsignadas.entries()) {
        if (aMedias && i > 1) break;
        await evaluar(token, id, j.emp.idEmpleado, a, cod, { parcial: aMedias && i === 1 });
      }
      const ficha = fichaDe[id];
      if (ficha && !aMedias) {
        await api('PATCH', `/objetivo/${ficha.idObjetivo}/evaluar`, {
          token,
          cuerpo: {
            detalles: ficha.objetivoDetalles.map((d) => {
              const f = perfil[cod] * 0.55 + 0.55 + (azar() - 0.5) * 0.2; // ~80 % – 110 %
              const meta = Number(d.metaObjetivo);
              const logrado = d.tipoCalculo === 'DESCENDENTE' ? Math.max(0, Math.round(meta * (2 - f) * 10) / 10) : Math.round(meta * f * 10) / 10;
              return { idObjetivoDetalle: d.idObjetivoDetalle, metaAlcanzada: logrado, ...(d.tipoCalculo === 'MANUAL' ? { porcentajeLogrado: Math.round(f * 100) } : {}) };
            }),
          },
        });
        contar.metasCalificadas += ficha.objetivoDetalles.length;
      }
      if (!aMedias) evaluadosCompletos.push({ jefe: j, id, cod, token });
    }
  }

  paso('Evaluación al jefe (180°): la mitad de los colaboradores');
  for (const p of personas.filter((x) => x.jefe)) {
    if (azar() > 0.5) continue;
    const token = await tokenDe(p);
    const { jefeConCompetencias } = await api('GET', `/empleado/jefe/competencias/by-user/${p.emp.idUsuario}`, { token });
    for (const a of jefeConCompetencias.competenciasAsignadas)
      await evaluar(token, jefeConCompetencias.jefe.idEmpleado, p.emp.idEmpleado, a, jefeConCompetencias.jefe.codigoEmpleado);
  }

  paso('Evidencias');
  for (const e of evaluadosCompletos.slice(0, 12)) {
    const ficha = fichaDe[e.id];
    if (!ficha) continue;
    const det = ficha.objetivoDetalles[0];
    await api('POST', '/evidencias', {
      token: e.token,
      formulario: archivo({ idEmpleado: e.id, idObjetivoDetalle: det.idObjetivoDetalle }, `evidencia-${e.cod}.pdf`, `Evidencia de la meta: ${det.descripcion}`),
    });
    contar.evidencias++;
  }
  for (const p of personas.filter((x) => x.rol === 'EMPLEADO').slice(0, 6)) {
    const token = await tokenDe(p);
    const det = fichaDe[p.emp.idEmpleado]?.objetivoDetalles?.[1];
    if (!det) continue;
    await api('POST', '/evidencias', {
      token,
      formulario: archivo({ idEmpleado: p.emp.idEmpleado, idObjetivoDetalle: det.idObjetivoDetalle }, `informe-${p.cod}.pdf`, `Informe de avance: ${det.descripcion}`),
    });
    contar.evidencias++;
  }

  paso('Retroalimentación, conformidad y plan de acción');
  for (const [i, e] of evaluadosCompletos.slice(0, 10).entries()) {
    await api('PUT', '/retroalimentacion/sesion', {
      token: e.token,
      cuerpo: {
        idEmpleado: e.id,
        fechaSesion: diasAtras(3 + i),
        fortalezas: 'Cumple sus compromisos con calidad y mantiene buena relación con el equipo.',
        oportunidades: 'Mejorar la planificación de tareas para reducir los reprocesos.',
        compromisos: 'Revisar el avance cada dos semanas con el jefe y completar el curso de gestión del tiempo.',
      },
    });
    contar.sesiones++;
    const ficha = fichaDe[e.id];
    if (ficha && i < 5)
      await api('PATCH', '/retroalimentacion-detalle/many', {
        token: e.token,
        cuerpo: {
          idObjetivo: ficha.idObjetivo,
          detalles: [
            { descripcionObjetivo: 'Mejorar la planificación del trabajo', descripcionActividad: 'Curso de gestión del tiempo', descripcionFecha: `Marzo ${anio + 1}`, descripcionEstado: 'Pendiente' },
            { descripcionObjetivo: 'Fortalecer la comunicación con clientes', descripcionActividad: 'Acompañamiento en reuniones con clientes', descripcionFecha: `Abril ${anio + 1}`, descripcionEstado: 'Pendiente' },
          ],
        },
      });
    const trabajador = personas.find((p) => p.cod === e.cod);
    if (i < 6) {
      const token = await tokenDe(trabajador);
      await api('PUT', '/retroalimentacion/mia/conformidad', {
        token,
        cuerpo: i === 5 ? { conforme: false, comentario: 'Considero que la nota de objetivos no refleja el trabajo del segundo semestre.' } : { conforme: true },
      });
    }
  }

  paso('Calibración');
  for (const e of evaluadosCompletos.slice(2, 4))
    await api('PUT', '/calibracion/ajustes', {
      token: T,
      cuerpo: { idEmpresaEmpleadora: ID, idEmpleado: e.id, competencias: 80, motivo: 'Ajuste acordado en el comité de calibración (demostración).' },
    });

  paso('Hitos del proceso (lista FONAFE)');
  await api('POST', `/registros-proceso/lista?idEmpresaEmpleadora=${ID}`, { token: T, cuerpo: { idCampanaEvaluacion: ID_CAMPANA, origen: 'FONAFE' } });
  const { hitos } = await api('GET', `/registros-proceso?idEmpresaEmpleadora=${ID}&idCampanaEvaluacion=${ID_CAMPANA}`, { token: T });
  for (const h of hitos.slice(0, 4))
    await api('POST', `/registros-proceso/hitos/${h.idHitoCampana}/archivos?idEmpresaEmpleadora=${ID}`, {
      token: T,
      formulario: archivo({}, `hito-${h.idHitoCampana}.pdf`, h.nombre),
    });

  // ------------------------------------------------------ accesos en Excel
  paso('Excel de accesos');
  mkdirSync(SALIDA, { recursive: true });
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Accesos');
  hoja.columns = [
    { header: 'Código', key: 'cod', width: 10 },
    { header: 'Nombre', key: 'nombre', width: 34 },
    { header: 'Rol', key: 'rol', width: 10 },
    { header: 'Puesto', key: 'puesto', width: 36 },
    { header: 'Jefe', key: 'jefe', width: 10 },
    { header: 'Usuario', key: 'usuario', width: 14 },
    { header: 'Contraseña', key: 'clave', width: 18 },
    { header: 'Nota', key: 'nota', width: 46 },
  ];
  hoja.getRow(1).font = { bold: true };
  hoja.getRow(1).alignment = { vertical: 'middle' };
  hoja.addRow({ cod: '—', nombre: 'Recursos Humanos TeamWork (demo)', rol: 'RR. HH.', usuario: 'rrhh.demo', clave: claveRrhh, nota: 'Administrador de la empresa' });
  for (const p of personas)
    hoja.addRow({
      cod: p.cod,
      nombre: `${p.dto.nombres} ${p.dto.apellidos}`,
      rol: p.rol === 'JEFE' ? 'Jefe' : 'Empleado',
      puesto: p.puesto,
      jefe: p.jefe ?? '',
      usuario: p.acceso.usuario,
      clave: p.acceso.contrasena,
      nota: PRACTICA.has(p.cod) ? 'Jefe para practicar: su equipo está sin calificar' : '',
    });
  const ruta = join(SALIDA, 'accesos-demo-teamwork.xlsx');
  await libro.xlsx.writeFile(ruta);

  console.log('\n✔ Listo');
  console.log(`  Empresa: ${NOMBRE_EMPRESA} (id ${ID}), campaña ${ID_CAMPANA}`);
  console.log(`  Evaluaciones cerradas ${contar.evaluacionesCerradas}, en proceso ${contar.evaluacionesEnProceso}, notas ${contar.notas}`);
  console.log(`  Metas calificadas ${contar.metasCalificadas}, evidencias ${contar.evidencias}, sesiones de retroalimentación ${contar.sesiones}`);
  console.log(`  Accesos: ${ruta}`);
}

main().catch((e) => {
  console.error(`\n✘ ${e.message}`);
  process.exit(1);
});
