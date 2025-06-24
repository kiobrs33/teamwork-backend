-- CreateTable
CREATE TABLE "competencia" (
    "id_competencia" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "competencia_pkey" PRIMARY KEY ("id_competencia")
);

-- CreateTable
CREATE TABLE "competencia_detalle" (
    "id_competencia_detalle" SERIAL NOT NULL,
    "id_competencia" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "competencia_detalle_pkey" PRIMARY KEY ("id_competencia_detalle")
);

-- AddForeignKey
ALTER TABLE "competencia_detalle" ADD CONSTRAINT "competencia_detalle_id_competencia_fkey" FOREIGN KEY ("id_competencia") REFERENCES "competencia"("id_competencia") ON DELETE RESTRICT ON UPDATE CASCADE;
