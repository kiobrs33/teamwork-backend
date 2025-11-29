/*
  Warnings:

  - You are about to drop the column `apellido_materno` on the `empleado` table. All the data in the column will be lost.
  - You are about to drop the column `apellido_paterno` on the `empleado` table. All the data in the column will be lost.
  - Added the required column `id_empresa_empleadora` to the `competencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellidos` to the `empleado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "competencia" ADD COLUMN     "id_empresa_empleadora" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "empleado" DROP COLUMN "apellido_materno",
DROP COLUMN "apellido_paterno",
ADD COLUMN     "apellidos" TEXT NOT NULL,
ADD COLUMN     "id_empleado_jefe" INTEGER,
ADD COLUMN     "id_jefe" INTEGER;

-- CreateTable
CREATE TABLE "evaluacion_competencia_detalle" (
    "idEvaluacionCompetencia" SERIAL NOT NULL,
    "id_empleado_evaluado" INTEGER NOT NULL,
    "id_competencia_detalle" INTEGER NOT NULL,
    "id_empleado_evaluador" INTEGER,
    "calificacion" INTEGER NOT NULL,
    "fecha_evaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "evaluacion_competencia_detalle_pkey" PRIMARY KEY ("idEvaluacionCompetencia")
);

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_empleado_jefe_fkey" FOREIGN KEY ("id_empleado_jefe") REFERENCES "empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencia" ADD CONSTRAINT "competencia_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia_detalle" ADD CONSTRAINT "evaluacion_competencia_detalle_id_empleado_evaluado_fkey" FOREIGN KEY ("id_empleado_evaluado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia_detalle" ADD CONSTRAINT "evaluacion_competencia_detalle_id_competencia_detalle_fkey" FOREIGN KEY ("id_competencia_detalle") REFERENCES "competencia_detalle"("id_competencia_detalle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia_detalle" ADD CONSTRAINT "evaluacion_competencia_detalle_id_empleado_evaluador_fkey" FOREIGN KEY ("id_empleado_evaluador") REFERENCES "empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;
