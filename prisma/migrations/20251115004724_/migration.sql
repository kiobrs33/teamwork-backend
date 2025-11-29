/*
  Warnings:

  - Added the required column `codigo` to the `competencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "competencia" ADD COLUMN     "codigo" TEXT NOT NULL;
