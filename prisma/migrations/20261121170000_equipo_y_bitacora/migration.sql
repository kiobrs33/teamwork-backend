-- Cuentas internas de TeamWork (rol EQUIPO) con empresas asignadas, y la
-- bitácora de actividad. Aditiva: no cambia datos existentes.

ALTER TABLE "usuario" ADD COLUMN "todas_las_empresas" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "usuario_empresa" (
    "id_usuario" INTEGER NOT NULL,
    "id_empresa_empleadora" INTEGER NOT NULL,
    "asignado_por_id" INTEGER,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usuario_empresa_pkey" PRIMARY KEY ("id_usuario","id_empresa_empleadora")
);
CREATE INDEX "usuario_empresa_id_empresa_empleadora_idx" ON "usuario_empresa"("id_empresa_empleadora");
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_id_usuario_fkey"
  FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "usuario_empresa" ADD CONSTRAINT "usuario_empresa_id_empresa_empleadora_fkey"
  FOREIGN KEY ("id_empresa_empleadora") REFERENCES "empresa_empleadora"("id_empresa_empleadora") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "registro_actividad" (
    "id_registro" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" INTEGER,
    "usuario_codigo" TEXT,
    "usuario_nombre" TEXT,
    "usuario_rol" TEXT,
    "id_empresa_empleadora" INTEGER,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "id_entidad" TEXT,
    "descripcion" TEXT NOT NULL,
    "detalle" JSONB,
    "metodo" TEXT,
    "ruta" TEXT,
    "resultado" TEXT NOT NULL DEFAULT 'OK',
    "codigo_http" INTEGER,
    "ip" TEXT,
    "user_agent" TEXT,
    CONSTRAINT "registro_actividad_pkey" PRIMARY KEY ("id_registro")
);
CREATE INDEX "registro_actividad_id_empresa_empleadora_fecha_idx" ON "registro_actividad"("id_empresa_empleadora", "fecha");
CREATE INDEX "registro_actividad_id_usuario_fecha_idx" ON "registro_actividad"("id_usuario", "fecha");
CREATE INDEX "registro_actividad_fecha_idx" ON "registro_actividad"("fecha");

-- La bitácora solo se agrega: ni la aplicación ni nadie con el usuario de la
-- base puede corregir o borrar lo registrado.
CREATE OR REPLACE FUNCTION registro_actividad_solo_agregar() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'La bitácora de actividad no se puede modificar ni borrar';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER registro_actividad_inmutable
  BEFORE UPDATE OR DELETE ON "registro_actividad"
  FOR EACH ROW EXECUTE FUNCTION registro_actividad_solo_agregar();
