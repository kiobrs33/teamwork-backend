# TeamWork — Backend

API REST del sistema de **evaluación de desempeño 90°/180°**.
NestJS 11 · Prisma 6 · PostgreSQL · Passport-JWT · Swagger · Cloudinary ·
ExcelJS · Puppeteer + Handlebars. 99 rutas en 14 controladores.

**Trabaja en conjunto con dos repos hermanos** (carpetas vecinas, repos git
independientes): `teamwork-fronted/` (SPA React que consume esta API) y
`teamwork-docker/` (Postgres de desarrollo, hoy desconectado — ver §4).

---

## 1. Comandos

```bash
npm run start:dev          # NODE_ENV=development · http://localhost:4055
npm run build              # nest build
npm run start:prod         # node dist/src/main
npm run seed               # ⚠️ leer §4.2 antes de ejecutarlo
npm test                   # ⚠️ roto hoy, ver §4.5

npx prisma migrate dev
npx prisma studio
npx prisma generate
```

Swagger en `http://localhost:4055/api` (con `persistAuthorization`, guarda el JWT).
**En producción no se publica** salvo con `SWAGGER=true`: enseña el mapa
completo de la API.

Node: `.nvmrc` pide **22.23.2**, el Dockerfile usa **22.13.0**. No rompe nada hoy,
pero conviene saberlo.

**Dockerfile** (imagen de Easypanel): corre como el usuario `node` (no root),
`npm ci` sobre el lock, `PUPPETEER_SKIP_DOWNLOAD` (los PDF usan el Chromium
del sistema), `CMD node dist/src/main` con `NODE_ENV=production` en la imagen
y `HEALTHCHECK` contra `GET /`. Conserva las dependencias de desarrollo a
propósito: el CLI de Prisma (`npx prisma migrate deploy` desde la consola del
servicio) es una de ellas. La app no escribe en disco; si algún día lo hace,
tiene que ser en una carpeta del usuario `node`.

---

## 2. Arquitectura

### Forma de los módulos — `src/<recurso>/`

Todos repiten la misma estructura: `<r>.module.ts`, `<r>.controller.ts`,
`<r>.service.ts`, `dto/`, `entities/`. Al agregar un recurso, seguirla.

Módulos: `auth`, `empleado`, `empresa-empleadora`, `plataforma`, `area-empleadora`,
`gerencia-empleadora`, `puesto-empleadora`, `unidad-ocupacional-empleadora`,
`competencia`, `objetivo`, `retroalimentacion-detalle`, `evidencia`, `reporte`,
`empleo`, `plantilla`, `calibracion`, `retroalimentacion`,
`registro-proceso`.

### Convenciones que hay que respetar

- **Imports absolutos** `src/...` (habilitado por `baseUrl: "./"` en tsconfig).
- **Las reglas de cálculo de la evaluación viven en
  `src/common/resultados/resultados-evaluacion.ts`, y solo ahí.** Son funciones
  puras (sin DI, para que las importen módulos distintos sin dependencias
  circulares) y cubren las cuatro decisiones que hacían que cada salida diera
  un número distinto:
  - `filtroEvaluacionesDeCampana(idCampana)` (en `campana.ts`) — qué evaluaciones cuentan: las de la
    campaña de la empresa y **nada `ANULADA`**.
  - `notaDeEvaluacion` / `resultadoDeObjetivo` — devuelven **`null`, no 0**,
    cuando no hay nada calificado, para que lo pendiente no entre al promedio.
  - `origenDeEvaluacion` — auto / jefe / subordinado, comparando por
    `codigoEmpleadoJefe` (es texto, no una relación).
  - `calcularResultados` — la fórmula y el redondeo. Calcula con toda la
    precisión y **redondea solo a la salida, a 2 decimales**.

  Los consumen el Excel de resultados por empresa
  (`CompetenciaService.calcularResultadosEmpleadoDesdeAgrupado`, que ya solo es
  una puerta de entrada), el PDF individual (`ReporteService`) y el progreso
  de `EmpleadoService`. Las dos `$queryRaw` de `EmpleadoService.conAgregados`
  repiten el mismo criterio en SQL porque agregan en la base: si la regla
  cambia, hay que tocarlas a mano.

  **El PDF individual se había quedado fuera de todo esto** y para el mismo
  trabajador daba 75 en competencias donde el Excel daba 100: no descartaba las
  anuladas ni acotaba por campaña, usaba otros valores por defecto para los
  pesos y promediaba los objetivos mezclando los detalles de todos ellos en vez
  de por objetivo. Cualquier salida nueva que enseñe un resultado tiene que
  pasar por este módulo.
- **El Excel de resultados por empresa arma su lista de empleados con las
  evaluaciones Y con los objetivos.** Recorriendo solo evaluaciones, quien
  tenía objetivos calificados pero ninguna evaluación vigente se caía del
  reporte entero sin dejar rastro. Y donde no hay nada evaluado deja la **celda
  vacía, no un 0**: en una hoja de cálculo el vacío es "sin dato", el 0 es un
  cero, y escribirlo falseaba cualquier promedio hecho sobre la columna. Es el
  equivalente del "Sin evaluar" del PDF.
- **El PDF no puede depender de que cargue una imagen externa.**
  `PdfRendererService` esperaba `networkidle0`, que espera también a las
  imágenes: con el `urlLogo` de la empresa apuntando a un host que no responde
  —pasó con el `loremflickr` de los datos de prueba— Puppeteer agotaba sus 30 s
  y el informe respondía un 500. Ahora espera `domcontentloaded` (los
  `<script>` del CDN sí lo bloquean, así que Chart.js ya está), luego a que los
  canvas estén pintados y aparte, con poco margen, a las imágenes: sin logo es
  mejor que sin informe. Y el `browser.close()` va en un `finally`, porque cada
  informe fallido dejaba un Chromium vivo.
- **Los ejes de los gráficos se calculan desde los datos.** Estaban fijos —120 %
  en objetivos, 100 en competencias— así que un objetivo al 166 % y otro al
  200 % salían como la misma barra llena y sin etiqueta, contradiciendo a la
  tabla de encima. El de objetivos deja además un escalón de holgura, porque su
  barra lleva el porcentaje escrito en la punta.
- **El PDF individual explica de dónde sale la nota** (`comoSeCalcula`, una
  frase según modelo, jefe y gente a cargo) y la tabla de competencias es
  **una sola** con lo que puso cada uno (autoevaluación, jefe y, en 180°,
  subordinados; «—» = no calificó). El radar lleva los nombres de las
  competencias y no dibuja una mirada sin notas. Chart.js y su plugin van
  con **versión fija** en la plantilla, y el anillo con `animation: false`
  (sin eso el PDF salía a mitad de la animación).
- **El gráfico de competencias es un radar, siempre.** Con menos de tres
  competencias un radar es geométricamente un punto o una raya, y se probó a
  cambiarlo por barras en ese caso; **no hacerlo**, es una decisión tomada: el
  informe enseña un radar.
- **Los tres papeles del modelo, y quién puntúa.** `origenDeEvaluacion`
  clasifica cada nota en `auto` / `jefe` / `subordinado` / `otro`:
  - **90°**: la nota es la del líder inmediato, al **100 %**.
  - **180°**: líder **70 %** + subordinados **30 %**; si el evaluado no tiene
    gente a cargo no hay quien lo evalúe desde abajo y cae a solo el líder.
    **Y si no tiene jefe (la cabeza de la empresa), cae a solo los
    subordinados, al 100 %** (decisión de noviembre de 2026; antes su parte
    del jefe contaba 0 y un gerente general no pasaba de 30). Lo decide
    `evaluadoSinJefe` (en curso: estructura de hoy; cerrada: la foto
    `codigoJefeEvaluado` de sus evaluaciones) y viaja como
    `ConfiguracionEmpresa.evaluadoSinJefe`, por evaluado: el PDF y
    `construirResultadosEmpresa` (Excel, calibración, retroalimentación,
    estadísticas) lo ponen antes de calcular. En 90° sin jefe no cambia nada:
    se resuelve en Calibración. En **Avance** (`avance`) esa persona va con
    `calificanSubordinados`: cuenta como «Completo» en lo del jefe y sus
    competencias no suman a lo pendiente de ningún jefe.
  - **La autoevaluación existe en los dos modelos y NUNCA puntúa.** Es el
    contraste con la nota del líder: si se separan más de `BRECHA_REVISION`
    puntos, el informe marca la fila y la lista aparte. Tampoco decide si una
    competencia está evaluada — antes sí, y como el trabajador se autoevalúa
    normalmente antes que su jefe, esa competencia se daba por evaluada y su 0
    se leía como "el jefe le puso 0".
  - **`otro`** (ni el evaluado, ni su jefe, ni alguien a su cargo) **se
    descarta**. Antes todo lo que no fuera auto ni jefe caía en el cajón de
    subordinados y se llevaba su 30 % de la nota sin serlo; ahora se comprueba
    el vínculo con `codigoEmpleadoJefe` del evaluador.
  - Los objetivos los califica solo el jefe: no hay autoevaluación de
    objetivos.
  - `iniciarEvaluacion` **no abre evaluaciones que no cuentan**: rechaza el
    origen `OTRO` (compañeros o sin vínculo; también desde administración) y
    `SUBORDINADO` si la campaña no es 180°. Las 42 `OTRO` que hay en datos
    son de antes de esta regla. `impactoCierre` lista en 180° las
    competencias con nota de subordinados y sin la del jefe (`sinNotaDelJefe`):
    al cerrar, la parte del jefe cuenta 0.
  - El informe clasifica **tres** notas con las bandas de la guía FONAFE
    (≥105 / 95 / 75 / 50): competencias (`clasificarDesempeno`, con
    Sobresaliente en 100 para LIKERT), objetivos (`clasificarObjetivos`) y
    resultado final (`clasificarResultadoFinal`). La columna "Desempeño" del
    historial es la del **resultado final**, no la de competencias.
  - Nota de una ficha de objetivos (`resultadoDeObjetivo`): Σ cumplimiento ×
    peso ÷ Σ pesos **de las metas calificadas**. Normaliza a propósito: hay
    fichas antiguas cuyos pesos no suman 100. La página de evaluar del jefe usa la misma
    regla; dividir entre 100 le daba otra nota que el reporte.
  - **Metas DESCENDENTES: fórmula lineal** `(2 − logrado ÷ meta) × 100`,
    mínimo 0 (meta 0: 100 si logró 0, si no 0). Decisión deliberada: con
    `meta ÷ logrado` el 0 valía 100 % (menos que lograr 1 = 400 %) y cerca
    de cero se disparaba e inflaba la nota final. Es el espejo de la
    ascendente (que sigue sin tope, también a propósito). La página del jefe
    (`cumplimiento` en el front, `evaluation/utils/cumplimientoObjetivo.ts`) repite la fórmula: cambiar una
    es cambiar las dos. La migración `20261122150000_objetivos_descendente_lineal`
    recalculó lo ya calificado solo en campañas EN_CURSO; las cerradas
    conservan su cálculo.
  - Unidades de medida de una meta: `UNIDADES_MEDIDA` (se guardan en
    mayúsculas y sin tildes: "Días" → `DIAS`). El front las toma de
    `modules/objective/unidades.ts`; agregar una es tocar los dos.
  - El radar del informe enseña las tres miradas por separado (líder,
    autoevaluación y, solo en 180°, subordinados), no el resultado ya
    mezclado: pintando la combinación no se veía el contraste, que es para lo
    que sirve.
