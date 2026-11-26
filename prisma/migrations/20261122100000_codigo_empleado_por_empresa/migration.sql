-- El código de empleado deja de ser único en todo el sistema y pasa a serlo
-- dentro de cada empresa: dos empresas pueden usar el mismo código interno
-- ("EMP-001") o la misma persona trabajar en dos clientes con su DNI.
DROP INDEX "empleado_codigo_empleado_key";

CREATE UNIQUE INDEX "empleado_id_empresa_empleadora_codigo_empleado_key"
  ON "empleado"("id_empresa_empleadora", "codigo_empleado");
