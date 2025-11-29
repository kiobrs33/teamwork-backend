/*
  Warnings:

  - The `rol` column on the `usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "empleado" ALTER COLUMN "tiempo_empresa_unidad" SET DEFAULT 'AÑOS';

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "rol",
ADD COLUMN     "rol" TEXT NOT NULL DEFAULT 'EMPLEADO';

-- DropEnum
DROP TYPE "rol";
