/*
  Warnings:

  - Added the required column `secuencial` to the `competencia_detalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "competencia_detalle" ADD COLUMN     "secuencial" INTEGER NOT NULL;
