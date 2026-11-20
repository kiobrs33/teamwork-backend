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

Node: `.nvmrc` pide **22.23.2**, el Dockerfile usa **22.13.0**. No rompe nada hoy,
pero conviene saberlo.

---

## 2. Arquitectura

### Forma de los módulos — `src/<recurso>/`

Todos repiten la misma estructura: `<r>.module.ts`, `<r>.controller.ts`,
`<r>.service.ts`, `dto/`, `entities/`. Al agregar un recurso, seguirla.

Módulos: `auth`, `empleado`, `empresa-empleadora`, `area-empleadora`,
`gerencia-empleadora`, `puesto-empleadora`, `unidad-ocupacional-empleadora`,
`competencia`, `objetivo`, `retroalimentacion-detalle`, `evidencia`, `reporte`,
`empleo`.

### Convenciones que hay que respetar

- **Imports absolutos** `src/...` (habilitado por `baseUrl: "./"` en tsconfig).
- **Las reglas de cálculo de la evaluación viven en
  `src/common/resultados/resultados-evaluacion.ts`, y solo ahí.** Son funciones
  puras (sin DI, para que las importen módulos distintos sin dependencias
  circulares) y cubren las cuatro decisiones que hacían que cada salida diera
  un número distinto:
  - `filtroEvaluacionesVigentes(periodo)` — qué evaluaciones cuentan: las de la
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
- **El gráfico de competencias es un radar, siempre.** Con menos de tres
  competencias un radar es geométricamente un punto o una raya, y se probó a
  cambiarlo por barras en ese caso; **no hacerlo**, es una decisión tomada: el
  informe enseña un radar.
- **Los tres papeles del modelo, y quién puntúa.** `origenDeEvaluacion`
  clasifica cada nota en `auto` / `jefe` / `subordinado` / `otro`:
  - **90°**: la nota es la del líder inmediato, al **100 %**.
  - **180°**: líder **70 %** + subordinados **30 %**; si el evaluado no tiene
    gente a cargo no hay quien lo evalúe desde abajo y cae a solo el líder.
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
  - El radar del informe enseña las tres miradas por separado (líder,
    autoevaluación y, solo en 180°, subordinados), no el resultado ya
    mezclado: pintando la combinación no se veía el contraste, que es para lo
    que sirve.
- **`tipoCalificacionCompetencia` solo cambia el control con el que se
  califica, pero tiene dos consecuencias que no se ven.** `LIKERT` pinta cinco
  pasos fijos (0, 25, 50, 75, 100) y `MANUAL` una entrada libre de 0 a 110.
  El cálculo es el mismo en los dos casos: el promedio de las calificaciones.
  - **Con LIKERT el techo es 100**, así que el "superávit" del informe nunca
    puede ser positivo (el esperado por defecto también es 100) y el nivel
    "Sobresaliente" de `clasificarDesempeno`, que pide ≥105, es inalcanzable.
    La tabla de bandas (`CompetencyEvaluationScale`) solo se enseña en MANUAL,
    aunque la clasificación se aplica a los dos.
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
  queda registrado.**
- **Las ventanas de vigencia son solo del front.** `fechaVigenciaInicio/Fin`
  gobierna todas las pantallas de evaluación (`useEvaluationPeriod` +
  `EvaluationGuard`) y `fechaVigenciaInicioObjetivo/FinObjetivo` pone en
  solo-lectura la edición de objetivos del JEFE (`usePermissions`). **Ningún
  endpoint del backend mira esas fechas**, así que con un token válido se
  califica fuera de vigencia. Mismo caso que el control de roles (§trampa 1).
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
  vistas pierden el indicador. Cuenta solo ítems del nivel asignado hoy y usa
  `filtroEvaluacionesVigentes`, así que ignora las `ANULADA` y las de campañas
  anteriores — este último recorte le faltaba y no cuadraba con la columna del
  listado, que sí acotaba por periodo.
