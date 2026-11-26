-- Situación laboral del trabajador (ACTIVO | SUSPENDIDO | CESADO) y tipo de
-- documento (DNI | CE | PASAPORTE). Aditiva: no borra ni cambia datos.

ALTER TABLE "empleado" ADD COLUMN "tipo_documento" TEXT NOT NULL DEFAULT 'DNI';
ALTER TABLE "empleado" ADD COLUMN "situacion" TEXT NOT NULL DEFAULT 'ACTIVO';
ALTER TABLE "empleado" ADD COLUMN "fecha_situacion" TIMESTAMP(3);
ALTER TABLE "empleado" ADD COLUMN "motivo_situacion" TEXT;

-- Las bajas que ya existían pasan a CESADO, con la fecha de su última
-- modificación (la de la baja) y un motivo que dice de dónde vienen.
UPDATE "empleado"
SET "situacion" = 'CESADO',
    "fecha_situacion" = COALESCE("fecha_modificacion", "fecha_creacion"),
    "motivo_situacion" = 'Dado de baja antes de registrar la situación laboral'
WHERE "estado" = false;

CREATE INDEX "empleado_id_empresa_empleadora_tipo_documento_documento_idx"
  ON "empleado"("id_empresa_empleadora", "tipo_documento", "documento");
CREATE INDEX "empleado_id_empresa_empleadora_situacion_idx"
  ON "empleado"("id_empresa_empleadora", "situacion");
