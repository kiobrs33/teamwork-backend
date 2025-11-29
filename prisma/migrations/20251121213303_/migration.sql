-- AlterTable
ALTER TABLE "evaluacion_competencia" ADD COLUMN     "comentarioGeneral" TEXT,
ADD COLUMN     "estadoEvaluacion" TEXT NOT NULL DEFAULT 'PROCESO';

-- CreateTable
CREATE TABLE "evaluacion_competencia_item" (
    "id_evaluacion_competencia_item" SERIAL NOT NULL,
    "id_evaluacion_competencia" INTEGER NOT NULL,
    "id_competencia_nivel_item" INTEGER NOT NULL,
    "calificacion" INTEGER,
    "textoItemEvaluado" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "evaluacion_competencia_item_pkey" PRIMARY KEY ("id_evaluacion_competencia_item")
);

-- AddForeignKey
ALTER TABLE "evaluacion_competencia_item" ADD CONSTRAINT "evaluacion_competencia_item_id_evaluacion_competencia_fkey" FOREIGN KEY ("id_evaluacion_competencia") REFERENCES "evaluacion_competencia"("idEvaluacionCompetencia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia_item" ADD CONSTRAINT "evaluacion_competencia_item_id_competencia_nivel_item_fkey" FOREIGN KEY ("id_competencia_nivel_item") REFERENCES "competencia_nivel_item"("id_competencia_nivel_item") ON DELETE RESTRICT ON UPDATE CASCADE;
