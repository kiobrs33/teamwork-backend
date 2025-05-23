-- CreateEnum
CREATE TYPE "rol" AS ENUM ('ADMIN', 'SUBADMIN', 'JEFE', 'EMPLEADO');

-- CreateTable
CREATE TABLE "empleado" (
    "id_empleado" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "id_equipo_empleadora" INTEGER NOT NULL,
    "id_puesto_empleadora" INTEGER NOT NULL,
    "id_unidad_empleadora" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "codigo_usuario" TEXT NOT NULL,
    "correo_electronico" TEXT,
    "contrasena" TEXT NOT NULL,
    "rol" "rol" NOT NULL DEFAULT 'EMPLEADO',
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "empresa_empleadora" (
    "id_empresa_empleadora" SERIAL NOT NULL,
    "nombre_empresa" TEXT NOT NULL,
    "ruc" TEXT,
    "direccion_empresa" TEXT,
    "url_logo" TEXT NOT NULL,
    "fecha_vigencia_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_vigencia_fin" TIMESTAMP(3) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "empresa_empleadora_pkey" PRIMARY KEY ("id_empresa_empleadora")
);

-- CreateTable
CREATE TABLE "equipo_empleadora" (
    "id_equipo_empleadora" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "equipo_empleadora_pkey" PRIMARY KEY ("id_equipo_empleadora")
);

-- CreateTable
CREATE TABLE "puesto_empleadora" (
    "id_puesto_empleadora" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "puesto_empleadora_pkey" PRIMARY KEY ("id_puesto_empleadora")
);

-- CreateTable
CREATE TABLE "unidad_empleadora" (
    "id_unidad_empleadora" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "unidad_empleadora_pkey" PRIMARY KEY ("id_unidad_empleadora")
);

-- CreateTable
CREATE TABLE "objetivo" (
    "id_objetivo" SERIAL NOT NULL,
    "fecha_vigencia_inicia" TIMESTAMP(3) NOT NULL,
    "fecha_vigencia_fin" TIMESTAMP(3) NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "objetivo_pkey" PRIMARY KEY ("id_objetivo")
);

-- CreateTable
CREATE TABLE "objetivo_detalle" (
    "id_objetivo_detalle" SERIAL NOT NULL,
    "id_objetivo" INTEGER NOT NULL,
    "secuencial" INTEGER NOT NULL,
    "descripcion" TEXT,
    "descripcion_iniciativa" TEXT,
    "unidad_medida" TEXT,
    "peso_especifico" DOUBLE PRECISION,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "objetivo_detalle_pkey" PRIMARY KEY ("id_objetivo_detalle")
);

-- CreateTable
CREATE TABLE "tabla_maestra" (
    "id_tabla_maestra" SERIAL NOT NULL,
    "descripcion" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "tabla_maestra_pkey" PRIMARY KEY ("id_tabla_maestra")
);

-- CreateTable
CREATE TABLE "tabla_maestra_detalle" (
    "id_tabla_maestra_detalle" SERIAL NOT NULL,
    "descripcion" TEXT,
    "valor" TEXT,
    "id_tabla_maestra" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "tabla_maestra_detalle_pkey" PRIMARY KEY ("id_tabla_maestra_detalle")
);

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_equipo_empleadora_fkey" FOREIGN KEY ("id_equipo_empleadora") REFERENCES "equipo_empleadora"("id_equipo_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_puesto_empleadora_fkey" FOREIGN KEY ("id_puesto_empleadora") REFERENCES "puesto_empleadora"("id_puesto_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_unidad_empleadora_fkey" FOREIGN KEY ("id_unidad_empleadora") REFERENCES "unidad_empleadora"("id_unidad_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo_empleadora" ADD CONSTRAINT "equipo_empleadora_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puesto_empleadora" ADD CONSTRAINT "puesto_empleadora_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_empleadora" ADD CONSTRAINT "unidad_empleadora_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_id_empresa_empleadora_fkey" FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivo_detalle" ADD CONSTRAINT "objetivo_detalle_id_objetivo_fkey" FOREIGN KEY ("id_objetivo") REFERENCES "objetivo"("id_objetivo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabla_maestra_detalle" ADD CONSTRAINT "tabla_maestra_detalle_id_tabla_maestra_fkey" FOREIGN KEY ("id_tabla_maestra") REFERENCES "tabla_maestra"("id_tabla_maestra") ON DELETE RESTRICT ON UPDATE CASCADE;
