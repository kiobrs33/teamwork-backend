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
- **`progresoEvaluacion: { totalItems, itemsEvaluados, completo }`** lo calcula
  el helper privado `EmpleadoService.calcularProgresoCompetencias(idEvaluado,
  idEvaluador, competencias)` y lo devuelven tres endpoints, **por competencia
  y en total**: `/empleado/subordinados/competencias/:id` (el jefe evalúa a cada
  subordinado), `/empleado/competencias/:id` (autoevaluación: evaluado ===
  evaluador) y `/empleado/jefe/competencias/by-user/:idUsuario` (el subordinado
  evalúa a su jefe). El front lo pinta con `ProgresoEvaluacionTag`, en la
  columna de las tablas y en la cabecera de cada competencia; si se quita, esas
  vistas pierden el indicador. Cuenta solo ítems del nivel asignado hoy e
  ignora las evaluaciones `ANULADA`.
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
  lo que los saca del `ResponseInterceptor`.
- Los errores de Prisma pasan por `handlePrismaError()`
  (`src/prisma/helpers/prisma-error.handler.ts`).
- El cuerpo de las peticiones admite hasta **50 MB** (cargas masivas desde Excel).

### Modelo de datos — `prisma/schema.prisma`, 34 migraciones

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
  editar una competencia no debe alterar evaluaciones ya hechas.
- `EmpresaEmpleadora` guarda la configuración de la campaña: ventanas de vigencia
  (competencias y objetivos por separado), `modeloEmpresa` (`"90"` | `"180"`) y
  los porcentajes de ponderación.
- `Empleo` / `Comunicado` no pertenecen al núcleo de evaluación: alimentan la
  landing pública de ofertas laborales.

---

## 3. Configuración y puertos

| Qué | Dónde | Valor |
|---|---|---|
| Puerto API | `.env` → `PORT` | 4055 |
| Puerto fallback | `src/main.ts` si no hay `PORT` | 3000 |
| Postgres que espera el backend | `.env` → `DATABASE_URL` | host 5050, `teamworkdb` |
| Postgres de `teamwork-docker` | su `docker-compose.yml` | host **6025**, `teamwork_db` |

Variables: `DATABASE_URL`, `PORT`, `JWT_SECRET_KEY`, `JWT_EXPIRATION` (`7d`),
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
`.env` y `.env.*` están gitignoreados.

El front espera la API en el **4055** (`VITE_API_URL`); si el backend cae al
fallback 3000, la SPA deja de conectar.

---

## 4. Trampas conocidas (leer antes de tocar nada)

1. **`ConfigService` no carga `.env`.** `app.module.ts` usa
   `envFilePath: ['.env.${NODE_ENV}']`, pero solo existe `.env`. Verificado:
   `PORT`, `JWT_SECRET_KEY` y `DATABASE_URL` quedan `undefined` dentro de Nest —
   con lo cual `JwtModule` se queda sin secreto y el login no funciona. Prisma sí
   anda porque su CLI lee `.env` por su cuenta. **Para levantar en local hay que
   crear `.env.development`** (o quitar el `envFilePath`). En producción no se
   nota porque Render/Docker inyectan las variables.

2. **`.env` apunta a la BD de producción** (un VPS, puerto 5050). Un
   `npm run seed` local escribe en producción. Apuntarlo a `teamwork-docker`
   antes de cualquier prueba destructiva.

3. **`docker-compose.yml` referencia `.env.deploy`**, un archivo que no existe en
   el repo. Además define su propio Postgres 15 en el 5050, que no coincide con el
   de `teamwork-docker` (Postgres 17 en el 6025). Los tres están desalineados.

4. **Las plantillas del PDF no llegan a `dist`.** `PdfRendererService` lee
   `process.cwd()/src/reporte/templates/*.hbs` y `nest-cli.json` no declara
   `assets`. Solo funciona porque el Dockerfile hace `COPY . .`. Además lanza un
   Chromium nuevo por cada request, y usa `/usr/bin/chromium` solo si
   `NODE_ENV === 'production'`.

5. **Los 4 suites de jest fallan**, todos por lo mismo:
   `Cannot find module 'src/...'`. Falta mapear los imports absolutos.
   Arreglo: `"moduleNameMapper": { "^src/(.*)$": "<rootDir>/$1" }` en la config
   de jest del `package.json`.

6. **`npm run lint` aborta**: `eslint.config.mjs` pasa una opción inválida a
   `@typescript-eslint/no-unsafe-call`.

7. **`urlLogo` en `CreateEmpresaEmpleadoraDto` es opcional a propósito.**
   El logo se sube en un segundo paso vía `POST /empresa-empleadora/:id/logo`,
   porque Cloudinary necesita la empresa ya creada. Cuando `urlLogo` era
   `@IsNotEmpty()` se producía un bloqueo circular que **impedía crear empresas**.
   No revertirlo. El servicio hace `urlLogo: dto.urlLogo ?? ''` porque la columna
   sigue siendo NOT NULL.

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
   detalles que el usuario quita sí se eliminan; los nuevos nacen con ambos
   campos en `null`; y si el PATCH no trae `objetivoDetalles`, no se toca
   ninguno.

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
   Ojo: `empleadosEvaluadosPorEmpresa` todavía usa el criterio viejo
   (`calificacion !== null && > 0`) y por eso cuenta un 0% como sin evaluar.

---

## 5. Deuda abierta — seguridad, sin resolver

1. **Secretos en el historial de git.** El commit `302c612` solo dejó de rastrear
   `.env`; en `300b3da` y anteriores siguen la cadena de conexión del VPS, el
   `JWT_SECRET_KEY` y el `CLOUDINARY_API_SECRET`. Hay que **rotar las tres**;
   reescribir el historial no basta por sí solo.

2. **No hay autorización, solo autenticación.** `JwtAuthGuard` está en 12 de 14
   controladores, pero **no existe ningún `RolesGuard`** — el `rol` solo se lee
   para meterlo en el token. Los roles se aplican únicamente en el frontend, así
   que cualquier EMPLEADO con su token puede llamar `DELETE /empleado/:id` con
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
- `ObjetivoService.update` hace `deleteMany` + `createMany` de los detalles:
  pierde los IDs y la auditoría en cada edición.
- `periodoEvaluacion` se guarda como ISO completo aunque el esquema documenta
  `"YYYY-MM"` — el front manda un objeto dayjs. No rompe (el reporte hace
  `new Date(...)`), pero el dato queda inconsistente.

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
