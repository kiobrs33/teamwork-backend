-- Fecha de ingreso en vez de "antigüedad" escrita a mano (un número que
-- quedaba desactualizado al día siguiente).
ALTER TABLE "empleado" ADD COLUMN "fecha_ingreso" DATE;

-- Los que ya tenían antigüedad: fecha aproximada = día en que se los
-- registró menos esa antigüedad. Las columnas viejas se conservan.
-- "0 días" era el valor por defecto, no un dato (SEAL tenía 215 así): queda
-- sin fecha. "0 años" sí es un dato (menos de un año) y se conserva.
UPDATE "empleado"
SET "fecha_ingreso" = ("fecha_creacion" - CASE "tiempo_empresa_unidad"
    WHEN 'AÑOS'  THEN make_interval(years  => "tiempo_empresa_valor")
    WHEN 'MESES' THEN make_interval(months => "tiempo_empresa_valor")
    ELSE              make_interval(days   => "tiempo_empresa_valor")
  END)::date
WHERE "tiempo_empresa_valor" IS NOT NULL
  AND NOT ("tiempo_empresa_valor" = 0
           AND coalesce("tiempo_empresa_unidad", 'DIAS') = 'DIAS');