- **`tipoCalificacionCompetencia` solo cambia el control con el que se
  califica, pero tiene dos consecuencias que no se ven.** `LIKERT` pinta cinco
  pasos fijos (0, 25, 50, 75, 100) y `MANUAL` una entrada libre de 0 a 110.
  El cálculo es el mismo en los dos casos: el promedio de las calificaciones.
  - **Con LIKERT el techo es 100**, así que el "superávit" del informe nunca
    puede ser positivo (el esperado por defecto también es 100). Por eso
    `clasificarDesempeno(resultado, escala)` pone **"Sobresaliente" en 100
    con LIKERT** (todos los comportamientos en el paso más alto) y en 105 con
    MANUAL; con 105 fijo era inalcanzable (decisión de noviembre de 2026).
    La tabla de bandas (`CompetencyEvaluationScale`) solo se enseña en MANUAL.
  - **Cambiar la escala a mitad de campaña no toca las notas ya puestas.** De
    MANUAL a LIKERT quedan valores que no caen en ningún paso (un 37, un 110):
    el `Radio.Group` no los reconoce y el ítem sale en blanco, como si nadie lo
    hubiera calificado. El panel avisa con el valor anterior para que se vuelva
    a elegir.
  - **La escala se valida en el servidor** (`calificacionValida`, en el módulo
    de resultados). No se validaba: el DTO tenía `Min` y `Max` importados y sin
    usar, así que por la API entraban un 9999 o un -500 y se guardaban tal
    cual, arrastrando el promedio de la competencia entera.
- **El reparto jefe/subordinado solo existe en 180°.** En 90° evalúa solo el
  jefe y `calcularResultados` usa su nota tal cual, al 100 %: esos dos
  porcentajes se ignoran. El formulario de empresa los oculta en 90°, la
  validación de la suma a 100 solo corre en 180°, y el Excel de resultados
  titula la columna "Evaluacion Jefe 100 %" — antes imprimía el 60 % guardado
  en una empresa donde valía el 100, que es una cifra falsa en un reporte.
- **Toda la configuración de la empresa se aplica en caliente y hacia atrás.**
  No se guarda ningún resultado: el PDF y los Excel se recalculan en cada
  petición con la configuración **vigente en ese momento**. Cambiar la
  ponderación a mitad de campaña reescribe evaluaciones ya emitidas sin tocar
  una sola nota (comprobado: un trabajador pasó de 42.83 a 80.83 solo moviendo
  80/20 a 50/50). Lo mismo el modelo: pasar de 90° a 180° habilita "Evaluación
  al Jefe" y, en cuanto un subordinado califica, la nota del jefe se recalcula
  para toda la campaña como `jefe×% + subordinados×%`; al revés, las notas de
  subordinados ya puestas dejan de contar en silencio. **Nada de esto avisa ni
  queda registrado.** Esto vale para la campaña **vigente**: al cerrarla (ver
  "Campañas" en el modelo de datos) su configuración queda congelada en
  `CampanaEvaluacion`, y desde entonces sus resultados ya no se mueven.
- **Las ventanas de vigencia las valida el servidor** (noviembre de 2026;
  antes solo el front). `AlcanceService.verificarVigencia(alcance, tipo)`:
  jefes y empleados solo **califican** (competencias: actualizar y cerrar;
  objetivos: evaluar) dentro de `fechaVigenciaInicio/Fin` de la campaña en
  curso, y el jefe solo **crea, edita o elimina objetivos** dentro de
  `fechaVigenciaInicioObjetivo/FinObjetivo` (sin esas fechas, sin límite).
  403 con el periodo en el mensaje. Los administradores quedan fuera
  (corrigen datos). Se compara **por día en hora de Lima con los extremos
  incluidos**: las fechas se guardan a medianoche UTC y comparadas con la
  hora el último día se cerraba a las 7 p. m. del anterior (el front tenía
  ese error; ahora usa `utils/vigencia.ts`).
- **Las competencias de un trabajador salen de su unidad ocupacional**
  (`UnidadOcupacionalCompetenciaNivel`), **no de que alguien haya abierto su
  panel de evaluación.** El informe las recorría desde `evaluacion_competencia`
  —que se crea de una en una, cuando el evaluador expande ese panel— así que
  una asignada y sin evaluar no existía: ni fila en la tabla ni esquina en el
  radar. Una trabajadora con dos asignadas y una evaluada dibujaba un radar de
  una sola punta y sacaba 100 en vez de 50.
- **Una competencia asignada y sin evaluar vale 0 y ese 0 cuenta**
  (`resultadoDeCompetenciasAsignadas`, en el módulo compartido), pero **el
  informe dice por qué es 0**: la fila lleva "Sin evaluar · cuenta como 0" y el
  Excel una columna de observación. Un 0 que nadie puso no significa lo mismo
  que un 0 que puso el jefe. **En la base de datos no hay nota**: el 0 es solo
  de cara al cálculo y a la lectura, no se persiste.
- **La autoevaluación NO puntúa, en ningún modelo.** Es el dato de cómo se
  percibe el trabajador, y está para detectar discrepancias: si él se pone 100
  y su jefe 20, la empresa habla con el jefe antes de cerrar la evaluación. El
  informe marca esas filas y las lista aparte ("A REVISAR CON EL EVALUADOR");
  el umbral es `BRECHA_REVISION` (30 puntos) en el módulo compartido.
- **Un informe de alguien sin evaluar dice "Sin evaluar", no 0.**
  `calcularResultados` devuelve `competenciasSinEvaluar`, `objetivosSinEvaluar`
  y `sinEvaluar`; la plantilla recibe las cifras dos veces, `resultados` en
  número para los gráficos y `resultadosTexto` ya formateado para las tablas.
  Sin esto el PDF de quien todavía no tenía ninguna evaluación salía con 0% y
  la leyenda "Necesita Mejora · Nunca evidencia los comportamientos". Cuando
  `sinEvaluar` es cierto la plantilla no monta los `<canvas>` **ni el `<script>`
  de Chart.js**, que reventaría con un `getElementById` nulo.
- **`progresoEvaluacion: { totalItems, itemsEvaluados, completo }`** lo calcula
  el helper privado `EmpleadoService.calcularProgresoCompetencias(idEvaluado,
  idEvaluador, competencias)` y lo devuelven tres endpoints, **por competencia
  y en total**: `/empleado/subordinados/competencias/:id` (el jefe evalúa a cada
  subordinado), `/empleado/competencias/:id` (autoevaluación: evaluado ===
  evaluador) y `/empleado/jefe/competencias/by-user/:idUsuario` (el subordinado
  evalúa a su jefe). El front lo pinta con `ProgresoEvaluacionTag`, en la
  columna de las tablas y en la cabecera de cada competencia; si se quita, esas
  vistas pierden el indicador. El de subordinados trae además, por
  trabajador, `puestoEmpleadora`, `progresoAutoevaluacion` (el mismo conteo
  con él como evaluador) y `evidencias` (las de competencias en la campaña
  en curso), para la tabla «Competencias del equipo». Cuenta solo ítems del nivel asignado hoy y usa
  `filtroEvaluacionesDeCampana`, así que ignora las `ANULADA` y las de campañas
  anteriores — este último recorte le faltaba y no cuadraba con la columna del
  listado, que sí acotaba por periodo.
- **Los detalles de objetivo se leen siempre `orderBy: { secuencial: 'asc' }`**
  (todas las consultas): sin orden, tras un `update` la base los devolvía en
  otro y el formulario quitaba el objetivo equivocado.
- **`impactoCierre`**: `sinNotaDelJefe` omite a quien no tiene jefe (en
  180° lo califican sus subordinados) y a los ya calibrados;
  `detallesObjetivoSinCalificar` cuenta solo trabajadores activos.
- **`GET /empleado/avance/mio` (JEFE y EMPLEADO)**: el resumen del
  trabajador en la campaña en curso, **sin notas**: autoevaluación, evaluar a
  su jefe (180°), objetivos con evidencia, cuánto calificó su jefe (solo
  cuántos), si ya hay sesión de retroalimentación y el nombre del jefe
  (también sin campaña; lo usa «Mi perfil»).
- **`GET /empleado/avance/mi-equipo` (solo JEFE) es `avance` con `whereFijo`**:
  su equipo directo (`codigoEmpleadoJefe` = su código, misma empresa,
  activos) sin pasar por los filtros del listado, para que no pueda ampliarlo
  por la URL; suma su autoevaluación (`conAgregados` de sí mismo) y la
  campaña en curso. Es el Panel del jefe en el front.
- **`GET /empleado/:id/estado-evaluacion` explica el avance, no lo resume.**
  La columna del listado dice "Jefe: 2/5", que es cuánto falta pero no QUÉ
  falta. Este endpoint devuelve competencia por competencia con los enunciados
  concretos sin calificar, separando jefe y autoevaluación, y aparte las
  **anuladas** con cuántas notas se perdieron con cada una: son las que
  explican un avance que retrocede sin que nadie haya tocado una calificación.
  Usa el mismo criterio que el resto (`filtroEvaluacionesDeCampana`, y completa
  = todos los ítems con nota). Lo consume la vista «Qué le falta» de Avance
  (front, `avance/trabajador/:idEmpleado`).
- **`GET /empleado/:id/impacto-grupo?idUnidad=` (no escribe)**: qué cambia
  en la campaña en curso si el trabajador pasa a otro grupo ocupacional:
  competencias que deja (`conNotas`: sus notas dejan de contar, porque en
  una campaña abierta lo asignado se lee del grupo actual), nuevas (cuentan
  0) y con otro nivel (`iniciarEvaluacion` anula la evaluación al abrirla).
  Sin campaña en curso devuelve `campana: null`. El formulario del
  trabajador confirma con esto antes de guardar.
- **El avance del listado se mide contra los ítems que la UNIDAD asigna, y con
  el numerador partido en jefe y autoevaluación** (`conAgregados`, consulta
  cruda). Contando ítems de las evaluaciones existentes, añadir una competencia
  a la unidad no movía la barra —nadie había abierto su panel, así que para el
  contador no existía— y el trabajador seguía marcando "completo" con tres
  competencias nuevas sin tocar. Y sumando la autoevaluación al mismo
  contador, quien se autoevaluaba inflaba su propio avance: 6/6 eran 3 ítems
  del jefe y 3 suyos sobre 9 asignados.
