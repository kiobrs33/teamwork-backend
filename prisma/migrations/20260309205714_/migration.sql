-- AlterTable
ALTER TABLE "empresa_empleadora" ADD COLUMN     "competencia_resultado_esperado" INTEGER,
ADD COLUMN     "periodo_evaluacion" TEXT;

-- CreateTable
CREATE TABLE "retroalimentacion_detalle" (
    "id_retroalimentacion_detalle" SERIAL NOT NULL,
    "id_objetivo" INTEGER NOT NULL,
    "descripcion_objetivo" TEXT,
    "descripcion_actividad" TEXT,
    "descripcion_fecha" TEXT,
    "descripcion_estado" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "retroalimentacion_detalle_pkey" PRIMARY KEY ("id_retroalimentacion_detalle")
);

-- AddForeignKey
ALTER TABLE "retroalimentacion_detalle" ADD CONSTRAINT "retroalimentacion_detalle_id_objetivo_fkey" FOREIGN KEY ("id_objetivo") REFERENCES "objetivo"("id_objetivo") ON DELETE RESTRICT ON UPDATE CASCADE;
