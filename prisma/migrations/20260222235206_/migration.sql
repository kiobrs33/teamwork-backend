/*
  Warnings:

  - You are about to drop the column `porcentaje_autoevaluacion_compet` on the `empresa_empleadora` table. All the data in the column will be lost.
  - You are about to drop the column `porcentaje_jefe_compet` on the `empresa_empleadora` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_calificacion_compet` on the `empresa_empleadora` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "empresa_empleadora" DROP COLUMN "porcentaje_autoevaluacion_compet",
DROP COLUMN "porcentaje_jefe_compet",
DROP COLUMN "tipo_calificacion_compet",
ADD COLUMN     "porcentaje_autoevaluacion_competencia" INTEGER,
ADD COLUMN     "porcentaje_jefe_competencia" INTEGER,
ADD COLUMN     "tipo_calificacion_objetivo" TEXT DEFAULT 'LIKERT';