- **Cambiar el nivel de una competencia en la unidad, o quitarla, anula las
  evaluaciones abiertas de sus ocupantes** (`asignarCompetenciasInterno`), y
  con ellas las notas ya puestas. Eso se hacía en silencio: ahora
  `POST /unidad-ocupacional-empleadora/asignar/impacto` dice de antemano qué
  competencias caerían, a cuántos trabajadores y cuántas calificaciones se
  perderían, y la pantalla pide confirmación **solo si hay notas en juego** —
  anular una evaluación vacía no cuesta nada. El endpoint no escribe; va antes
  de `asignar`, no en su lugar.
  **Ojo:** volver a asignar la misma competencia al mismo nivel NO recupera la
  evaluación anulada; se crea una nueva vacía.
  `asignar` y `asignar/impacto` pasan por `validarAsignacion`: cada
  competencia una vez por grupo, de la misma empresa que el grupo y vigente,
  con un nivel suyo y vigente (400 con la lista). El mapa
  (`…/empresa/:id/unidades-competencias`) viene ordenado (grupos por nombre,
  competencias por código, niveles) y trae `trabajadores` por grupo.
  **`POST …/asignar/impacto/pdf`** (no escribe) arma con
  `detalleImpactoAsignacion` y la plantilla `reporte/templates/
  impacto-asignacion.hbs` una **lista de aviso**: una fila por persona
  (nombre, código, documento, usuario, área y puesto) con **qué debe
  calificar** en frases ("Autoevaluarse en X (nivel 4)", "Calificar a Ana
  en X (nivel 4)") y una casilla "Avisado". Entra quien calificaba una
  evaluación que **cambia de nivel** y, por cada **competencia nueva**, cada
  trabajador del grupo (autoevaluación) y su jefe. Lo que **se quita** no
  genera avisos (deja de evaluarse) y va como información.
  Usa `PdfRendererService` (provisto también en el módulo de unidades). Los
  plurales van resueltos en el servicio: la plantilla solo tiene `#each` e
  `#if`. Guardar la asignación se registra en la bitácora como
  **`ASIGNAR`** ("Cambió las competencias asignadas al grupo ocupacional
  «X»"); antes caía en la regla general de POST y decía "Creó".
- **Editar una competencia también avisa antes** (`POST
  /competencia/:id/impacto-edicion`, no escribe): empareja los
  comportamientos como `update` y cuenta, por nivel, evaluaciones en curso,
  las completas que volverían a quedar pendientes (comportamiento nuevo) y
  las calificaciones que dejarían de contar (comportamiento quitado), además
  de los niveles que no se pueden quitar por estar asignados. El formulario
  confirma solo si alguien pierde algo. **La bitácora ignora las rutas
  `…/impacto`, `…/impacto/pdf` y `…/impacto-edicion`**: son POST porque llevan cuerpo, pero
  solo consultan.
- **Envoltorio de respuesta**: los controladores devuelven `{ message, data }` y
  `ResponseInterceptor` lo convierte en `{ success, message, data }`. El front
  siempre lee `response.data.data`, así que **no romper esa forma**.
- **`PurgeResponseInterceptor`** borra `estado`, `creadoPorId`,
  `actualizadoPorId`, `fechaCreacion`, `fechaModificacion` y `password` de *toda*
  respuesta JSON, de forma recursiva.
- **`AllExceptionsFilter`** responde
  `{ success:false, statusCode, message, errors, path, timestamp }`;
  `errors` trae el array de mensajes de class-validator.
- **`ValidationPipe`** global con `whitelist: true` — una propiedad que no esté
  declarada en el DTO se descarta en silencio. Si un campo "no llega", empezar por ahí.
- **Soft delete** en todas las entidades: `estado: boolean`, nunca `DELETE` real.
- **Auditoría** `creadoPorId` / `actualizadoPorId` vía el decorador `@User()`
  (`src/auth/auth.decorator.ts`). Ese decorador **solo** alimenta auditoría;
  no decide accesos: eso lo hace `RolesGuard` con `@AlcanceActual()` (ver
  "Roles y aislamiento por empresa").
- Los endpoints de descarga (Excel, PDF) usan `@Res()` + `res.send/end(buffer)`,
  lo que los saca del `ResponseInterceptor`. **Ojo: cuando fallan sí pasan por
  `AllExceptionsFilter` y responden JSON**, así que el cliente tiene que mirar
  el `Content-Type` antes de guardar el archivo.
- **El Excel de una campaña** (`GET /competencia/reportes/empresa/:id/
  campana/export-excel`, `exportarCampanaExcel`): un libro con Resumen,
  Avance (solo si es la en curso: `EmpleadoService.avance`, por eso
  `CompetenciaModule` importa `EmpleadoModule`), Resultados, Competencias
  y Objetivos. Las tres últimas son las de los reportes sueltos: sus
  constructores reciben el libro compartido (`libro?`). Acepta además
  `codigoJefe` (equipo directo de un jefe), que también filtran los
  reportes sueltos. Es lo que exporta el front; los tres sueltos siguen
  como rutas.
- **Los tres reportes Excel por empresa aceptan filtros opcionales**
  (`ExportEmpresaQueryDto`): `idGerenciaEmpleadora`, `idAreaEmpleadora`,
  `idUnidadOcupacionalEmpleadora`, `idPuestoEmpleadora` y `search`. Todos
  recortan por el empleado evaluado mediante
  `CompetenciaService.filtroEmpleadoExport()`, que es lo único que los tres
  reportes tienen en común. Sin filtros el reporte sale completo, como antes.
  Los dos de competencias aceptan además `periodoEvaluacion` y, si no llega,
  usan el periodo vigente de la empresa; los dos descartan las evaluaciones
  `ANULADA`, igual que el indicador de avance.
  `GET /competencia/evaluaciones/empresa/:id/periodos` lista las campañas con
  evaluaciones (más la vigente) para el selector del front.
- **Calibración** (`calibracion`, guía FONAFE p. 32): con la campaña en
  curso, RR. HH. (Edición) o TeamWork ajusta el resultado de **competencias
  y/o objetivos** de un trabajador con **motivo obligatorio**
  (`AjusteCalibracion`, uno por trabajador y campaña; guarda los originales).
  El final se recalcula con los pesos de la campaña. **El ajuste se aplica
  solo con `aplicarCalibracion`** (common/resultados), que usan el PDF, el
  historial y el Excel de resultados (anota "Calibrado: motivo"); la pantalla
  toma sus cifras de `CompetenciaService.resultadosDeEmpresa`, el mismo
  cálculo del Excel. Rutas: `GET /calibracion`, `PUT /calibracion/ajustes`,
  `DELETE /calibracion/ajustes/:idEmpleado`, `GET /calibracion/acta/pdf`
  (plantilla `acta-calibracion.hbs`, integrantes en `comite=a|b`, cada
  uno «Nombre · cargo»; el servicio los separa). Es el único PDF con pie
  «Página N de M»: `PdfRendererService.render` acepta `{ piePagina }` y,
  sin él, los demás informes salen como siempre.
- **Retroalimentación con conformidad** (`retroalimentacion`, FONAFE
  pp. 33–34): `SesionRetroalimentacion`, una por trabajador y campaña y **sin
  depender de la ficha de objetivos** (el plan por objetivo de
  `retroalimentacion-detalle` sigue aparte). El jefe la registra
  (`PUT /retroalimentacion/sesion`: fecha, fortalezas, oportunidades,
  compromisos; solo su equipo directo, con campaña en curso y resultado). El
  trabajador ve su resultado de la campaña en curso **solo desde la sesión**
  (`GET /retroalimentacion/mia`) y responde CONFORME / NO_CONFORME (este con
  comentario). Si el jefe cambia lo conversado, la respuesta vuelve a
  PENDIENTE. RR. HH.: `GET /retroalimentacion/empresa` (la clave es
  `situacion`, no `estado`: el PurgeResponseInterceptor borra `estado`).
  `impactoCierre` suma `sinRetroalimentacion` y `noConformes`.
  **El plan de acción** (`RetroalimentacionDetalle`, por ficha de
  objetivos) viaja en `GET /retroalimentacion/equipo` (`idObjetivo`, `plan`)
  y en `/mia` (`plan`). `GET /retroalimentacion/equipo/:idEmpleado/apoyo`
  (solo JEFE, su equipo directo) da cada competencia con su nota, lo
  esperado y la autoevaluación si hay brecha, y cada objetivo con su
  cumplimiento, desde `ReporteService.datosReporte` (por eso `ReporteModule`
  exporta el servicio): lo conversado cuadra con el PDF. El plan se guarda con `PATCH /retroalimentacion-detalle/many`,
  que valida cada acción (`ValidateNested`; objetivo de desarrollo
  obligatorio) y **rechaza ids que no sean de esa ficha** (antes se podía
  editar una acción ajena por id). El PDF llena «Comentarios finales» con la
  sesión y su respuesta; el plan agrega filas en blanco solo si está vacío
  (`hayPlan`: antes las agregaba siempre).
- **Evidencias**: por **meta** (`idObjetivoDetalle`, su ficha se deduce) o
  por **competencia** (`idEvaluacionCompetencia`; se agrupan por
  `idCompetencia`). Suben el jefe (su equipo y lo suyo) y **el propio
  trabajador**, que solo quita lo que subió él. **Solo con la campaña en
  curso** (subir y quitar). Tipos PDF, imagen, Word, Excel, PowerPoint y
  máximo 10 MB (`opcionesEvidencia`; el 413 de multer se traduce en
  AllExceptionsFilter). **Carpeta por módulo bajo una raíz por entorno**
  (`carpetaDe`, `CLOUDINARY_CARPETA_RAIZ`): en local
  `teamwork-local/{evidencias,empresas,registros-proceso}`; en producción la
  raíz va vacía y todo sigue en `evidencias`, `empresas`… Toda baja pasa por
  `borrarArchivo` (`src/config/cloudinary.ts`), que **no borra nada fuera de
  la raíz** (la cuenta de Cloudinary es la misma que la de producción y la
  base local es su copia) y prueba `image`/`raw`/`video`: antes se llamaba a
  `destroy` con `resource_type: 'auto'`, que Cloudinary no acepta, y los
  archivos nunca se borraban. Si Cloudinary rechaza el archivo (dañado),
  400 con el motivo, no 500. Sin Cloudinary en desarrollo, el archivo no se
  guarda y la evidencia queda con URL vacía.
  **Los PDF no se entregan por su URL pública**: la cuenta tiene apagado
  «Allow delivery of PDF and ZIP files» y responde 401 (como `image` y como
  `raw`). Por eso `PurgeResponseInterceptor` cambia todo `urlArchivo` de un
  PDF por un enlace firmado de 12 h (`enlaceDeEntrega`,
  `private_download_url`, se abre en el navegador); la base guarda la URL
  pública. Vale para evidencias, hitos y calibración. El Excel de
  evidencias lleva la URL pública: sus PDF no abren desde ahí. Si se activa
  el ajuste en Cloudinary, esto sobra.
  `GET /evidencias/empleado/:id` trae `idCompetencia`, `subidaPor` y
  `sePuedeQuitar`. `GET /objetivo/mios`: las metas del trabajador en la
  campaña en curso, **sin calificación**.
- **Hitos del proceso** (`registro-proceso`, FONAFE pp. 36–39):
  `HitoCampana` (etapa, nombre, registro esperado) y `RegistroHito`
  (archivos) **por campaña**. La lista la arma cada empresa:
  `POST /registros-proceso/lista` con `origen` FONAFE (14 sugeridos en
  `SUGERIDOS_FONAFE`, con dónde generarlos en TeamWork) o ANTERIOR (copia la
  de la última campaña con hitos), o hito a hito. Un hito se cumple con al
  menos un archivo. **No se bloquea al cerrar**: varios registros (reporte
  final, retroalimentación) se producen después. Archivos con
  `opcionesArchivo('registros-proceso')` (mismas reglas que evidencias).
  La empresa va en la query y se comprueba contra la campaña del hito.
- **Plantillas de importación: todas con el formato de la de trabajadores**
  (`common/excel/plantilla-importacion.ts`, `construirPlantilla`): hoja
  «Instrucciones» (pasos + tabla Columna/Obligatoria/Qué va/Ejemplo), hoja de
  datos con títulos `*` y línea gris, hojas de referencia y **listas
  desplegables** (lista fija, hoja de referencia, fecha, número) y, si la
  definición trae `ejemplos`, filas de ejemplo con formato normal (título
  «… (Ejemplo)», que el front y `POST /competencia/import` omiten). Varias
  hojas de datos con `otrasHojas`: **competencias usa dos, «Competencias»
  (código, título, definición) y «Comportamientos» (código, nivel,
  comportamiento), sin lista que las enlace (pedido explícito)**; el front
  comprueba que los códigos coincidan. La exportación del catálogo sale en
  las mismas dos hojas (+ «Asignaciones»). Trabajadores
  sigue en `GET /empleado/importacion/plantilla`; el resto en
  `GET /plantilla/:tipo?idEmpresaEmpleadora=` (`objetivos`, `competencias`,
  `gerencias`, `areas`, `grupos-ocupacionales`, `puestos`). Los lectores del
  front toman solo la primera línea del título e ignoran el `*`. Las
  exportaciones re-importables (trabajadores, objetivos, competencias) usan
  los mismos títulos que su plantilla.
- **Trabajadores repetidos: los mensajes hablan del documento, nunca del
  «código de usuario»** (es el documento y no está en la plantilla ni en el
  formulario; pedido explícito). `problemasDeDocumento` va **antes** que
  la unicidad del usuario y, si la persona ya está registrada, el usuario no
  se informa aparte («Esta persona ya está registrada: el DNI … es de …
  (código …)»; en la importación agrega «quite la fila»). Si el número solo
  choca con el usuario de otra cuenta, `mensajeUsuarioTomado` lo dice por el
  documento y nombra al dueño. `GET /empleado/importacion/registrados`
  (documento, código, nombre y situación de todos) alimenta la revisión del
  front.
- **Exportaciones de listados (`GET <recurso>/export/excel`)**: empleados,
  empresas, áreas, gerencias, puestos, unidades, competencias, objetivos y
  evidencias. Las nuevas se arman con `construirLibroExcel` / `enviarExcel`
  (`src/common/excel/libro-excel.ts`), que pone el **encabezado común**
  (`aplicarCabecera` en `estilo-excel.ts`: negrita, línea gris opcional
  `breve`, fondo gris y bordes; autofiltro y la fila **sin fijar**, a
  pedido), y
  `tipo: 'texto'` para documentos y códigos (como número pierden los ceros a
  la izquierda). **Usan el mismo filtro que su listado**, extraído a un
  método (`construirListado`, `construirWhere`), y van declaradas **antes de
  `@Get(':id')`**. Las de competencias, objetivos y trabajadores llevan **las
  columnas de su carga masiva con el mismo nombre**, para que el archivo
  sirva de base para volver a importar; competencias agrega la hoja
  "Asignaciones" (nivel por unidad) y objetivos la de "Retroalimentación".
  La de evidencias respeta el alcance por rol del listado.
  **Ninguna exportación de la empresa lleva columna «Empresa»** (competencias,
  trabajadores, objetivos y las cuatro de estructura) si se pidió con
  `idEmpresaEmpleadora` (pedido explícito: se exporta desde el espacio de la
  empresa y repetía el nombre en cada fila); solo aparece si el archivo
  mezcla empresas. Los títulos de ID van en minúscula («ID gerencia»).
- **Cargas masivas: los errores llevan su fila** (`[i] …`, índice del
  arreglo enviado) para que el front los devuelva a su fila del Excel. Las
  que usan `ParseArrayPipe` (estructura, competencias) llevan
  `stopAtFirstError: false`: sin eso Nest se detenía en el primer error y
  sin índice. `AllExceptionsFilter` limpia la ruta interna del mensaje pero
  **conserva el `[i]`**. Objetivos y trabajadores arman sus `[i]` a mano.
  Las metas de ejemplo («(Ejemplo)») se rechazan en objetivos con su motivo.
  **Textos de objetivos con el vocabulario de FONAFE**: cada fila es un
  «Objetivo», «Meta» es solo el número a alcanzar («Meta a alcanzar» en
  plantilla y exportación), «Logrado» y «Cumplimiento (%)» (también en el
  PDF y el Excel de campaña). Ver el CLAUDE.md del front.
  **Las cuatro de estructura filtran por `idEmpresaEmpleadora`** en su
  `exportExcel`: el controlador lo resolvía con `empresaDelListado` pero el
  `where` del servicio no lo usaba, así que el Excel traía todas las empresas,
  también a RR. HH. Traen la columna **Trabajadores** (no cesados).
- **Reglas comunes de la estructura** (`src/common/estructura/estructura.ts`,
  las usan los cuatro servicios): el nombre se guarda recortado y **no se
  repite en la empresa** (409; compara sin mayúsculas, tildes ni espacios);
  `@Matches(/\S/)` + 3–100 caracteres en el DTO. **No se elimina** un
  registro con trabajadores activos o suspendidos (409), **ni se cambia de
  empresa** uno con trabajadores, también cesados (400). La importación
  valida cada fila con `ParseArrayPipe` y **omite** existentes, repetidas y
  las que terminan en "(Ejemplo)" (filas de ejemplo de la plantilla)
  (`{ count, omitidas }`). Los listados devuelven `_count.empleados`. Los
  datos anteriores conservan duplicados activos (EGEMSA, SEAL).
- **"Grupo ocupacional" es el nombre visible de `UnidadOcupacionalEmpleadora`**
  (mensajes, Excel, bitácora). El modelo, las rutas y las columnas no
  cambiaron. La bitácora guardaba la entidad como "unidad ocupacional" y no
  se reescribe: el filtro `entidad=grupo ocupacional` busca los dos nombres.
- Los errores de Prisma pasan por `handlePrismaError()`
  (`src/prisma/helpers/prisma-error.handler.ts`).
- **Los listados pasan el query DTO entero al servicio.** `GET /empresa-empleadora`
  acepta `search`, un filtro por columna (`idEmpresaEmpleadora`, `nombreEmpresa`,
  `ruc`, `modeloEmpresa`, `direccionEmpresa`) y `sortBy`/`sortOrder` — este
  último limitado a `EMPRESA_SORT_FIELDS`. El controlador hacía
  `findAll({ page, limit, search })` y con eso los filtros del servicio nunca se
  aplicaban: la fila de filtros del front no hacía nada. `area-empleadora` ya
  tenía el arreglo; al tocar otro listado, comprobar lo mismo.
- **Los listados de estructura y de competencias aceptan `idEmpresaEmpleadora`**
  (áreas, gerencias, unidades, puestos, competencias), y `GET /objetivo`
  también, por la empresa del trabajador. Es el filtro del selector de empresa
  del front, que hace trabajar al administrador con una empresa a la vez. Es
  opcional para el superadmin; a los demás `empresaDelListado` les fuerza la
  suya (ver "Roles y aislamiento por empresa").
  `GET /empresa-empleadora?limit=0` devuelve `campanaEnCurso` y los avances
  igual que la rama paginada (antes la lista completa llegaba sin ellos).
- **Competencias: reglas de alta, edición e importación** (noviembre de
  2026). El DTO exige código (≤20), título (≤150) y descripción (≤2000) con
  texto, 1–10 niveles numerados de 1 a 10 sin repetir, y en cada nivel 1–50
  ítems no vacíos (≤1000). El servicio recorta los textos
  (`normalizarCompetencia`; el `ValidationPipe` no transforma) y **el código
  es único en la empresa** sin distinguir mayúsculas (409, `exigirCodigoLibre`;
  solo en el servicio, no hay índice). `GET /competencia/:id` devuelve **solo
  niveles e ítems vigentes**: devolvía también los retirados (15 por
  competencia en EGEMSA) y el formulario de edición los volvía a crear al
  guardar. `POST /competencia/import` valida cada competencia con
  `ParseArrayPipe` (antes una fila inválida daba 500), rechaza códigos
  repetidos en el archivo y **omite las que ya existen** (`{ count,
  omitidas }`), así el Excel de «Exportar» se puede volver a subir. `GET
  /competencia/:id/impacto-eliminacion` dice qué arrastra eliminarla
  (grupos, trabajadores, evaluaciones abiertas y notas); no escribe.
  `GET /competencia/estadisticas?idEmpresaEmpleadora=` (alcance como el
  listado) da por competencia, en la campaña en curso, `trabajadores`
  (activos y suspendidos de los grupos donde está asignada), `conNota`,
  `promedio` y `nivel`: la nota es la oficial (`resultadoDeCompetencia`,
  que `construirResultadosEmpresa` ahora devuelve en `notasPorCompetencia`),
  así que cuadra con el informe y la calibración. Va antes de `@Get(':id')`.
  `GET /retroalimentacion/equipo` trae `nivelCompetencias`
  (`clasificarDesempeno` con la escala de la campaña).
  `AllExceptionsFilter` quita la ruta de los objetos anidados de los
  mensajes ("niveles.0.El nivel…" → "El nivel…").
  **Índice único parcial** `competencia_empresa_codigo_vigente_key`
  (`20261122140000_codigo_competencia_unico`: empresa + `LOWER(BTRIM(codigo))`
  entre las vigentes). Prisma no modela índices parciales ni por expresión:
  vive solo en la migración y `migrate diff` no lo ve.
  **`GET /competencia` (tabla) no trae los enunciados**: cada nivel con
  `comportamientos` (conteo), más `totalComportamientos` y `grupos` (grupos
  ocupacionales donde está asignada). La exportación los pide completos
  (`findAll(query, { completo: true })`). Ordena en el servidor con
  `sortBy` (`COMPETENCIA_SORT_FIELDS`) y `sortOrder`.
  **"Comportamiento" es el nombre visible del ítem** (término de la guía de
  FONAFE): mensajes, el Excel de resultados ("Comportamiento evaluado") y el
  de «Exportar» (columnas `descripcion` y `comportamiento`; el importador
  acepta también `nombre` y `enunciado`). El modelo sigue siendo
  `CompetenciaNivelItem.enunciado`.
- **Editar una competencia empareja los ítems por `idCompetenciaNivelItem`,
  no por posición.** El front lo manda en un `Form.Item` oculto. Emparejando
  por `secuencial`, borrar o reordenar un ítem intermedio hacía que los
  siguientes "cambiaran de texto" y sus notas en `PROCESO` pasaran a un
  enunciado que nadie calificó. Sin id (clientes de la API que no lo mandan)
  un ítem solo se reconoce si el texto es idéntico; si no, es nuevo y el
  viejo se retira. Cambiar el texto de un ítem calificado lo retira y crea un
  reemplazo que hereda las notas en `PROCESO`. **No se puede quitar un nivel
  que alguna unidad ocupacional tiene asignado** (400 con las unidades).
- **`PATCH /empleado/:id` no toca el jefe si `codigoEmpleadoJefe` no llega**;
  `""` o `null` lo quitan. Antes un `?? null` dejaba sin jefe a cualquiera
  actualizado sin el campo. Valida que el jefe exista y no sea él mismo, y
  **si cambia el `codigoEmpleado` de un jefe, reescribe el
  `codigoEmpleadoJefe` de sus subordinados** en la misma transacción: el
  vínculo es texto suelto y sin eso quedaban huérfanos y sus notas de jefe
  dejaban de contar. "Sin jefe" es siempre `NULL`
  (`20261120120000_normalizar_codigo_jefe_vacio` limpió los `''`).
- **`GET /evidencias` es el listado del administrador**: acepta `search`
  (trabajador o archivo, por palabras), `idEmpresaEmpleadora`, `tipo`
  (`OBJETIVO`/`COMPETENCIA`), `codigoEmpleadoJefe` y `fechaDesde/Hasta`, y
  devuelve `fechaSubida` y `subidoPor` resueltos — `fechaCreacion` y
  `creadoPorId` los borra el `PurgeResponseInterceptor`.
- **El listado de empleados arma su `where` en `construirWhereListado()` y su
  `orderBy` en `construirOrdenListado()`, y `findAll` y `exportExcel` comparten
  los dos.** El `where` estaba escrito dos veces (el de la exportación se
  colaba con `contains: undefined`) y el orden directamente se descartaba al
  exportar: ordenabas la tabla y el Excel salía por `fechaCreacion desc`. El
  archivo tiene que traer el mismo recorte y el mismo orden que la pantalla.
  Dos de sus filtros no son un `contains` sobre una columna y por eso viven
  ahí:
  - `nombreCompleto` se parte en palabras y cada una tiene que aparecer en
    `nombres` **o** en `apellidos`, así que "Perez Juan" encuentra lo mismo que
    "Juan Perez". Con un `contains` sobre un solo campo no encontraba a nadie.
  - `jefe` acepta nombre, apellidos o código. Como `codigoEmpleadoJefe` es
    texto suelto y no una relación, primero resuelve qué códigos corresponden a
    ese nombre y después filtra por `in`.
  Las condiciones compuestas van dentro de `AND`, no como claves sueltas del
  objeto: tres de ellas necesitan su propio `OR` y en la raíz la última pisaba
  a las anteriores.
- **El Excel de trabajadores pasa por `conAgregados()`, igual que el listado**,
  así que trae el nombre del jefe resuelto y el avance de evaluaciones. Antes
  el jefe salía solo como código —`YLRZUE` no le dice nada a quien abre el
  archivo— y el avance no estaba. Las dos barras van como cuatro columnas
  numéricas (evaluadas y totales), no como un `"1/2"` de texto, para que se
  puedan cruzar en una tabla dinámica. El autofiltro se calcula desde
  `columnCount`: estaba fijo en `'H1'` y se quedaba corto al tocar columnas.
- **`GET /empleado/avance` es el reporte de avance** (pantalla Avance del
  front). Acepta los filtros del listado de empleados más `estadoAvance` y
  devuelve `resumen`, `porGerencia`, `porArea`, `porUnidad`, `porPuesto`,
  `porJefe` y `trabajadores`. Cada grupo trae `id` (para que el front filtre
  al entrar; los nombres se repiten) y `padre`, el nivel de arriba más
  frecuente entre sus trabajadores (la gerencia de un área, el área de una
  unidad), solo como contexto.
  Sale de `conAgregados`, así que cuadra con la columna del listado. **Lo que
  puntúa decide el estado** (jefe + objetivos); la autoevaluación se informa
  aparte. Excluye a los ADMIN y calcula los indicadores **sin** el filtro de
  estado (filtrar "completos" y ver 100 % no informa nada). El estado viaja
  como `estadoAvance` porque `PurgeResponseInterceptor` borra `estado`.
- **La jefatura no puede formar un círculo**: al editar el jefe,
  `formariaCiclo` sube por la cadena del nuevo jefe y rechaza si llega al
  propio trabajador (antes A podía ser jefe de B y B de A); la importación
  hace lo mismo con los jefes declarados en el archivo. **Reactivar es por
  conjunto**, igual que suspender: un jefe y su equipo vuelven juntos (antes el
  subordinado se rechazaba porque su jefe "no estaba activo"). El DTO exige
  texto real en usuario, código, nombres y apellidos (`@Matches(/\S/)`),
  usuario sin espacios, largos máximos y antigüedad ≥ 0; el servicio guarda
  los textos recortados (`normalizarTrabajador`: "  EMP-01  " rompía el
  vínculo con el jefe, que es texto). **El jefe tiene que tener rol JEFE**
  (también el que viene en el mismo archivo) y **no se le quita el rol Jefe
  a quien tiene gente a cargo** (no cesada): con un jefe de rol Empleado el
  equipo quedaba sin evaluador. `GET /empleado` trae los nombres de
  gerencia, área, grupo y puesto.
  La importación informa usuario y código repetidos o ya registrados **por
  fila** (`[i] …`, junto con el resto), no con el primero que aparece. El
  Excel de trabajadores incluye "Tipo de documento" para poder reimportarlo.
  `GET /empleado/importacion/plantilla?idEmpresaEmpleadora=` arma la
  plantilla con ExcelJS (`plantilla-importacion.ts`): instrucciones,
  referencias y listas desplegables. Las validaciones se agregan **por
  rango** (`dataValidations.add('A2:A1001')`): celda por celda, ExcelJS
  ordena "A10" antes que "A2" y escribía rangos superpuestos.
- **Alta, edición e importación de trabajadores validan estructura y jefe**
  con un solo helper (`EmpleadoService.problemasDeRelaciones`): gerencia,
  área, unidad y puesto tienen que existir, estar activos y ser **de la
  empresa del trabajador**, y el jefe también (en la importación puede venir
  en el mismo archivo). Antes bastaba con que el id existiera, así que una
  fila podía quedar con la estructura de otra empresa o con un jefe
  inexistente. **La importación (`POST /empleado/masivo`) valida cada fila con
  las reglas de `CreateEmpleadoDto`** (`validarFilas` en el controlador): con
  el tipo `CreateEmpleadoDto[]` el `ValidationPipe` global no valida los
  elementos de un arreglo y las filas entraban sin ninguna regla. Los
  problemas se devuelven todos juntos en `errors`, con el índice de la fila
  delante (`[3] …`), que el front traduce a la fila del Excel. La contraseña
  exige 8 caracteres también en el servidor (antes solo en pantalla).
- **Cuentas de trabajadores por empresa, cuentas del sistema globales**
  (`20261122110000_usuario_por_empresa`): `usuario.id_empresa_cuenta` es la
  empresa dueña de la cuenta **solo para JEFE/EMPLEADO** y el usuario es
  único dentro de ella (`@@unique([idEmpresaCuenta, codigoUsuario])`), así
  una persona que pasó por varias empresas tiene una cuenta en cada una con
  su DNI. `null` = cuenta del sistema (ADMIN, EQUIPO, ADMIN_EMPRESA): única en
  todo el sistema, **comprobado en el servicio** (los NULL no chocan en un
  índice único). `empresaDeCuenta(rol, idEmpresa)` decide el ámbito; si el rol
  o la empresa cambian, la cuenta cambia de ámbito.
  **Login** (`AuthService.login`): valida la contraseña en todas las cuentas
  con ese usuario; con una sola válida entra, con varias responde
  `data.cuentas` (sin token) y el front reenvía con `idUsuario`. `empresa`
  (del enlace `/login?empresa=<id>`) deja solo las de esa empresa. El
  interceptor de bitácora busca al autor por id, no por usuario.
  **Límite de intentos** (`common/acceso/intentos-login.ts`): 5 fallos por
  usuario o 20 por IP (X-Forwarded-For detrás de Nginx) en 15 min bloquean
  15 min (429); un ingreso correcto limpia el usuario. Solo cuentan
  contraseña o usuario incorrectos. La IP es la **última** de
  X-Forwarded-For (la agrega el proxy); la primera la escribe el cliente y
  con ella se esquivaba el límite por IP. **En memoria del proceso**: se reinicia
  con el backend y no se comparte entre instancias (si hubiera varias,
  moverlo a Redis o a la base). Con enlace de empresa se verifica primero la
  cuenta de esa empresa.
  **Contraseñas escritas por personas** (`politica-contrasena.ts`): al menos
  8, ni comunes, ni un carácter repetido, ni secuencias, ni que contengan
  usuario, documento o nombre. Se aplica al crear o cambiar (trabajadores,
  RR. HH., equipo y "Cambiar contraseña"); las generadas no pasan por ahí y
  las existentes no se tocan.
- **Objetivos: reglas** (noviembre de 2026). **Una ficha por trabajador y
  campaña** (409 al crear otra; la importación omite a quien ya tiene:
  `{ count, omitidos }`). Cada meta: descripción con texto (≤1000), tipo
  ASCENDENTE/DESCENDENTE/MANUAL, unidad de `UNIDADES_MEDIDA` (guardada en
  mayúsculas), peso de 1 a 100 (y suman 100), meta ≥ 0 y **> 0 si es
  ascendente** (con 0 no hay porcentaje posible), fecha entre 2000 y 2100.
  `normalizarDetalles` recorta textos y pasa la unidad a mayúsculas.
  `POST /objetivo/masivo` revisa todo antes de escribir y devuelve los
  problemas juntos (`[i] código: …`). La migración
  `20261122130000_objetivos_fechas_y_unidades` recuperó las fechas que el
  importador viejo guardó en 1970 (238 metas vigentes de EGEMSA: el número de
  serie de Excel quedó como milisegundos y se reconvierte) y unificó la
  unidad de medida.
- **Instalación limpia: superadministrador desde el entorno**
  (`auth/superadmin-inicial.service.ts`). En producción **no se corre el
  seed** (crea `admin`, `jefe` y 20 empleados con `12345678` y empresas
  falsas; con `NODE_ENV=production` se niega a correr). Al arrancar, si no
  hay ningún ADMIN activo, se crea uno con `SUPERADMIN_USUARIO` /
  `SUPERADMIN_CONTRASENA` (≥ 12 caracteres + `problemaContrasena`; si no
  cumple, el arranque se detiene) y `SUPERADMIN_NOMBRE`, sin `Empleado`
  (como RR. HH.). Si ya hay un ADMIN no hace nada ni cambia contraseñas.
- **Encabezados y logs**: `helmet` sin CSP (la API solo da JSON y archivos;
  la CSP rompería Swagger) y `pino-http` con `redact` de `authorization`,
  `cookie` y `set-cookie`: el token no llega a los logs.
- **CORS limitado** (`main.ts`): `CORS_ORIGINS` (coma) o, sin ella, la SPA de
  Vercel, teamwork.com.pe y el front local. Antes `*`. Un dominio nuevo del
  front (otro de Vercel) hay que agregarlo ahí.
- **El código de empleado es único POR EMPRESA**
  (`20261122100000_codigo_empleado_por_empresa`, `@@unique([idEmpresaEmpleadora,
  codigoEmpleado])`): dos empresas pueden usar el mismo código interno.
  Como el jefe se vincula por código (`codigoEmpleadoJefe`, texto), **toda
  búsqueda por código o por subordinados filtra también la empresa**
  (alta/edición, importación, `conAgregados`, la consulta cruda de "es jefe",
  alcance del JEFE, evidencias, objetivos, reportes). La importación de
  objetivos recibe `idEmpresaEmpleadora` (RR. HH.: la suya). Al agregar una
  consulta por código, no olvidar la empresa.
- **Usuario y contraseña los pone el sistema** (decisión de noviembre de
  2026): si no llegan, el usuario es el **número de documento** (así estaba
  en el 99 % de los trabajadores reales) y la contraseña se genera al azar
  (`common/acceso/generar-contrasena.ts`, sin 0/O ni 1/l/I). `POST /empleado`
  devuelve `acceso: { usuario, contrasena, generada }` y `POST /empleado/masivo`
  `accesos: [{ codigoEmpleado, nombre, usuario, contrasena }]`, **una sola
  vez** (se guarda cifrada). Si el documento ya es usuario de otra cuenta
  (otra empresa), es el error de usuario repetido. Se descartó un prefijo de
  empresa en el usuario; si hiciera falta, la alternativa es la empresa en el
  enlace de ingreso (usuario único por empresa).
- **Fecha de ingreso, no antigüedad** (`20261122090000_fecha_ingreso`):
  `empleado.fecha_ingreso` (DATE, opcional) reemplaza a
  `tiempoEmpresaValor/Unidad`, un "3 años" escrito una vez que quedaba
  desactualizado. La antigüedad se calcula al mostrarla (Excel: columnas
  "Fecha de ingreso" dd/mm/aaaa y "Antigüedad"). La migración puso a los
  existentes una fecha **aproximada** (registro − antigüedad); "0 días" era el
  valor por defecto (los 215 de SEAL) y quedó sin fecha. Las columnas viejas
  se conservan con el dato original pero ya no se reciben ni se escriben. No
  puede ser futura (`problemaFechaIngreso`); llega como AAAA-MM-DD.
- **Situación laboral del trabajador** (`20261121150000_situacion_y_tipo_documento`):
  `situacion` = `ACTIVO` | `SUSPENDIDO` (temporal: licencia, descanso médico)
  | `CESADO` (salió), con `fechaSituacion` y `motivoSituacion` (obligatorio
  salvo al reactivar). **`estado` sigue mandando en todas las consultas** y
  vale true solo en ACTIVO: un suspendido o cesado no entra, no se evalúa y no
  puede ser jefe, pero conserva todo su historial. Se cambia con
  `PATCH /empleado/situacion` (`{ ids, situacion, fecha?, motivo? }`, todo o
  nada): dejar de operar no puede dejar a nadie activo sin jefe; reactivar
  exige que su estructura y su jefe sigan vigentes y le devuelve su mismo
  usuario. `DELETE /empleado/masivo` y `DELETE /empleado/:id` quedan como
  atajo de **cesar** con motivo "Dado de baja". Las bajas anteriores a la
  migración quedaron CESADO. El listado filtra por `situacion` (por defecto
  ACTIVO) y devuelve en `meta.situaciones` cuántos hay en cada una.
- **Documento con tipo, obligatorio y único por empresa**: `tipoDocumento`
  (`DNI` 8 dígitos | `CE` | `PASAPORTE`, 6–12 alfanuméricos) + `documento`.
  `problemasDeDocumento` lo valida en alta, edición e importación (también
  repetidos dentro del archivo) contra **todas** las situaciones: si es de un
  cesado, el mensaje pide reactivarlo en vez de registrarlo de nuevo. **Solo
  hay índice, no restricción única en la base**: hoy existen documentos
  repetidos (y en algunas empresas el campo tiene el código de empleado), así
  que la restricción espera a que se limpien.
- **`DELETE /empleado/masivo` da de baja varios a la vez, todo o nada**, y es
  por donde pasa también el borrado de una sola fila desde el front. La regla de
  `remove` (no se da de baja a quien todavía es jefe de alguien) se evalúa
  **contra el conjunto seleccionado**: un jefe junto con todos sus subordinados
  es una baja válida. Va declarado **antes** de `@Delete(':id')` o 'masivo'
  entra por la ruta con parámetro y el `ParseIntPipe` responde un 400.
- **El `ValidationPipe` global corre con `transform` desactivado**, así que un
  `@Type(() => Number)` en un query DTO solo sirve para validar: el handler
  recibe los strings crudos. Normalizar en el servicio.
- El cuerpo de las peticiones admite hasta **50 MB** (cargas masivas desde Excel).

### Modelo de datos — `prisma/schema.prisma`, 39 migraciones

```
EmpresaEmpleadora ─┬─ GerenciaEmpleadora
                   ├─ AreaEmpleadora
                   ├─ PuestoEmpleadora
                   ├─ UnidadOcupacionalEmpleadora ── UnidadOcupacionalCompetenciaNivel
                   ├─ Competencia ── CompetenciaNivel ── CompetenciaNivelItem
                   ├─ CampanaEvaluacion (una por campaña cerrada)
                   └─ Empleado (1:1 Usuario, roles ADMIN | JEFE | EMPLEADO)
                        ├─ Objetivo ── ObjetivoDetalle
                        │                └─ RetroalimentacionDetalle
                        ├─ EvaluacionCompetencia ── EvaluacionCompetenciaItem
                        └─ Evidencia (Cloudinary)
```

Decisiones de diseño que no se deducen leyendo el esquema:

- **La campaña es una entidad** (`CampanaEvaluacion`, módulo `campana`,
  solo ADMIN): nombre, **periodo evaluado** (`periodoDesde/Hasta`, el tramo
  que se juzga), **vigencias** (cuándo se califica), configuración (modelo,
  pesos, escala, resultado esperado) y estado `EN_CURSO`/`CERRADA`.
  Evaluaciones, objetivos y evidencias pertenecen a una por
  `idCampanaEvaluacion`; **todo filtra por campaña**
  (`filtroEvaluacionesDeCampana`, `campanaEnCurso`, `resolverCampana` en
  `common/resultados/campana.ts`) y nunca por el "YYYY-MM" heredado, que solo
  conservan las campañas migradas.
  - Reglas (en `CampanaService`, Prisma no modela índices parciales): **una
    sola EN_CURSO por empresa**, periodos que **no se superponen**, y la
    vigencia no empieza antes del periodo. El plazo de **fijación de
    objetivos** va completo o vacío (nunca una sola fecha) y su fin no es
    anterior a su inicio (`validarFijacion`); el **nombre** no puede ser solo
    espacios (`@Matches(/\S/)`: el `IsNotEmpty` lo dejaba pasar y quedaba ""). Abrir con `cerrarActual` cierra la
    en curso en la misma transacción; `copiarObjetivos` copia los de la
    anterior sin calificación. En una cerrada solo se corrigen nombre y
    periodo. **En una en curso con calificaciones, modelo y escala no se
    cambian** (400): el modelo decide qué evaluaciones cuentan y la escala
    cuáles son válidas. La salida es el **cambio excepcional**: solo `ADMIN`
    y con `motivoCambioExcepcional` (≥ 10 caracteres), que va a la
    descripción del registro en la bitácora. Nada se reinicia: de 180° a 90°
    las notas de subordinados dejan de contar sin borrarse; de 90° a 180° el
    70/30 solo se aplica a quien ya tiene notas de subordinados; de Manual a
    Likert se vacían solo las notas fuera de 0/25/50/75/100 y sus
    evaluaciones vuelven a PROCESO (la respuesta trae `notasVaciadas` con la
    nota anterior y el interceptor las guarda en el `detalle`). Los pesos sí, pero los resultados no se guardan, se
    calculan con la configuración vigente: cambiarlos recalcula a todos,
    también a los ya calificados. `GET /objetivo?idCampanaEvaluacion=`
    consulta los objetivos de una campaña concreta (una cerrada); sin él, los
    de la en curso. `GET /campana/:id/impacto-edicion` dice a
    cuántos (personas con notas, competencias y metas calificadas, notas fuera
    de Likert, notas de subordinados y si la configuración está bloqueada). Reabrir (solo si no hay otra en curso) devuelve sus evaluaciones
    a PROCESO y deja `fechaReapertura`/`reabiertoPorId`.
  - **Cerrar guarda una foto de asignaciones** (`CampanaAsignacion`: qué
    competencias y nivel le tocaban a cada trabajador al cierre). Las
    cerradas calculan "asignadas" con ella: sin la foto, una competencia
    asignada que nadie evaluó dejaba de contar como 0 y el resultado cambiaba
    al cerrar. Reabrir la borra.
  - **Transición:** el formulario de empresa y las pantallas de evaluación
    todavía leen vigencias y configuración de la empresa, así que abrir o
    editar la en curso las refleja en la empresa, y editar la empresa las
    refleja en la en curso. Cambiar `periodoEvaluacion` de la empresa **ya
    no cierra nada**.
  - El estado viaja como `estadoCampana` (y `fechaCreacion` como
    `fechaApertura`): el `PurgeResponseInterceptor` borra `estado`.
  - Verificado sobre una copia de producción: cerrar, reabrir y calcular
    por campaña dan los mismos 382 resultados por trabajador que antes.
- **Historial** (`20261120215711_historial_campanas`; requerimientos 5 y 7):
  cada evaluación lleva una **foto de la estructura al iniciarse**
  (`tipoEvaluador`, `codigoJefeEvaluado`, `id*Evaluado`) y `origenDeEvaluacion`
  y las consultas de `conAgregados` la usan: cambiar jefe, puesto o unidad no
  reescribe notas ya puestas. El PDF acepta `?campana=<id>`; para una cerrada
  usa la foto de asignaciones y la cabecera de la foto de la evaluación.
  `GET /reporte/campanas/:id` y `/reporte/mis-campanas` devuelven el
  historial. **Acceso** (`ReporteService.verificarAcceso`): ADMIN todo; JEFE
  sus subordinados actuales; **uno mismo solo campañas cerradas**.
- Nombres **camelCase en Prisma**, `snake_case` en la BD vía `@map`.
- **Todo es multi-empresa**: la jerarquía del empleado se ancla en
  `idEmpresaEmpleadora`, y `src/autorizacion/` lo hace cumplir en cada ruta.
- `EvaluacionCompetenciaItem.textoItemEvaluado` es un **snapshot deliberado**:
  editar una competencia no debe alterar evaluaciones ya hechas. Pero el
  snapshot solo congela el *texto*: **la lista de lo que falta por calificar se
  arma en vivo** contra los ítems vigentes del nivel. Por eso
  `CompetenciaService.sincronizarItemsDeNivel()` realinea las evaluaciones en
  `PROCESO` cada vez que se edita el nivel y cada vez que se abre una
  evaluación: agrega los ítems nuevos, da de baja los retirados y nunca toca
  una calificación puesta. Sin eso, editar un enunciado (que crea un ítem con
  id nuevo) dejaba la evaluación congelada en "0 de N" para siempre. **Las
  `CERRADA` y `ANULADA` no se sincronizan**: ahí manda el snapshot.
- **`EvaluacionCompetencia.periodoEvaluacion` (`"YYYY-MM"`) es lo que separa una
  campaña de la siguiente.** Se copia de la empresa al iniciar la evaluación y
  no se vuelve a tocar. La identidad de una evaluación es
  *(evaluado, evaluador, competencia, periodo, `PROCESO`)*: sin el periodo, al
  abrir la campaña siguiente `iniciarEvaluacion` devolvía la fila del periodo
  anterior y el evaluador sobrescribía sus notas. Los dos reportes Excel de
  competencias recortan por ese periodo (`periodoEvaluacion` en
  `ExportEmpresaQueryDto` permite pedir una campaña pasada); si no, promediarían
  juntas las notas de todos los periodos.
  La migración que lo introduce es
  `20260921120000_evaluacion_competencia_periodo`; su backfill atribuye lo ya
  existente al periodo vigente de la empresa de cada evaluado, que es la única
  atribución posible porque la tabla nunca guardó el periodo.
- **Cambiar la asignación de una unidad ocupacional anula lo que quede abierto
  del nivel que se abandona.** `asignarCompetenciasInterno` compara contra lo
  que ya había en vez de borrar y recrear todo: solo toca las filas que cambian
  y pasa a `ANULADA` las evaluaciones en `PROCESO` del nivel viejo de los
  empleados de esa unidad. Antes quedaban dos evaluaciones vivas por
  competencia y el Excel promediaba las dos.
- **Eliminar una competencia cascadea**: niveles, ítems, asignaciones por unidad
  (esta tabla no tiene soft delete, así que se borran) y anulación de sus
  evaluaciones abiertas. Dar de baja solo la competencia la dejaba apareciendo
  como pendiente de evaluar y promediando en el reporte.
- **Los pesos específicos de un objetivo deben sumar 100** (`validarPesos`, con
  tolerancia 0,01). La nota del objetivo es `Σ (% logrado × peso / 100)`, así
  que sin esa regla el resultado no significa nada. Se valida en los dos
  `create` y en el `update`.
- **`porcentajeLogrado` lo calcula el backend, no el cliente**
  (`calcularPorcentajeLogrado`): ASCENDENTE = alcanzada/meta, DESCENDENTE =
  meta/alcanzada (100 si la alcanzada es 0), y solo en MANUAL manda el número
  que llega. Además se recalcula cuando el `update` cambia la meta o el tipo de
  cálculo de un detalle ya calificado. Antes se persistía tal cual lo que
  mandaba el navegador y editar la meta dejaba un porcentaje huérfano.
- `EmpresaEmpleadora` guarda la configuración de la campaña: ventanas de vigencia
  (competencias y objetivos por separado), `modeloEmpresa` (`"90"` | `"180"`) y
  los porcentajes de ponderación. Las reglas que cruzan campos viven en
  `EmpresaEmpleadoraService.validarReglasNegocio`, no en el DTO: fin ≥ inicio en
  las dos vigencias, y cada par de porcentajes (competencias/objetivos,
  jefe/subordinado) suma 100 cuando los dos vienen con valor. En el PATCH se
  valida contra el estado resultante, no contra lo que llega.
- **`ruc` es `@unique` en toda la tabla, también para las empresas
  archivadas**: el soft delete no libera el RUC. El servicio lo comprueba antes de
  escribir para poder decir de qué empresa es, en vez de devolver el P2002 pelado.
- **`periodoEvaluacion` se guarda como `"YYYY-MM"`**, validado con `@Matches` en
  el DTO. `ReporteService` lo parte con un regex y arma la fecha en UTC a
  propósito: `new Date("2025-01")` se interpreta en UTC y, con el offset de
  Lima, el reporte salía con el mes anterior. No volver a `new Date(...)`. El
  regex toma también el prefijo de las filas viejas, guardadas como ISO completo.
  **Esas filas viejas ya se normalizaron**
  (`20260921140000_normalizar_periodo_evaluacion`): convivían los dos formatos y
  daba igual mientras el periodo solo se imprimiera, pero desde que identifica
  la campaña en `EvaluacionCompetencia` se compara como texto, y las dos formas
  no coinciden. Aun así `CompetenciaService.normalizarPeriodo()` recorta
  siempre al prefijo antes de estampar o de filtrar: **no comparar
  `periodoEvaluacion` crudo contra la columna de la empresa.**
- **Una empresa no se borra: se archiva** (ver "Archivar una empresa" en §4).
- `Empleo` / `Comunicado` no pertenecen al núcleo de evaluación: alimentan la
  landing pública de ofertas laborales.

---

## 3. Configuración y puertos

### Reparto de los archivos de entorno

**Cada variable vive en un solo archivo.** `ConfigModule` carga
`[.env.$NODE_ENV, .env]` en ese orden y la primera que define una clave gana.

| Archivo | Qué contiene | Versionado |
|---|---|---|
| `.env` | **solo `DATABASE_URL`** | no |
| `.env.development` | `PORT`, `JWT_*`, `CLOUDINARY_*` (con `CLOUDINARY_CARPETA_RAIZ=teamwork-local`), `APISPERU_TOKEN` | no |
| producción (Easypanel) | lo anterior + `CORS_ORIGINS`, `SUPERADMIN_*` (solo el primer arranque), `SWAGGER` opcional | — |
| `.env.example` | plantilla de todas, con placeholders | **sí** |
| producción | nada: las inyecta la plataforma de despliegue | — |

`DATABASE_URL` está sola en `.env` **a propósito**: es lo único que lee el CLI
de Prisma (`migrate`, `studio`, `seed`), que no entiende de `NODE_ENV`.
Duplicarla en los dos archivos es cómo se termina migrando contra la base
equivocada. Nest la hereda por la cadena de carga, así que no hace falta
repetirla.

`.gitignore` ignora `.env` y `.env.*`, con dos excepciones explícitas
(`!.env.example`, `!.env.deploy.example`): sin las plantillas, la única forma
de saber qué variables hacen falta era pedirle el `.env` a alguien.
**Ningún archivo con valores reales se sube a git**, ni siquiera el de
producción.

En el contenedor manda `process.env`: `ConfigModule` arma la configuración como
`{ ...archivos, ...process.env }`, así que lo que inyecta `env_file` gana sobre
cualquier `.env*` que hubiera quedado dentro de la imagen. El `.dockerignore`
existe para que no quede ninguno: sin él, `COPY . .` metía el `.env` local y el
`.git` —con los secretos que §5.1 dice que siguen en el historial— dentro de las
capas de la imagen.

**Las variables se validan al arrancar** (`src/config/env.validation.ts`):
`DATABASE_URL` y `JWT_SECRET_KEY` faltando **tumban el arranque** con el nombre
exacto de la que falta; las de Cloudinary solo dejan una advertencia (sin ellas
falla la subida del logo, no el resto). `PORT` (4055) y `JWT_EXPIRATION` (`7d`)
tienen valor por defecto aplicado ahí, así que `ConfigService` ya los entrega
resueltos. `APISPERU_TOKEN` también es opcional con aviso: sin ella solo se
desactiva la búsqueda por DNI y RUC.

**Consulta de DNI y RUC** (`src/consulta-documento/`, APIs Perú,
`https://dniruc.apisperu.com`): `GET /consulta-documento/dni/:dni` (RENIEC:
nombres y apellidos) y `GET /consulta-documento/ruc/:ruc` (SUNAT: razón
social, estado, condición, dirección), solo `ADMIN` y `ADMIN_EMPRESA`. Es un
proxy para que el token no viaje en el bundle del front; no guarda nada.
Responde 400 si el número no tiene la forma (8 dígitos; RUC de 11 que empiece
por 10/15/17/20), 404 si no existe —APIs Perú lo devuelve con **200 y
`success: false`**—, 503 sin token o con token rechazado, y 504 si tarda más
de 8 s. **El estado del RUC viaja como `estadoContribuyente`**:
`PurgeResponseInterceptor` borra toda clave `estado` de las respuestas.

| Qué | Dónde | Valor |
|---|---|---|
| Puerto API | `.env.development` → `PORT` | 4055 |
| Postgres de desarrollo | `.env` → `DATABASE_URL` | host **6025**, `teamwork_db` |
| — lo levanta | `teamwork-docker/docker-compose.yml` | postgres:17, contenedor `postgres_teamwork` |

El front espera la API en el **4055** (`VITE_API_URL`).

---

## 4. Trampas conocidas (leer antes de tocar nada)

1. **El `.env` ya apunta a `teamwork-docker` (127.0.0.1:6025)**, no al VPS.
   Hubo un periodo en que sí apuntaba a producción y un `npm run seed` escribía
   allá, así que antes de una prueba destructiva conviene confirmarlo:
   `grep DATABASE_URL .env`. El contenedor se levanta con
   `docker compose up -d` dentro de `teamwork-docker/`.

2. **Producción corre en Easypanel, no con `docker-compose.yml`.** Easypanel
   construye el `Dockerfile` desde GitHub y las variables se cargan en el
   servicio (`api` para `main`, `api-old` para `sistema-old`; ver el
   CLAUDE.md del workspace). `docker-compose.yml` y `.env.deploy.example`
   quedan del despliegue anterior del VPS y ya no se usan.
   Acoplamiento que rompe en silencio: el `PORT` del servicio tiene que ser
   el puerto del dominio en Easypanel (hoy 3000); sin la variable la app usa
   4055 y el dominio responde 502.
   No confundirlo con `teamwork-docker/`, que es el Postgres de desarrollo.

3. **Las plantillas del PDF no llegan a `dist`.** `PdfRendererService` lee
   `process.cwd()/src/reporte/templates/*.hbs` y `nest-cli.json` no declara
   `assets`. Solo funciona porque el Dockerfile hace `COPY . .`. Además lanza un
   Chromium nuevo por cada request, y usa `/usr/bin/chromium` solo si
   `NODE_ENV === 'production'`.

4. **Los 4 suites de jest fallan**, todos por lo mismo:
   `Cannot find module 'src/...'`. Falta mapear los imports absolutos.
   Arreglo: `"moduleNameMapper": { "^src/(.*)$": "<rootDir>/$1" }` en la config
   de jest del `package.json`.

5. **`npm run lint` aborta**: `eslint.config.mjs` pasa una opción inválida a
   `@typescript-eslint/no-unsafe-call`.

6. **`urlLogo` en `CreateEmpresaEmpleadoraDto` es opcional a propósito.**
   El logo se sube en un segundo paso vía `POST /empresa-empleadora/:id/logo`,
   porque Cloudinary necesita la empresa ya creada. Cuando `urlLogo` era
   `@IsNotEmpty()` se producía un bloqueo circular que **impedía crear empresas**.
   No revertirlo. El servicio hace `urlLogo: dto.urlLogo ?? ''` porque la columna
   sigue siendo NOT NULL. El endpoint acepta solo JPG/PNG/WEBP/SVG hasta 5 MB
   (`empresaLogoUploadOptions`) y rechaza la petición sin archivo: antes leía
   `file.path` a ciegas y sin adjunto respondía un 500.

7. **Cloudinary se configura en `main.ts`, no en su propio módulo.**
   `configurarCloudinary(configService)` se llama desde el bootstrap **a
   propósito**. Tenerlo en el cuerpo de `src/config/cloudinary.ts` —que es lo
   natural— no funciona: ese módulo se importa mientras Node resuelve la cadena
   de `app.module.ts`, o sea **antes** de que `ConfigModule.forRoot()` lea los
   `.env`, así que el SDK se quedaba con las tres claves en `undefined` para
   siempre. El síntoma es desconcertante: nada falla al arrancar y toda subida
   (logo de empresa y evidencias, que comparten el singleton) responde 500 en
   pocos milisegundos, sin llegar a salir a la red. Si alguien "ordena" esto
   devolviéndolo al módulo, vuelve el bug.
   El `CloudinaryStorage` de los interceptores guarda una referencia a ese
   mismo objeto y la lee al subir, por eso configurarlo después sí sirve.

8. **Dependencia auto-referencial** `"teamwork-back": "file:"` en `package.json`
   (un symlink a sí mismo en `node_modules`, resultado de un `npm i` accidental).

9. **Un objetivo se define en un módulo y se califica en otro.**
   `metaAlcanzada` y `porcentajeLogrado` **no** se aceptan en
   `ObjetivoDetalleDto` ni en `ObjetivoDetalleMasivoDto`: con el `whitelist`
   global, quien los mande por `POST /objetivo/con-detalles`, `/objetivo/masivo`
   o `PATCH /objetivo/:id` se los descartan. El único camino para escribirlos es
   `PATCH /objetivo/:id/evaluar`.
   Por eso `ObjetivoService.update` **actualiza los detalles por
   `idObjetivoDetalle` en vez de borrarlos y recrearlos**: el borrado masivo
   destruía la calificación cada vez que el jefe editaba el objetivo. Los
   detalles que el usuario quita se dan de baja (`estado: false`, nunca
   `DELETE`: antes se borraban y con ellos la calificación); los nuevos nacen
   con ambos campos en `null`; y si el PATCH no trae `objetivoDetalles`, no se
   toca ninguno. **Todas las lecturas de `objetivoDetalles` filtran
   `estado: true`.**

10. **Cuidado con los filtros de relación en Prisma: varios campos dentro de
    un mismo filtro se combinan con AND.** Escribir
    `empresaEmpleadora: { nombreEmpresa: {contains: x}, ruc: {contains: x} }`
    exige que el término esté en el nombre **y** en el RUC, así que no coincide
    nunca. Para "nombre o RUC" van en ramas separadas del `OR`. Este bug estaba
    en la búsqueda de competencias y ya se corrigió. Por lo mismo, dos spreads
    de `empresaEmpleadora` en el mismo objeto se pisan entre sí: hay que armar
    el filtro de la relación una sola vez.

11. **`null` significa SIN EVALUAR; `0` es un valor válido.** Aplica a
   `EvaluacionCompetenciaItem.calificacion` y a `ObjetivoDetalle.metaAlcanzada`
   / `porcentajeLogrado`. Sus DTOs (`UpdateEvaluacionItemDto`,
   `EvaluarObjetivoDetalleDto`) son `@IsOptional()` **a propósito**: si se
   vuelven obligatorios se pierde la diferencia entre "calificado con 0%" y
   "nunca calificado", y con ella el indicador de avance del jefe. `0` es una
   calificación real tanto en LIKERT como en MANUAL.

---

### Archivar una empresa (no se borra)

Una empresa **se archiva, no se elimina** (`POST /empresa-empleadora/:id/archivar`
y `…/restaurar`, solo `ADMIN`; `DELETE :id` quedó como alias de archivar).
Archivada = `estado` en false más `fecha_archivo`
(`20261121190000_archivo_empresa`). Decisión de noviembre de 2026, como el
"archivar" de GitHub o la desactivación de Microsoft 365:

- **No toca a los hijos**: trabajadores, estructura, campañas, evaluaciones y
  bitácora siguen como estaban, y `restaurar` la devuelve tal cual. Antes
  "eliminar" exigía vaciarla (dar de baja a todos) y no tenía vuelta atrás.
- **Nadie de ella entra**: `validateUser` rechaza el login y `AlcanceService.de`
  corta los tokens vigentes de RR. HH., jefes y empleados de una empresa
  archivada. Las cuentas no se desactivan una por una (restaurar no tiene que
  adivinar cuáles estaban activas antes).
- Sus registros siguen con `estado` true colgando de una empresa que no se
  lista: el front trabaja siempre dentro de una empresa activa. Un listado
  global sin `idEmpresaEmpleadora` (solo dueño/equipo) sí los incluiría.
- El RUC sigue siendo único con la empresa archivada: registrarla de nuevo
  da 409 y el mensaje manda a restaurarla. `GET ?archivadas=true` (solo
  `ADMIN`) lista las archivadas.
- La bitácora las registra como `ARCHIVAR` / `RESTAURAR`.

**Color de la empresa:** `empresa_empleadora.color_primario` (hex, null = azul
por defecto; `20261121200000_color_empresa`). El front lo aplica como color
primario de antd para toda la gente de esa empresa (color libre, con la
paleta de antd como sugeridos); el backend solo valida que sea hexadecimal. Viaja en el login
(`empresaAdministrada`) y en toda respuesta de empresa.

**Configuración de la plataforma** (`plataforma`, tabla
`configuracion_plataforma`, una sola fila id 1;
`20261121210000_configuracion_plataforma`): lo que es de TeamWork y no de
una empresa. Hoy, `colorPrimario` de la consola. `GET
/plataforma/configuracion` (dueño y equipo) y `PATCH` (solo `ADMIN`, hace
upsert); en la bitácora consta como «configuración de la plataforma».

## Roles y aislamiento por empresa — `src/autorizacion/`

Cinco roles: **`ADMIN`** (dueño de TeamWork: todas las empresas y las cuentas
del equipo), **`EQUIPO`** (personal de TeamWork, ver abajo), **`ADMIN_EMPRESA`** (RR. HH. de una empresa: todo, pero solo la
suya), `JEFE` y `EMPLEADO`. El administrador de empresa es un `Usuario` **sin
`Empleado`** (no se evalúa): su nombre y su empresa viven en
`usuario.nombre_completo` / `usuario.id_empresa_empleadora`
(`20261121090000_administrador_de_empresa`). Una cuenta por persona, para saber
quién hizo qué.

- **Cada controlador lleva `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(...)`**
  (de clase, y por ruta cuando cambia). `RolesGuard` **falla cerrado**: una
  ruta sin `@Roles` responde 500 en vez de quedar abierta. Al agregar un
  endpoint, ponerle `@Roles`.
- **El alcance se calcula en el servidor en cada petición** (`AlcanceService.de`):
  rol y empresa salen de la base, no del token ni de la URL, y un usuario dado
  de baja queda fuera aunque su token siga vigente. Llega al handler con
  `@AlcanceActual()`. **Un jefe o empleado cuyo trabajador está dado de baja
  tampoco entra**, ni al iniciar sesión ni con un token vigente, aunque su
  usuario siga activo: las bajas anteriores a que `remove` desactivara
  también el usuario lo dejaron así.
- **Listados:** `empresaDelListado(alcance, pedida)` fuerza la empresa del
  usuario e ignora la que pida. **Por id:** `alcances.verificar(alcance,
  'area' | 'empleado' | …, id)` responde **404, no 403** si es de otra empresa
  (no confirma que el id existe). Escrituras con `idEmpresaEmpleadora` en el
  cuerpo comprueban también esa empresa (no se puede "mudar" un registro).
- **Jefe y empleado, más fino que la empresa:** `verificarUsuario` (rutas
  `by-user/:id`: solo los suyos), `verificarTrabajador` (él, o sus
  subordinados directos si es jefe), `verificarParEvaluacion` (para iniciar,
  el evaluador es él y el evaluado él, un subordinado o su propio jefe),
  `verificarEvaluacion` (ver: evaluador o evaluado; calificar/cerrar: solo
  evaluador), `verificarObjetivo` (el jefe, solo objetivos de sus
  subordinados, no los suyos).
- **`verificarRolAsignable`:** desde Trabajadores solo se asignan `JEFE` y
  `EMPLEADO`; `ADMIN` solo lo da el superadmin y `ADMIN_EMPRESA` nunca (sin
  esto, RR. HH. podía crearse un ADMIN y ver todas las empresas).
- **Nivel de acceso: Edición o Solo lectura** (`usuario.solo_lectura`,
  `20261122120000_solo_lectura`; decisión de noviembre de 2026). Solo para
  `EQUIPO` y `ADMIN_EMPRESA`; las existentes quedaron con Edición. Lo hace
  cumplir **`RolesGuard`**: con `alcance.soloLectura`, todo método que no sea
  GET/HEAD/OPTIONS responde 403 ("Su cuenta es de solo lectura…"), salvo
  `RUTAS_PERMITIDAS_SOLO_LECTURA` (hoy `/auth/contrasena`). Falla cerrado:
  una ruta de escritura nueva nace bloqueada; si una escritura debe quedar
  abierta, agregarla a esa lista. Ver y descargar son GET. El login devuelve
  `soloLectura` para que el front oculte las acciones. Es un 403 del guard,
  así que no llega a la bitácora.
- **Empleos (escritura): solo `ADMIN`** (también para `EQUIPO`, desde
  noviembre de 2026). `GET /administradores-empresa` (solo `ADMIN`) lista
  todas las cuentas de empresa con su empresa y nivel (pestaña Empresas de
  Usuarios).
- **Quién hace qué:** empresas (crear, editar, logo, archivar), abrir/editar/
  reabrir campañas: solo `ADMIN`. **Cerrar** una campaña:
  también `ADMIN_EMPRESA`. Estructura, trabajadores, competencias, objetivos,
  evidencias, avance y reportes: los dos administradores, cada uno a su
  alcance. Evidencias y reportes conservan su control propio (`alcanceDe`,
  `verificarAcceso`), ahora con la rama de `ADMIN_EMPRESA`.
- **Equipo de TeamWork** (`equipo-teamwork`, `20261121170000_equipo_y_bitacora`):
  rol `EQUIPO`, cuentas que crea y gestiona **solo el dueño** (`/equipo-teamwork`:
  listar, crear, editar nombre y empresas, restablecer contraseña,
  desactivar). Atiende las empresas de `usuario_empresa` o todas
  (`todasLasEmpresas`); las que crea se le asignan solas. **Nunca queda
  activa sin ninguna**: la regla se mira sobre cómo queda la cuenta (al
  editar, también al quitar «Todas» sin mandar empresas). Puede todo lo que
  antes era solo de ADMIN (empresas, campañas) **dentro de su alcance**,
  menos eliminar empresas, Empleos y gestionar cuentas de TeamWork. En el
  alcance va como `empresasPermitidas`; `empresaDelListado` devuelve la
  pedida solo si es suya (si no, -1) y la cartera usa `idsPermitidos`.
  Constantes: `INTERNOS` (ADMIN, EQUIPO), `ADMINISTRADORES` (+ ADMIN_EMPRESA),
  `TODOS`. **Usar siempre las constantes en `@Roles`**: una lista escrita a
  mano deja afuera a EQUIPO.
- **Bitácora** (`actividad`, tabla `registro_actividad`): un interceptor
  global (`ActividadInterceptor`, `APP_INTERCEPTOR`) registra todo POST, PUT,
  PATCH y DELETE con autor (copiado, no relación), empresa, acción,
  descripción legible, resultado (también los rechazos) y, si la ruta apunta
  a un registro (`/recurso/:id`), **qué campos cambiaron con su valor antes y
  después**. El inicio de sesión se registra sin el cuerpo; ninguna clave
  sensible (`contrasena`, `token`…) se guarda. **Un trigger rechaza UPDATE y
  DELETE**: no se puede corregir ni borrar, ni siquiera a mano. `GET
  /actividad` respeta el alcance (dueño todo, equipo sus empresas, RR. HH. la
  suya; los eventos sin empresa solo los ve quien ve todas), ordena por fecha
  (`sortOrder`) y `GET /actividad/export/excel` la exporta con los mismos
  filtros (hasta 10 000 filas). **Las cuentas** (equipo y RR. HH.) usan un
  solo `PATCH` para tres cosas y se registran con su nombre:
  `RESTABLECER_CONTRASENA` (consta como «acceso: la anterior → una nueva»,
  sin valor), `DESACTIVAR_CUENTA` y `REACTIVAR_CUENTA`; su «antes y después»
  incluye las empresas asignadas como texto. Las del equipo no llevan
  empresa (si no, caerían en la del autor). Las acciones POST sobre un
  registro existente (cerrar o reabrir una campaña) toman la empresa del
  registro: antes caían en la del autor y el RR. HH. no las veía.
  `PurgeResponseInterceptor` borra
  `estado` también dentro del detalle: `listar` lo entrega como `activo`
  (`sinClaveEstado`); en la base queda igual. Limitación: lo
  que `RolesGuard` rechaza (403) no llega al interceptor y no se registra.
- **Administradores de empresa** (`administrador-empresa`,
  `empresa-empleadora/:idEmpresa/administradores`): listar, crear y editar
  (nombre, nivel, restablecer contraseña, desactivar). Los gestionan el
  superadmin, el ayudante de TeamWork asignado a la empresa y el propio
  administrador de esa empresa, **los dos últimos solo con Edición**; nadie
  se desactiva a sí mismo. **La contraseña
  la pone quien crea la cuenta y se entrega por fuera del sistema: no hay
  correo.** `PATCH /auth/contrasena` cambia la propia (opcional). El login
  devuelve además `nombreCompleto` y `empresaAdministrada`.
- Pruebas manuales de este modelo (25 casos de aislamiento + 26 de jefe y
  empleado) en el historial de la sesión que lo introdujo; no hay tests
  automáticos (§4.4).

## 5. Deuda abierta — seguridad, sin resolver

1. **Secretos en el historial de git.** El commit `302c612` solo dejó de rastrear
   `.env`; en `300b3da` y anteriores siguen la cadena de conexión del VPS, el
   `JWT_SECRET_KEY` y el `CLOUDINARY_API_SECRET`. Hay que **rotar las tres**;
   reescribir el historial no basta por sí solo.

## 6. Deuda abierta — mantenibilidad

- **Duplicación masiva.** `area-empleadora`, `puesto-empleadora`,
  `gerencia-empleadora` y `unidad-ocupacional-empleadora` son cuatro copias del
  mismo servicio de ~390 líneas (CRUD + import + export Excel); normalizando
  nombres, el diff entre ellos es de ~60 líneas. Candidato claro a un servicio
  genérico parametrizado por entidad.
- **~1.300 líneas comentadas** (≈11% del código). Varios archivos guardan dos
  versiones completas de la misma clase.
- **52 `console.log`** pese a tener `nestjs-pino` configurado.

---

## 7. Convenciones de trabajo

- El producto y el código están **en español**: nombres de dominio
  (`EmpresaEmpleadora`, `objetivoDetalle`), mensajes de error y de UI.
  Mantenerlo así.
- Mensajes de commit estilo `feat: ...` / `fix: ...`, en español.
- Rama de trabajo actual: `cambios-julio-2026`.

---

## Mantenimiento de este archivo

Se actualiza **en el mismo cambio que lo vuelve obsoleto**, no después.

Actualízalo cuando el cambio toque algo que no se deduzca leyendo el código:

- Se agrega, renombra o elimina un módulo, una ruta o una variable de entorno.
- Cambia un contrato compartido con el otro repo: forma de la respuesta, forma
  de los errores, autenticación, puertos.
- Cambia el modelo de datos: entidad nueva, relación nueva, o una migración con
  intención de negocio detrás.
- Se resuelve o aparece una trampa o un punto de deuda de las secciones de
  arriba. Si se resolvió, **borrar la entrada**; no dejarla marcada como hecha.
- Se toma una decisión de diseño deliberada que alguien podría revertir por
  error (ejemplo: la subida del logo en dos pasos).
- Cambia un comando, una versión de Node o la rama de trabajo.

**No** lo actualices por refactors internos, cambios de estilo, ajustes de copy
ni nada que el propio código ya explique. Esto es contexto, no un changelog: se
carga entero en cada sesión, así que si crece con cada commit deja de servir.
