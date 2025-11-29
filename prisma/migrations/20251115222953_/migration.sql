/*
  Warnings:

  - You are about to drop the column `id_empleado_jefe` on the `empleado` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo_empleado]` on the table `empleado` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "empleado" DROP CONSTRAINT "empleado_id_empleado_jefe_fkey";

-- AlterTable
ALTER TABLE "empleado" DROP COLUMN "id_empleado_jefe",
ADD COLUMN     "codigo_empleado" TEXT,
ADD COLUMN     "codigo_empleado_jefe" TEXT,
ALTER COLUMN "documento" DROP NOT NULL,
ALTER COLUMN "documento" SET DATA TYPE TEXT,
ALTER COLUMN "sede" DROP NOT NULL,
ALTER COLUMN "tiempo_empresa_unidad" DROP NOT NULL,
ALTER COLUMN "tiempo_empresa_valor" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "empleado_codigo_empleado_key" ON "empleado"("codigo_empleado");
