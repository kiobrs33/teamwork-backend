/*
  Warnings:

  - Added the required column `creado_por_id` to the `unidad_ocupacional_empleadora_competencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "competencia_detalle" ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "unidad_ocupacional_empleadora_competencia" ADD COLUMN     "actualizado_por_id" INTEGER,
ADD COLUMN     "creado_por_id" INTEGER NOT NULL,
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_modificacion" TIMESTAMP(3);
