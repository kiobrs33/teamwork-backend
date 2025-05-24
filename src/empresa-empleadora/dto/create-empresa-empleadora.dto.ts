export class CreateEmpresaEmpleadoraDto {
  nombreEmpresa: string;
  ruc?: string;
  direccionEmpresa?: string;
  urlLogo: string;
  fechaVigenciaInicio: Date;
  fechaVigenciaFin: Date;
}