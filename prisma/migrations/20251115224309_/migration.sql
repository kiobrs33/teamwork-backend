/*
  Warnings:

  - A unique constraint covering the columns `[codigo_usuario]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usuario_codigo_usuario_key" ON "usuario"("codigo_usuario");
