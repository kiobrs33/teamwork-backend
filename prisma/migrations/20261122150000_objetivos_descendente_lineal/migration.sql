-- Metas DESCENDENTES: fórmula lineal (2 − logrado ÷ meta) × 100, mínimo 0.
-- Antes era meta ÷ logrado: el 0 quedaba fijo en 100 % (menos que lograr 1)
-- y cerca de cero los porcentajes se disparaban. El servidor ya calcula con
-- la fórmula nueva; aquí se recalculan las metas YA CALIFICADAS de las
-- campañas EN CURSO, para que toda la campaña se mida con la misma regla.
-- Las campañas cerradas conservan su cálculo.
-- Meta 0 ("cero accidentes"): 100 si se logró 0, si no 0 (igual que antes).
UPDATE "objetivo_detalle" AS d
SET "porcentaje_logrado" = CASE
      WHEN d."meta_objetivo" <= 0 THEN
        CASE WHEN d."meta_alcanzada" <= 0 THEN 100 ELSE 0 END
      ELSE round(
        greatest(0, (2 - d."meta_alcanzada" / d."meta_objetivo") * 100)::numeric,
        2
      )::double precision
    END
FROM "objetivo" AS o
JOIN "campana_evaluacion" AS c
  ON c."id_campana_evaluacion" = o."id_campana_evaluacion"
WHERE d."id_objetivo" = o."id_objetivo"
  AND d."tipo_calculo" = 'DESCENDENTE'
  AND d."meta_alcanzada" IS NOT NULL
  AND c."estado" = 'EN_CURSO';
