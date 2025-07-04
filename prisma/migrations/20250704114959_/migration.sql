-- CreateTable
CREATE TABLE "unidad_ocupacional_empleadora_competencia" (
    "idUnidadOcupacionalEmpleadora" INTEGER NOT NULL,
    "idCompetencia" INTEGER NOT NULL,

    CONSTRAINT "unidad_ocupacional_empleadora_competencia_pkey" PRIMARY KEY ("idUnidadOcupacionalEmpleadora","idCompetencia")
);

-- AddForeignKey
ALTER TABLE "unidad_ocupacional_empleadora_competencia" ADD CONSTRAINT "unidad_ocupacional_empleadora_competencia_idUnidadOcupacio_fkey" FOREIGN KEY ("idUnidadOcupacionalEmpleadora") REFERENCES "unidad_ocupacional_empleadora"("id_unidad_ocupacional_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_ocupacional_empleadora_competencia" ADD CONSTRAINT "unidad_ocupacional_empleadora_competencia_idCompetencia_fkey" FOREIGN KEY ("idCompetencia") REFERENCES "competencia"("id_competencia") ON DELETE RESTRICT ON UPDATE CASCADE;
