-- ============================================================
-- La campaña pasa a ser una entidad propia: nombre, periodo evaluado
-- (rango de fechas), vigencias del proceso, configuración y estado.
-- Evaluaciones, objetivos y evidencias se enlazan por id.
--
-- Las columnas obligatorias se agregan primero como opcionales, se
-- rellenan y recién al final pasan a NOT NULL: ya puede haber campañas
-- cerradas en la tabla.
-- ============================================================

ALTER TABLE "campana_evaluacion"
  ADD COLUMN "nombre" TEXT,
  ADD COLUMN "periodo_desde" TIMESTAMP(3),
  ADD COLUMN "periodo_hasta" TIMESTAMP(3),
  ADD COLUMN "fecha_vigencia_inicio" TIMESTAMP(3),
  ADD COLUMN "fecha_vigencia_fin" TIMESTAMP(3),
  ADD COLUMN "fecha_vigencia_inicio_objetivo" TIMESTAMP(3),
  ADD COLUMN "fecha_vigencia_fin_objetivo" TIMESTAMP(3),
  ADD COLUMN "estado" TEXT NOT NULL DEFAULT 'EN_CURSO',
  ADD COLUMN "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "creado_por_id" INTEGER,
  ADD COLUMN "fecha_reapertura" TIMESTAMP(3),
  ADD COLUMN "reabierto_por_id" INTEGER,
  ALTER COLUMN "periodo_evaluacion" DROP NOT NULL,
  ALTER COLUMN "fecha_cierre" DROP NOT NULL,
  ALTER COLUMN "fecha_cierre" DROP DEFAULT;

ALTER TABLE "evaluacion_competencia" ADD COLUMN "id_campana_evaluacion" INTEGER;
ALTER TABLE "objetivo" ADD COLUMN "id_campana_evaluacion" INTEGER;
ALTER TABLE "evidencia" ADD COLUMN "id_campana_evaluacion" INTEGER;

-- ------------------------------------------------------------
-- Relleno
-- ------------------------------------------------------------

-- 1. Las campañas que ya estaban cerradas (filas existentes).
UPDATE "campana_evaluacion" SET "estado" = 'CERRADA';

-- 2. Una campaña por cada (empresa, periodo) que aparezca en los datos o
--    sea el periodo vigente de la empresa y que todavía no exista. La
--    vigente queda EN_CURSO; las demás, CERRADA. La configuración es la de
--    la empresa: es la única que hay para periodos anteriores a esta tabla.
WITH pares AS (
  SELECT e."id_empresa_empleadora" AS id_empresa, ec."periodo_evaluacion" AS periodo
  FROM "evaluacion_competencia" ec
  JOIN "empleado" e ON e."id_empleado" = ec."id_evaluado"
  WHERE ec."periodo_evaluacion" IS NOT NULL
  UNION
  SELECT e."id_empresa_empleadora", o."periodo_evaluacion"
  FROM "objetivo" o
  JOIN "empleado" e ON e."id_empleado" = o."idEmpleado"
  WHERE o."periodo_evaluacion" IS NOT NULL
  UNION
  SELECT e."id_empresa_empleadora", ev."periodo_evaluacion"
  FROM "evidencia" ev
  JOIN "empleado" e ON e."id_empleado" = ev."id_empleado"
  WHERE ev."periodo_evaluacion" IS NOT NULL
  UNION
  SELECT emp."id_empresa_empleadora", substring(emp."periodo_evaluacion" FROM 1 FOR 7)
  FROM "empresa_empleadora" emp
  WHERE emp."periodo_evaluacion" IS NOT NULL
)
INSERT INTO "campana_evaluacion" (
  "id_empresa_empleadora", "periodo_evaluacion", "estado", "fecha_cierre",
  "modelo_empresa", "porcentaje_competencias", "porcentaje_objetivos",
  "porcentaje_evaluacion_jefe", "porcentaje_evaluacion_subordinado",
  "tipo_calificacion", "resultado_esperado"
)
SELECT p.id_empresa, p.periodo,
       CASE WHEN p.periodo = substring(emp."periodo_evaluacion" FROM 1 FOR 7)
            THEN 'EN_CURSO' ELSE 'CERRADA' END,
       CASE WHEN p.periodo = substring(emp."periodo_evaluacion" FROM 1 FOR 7)
            THEN NULL ELSE CURRENT_TIMESTAMP END,
       emp."modeloEmpresa", emp."porcentaje_competencias", emp."porcentaje_objetivos",
       emp."porcentaje_evaluacion_jefe_competencia",
       emp."porcentaje_evaluacion_subordinado_competencia",
       emp."tipo_calificacion_competencia", emp."competencia_resultado_esperado"
FROM pares p
JOIN "empresa_empleadora" emp ON emp."id_empresa_empleadora" = p.id_empresa
WHERE p.periodo ~ '^\d{4}-\d{2}$'
  AND NOT EXISTS (
    SELECT 1 FROM "campana_evaluacion" c
    WHERE c."id_empresa_empleadora" = p.id_empresa
      AND c."periodo_evaluacion" = p.periodo
  );

