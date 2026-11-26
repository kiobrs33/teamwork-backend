-- Color primario de cada empresa: el sistema lo usa para que su gente lo
-- sienta suyo. Null = el azul por defecto.
ALTER TABLE "empresa_empleadora" ADD COLUMN "color_primario" TEXT;
