/*
  Warnings:

  - You are about to drop the column `porcentaje_autoevaluacion_competencia` on the `empresa_empleadora` table. All the data in the column will be lost.
  - You are about to drop the column `porcentaje_jefe_competencia` on the `empresa_empleadora` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "empresa_empleadora" DROP COLUMN "porcentaje_autoevaluacion_competencia",
DROP COLUMN "porcentaje_jefe_competencia",
ADD COLUMN     "porcentaje_evaluacion_jefe_competencia" INTEGER,
ADD COLUMN     "porcentaje_evaluacion_subordinado_competencia" INTEGER;
