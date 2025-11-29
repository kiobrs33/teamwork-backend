/*
  Warnings:

  - You are about to drop the column `cantidadObjetivos` on the `empresa_empleadora` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ruc]` on the table `empresa_empleadora` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "empresa_empleadora" DROP COLUMN "cantidadObjetivos";

-- CreateIndex
CREATE UNIQUE INDEX "empresa_empleadora_ruc_key" ON "empresa_empleadora"("ruc");
