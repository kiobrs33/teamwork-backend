-- CreateTable
CREATE TABLE "hito_campana" (
    "id_hito_campana" SERIAL NOT NULL,
    "id_campana_evaluacion" INTEGER NOT NULL,
    "etapa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "registro" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "hito_campana_pkey" PRIMARY KEY ("id_hito_campana")
);

-- CreateTable
CREATE TABLE "registro_hito" (
    "id_registro_hito" SERIAL NOT NULL,
    "id_hito_campana" INTEGER NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "url_archivo" TEXT NOT NULL,
    "public_id" TEXT,
    "tipo_archivo" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "creado_por_id" INTEGER NOT NULL,
    "actualizado_por_id" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "registro_hito_pkey" PRIMARY KEY ("id_registro_hito")
);

-- CreateIndex
CREATE INDEX "hito_campana_id_campana_evaluacion_idx" ON "hito_campana"("id_campana_evaluacion");

-- AddForeignKey
ALTER TABLE "hito_campana" ADD CONSTRAINT "hito_campana_id_campana_evaluacion_fkey" FOREIGN KEY ("id_campana_evaluacion") REFERENCES "campana_evaluacion"("id_campana_evaluacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_hito" ADD CONSTRAINT "registro_hito_id_hito_campana_fkey" FOREIGN KEY ("id_hito_campana") REFERENCES "hito_campana"("id_hito_campana") ON DELETE RESTRICT ON UPDATE CASCADE;
