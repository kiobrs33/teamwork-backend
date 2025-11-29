/*
  Warnings:

  - The values [SUBADMIN] on the enum `rol` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "rol_new" AS ENUM ('ADMIN', 'JEFE', 'EMPLEADO');
ALTER TABLE "usuario" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "usuario" ALTER COLUMN "rol" TYPE "rol_new" USING ("rol"::text::"rol_new");
ALTER TYPE "rol" RENAME TO "rol_old";
ALTER TYPE "rol_new" RENAME TO "rol";
DROP TYPE "rol_old";
ALTER TABLE "usuario" ALTER COLUMN "rol" SET DEFAULT 'EMPLEADO';
COMMIT;
