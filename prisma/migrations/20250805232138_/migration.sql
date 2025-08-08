-- CreateTable
CREATE TABLE "empleo" (
    "id_empleo" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "nombre_empresa" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "tipo_empleo" TEXT NOT NULL,
    "modalidad" TEXT,
    "fecha_publicacion" TIMESTAMP(3) NOT NULL,
    "fecha_fin_publicacion" TIMESTAMP(3) NOT NULL,
    "tiempo_experiencia" TEXT NOT NULL,
    "numero_vacantes" TEXT NOT NULL,
    "salario" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "empleo_pkey" PRIMARY KEY ("id_empleo")
);

-- CreateTable
CREATE TABLE "comunicado" (
    "id_comunicado" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT,
    "estado_disponible" BOOLEAN NOT NULL DEFAULT true,
    "id_empleo" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "comunicado_pkey" PRIMARY KEY ("id_comunicado")
);

-- AddForeignKey
ALTER TABLE "comunicado" ADD CONSTRAINT "comunicado_id_empleo_fkey" FOREIGN KEY ("id_empleo") REFERENCES "empleo"("id_empleo") ON DELETE RESTRICT ON UPDATE CASCADE;
