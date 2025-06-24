/*
  Warnings:

  - You are about to drop the column `cantidadObjetivo` on the `empresa_empleadora` table. All the data in the column will be lost.
  - Added the required column `cantidadObjetivos` to the `empresa_empleadora` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "empresa_empleadora" DROP COLUMN "cantidadObjetivo",
ADD COLUMN     "cantidadObjetivos" TEXT NOT NULL;
