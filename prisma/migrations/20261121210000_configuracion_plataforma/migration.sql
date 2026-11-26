-- Configuración de la plataforma TeamWork (una sola fila): el color primario
-- de la consola, que elige el dueño. Null = el azul por defecto.
CREATE TABLE "configuracion_plataforma" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "color_primario" TEXT,
    "fecha_modificacion" TIMESTAMP(3),
    "actualizado_por_id" INTEGER,

    CONSTRAINT "configuracion_plataforma_pkey" PRIMARY KEY ("id")
);
