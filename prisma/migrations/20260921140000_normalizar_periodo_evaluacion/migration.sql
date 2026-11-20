-- Deja `periodo_evaluacion` en una sola forma: "YYYY-MM".
--
-- Conviven dos formatos: el actual ("2026-09", que es lo que valida el DTO) y
-- el ISO completo de filas antiguas ("2026-09-04T05:00:00.000Z"). Mientras el
-- periodo solo se leía para imprimirlo en un reporte daba igual, porque el
-- parser tomaba el prefijo. Ahora el periodo es lo que identifica una campaña
-- en `evaluacion_competencia` y se compara como texto: con los dos formatos
-- vivos, guardar una empresa vieja desde el formulario normalizaría su periodo
-- a la forma corta y sus evaluaciones abiertas —estampadas con la larga— ya no
-- se encontrarían: se crearían evaluaciones nuevas y las notas ya puestas
-- quedarían huérfanas.
--
-- Solo recorta lo que empieza por YYYY-MM y mide más de 7, así que es
-- idempotente y no toca lo que ya está bien.

UPDATE "empresa_empleadora"
SET "periodo_evaluacion" = substring("periodo_evaluacion" from 1 for 7)
WHERE "periodo_evaluacion" ~ '^\d{4}-\d{2}'
  AND length("periodo_evaluacion") > 7;

UPDATE "evaluacion_competencia"
SET "periodo_evaluacion" = substring("periodo_evaluacion" from 1 for 7)
WHERE "periodo_evaluacion" ~ '^\d{4}-\d{2}'
  AND length("periodo_evaluacion") > 7;
