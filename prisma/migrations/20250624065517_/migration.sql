/*
  Warnings:

  - You are about to drop the column `ponderacion` on the `objetivo_detalle` table. All the data in the column will be lost.
  - Added the required column `meta_objetivo` to the `objetivo_detalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "objetivo_detalle" DROP COLUMN "ponderacion",
ADD COLUMN     "meta_alcanzada" DOUBLE PRECISION,
ADD COLUMN     "meta_objetivo" DOUBLE PRECISION NOT NULL;
