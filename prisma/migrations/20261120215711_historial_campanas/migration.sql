-- AlterTable
ALTER TABLE "evaluacion_competencia" ADD COLUMN     "codigo_jefe_evaluado" TEXT,
ADD COLUMN     "id_area_evaluado" INTEGER,
ADD COLUMN     "id_gerencia_evaluado" INTEGER,
ADD COLUMN     "id_puesto_evaluado" INTEGER,
ADD COLUMN     "id_unidad_evaluado" INTEGER,
ADD COLUMN     "tipo_evaluador" TEXT;

-- AlterTable
ALTER TABLE "evidencia" ADD COLUMN     "periodo_evaluacion" TEXT;

-- AlterTable
ALTER TABLE "objetivo" ADD COLUMN     "periodo_evaluacion" TEXT;

-- CreateTable
CREATE TABLE "campana_evaluacion" (
    "id_campana_evaluacion" SERIAL NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "periodo_evaluacion" TEXT NOT NULL,
    "modelo_empresa" TEXT NOT NULL,
    "porcentaje_competencias" INTEGER,
    "porcentaje_objetivos" INTEGER,
    "porcentaje_evaluacion_jefe" INTEGER,
    "porcentaje_evaluacion_subordinado" INTEGER,
    "tipo_calificacion" TEXT,
    "resultado_esperado" INTEGER,
    "fecha_cierre" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerrado_por_id" INTEGER,

    CONSTRAINT "campana_evaluacion_pkey" PRIMARY KEY ("id_campana_evaluacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "campana_evaluacion_id_empresa_empleadora_periodo_evaluacion_key" ON "campana_evaluacion"("id_empresa_empleadora", "periodo_evaluacion");

-- CreateIndex
CREATE INDEX "objetivo_periodo_idx" ON "objetivo"("idEmpleado", "periodo_evaluacion");

-- AddForeignKey
ALTER TABLE "campana_evaluacion" ADD CONSTRAINT "campana_evaluacion_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Relleno de lo existente. Nunca se guardó cómo estaba la estructura al
-- evaluar, así que lo ya hecho se atribuye a la estructura y a la campaña
-- ACTUALES: es la única atribución posible, y la misma que el código hacía
-- hasta ahora en cada cálculo.
-- ============================================================

-- Foto de la estructura y tipo de evaluador (mismo criterio que
-- origenDeEvaluacion en src/common/resultados).
UPDATE "evaluacion_competencia" ec
SET "codigo_jefe_evaluado" = NULLIF(TRIM(e."codigo_empleado_jefe"), ''),
    "id_unidad_evaluado"   = e."id_unidad_ocupacional_empleadora",
    "id_puesto_evaluado"   = e."id_puesto_empleadora",
    "id_area_evaluado"     = e."id_equipo_empleadora",     -- área (nombre heredado)
    "id_gerencia_evaluado" = e."id_unidad_empleadora",     -- gerencia (nombre heredado)
    "tipo_evaluador" = CASE
      WHEN ec."id_evaluador" = ec."id_evaluado" THEN 'AUTO'
      WHEN e."codigo_empleado_jefe" IS NOT NULL AND (
        SELECT ev."codigo_empleado" FROM "empleado" ev
        WHERE ev."id_empleado" = ec."id_evaluador"
      ) = e."codigo_empleado_jefe" THEN 'JEFE'
      WHEN (
        SELECT ev."codigo_empleado_jefe" FROM "empleado" ev
        WHERE ev."id_empleado" = ec."id_evaluador"
      ) = e."codigo_empleado" THEN 'SUBORDINADO'
      ELSE 'OTRO'
    END
FROM "empleado" e
WHERE e."id_empleado" = ec."id_evaluado";

-- Objetivos: la campaña vigente de la empresa del trabajador.
UPDATE "objetivo" o
SET "periodo_evaluacion" = substring(emp."periodo_evaluacion" FROM 1 FOR 7)
FROM "empleado" e
JOIN "empresa_empleadora" emp
  ON emp."id_empresa_empleadora" = e."id_empresa_empleadora"
WHERE e."id_empleado" = o."idEmpleado";

-- Evidencias: la de lo que sustentan; si no, la de la empresa.
UPDATE "evidencia" ev
SET "periodo_evaluacion" = COALESCE(
  (SELECT ec."periodo_evaluacion" FROM "evaluacion_competencia" ec
   WHERE ec."idEvaluacionCompetencia" = ev."id_evaluacion_competencia"),
  (SELECT o."periodo_evaluacion" FROM "objetivo" o
   WHERE o."id_objetivo" = ev."id_objetivo"),
  (SELECT substring(emp."periodo_evaluacion" FROM 1 FOR 7)
   FROM "empleado" e
   JOIN "empresa_empleadora" emp
     ON emp."id_empresa_empleadora" = e."id_empresa_empleadora"
   WHERE e."id_empleado" = ev."id_empleado")
);
