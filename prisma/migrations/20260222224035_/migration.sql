-- AlterTable
ALTER TABLE "empresa_empleadora" ADD COLUMN     "porcentaje_autoevaluacion_compet" INTEGER,
ADD COLUMN     "porcentaje_jefe_compet" INTEGER,
ADD COLUMN     "tipo_calificacion_compet" TEXT DEFAULT 'LIKERT';
