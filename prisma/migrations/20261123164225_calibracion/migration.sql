-- CreateTable
CREATE TABLE "ajuste_calibracion" (
    "id_ajuste_calibracion" SERIAL NOT NULL,
    "id_campana_evaluacion" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "competencias" DOUBLE PRECISION,
    "objetivos" DOUBLE PRECISION,
    "competencias_original" DOUBLE PRECISION,
    "objetivos_original" DOUBLE PRECISION,
    "motivo" TEXT NOT NULL,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "ajuste_calibracion_pkey" PRIMARY KEY ("id_ajuste_calibracion")
);

-- CreateIndex
CREATE UNIQUE INDEX "ajuste_calibracion_id_campana_evaluacion_id_empleado_key" ON "ajuste_calibracion"("id_campana_evaluacion", "id_empleado");

-- AddForeignKey
ALTER TABLE "ajuste_calibracion" ADD CONSTRAINT "ajuste_calibracion_id_campana_evaluacion_fkey" FOREIGN KEY ("id_campana_evaluacion") REFERENCES "campana_evaluacion"("id_campana_evaluacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajuste_calibracion" ADD CONSTRAINT "ajuste_calibracion_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;
