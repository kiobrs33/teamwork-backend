/*
  Warnings:

  - You are about to drop the column `objetivoEmpresa` on the `empresa_empleadora` table. All the data in the column will be lost.
  - You are about to drop the column `id_empresa_empleadora` on the `objetivo` table. All the data in the column will be lost.
  - Added the required column `cantidadObjetivo` to the `empresa_empleadora` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "objetivo" DROP CONSTRAINT "objetivo_id_empresa_empleadora_fkey";

-- AlterTable
ALTER TABLE "empresa_empleadora" DROP COLUMN "objetivoEmpresa",
ADD COLUMN     "cantidadObjetivo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "objetivo" DROP COLUMN "id_empresa_empleadora";
