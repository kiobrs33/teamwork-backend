-- Cuentas de trabajadores por empresa: el mismo DNI puede ser usuario en
-- varias empresas (una persona que pasó por más de un cliente). Las cuentas
-- del sistema (dueño, equipo de TeamWork, RR. HH.) siguen únicas en todo el
-- sistema; eso lo comprueba el servicio (los NULL no chocan en un índice).
ALTER TABLE "usuario" ADD COLUMN "id_empresa_cuenta" INTEGER;

UPDATE "usuario" u
SET "id_empresa_cuenta" = e."id_empresa_empleadora"
FROM "empleado" e
WHERE e."id_usuario" = u."id_usuario"
  AND u."rol" IN ('JEFE', 'EMPLEADO');

DROP INDEX "usuario_codigo_usuario_key";

CREATE UNIQUE INDEX "usuario_id_empresa_cuenta_codigo_usuario_key"
  ON "usuario"("id_empresa_cuenta", "codigo_usuario");

CREATE INDEX "usuario_codigo_usuario_idx" ON "usuario"("codigo_usuario");
