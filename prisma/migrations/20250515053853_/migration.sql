/*
  Warnings:

  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employer_companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employer_positions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employer_teams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employer_units` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goal_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `master_table_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `master_tables` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'EMPLEADO');

-- DropForeignKey
ALTER TABLE "employer_positions" DROP CONSTRAINT "employer_positions_employer_company_id_fkey";

-- DropForeignKey
ALTER TABLE "employer_teams" DROP CONSTRAINT "employer_teams_employer_company_id_fkey";

-- DropForeignKey
ALTER TABLE "employer_units" DROP CONSTRAINT "employer_units_employer_company_id_fkey";

-- DropForeignKey
ALTER TABLE "goal_details" DROP CONSTRAINT "goal_details_goal_id_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "master_table_details" DROP CONSTRAINT "master_table_details_master_table_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_rol_id_fkey";

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "employer_companies";

-- DropTable
DROP TABLE "employer_positions";

-- DropTable
DROP TABLE "employer_teams";

-- DropTable
DROP TABLE "employer_units";

-- DropTable
DROP TABLE "goal_details";

-- DropTable
DROP TABLE "goals";

-- DropTable
DROP TABLE "master_table_details";

-- DropTable
DROP TABLE "master_tables";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "empleado" (
    "employee_id" SERIAL NOT NULL,
    "first_names" TEXT,
    "last_names" TEXT,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "user_code" TEXT,
    "correo_electronico" TEXT,
    "contrasena" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'EMPLEADO',
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "empresa_empleadora" (
    "id_empresa_empleadora" SERIAL NOT NULL,
    "nombre_empresa" TEXT,
    "ruc" TEXT,
    "direccion_empresa" TEXT,
    "url_logo" TEXT,
    "fecha_vigencia_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_vigencia_fin" TIMESTAMP(3) NOT NULL,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_empleadora_pkey" PRIMARY KEY ("id_empresa_empleadora")
);

-- CreateTable
CREATE TABLE "equipo_empleadora" (
    "employer_team_id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "idEmpresaEmpleadora" INTEGER NOT NULL,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipo_empleadora_pkey" PRIMARY KEY ("employer_team_id")
);

-- CreateTable
CREATE TABLE "puesto_empleadora" (
    "employer_position_id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "idEmpresaEmpleadora" INTEGER NOT NULL,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puesto_empleadora_pkey" PRIMARY KEY ("employer_position_id")
);

-- CreateTable
CREATE TABLE "unidad_empleadora" (
    "employer_unit_id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "idEmpresaEmpleadora" INTEGER NOT NULL,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidad_empleadora_pkey" PRIMARY KEY ("employer_unit_id")
);

-- CreateTable
CREATE TABLE "objetivo" (
    "objective_id" SERIAL NOT NULL,
    "fechaVigenciaInicia" TIMESTAMP(3) NOT NULL,
    "fechaVigenciaFin" TIMESTAMP(3) NOT NULL,
    "idEmpresaEmpleadora" INTEGER NOT NULL,
    "idEmpleado" INTEGER NOT NULL,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objetivo_pkey" PRIMARY KEY ("objective_id")
);

-- CreateTable
CREATE TABLE "objetivo_detalle" (
    "objective_detail_id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "descripcion_iniciativa" TEXT,
    "unidad_medida" TEXT,
    "peso_especifico" DOUBLE PRECISION,
    "idObjetivo" INTEGER NOT NULL,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objetivo_detalle_pkey" PRIMARY KEY ("objective_detail_id")
);

-- CreateTable
CREATE TABLE "tabla_maestra" (
    "master_table_id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tabla_maestra_pkey" PRIMARY KEY ("master_table_id")
);

-- CreateTable
CREATE TABLE "tabla_maestra_detalle" (
    "master_table_detail_id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "valor" TEXT,
    "idTablaMaestra" INTEGER NOT NULL,
    "estado" BOOLEAN DEFAULT false,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tabla_maestra_detalle_pkey" PRIMARY KEY ("master_table_detail_id")
);

-- AddForeignKey
ALTER TABLE "equipo_empleadora" ADD CONSTRAINT "equipo_empleadora_idEmpresaEmpleadora_fkey" FOREIGN KEY ("idEmpresaEmpleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puesto_empleadora" ADD CONSTRAINT "puesto_empleadora_idEmpresaEmpleadora_fkey" FOREIGN KEY ("idEmpresaEmpleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_empleadora" ADD CONSTRAINT "unidad_empleadora_idEmpresaEmpleadora_fkey" FOREIGN KEY ("idEmpresaEmpleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_idEmpresaEmpleadora_fkey" FOREIGN KEY ("idEmpresaEmpleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_idEmpleado_fkey" FOREIGN KEY ("idEmpleado") REFERENCES "empleado"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivo_detalle" ADD CONSTRAINT "objetivo_detalle_idObjetivo_fkey" FOREIGN KEY ("idObjetivo") REFERENCES "objetivo"("objective_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabla_maestra_detalle" ADD CONSTRAINT "tabla_maestra_detalle_idTablaMaestra_fkey" FOREIGN KEY ("idTablaMaestra") REFERENCES "tabla_maestra"("master_table_id") ON DELETE RESTRICT ON UPDATE CASCADE;
