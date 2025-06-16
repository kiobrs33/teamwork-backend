/*
  Warnings:

  - You are about to drop the column `correo_electronico` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the `equipo_empleadora` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unidad_empleadora` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `documento` to the `empleado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_unidad_ocupacional_empleadora` to the `empleado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sede` to the `empleado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tiempo_empresa_unidad` to the `empleado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tiempo_empresa_valor` to the `empleado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modeloEmpresa` to the `empresa_empleadora` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objetivoEmpresa` to the `empresa_empleadora` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ponderacion` to the `objetivo_detalle` table without a default value. This is not possible if the table is not empty.
  - Made the column `descripcion` on table `objetivo_detalle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `descripcion_iniciativa` on table `objetivo_detalle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unidad_medida` on table `objetivo_detalle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `peso_especifico` on table `objetivo_detalle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "empleado" DROP CONSTRAINT "empleado_id_equipo_empleadora_fkey";

-- DropForeignKey
ALTER TABLE "empleado" DROP CONSTRAINT "empleado_id_unidad_empleadora_fkey";

-- DropForeignKey
ALTER TABLE "equipo_empleadora" DROP CONSTRAINT "equipo_empleadora_id_empresa_empleadora_fkey";

-- DropForeignKey
ALTER TABLE "unidad_empleadora" DROP CONSTRAINT "unidad_empleadora_id_empresa_empleadora_fkey";

-- AlterTable
ALTER TABLE "empleado" ADD COLUMN     "documento" INTEGER NOT NULL,
ADD COLUMN     "id_unidad_ocupacional_empleadora" INTEGER NOT NULL,
ADD COLUMN     "sede" TEXT NOT NULL,
ADD COLUMN     "tiempo_empresa_unidad" TEXT NOT NULL,
ADD COLUMN     "tiempo_empresa_valor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "empresa_empleadora" ADD COLUMN     "modeloEmpresa" TEXT NOT NULL,
ADD COLUMN     "objetivoEmpresa" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "objetivo_detalle" ADD COLUMN     "ponderacion" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "descripcion" SET NOT NULL,
ALTER COLUMN "descripcion_iniciativa" SET NOT NULL,
ALTER COLUMN "unidad_medida" SET NOT NULL,
ALTER COLUMN "peso_especifico" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "correo_electronico";

-- DropTable
DROP TABLE "equipo_empleadora";

-- DropTable
DROP TABLE "unidad_empleadora";

-- CreateTable
CREATE TABLE "area_empleadora" (
    "id_equipo_empleadora" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "area_empleadora_pkey" PRIMARY KEY ("id_equipo_empleadora")
);

-- CreateTable
CREATE TABLE "gerencia_empleadora" (
    "id_unidad_empleadora" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "gerencia_empleadora_pkey" PRIMARY KEY ("id_unidad_empleadora")
);

-- CreateTable
CREATE TABLE "unidad_ocupacional_empleadora" (
    "id_unidad_ocupacional_empleadora" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "unidad_ocupacional_empleadora_pkey" PRIMARY KEY ("id_unidad_ocupacional_empleadora")
);

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_equipo_empleadora_fkey" FOREIGN KEY ("id_equipo_empleadora") REFERENCES "area_empleadora"("id_equipo_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_unidad_empleadora_fkey" FOREIGN KEY ("id_unidad_empleadora") REFERENCES "gerencia_empleadora"("id_unidad_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_unidad_ocupacional_empleadora_fkey" FOREIGN KEY ("id_unidad_ocupacional_empleadora") REFERENCES "unidad_ocupacional_empleadora"("id_unidad_ocupacional_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_empleadora" ADD CONSTRAINT "area_empleadora_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gerencia_empleadora" ADD CONSTRAINT "gerencia_empleadora_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_ocupacional_empleadora" ADD CONSTRAINT "unidad_ocupacional_empleadora_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;
