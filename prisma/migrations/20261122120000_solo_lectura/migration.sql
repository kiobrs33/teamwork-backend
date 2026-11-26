-- Nivel de acceso de las cuentas de gestión (ayudantes de TeamWork y
-- administradores de empresa): Edición (false) o Solo lectura (true).
-- Las cuentas existentes quedan con Edición.
ALTER TABLE "usuario" ADD COLUMN "solo_lectura" BOOLEAN NOT NULL DEFAULT false;
