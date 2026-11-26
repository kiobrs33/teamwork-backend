/**
 * Situación laboral del trabajador. `estado` (true/false) sigue siendo lo que
 * deciden todas las consultas ("opera o no": entra, se evalúa, puede ser
 * jefe) y vale true solo en ACTIVO; la situación dice POR QUÉ no opera.
 *
 * - SUSPENDIDO: temporal (licencia, descanso médico, suspensión). Vuelve a
 *   ACTIVO sin perder nada.
 * - CESADO: salió de la empresa. Conserva su historial y se reactiva si
 *   vuelve, en vez de registrarlo de nuevo.
 */
export const SITUACIONES = ['ACTIVO', 'SUSPENDIDO', 'CESADO'] as const;
export type Situacion = (typeof SITUACIONES)[number];

/** Tipos de documento de identidad aceptados, con su formato. */
export const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const FORMATO_DOCUMENTO: Record<
  TipoDocumento,
  { regex: RegExp; ayuda: string }
> = {
  DNI: { regex: /^\d{8}$/, ayuda: '8 dígitos' },
  CE: { regex: /^[A-Za-z0-9]{6,12}$/, ayuda: 'de 6 a 12 letras o números' },
  PASAPORTE: {
    regex: /^[A-Za-z0-9]{6,12}$/,
    ayuda: 'de 6 a 12 letras o números',
  },
};
