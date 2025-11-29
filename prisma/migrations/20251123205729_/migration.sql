/*
  Warnings:

  - You are about to drop the column `id_empleado` on the `objetivo` table. All the data in the column will be lost.
  - Added the required column `idEmpleado` to the `objetivo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_calculo` to the `objetivo_detalle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "objetivo" DROP CONSTRAINT "objetivo_id_empleado_fkey";

-- AlterTable
ALTER TABLE "objetivo" DROP COLUMN "id_empleado",
ADD COLUMN     "idEmpleado" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "objetivo_detalle" ADD COLUMN     "tipo_calculo" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_idEmpleado_fkey" FOREIGN KEY ("idEmpleado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;
