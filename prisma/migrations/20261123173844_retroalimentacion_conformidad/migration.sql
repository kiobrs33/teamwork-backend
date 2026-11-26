-- CreateTable
CREATE TABLE "sesion_retroalimentacion" (
    "id_sesion_retroalimentacion" SERIAL NOT NULL,
    "id_campana_evaluacion" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "id_jefe" INTEGER NOT NULL,
    "fecha_sesion" DATE NOT NULL,
    "fortalezas" TEXT NOT NULL,
    "oportunidades" TEXT NOT NULL,
    "compromisos" TEXT NOT NULL,
    "conformidad" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "comentario_trabajador" TEXT,
    "fecha_respuesta" TIMESTAMP(3),
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "sesion_retroalimentacion_pkey" PRIMARY KEY ("id_sesion_retroalimentacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "sesion_retroalimentacion_id_campana_evaluacion_id_empleado_key" ON "sesion_retroalimentacion"("id_campana_evaluacion", "id_empleado");

-- AddForeignKey
ALTER TABLE "sesion_retroalimentacion" ADD CONSTRAINT "sesion_retroalimentacion_id_campana_evaluacion_fkey" FOREIGN KEY ("id_campana_evaluacion") REFERENCES "campana_evaluacion"("id_campana_evaluacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion_retroalimentacion" ADD CONSTRAINT "sesion_retroalimentacion_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion_retroalimentacion" ADD CONSTRAINT "sesion_retroalimentacion_id_jefe_fkey" FOREIGN KEY ("id_jefe") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;
