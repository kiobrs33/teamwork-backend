-- AlterTable
ALTER TABLE "empresa_empleadora" ALTER COLUMN "fecha_vigencia_inicio" DROP NOT NULL,
ALTER COLUMN "fecha_vigencia_fin" DROP NOT NULL,
ALTER COLUMN "modeloEmpresa" SET DEFAULT '90';
