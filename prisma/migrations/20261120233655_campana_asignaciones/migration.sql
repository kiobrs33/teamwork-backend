-- CreateTable
CREATE TABLE "campana_asignacion" (
    "id_campana_asignacion" SERIAL NOT NULL,
    "id_campana_evaluacion" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "id_competencia" INTEGER NOT NULL,
    "id_competencia_nivel" INTEGER NOT NULL,

    CONSTRAINT "campana_asignacion_pkey" PRIMARY KEY ("id_campana_asignacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "campana_asignacion_id_campana_evaluacion_id_empleado_id_com_key" ON "campana_asignacion"("id_campana_evaluacion", "id_empleado", "id_competencia");

-- AddForeignKey
ALTER TABLE "campana_asignacion" ADD CONSTRAINT "campana_asignacion_id_campana_evaluacion_fkey" FOREIGN KEY ("id_campana_evaluacion") REFERENCES "campana_evaluacion"("id_campana_evaluacion") ON DELETE RESTRICT ON UPDATE CASCADE;