- **`GET /empleado/:id/estado-evaluacion` explica el avance, no lo resume.**
  La columna del listado dice "Jefe: 2/5", que es cuánto falta pero no QUÉ
  falta. Este endpoint devuelve competencia por competencia con los enunciados
  concretos sin calificar, separando jefe y autoevaluación, y aparte las
  **anuladas** con cuántas notas se perdieron con cada una: son las que
  explican un avance que retrocede sin que nadie haya tocado una calificación.
  Usa el mismo criterio que el resto (`filtroEvaluacionesVigentes`, y completa
  = todos los ítems con nota). Lo consume el modal "Ver estado de evaluación"
  del menú de cada fila.
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
  hoy no decide accesos en ningún lado (ver §5.2).
- Los endpoints de descarga (Excel, PDF) usan `@Res()` + `res.send/end(buffer)`,
  lo que los saca del `ResponseInterceptor`. **Ojo: cuando fallan sí pasan por
  `AllExceptionsFilter` y responden JSON**, así que el cliente tiene que mirar
  el `Content-Type` antes de guardar el archivo.
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
- **Exportaciones de listados (`GET <recurso>/export/excel`)**: empleados,
  empresas, áreas, gerencias, puestos, unidades, competencias, objetivos y
  evidencias. Las nuevas se arman con `construirLibroExcel` / `enviarExcel`
  (`src/common/excel/libro-excel.ts`), que pone cabecera, autofiltro y
  `tipo: 'texto'` para documentos y códigos (como número pierden los ceros a
  la izquierda). **Usan el mismo filtro que su listado**, extraído a un
  método (`construirListado`, `construirWhere`), y van declaradas **antes de
  `@Get(':id')`**. Las de competencias, objetivos y trabajadores llevan **las
  columnas de su carga masiva con el mismo nombre**, para que el archivo
  sirva de base para volver a importar; competencias agrega la hoja
  "Asignaciones" (nivel por unidad) y objetivos la de "Retroalimentación".
  La de evidencias respeta el alcance por rol del listado.
- Los errores de Prisma pasan por `handlePrismaError()`
  (`src/prisma/helpers/prisma-error.handler.ts`).
- **Los listados pasan el query DTO entero al servicio.** `GET /empresa-empleadora`
  acepta `search`, un filtro por columna (`idEmpresaEmpleadora`, `nombreEmpresa`,
  `ruc`, `modeloEmpresa`, `direccionEmpresa`) y `sortBy`/`sortOrder` — este
  último limitado a `EMPRESA_SORT_FIELDS`. El controlador hacía
  `findAll({ page, limit, search })` y con eso los filtros del servicio nunca se
  aplicaban: la fila de filtros del front no hacía nada. `area-empleadora` ya
  tenía el arreglo; al tocar otro listado, comprobar lo mismo.
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

### Modelo de datos — `prisma/schema.prisma`, 36 migraciones

```
EmpresaEmpleadora ─┬─ GerenciaEmpleadora
                   ├─ AreaEmpleadora
                   ├─ PuestoEmpleadora
                   ├─ UnidadOcupacionalEmpleadora ── UnidadOcupacionalCompetenciaNivel
                   ├─ Competencia ── CompetenciaNivel ── CompetenciaNivelItem
                   └─ Empleado (1:1 Usuario, roles ADMIN | JEFE | EMPLEADO)
                        ├─ Objetivo ── ObjetivoDetalle
                        │                └─ RetroalimentacionDetalle
                        ├─ EvaluacionCompetencia ── EvaluacionCompetenciaItem
                        └─ Evidencia (Cloudinary)
```

Decisiones de diseño que no se deducen leyendo el esquema:

- Nombres **camelCase en Prisma**, `snake_case` en la BD vía `@map`.
- **Todo es multi-empresa**: la jerarquía del empleado se ancla en
  `idEmpresaEmpleadora`. Hoy nada lo hace cumplir a nivel de consulta (§5.3).
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
- **`ruc` es `@unique` en toda la tabla, también para las empresas dadas de
  baja**: el soft delete no libera el RUC. El servicio lo comprueba antes de
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
- **Una empresa con hijos activos no se puede dar de baja** (empleados, áreas,
  puestos, gerencias, unidades ocupacionales o competencias): responde 409. El
  soft delete no cascadea, así que borrarla dejaba toda su jerarquía viva
  colgando de una empresa que ya no aparece en ninguna consulta.
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
| `.env.development` | `PORT`, `JWT_*`, `CLOUDINARY_*` | no |
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
resueltos.

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

