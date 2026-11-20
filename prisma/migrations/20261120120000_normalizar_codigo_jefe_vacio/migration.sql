-- "Sin jefe" se guardaba a veces como '' y a veces como NULL (el alta del
-- front inicializaba el campo en ''). El servicio ya normaliza a NULL al
-- escribir; esto alinea las filas existentes.
UPDATE "empleado" SET "codigo_empleado_jefe" = NULL WHERE TRIM("codigo_empleado_jefe") = '';
