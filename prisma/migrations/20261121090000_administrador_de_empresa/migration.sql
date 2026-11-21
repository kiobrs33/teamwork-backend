-- Administrador de empresa (rol ADMIN_EMPRESA): una cuenta por persona de
-- RR. HH., atada a la empresa que administra. Solo agrega columnas opcionales:
-- los usuarios existentes no cambian.
ALTER TABLE "usuario" ADD COLUMN "nombre_completo" TEXT;
ALTER TABLE "usuario" ADD COLUMN "id_empresa_empleadora" INTEGER;

ALTER TABLE "usuario"
  ADD CONSTRAINT "usuario_id_empresa_empleadora_fkey"
  FOREIGN KEY ("id_empresa_empleadora")
  REFERENCES "empresa_empleadora"("id_empresa_empleadora")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "usuario_id_empresa_empleadora_idx" ON "usuario"("id_empresa_empleadora");
