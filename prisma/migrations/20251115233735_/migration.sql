/*
  Warnings:

  - Made the column `codigo_empleado` on table `empleado` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "empleado" ALTER COLUMN "tiempo_empresa_unidad" SET DEFAULT 'DIAS',
ALTER COLUMN "codigo_empleado" SET NOT NULL;
