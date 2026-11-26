import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const URL_BASE = 'https://dniruc.apisperu.com/api/v1';
/** Si APIs Perú no responde en este tiempo, se avisa en vez de colgar el formulario. */
const TIEMPO_LIMITE_MS = 8000;

export interface PersonaDni {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  /** Paterno y materno juntos, como los guarda `Empleado.apellidos`. */
  apellidos: string;
}

export interface ContribuyenteRuc {
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  /**
   * ACTIVO, BAJA DE OFICIO… No se llama `estado`: `PurgeResponseInterceptor`
   * borra esa clave de toda respuesta.
   */
  estadoContribuyente: string | null;
  /** HABIDO, NO HABIDO… */
  condicion: string | null;
  direccion: string | null;
}

/**
 * Consulta de DNI (RENIEC) y RUC (SUNAT) a través de APIs Perú, para
 * autocompletar los formularios de trabajador y de empresa.
 *
 * El token vive solo en el backend (`APISPERU_TOKEN`): si el front llamara
 * directo al servicio, el token viajaría en el bundle a cualquier navegador.
 * Es opcional: sin él estas rutas responden 503 con un mensaje claro y el
 * resto del sistema funciona igual.
 */
@Injectable()
export class ConsultaDocumentoService {
  private readonly logger = new Logger(ConsultaDocumentoService.name);

  constructor(private readonly config: ConfigService) {}

  async dni(dni: string): Promise<PersonaDni> {
    if (!/^\d{8}$/.test(dni)) {
      throw new BadRequestException('El DNI debe tener 8 dígitos.');
    }
    const r = await this.consultar(`/dni/${dni}`, 'DNI');
    const paterno = String(r.apellidoPaterno ?? '').trim();
    const materno = String(r.apellidoMaterno ?? '').trim();
    return {
      dni,
      nombres: String(r.nombres ?? '').trim(),
      apellidoPaterno: paterno,
      apellidoMaterno: materno,
      apellidos: [paterno, materno].filter(Boolean).join(' '),
    };
  }

  async ruc(ruc: string): Promise<ContribuyenteRuc> {
    if (!/^(10|15|17|20)\d{9}$/.test(ruc)) {
      throw new BadRequestException(
        'El RUC debe tener 11 dígitos y empezar por 10, 15, 17 o 20.',
      );
    }
    const r = await this.consultar(`/ruc/${ruc}`, 'RUC');
    const texto = (v: unknown) => (v == null ? null : String(v).trim() || null);
    return {
      ruc,
      razonSocial: String(r.razonSocial ?? '').trim(),
      nombreComercial: texto(r.nombreComercial),
      estadoContribuyente: texto(r.estado),
      condicion: texto(r.condicion),
      direccion: texto(r.direccion),
    };
  }

  private async consultar(
    ruta: string,
    tipo: 'DNI' | 'RUC',
  ): Promise<Record<string, unknown>> {
    const token = String(this.config.get('APISPERU_TOKEN') ?? '').trim();
    if (!token) {
      throw new ServiceUnavailableException(
        `La búsqueda por ${tipo} no está configurada en el servidor (falta APISPERU_TOKEN). Complete los datos manualmente.`,
      );
    }

    let respuesta: Response;
    try {
      respuesta = await fetch(`${URL_BASE}${ruta}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
      });
    } catch (error) {
      if ((error as Error)?.name === 'TimeoutError') {
        throw new GatewayTimeoutException(
          `La consulta de ${tipo} tardó demasiado. Inténtalo de nuevo o completa los datos a mano.`,
        );
      }
      this.logger.warn(`APIs Perú no respondió: ${(error as Error)?.message}`);
      throw new BadGatewayException(
        `No se pudo consultar el ${tipo}. Inténtalo de nuevo o completa los datos a mano.`,
      );
    }

    const cuerpo = (await respuesta.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (respuesta.status === 401 || respuesta.status === 403) {
      this.logger.error('APIs Perú rechazó el token (APISPERU_TOKEN).');
      throw new ServiceUnavailableException(
        `La búsqueda por ${tipo} no está disponible: el servicio rechazó el token. Complete los datos manualmente.`,
      );
    }
    // Un documento que no existe llega con 200 y `success: false`.
    if (
      respuesta.status === 404 ||
      !cuerpo ||
      cuerpo.success === false ||
      (tipo === 'RUC' && !cuerpo.razonSocial) ||
      (tipo === 'DNI' && !cuerpo.nombres)
    ) {
      if (respuesta.ok || respuesta.status === 404) {
        throw new NotFoundException(`No se encontró ese ${tipo}.`);
      }
      throw new BadGatewayException(
        `No se pudo consultar el ${tipo}. Inténtalo de nuevo o completa los datos a mano.`,
      );
    }
    if (!respuesta.ok) {
      throw new BadGatewayException(
        `No se pudo consultar el ${tipo}. Inténtalo de nuevo o completa los datos a mano.`,
      );
    }
    return cuerpo;
  }
}