2. **`docker-compose.yml` es el despliegue del VPS, no el entorno local.**
   Define su propio Postgres 15 (publicado en el 5050, con otra BD y otro
   usuario que los del `.env`) y lee `env_file: .env.deploy`. Ese archivo
   **no está ni puede estar en el repo**: se crea a mano en el servidor, y
   `.env.deploy.example` es su plantilla versionada.
   Dos acoplamientos que rompen en silencio si se tocan por separado:
   el `PORT` de `.env.deploy` tiene que coincidir con el lado derecho de
   `ports:` (hoy `"3050:3000"`, o sea `PORT=3000`; sin la variable la app usa
   4055 por defecto y el mapeo deja de apuntar a nada), y el `DATABASE_URL`
   de ahí va contra el host `db` en el puerto **interno 5432**, no contra el
   5050 publicado.
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

## 5. Deuda abierta — seguridad, sin resolver

1. **Secretos en el historial de git.** El commit `302c612` solo dejó de rastrear
   `.env`; en `300b3da` y anteriores siguen la cadena de conexión del VPS, el
   `JWT_SECRET_KEY` y el `CLOUDINARY_API_SECRET`. Hay que **rotar las tres**;
   reescribir el historial no basta por sí solo.

2. **No hay autorización, solo autenticación — salvo en evidencias.**
   `JwtAuthGuard` está en 12 de 14 controladores, pero **no existe ningún
   `RolesGuard`** — el `rol` solo se lee para meterlo en el token. La única
   excepción es `EvidenciaService`, que deriva el alcance del token
   (`alcanceDe`): ADMIN todo; JEFE lee lo de sus subordinados directos y lo
   suyo, y sube/elimina solo lo de sus subordinados; EMPLEADO lee solo lo
   suyo. Una evidencia ajena responde 404, no 403, para no confirmar ids. Es
   el patrón a copiar al cerrar el resto. Fuera de ahí los roles se aplican
   únicamente en el frontend, así que cualquier EMPLEADO con su token puede llamar `DELETE /empleado/:id` con
   curl. Al agregar endpoints, asumir que **no hay red de seguridad**.

3. **Sin aislamiento entre empresas.** `GET /objetivo` devuelve los objetivos de
   todas; `PATCH /objetivo/:id` lo edita cualquier autenticado. El scoping debe
   derivarse del token, nunca del parámetro de la URL.

4. **Se filtran hashes de contraseña.** `PURGE_KEYS` borra `password`, pero el
   campo Prisma se llama **`contrasena`**, y `empleado.service.ts` hace
   `include: { usuario: true }` sin `select`. `GET /empleado` devuelve el bcrypt
   de cada empleado.

5. `app.enableCors({ origin: '*' })` en `main.ts`.

## 6. Deuda abierta — mantenibilidad

- **Duplicación masiva.** `area-empleadora`, `puesto-empleadora`,
  `gerencia-empleadora` y `unidad-ocupacional-empleadora` son cuatro copias del
  mismo servicio de ~390 líneas (CRUD + import + export Excel); normalizando
  nombres, el diff entre ellos es de ~60 líneas. Candidato claro a un servicio
  genérico parametrizado por entidad.
- **~1.300 líneas comentadas** (≈11% del código). Varios archivos guardan dos
  versiones completas de la misma clase.
- **52 `console.log`** pese a tener `nestjs-pino` configurado.
- **`PATCH /competencia/evaluaciones/:id` ya comprueba que los ítems enviados
  sean de esa evaluación** (antes se calificaba la de cualquier otro trabajador
  mandando ids ajenos). El resto de endpoints sigue sin comprobar de quién es lo
  que se toca — ver §5.2 y §5.3.

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
