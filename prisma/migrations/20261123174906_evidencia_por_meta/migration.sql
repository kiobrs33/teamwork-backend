-- AlterTable
ALTER TABLE "evidencia" ADD COLUMN     "id_objetivo_detalle" INTEGER;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_id_objetivo_detalle_fkey" FOREIGN KEY ("id_objetivo_detalle") REFERENCES "objetivo_detalle"("id_objetivo_detalle") ON DELETE SET NULL ON UPDATE CASCADE;