-- 3. Nombre y periodo evaluado: el mes completo del periodo viejo. Es la
--    única información que había; el administrador puede corregirlo.
UPDATE "campana_evaluacion" c
SET "nombre" = 'Campaña ' ||
      (ARRAY['enero','febrero','marzo','abril','mayo','junio','julio',
             'agosto','septiembre','octubre','noviembre','diciembre'])
      [substring(c."periodo_evaluacion" FROM 6 FOR 2)::int]
      || ' ' || substring(c."periodo_evaluacion" FROM 1 FOR 4),
    "periodo_desde" = to_date(c."periodo_evaluacion" || '-01', 'YYYY-MM-DD'),
    "periodo_hasta" = (to_date(c."periodo_evaluacion" || '-01', 'YYYY-MM-DD')
                       + INTERVAL '1 month' - INTERVAL '1 day')
WHERE c."nombre" IS NULL;

-- 4. Vigencias: la en curso toma las de la empresa; las cerradas, las de la
--    empresa si existen o el propio mes (no se guardaron).
UPDATE "campana_evaluacion" c
SET "fecha_vigencia_inicio" = CASE WHEN c."estado" = 'EN_CURSO'
          THEN COALESCE(emp."fecha_vigencia_inicio", c."periodo_desde") ELSE c."periodo_desde" END,
    "fecha_vigencia_fin" = CASE WHEN c."estado" = 'EN_CURSO'
          THEN COALESCE(emp."fecha_vigencia_fin", c."periodo_hasta") ELSE c."periodo_hasta" END,
    "fecha_vigencia_inicio_objetivo" = CASE WHEN c."estado" = 'EN_CURSO'
          THEN emp."fecha_vigencia_inicio_objetivo" END,
    "fecha_vigencia_fin_objetivo" = CASE WHEN c."estado" = 'EN_CURSO'
          THEN emp."fecha_vigencia_fin_objetivo" END
FROM "empresa_empleadora" emp
WHERE emp."id_empresa_empleadora" = c."id_empresa_empleadora"
  AND c."fecha_vigencia_inicio" IS NULL;

-- 5. Enlaces por empresa + periodo.
UPDATE "evaluacion_competencia" ec
SET "id_campana_evaluacion" = c."id_campana_evaluacion"
FROM "empleado" e, "campana_evaluacion" c
WHERE e."id_empleado" = ec."id_evaluado"
  AND c."id_empresa_empleadora" = e."id_empresa_empleadora"
  AND c."periodo_evaluacion" = ec."periodo_evaluacion";

UPDATE "objetivo" o
SET "id_campana_evaluacion" = c."id_campana_evaluacion"
FROM "empleado" e, "campana_evaluacion" c
WHERE e."id_empleado" = o."idEmpleado"
  AND c."id_empresa_empleadora" = e."id_empresa_empleadora"
  AND c."periodo_evaluacion" = o."periodo_evaluacion";

UPDATE "evidencia" ev
SET "id_campana_evaluacion" = c."id_campana_evaluacion"
FROM "empleado" e, "campana_evaluacion" c
WHERE e."id_empleado" = ev."id_empleado"
  AND c."id_empresa_empleadora" = e."id_empresa_empleadora"
  AND c."periodo_evaluacion" = ev."periodo_evaluacion";

-- ------------------------------------------------------------
-- Restricciones
-- ------------------------------------------------------------
ALTER TABLE "campana_evaluacion"
  ALTER COLUMN "nombre" SET NOT NULL,
  ALTER COLUMN "periodo_desde" SET NOT NULL,
  ALTER COLUMN "periodo_hasta" SET NOT NULL,
  ALTER COLUMN "fecha_vigencia_inicio" SET NOT NULL,
  ALTER COLUMN "fecha_vigencia_fin" SET NOT NULL;

CREATE INDEX "campana_evaluacion_id_empresa_empleadora_estado_idx" ON "campana_evaluacion"("id_empresa_empleadora", "estado");
CREATE INDEX "evaluacion_competencia_id_campana_evaluacion_idx" ON "evaluacion_competencia"("id_campana_evaluacion");
CREATE INDEX "objetivo_id_campana_evaluacion_idx" ON "objetivo"("id_campana_evaluacion");

ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_id_campana_evaluacion_fkey" FOREIGN KEY ("id_campana_evaluacion") REFERENCES "campana_evaluacion"("id_campana_evaluacion") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evaluacion_competencia" ADD CONSTRAINT "evaluacion_competencia_id_campana_evaluacion_fkey" FOREIGN KEY ("id_campana_evaluacion") REFERENCES "campana_evaluacion"("id_campana_evaluacion") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_id_campana_evaluacion_fkey" FOREIGN KEY ("id_campana_evaluacion") REFERENCES "campana_evaluacion"("id_campana_evaluacion") ON DELETE SET NULL ON UPDATE CASCADE;
