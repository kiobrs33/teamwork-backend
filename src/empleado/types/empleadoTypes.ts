export enum Rol {
  /** Dueño de TeamWork: todas las empresas y las cuentas del equipo. */
  ADMIN = 'ADMIN',
  /**
   * Personal de TeamWork: configura empresas y campañas y carga datos, solo
   * en las empresas que el dueño le asigna (o en todas). No gestiona cuentas
   * internas ni elimina empresas.
   */
  EQUIPO = 'EQUIPO',
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
