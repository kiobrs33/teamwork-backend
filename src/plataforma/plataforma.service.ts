import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { ActualizarConfiguracionDto } from './dto/configuracion.dto';

/** La fila única de la configuración de la plataforma. */
const ID = 1;

@Injectable()
export class PlataformaService {
  constructor(private readonly prisma: PrismaService) {}

  /** La configuración; sin fila todavía, los valores por defecto. */
  async leer() {
    const fila = await this.prisma.configuracionPlataforma.findUnique({
      where: { id: ID },
      select: { colorPrimario: true },
    });
    return { colorPrimario: fila?.colorPrimario ?? null };
  }

  async actualizar(user: AuthUser, dto: ActualizarConfiguracionDto) {
    const datos = {
      // Lo que no llega no se toca; null vuelve al azul por defecto.
      ...(dto.colorPrimario !== undefined && {
        colorPrimario: dto.colorPrimario,
      }),
      fechaModificacion: new Date(),
      actualizadoPorId: user.idUsuario,
    };
    const fila = await this.prisma.configuracionPlataforma.upsert({
      where: { id: ID },
      create: { id: ID, ...datos },
      update: datos,
      select: { colorPrimario: true },
    });
    return { colorPrimario: fila.colorPrimario };
  }
}
