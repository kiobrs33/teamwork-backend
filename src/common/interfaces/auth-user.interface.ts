// src/common/interfaces/auth-user.interface.ts
export interface AuthUser {
  idUsuario: number;
  codigoUsuario: string;
  rol: string;
  // agrega más campos si tu JWT incluye otros
}
