/*
  Warnings:

  - A unique constraint covering the columns `[id_usuario]` on the table `empleado` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "empleado_id_usuario_key" ON "empleado"("id_usuario");
