/*
  Warnings:

  - Added the required column `fecha_culminacion` to the `objetivo_detalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "objetivo_detalle" ADD COLUMN     "fecha_culminacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "porcentaje_logrado" DOUBLE PRECISION,
ALTER COLUMN "descripcion_iniciativa" DROP NOT NULL;
