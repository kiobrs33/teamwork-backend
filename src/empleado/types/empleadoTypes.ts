export enum Rol {
  /** Superadministrador: el equipo de TeamWork. Administra todas las empresas. */
  ADMIN = 'ADMIN',
  /** Administrador de una empresa (RR. HH.): todo, pero solo de su empresa. */
  ADMIN_EMPRESA = 'ADMIN_EMPRESA',
  JEFE = 'JEFE',
  EMPLEADO = 'EMPLEADO',
}

export enum TiempoEmpresaUnidad {
  DIAS = 'DIAS',
  MESES = 'MESES',
  ANOS = 'AÑOS',
}
