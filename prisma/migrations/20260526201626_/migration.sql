-- CreateTable
CREATE TABLE "evidencia" (
    "idEvidencia" SERIAL NOT NULL,
    "id_evaluacion_competencia" INTEGER,
    "id_objetivo" INTEGER,
    "id_empleado" INTEGER NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "publicId" TEXT,
    "tipoArchivo" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "evidencia_pkey" PRIMARY KEY ("idEvidencia")
);

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_id_evaluacion_competencia_fkey" FOREIGN KEY ("id_evaluacion_competencia") REFERENCES "evaluacion_competencia"("idEvaluacionCompetencia") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_id_objetivo_fkey" FOREIGN KEY ("id_objetivo") REFERENCES "objetivo"("id_objetivo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;
