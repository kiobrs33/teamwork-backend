-- 1) Fechas de culminación importadas en 1970.
-- El importador de objetivos pasaba el número de serie de Excel (días desde
-- 1899-12-30) a dayjs, que lo leía como milisegundos: 46022 (31/12/2025)
-- quedaba como 1970-01-01 00:00:46.022. El número sigue ahí, así que la
-- fecha real se recupera con exactitud. Solo toca fechas anteriores a 1971.
UPDATE "objetivo_detalle"
SET "fecha_culminacion" =
  (DATE '1899-12-30' + ROUND(EXTRACT(EPOCH FROM "fecha_culminacion") * 1000)::int)::timestamp
WHERE "fecha_culminacion" < TIMESTAMP '1971-01-01'
  AND ROUND(EXTRACT(EPOCH FROM "fecha_culminacion") * 1000) BETWEEN 36526 AND 73051;

-- 2) Unidad de medida en mayúsculas: convivían "Porcentaje" y "PORCENTAJE",
-- "Unidad" y "UNIDAD".
UPDATE "objetivo_detalle"
SET "unidad_medida" = UPPER(TRIM("unidad_medida"))
WHERE "unidad_medida" IS DISTINCT FROM UPPER(TRIM("unidad_medida"));
