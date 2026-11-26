-- El código de una competencia es único en su empresa (sin distinguir
-- mayúsculas ni espacios de los extremos), entre las vigentes. El servicio
-- ya lo comprobaba (`exigirCodigoLibre`); el índice cierra la carrera de dos
-- altas simultáneas. Parcial (solo `estado`): una eliminada libera el código.
-- Prisma no modela índices parciales ni por expresión: vive solo aquí.
CREATE UNIQUE INDEX "competencia_empresa_codigo_vigente_key"
  ON "competencia" ("id_empresa_empleadora", LOWER(BTRIM("codigo")))
  WHERE "estado";
