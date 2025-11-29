/*
  Warnings:

  - You are about to drop the column `codigo` on the `competencia` table. All the data in the column will be lost.
  - You are about to drop the column `nivel` on the `competencia` table. All the data in the column will be lost.
  - You are about to drop the `competencia_detalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluacion_competencia_detalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unidad_ocupacional_empleadora_competencia` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nombre` to the `competencia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "competencia_detalle" DROP CONSTRAINT "competencia_detalle_id_competencia_fkey";

-- DropForeignKey
ALTER TABLE "evaluacion_competencia_detalle" DROP CONSTRAINT "evaluacion_competencia_detalle_id_competencia_detalle_fkey";

-- DropForeignKey
ALTER TABLE "evaluacion_competencia_detalle" DROP CONSTRAINT "evaluacion_competencia_detalle_id_empleado_evaluado_fkey";

-- DropForeignKey
ALTER TABLE "evaluacion_competencia_detalle" DROP CONSTRAINT "evaluacion_competencia_detalle_id_empleado_evaluador_fkey";

-- DropForeignKey
ALTER TABLE "unidad_ocupacional_empleadora_competencia" DROP CONSTRAINT "unidad_ocupacional_empleadora_competencia_idCompetencia_fkey";

-- DropForeignKey
ALTER TABLE "unidad_ocupacional_empleadora_competencia" DROP CONSTRAINT "unidad_ocupacional_empleadora_competencia_idUnidadOcupacio_fkey";

-- AlterTable
ALTER TABLE "competencia" DROP COLUMN "codigo",
DROP COLUMN "nivel",
ADD COLUMN     "nombre" TEXT NOT NULL;

-- DropTable
DROP TABLE "competencia_detalle";

-- DropTable
DROP TABLE "evaluacion_competencia_detalle";

-- DropTable
DROP TABLE "unidad_ocupacional_empleadora_competencia";

-- CreateTable
CREATE TABLE "competencia_nivel" (
    "id_competencia_nivel" SERIAL NOT NULL,
    "nivel" INTEGER NOT NULL,
    "id_competencia" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "competencia_nivel_pkey" PRIMARY KEY ("id_competencia_nivel")
);

-- CreateTable
CREATE TABLE "competencia_nivel_item" (
    "id_competencia_nivel_item" SERIAL NOT NULL,
    "enunciado" TEXT NOT NULL,
    "secuencial" INTEGER NOT NULL,
    "id_competencia_nivel" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "competencia_nivel_item_pkey" PRIMARY KEY ("id_competencia_nivel_item")
);

-- CreateTable
CREATE TABLE "unidad_ocupacional_competencia_nivel" (
    "id_unidad_ocupacional_competencia_nivel" SERIAL NOT NULL,
    "id_unidad_ocupacional_empleadora" INTEGER NOT NULL,
    "id_competencia" INTEGER NOT NULL,
    "id_competencia_nivel" INTEGER NOT NULL,

    CONSTRAINT "unidad_ocupacional_competencia_nivel_pkey" PRIMARY KEY ("id_unidad_ocupacional_competencia_nivel")
);

-- CreateTable
CREATE TABLE "evaluacion_competencia" (
    "idEvaluacionCompetencia" SERIAL NOT NULL,
    "id_evaluado" INTEGER,
    "id_evaluador" INTEGER,
    "id_competencia" INTEGER NOT NULL,
    "id_competencia_nivel" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "evaluacion_competencia_pkey" PRIMARY KEY ("idEvaluacionCompetencia")
);

-- CreateIndex
CREATE UNIQUE INDEX "unidad_ocupacional_competencia_nivel_id_unidad_ocupacional__key" ON "unidad_ocupacional_competencia_nivel"("id_unidad_ocupacional_empleadora", "id_competencia");

-- AddForeignKey
ALTER TABLE "competencia_nivel" ADD CONSTRAINT "competencia_nivel_id_competencia_fkey" FOREIGN KEY ("id_competencia") REFERENCES "competencia"("id_competencia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencia_nivel_item" ADD CONSTRAINT "competencia_nivel_item_id_competencia_nivel_fkey" FOREIGN KEY ("id_competencia_nivel") REFERENCES "competencia_nivel"("id_competencia_nivel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_ocupacional_competencia_nivel" ADD CONSTRAINT "unidad_ocupacional_competencia_nivel_id_unidad_ocupacional_fkey" FOREIGN KEY ("id_unidad_ocupacional_empleadora") REFERENCES "unidad_ocupacional_empleadora"("id_unidad_ocupacional_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_ocupacional_competencia_nivel" ADD CONSTRAINT "unidad_ocupacional_competencia_nivel_id_competencia_fkey" FOREIGN KEY ("id_competencia") REFERENCES "competencia"("id_competencia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_ocupacional_competencia_nivel" ADD CONSTRAINT "unidad_ocupacional_competencia_nivel_id_competencia_nivel_fkey" FOREIGN KEY ("id_competencia_nivel") REFERENCES "competencia_nivel"("id_competencia_nivel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia" ADD CONSTRAINT "evaluacion_competencia_id_evaluado_fkey" FOREIGN KEY ("id_evaluado") REFERENCES "empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia" ADD CONSTRAINT "evaluacion_competencia_id_evaluador_fkey" FOREIGN KEY ("id_evaluador") REFERENCES "empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia" ADD CONSTRAINT "evaluacion_competencia_id_competencia_fkey" FOREIGN KEY ("id_competencia") REFERENCES "competencia"("id_competencia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_competencia" ADD CONSTRAINT "evaluacion_competencia_id_competencia_nivel_fkey" FOREIGN KEY ("id_competencia_nivel") REFERENCES "competencia_nivel"("id_competencia_nivel") ON DELETE RESTRICT ON UPDATE CASCADE;
