/*
  Warnings:

  - You are about to drop the column `fecha_vigencia_fin` on the `objetivo` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_vigencia_inicia` on the `objetivo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "empresa_empleadora" ADD COLUMN     "fecha_vigencia_fin_objetivo" TIMESTAMP(3),
ADD COLUMN     "fecha_vigencia_inicio_objetivo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "objetivo" DROP COLUMN "fecha_vigencia_fin",
DROP COLUMN "fecha_vigencia_inicia";
