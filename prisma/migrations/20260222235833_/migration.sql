/*
  Warnings:

  - You are about to drop the column `tipo_calificacion_objetivo` on the `empresa_empleadora` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "empresa_empleadora" DROP COLUMN "tipo_calificacion_objetivo",
ADD COLUMN     "tipo_calificacion_competencia" TEXT DEFAULT 'LIKERT';
