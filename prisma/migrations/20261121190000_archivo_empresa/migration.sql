-- Archivar una empresa (en vez de "eliminarla"): conserva todo y se puede
-- restaurar. La fecha dice desde cuándo está archivada.
ALTER TABLE "empresa_empleadora" ADD COLUMN "fecha_archivo" TIMESTAMP(3);
