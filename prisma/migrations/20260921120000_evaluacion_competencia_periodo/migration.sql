-- Separación de campañas en la evaluación de competencias.
--
-- Hasta ahora la identidad de una evaluación era
-- (evaluado, evaluador, competencia, nivel, PROCESO). Al abrir la campaña
-- siguiente, `iniciarEvaluacion` encontraba la fila del periodo anterior y la
-- devolvía tal cual: el evaluador terminaba sobrescribiendo las calificaciones
-- del periodo pasado. `periodo_evaluacion` es lo que separa una campaña de otra.

ALTER TABLE "evaluacion_competencia"
  ADD COLUMN "periodo_evaluacion" TEXT;

-- Backfill: todo lo que ya existe se atribuye al periodo vigente de la empresa
-- del trabajador evaluado. Es la única atribución posible con los datos que hay
-- (la tabla nunca guardó el periodo), y deja el histórico atado a la campaña en
-- curso para que la siguiente arranque con filas nuevas.
UPDATE "evaluacion_competencia" AS ec
SET "periodo_evaluacion" = empresa."periodo_evaluacion"
FROM "empleado" AS emp
JOIN "empresa_empleadora" AS empresa
  ON empresa."id_empresa_empleadora" = emp."id_empresa_empleadora"
WHERE ec."id_evaluado" = emp."id_empleado"
  AND ec."periodo_evaluacion" IS NULL;

CREATE INDEX "evaluacion_competencia_periodo_idx"
  ON "evaluacion_competencia" ("id_evaluado", "id_evaluador", "id_competencia", "periodo_evaluacion");
