import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateObjetivoDto } from './dto/update-objetivo.dto';
import { CreateObjetivoConDetallesDto } from './dto/create-objetivo-detalle.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { CreateObjetivosMasivosDto } from './dto/create-objetivo-masivo.dto';
import { EvaluarObjetivoDto } from './dto/evaluar-objetivo.dto';

@Injectable()
export class ObjetivoService {
  private readonly logger = new Logger(ObjetivoService.name);

  constructor(private prisma: PrismaService) {}

  // ======================================================
  // GET ALL
  // ======================================================
  async findAll() {
    try {
      return await this.prisma.objetivo.findMany({
        where: { estado: true },
        orderBy: { fechaCreacion: 'desc' },
        include: {
          empleado: true,
          objetivoDetalles: true,
        },
      });
    } catch (error) {
      this.logger.error('Error al obtener objetivos:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los objetivos.',
      );
    }
  }

  // ======================================================
  // GET ONE
  // ======================================================
  async findOne(id: number) {
    try {
      const objetivo = await this.prisma.objetivo.findFirst({
        where: { idObjetivo: id, estado: true },
        include: {
          empleado: true,
          objetivoDetalles: true,
        },
      });

      if (!objetivo)
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado.`);

      return objetivo;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error al obtener objetivo ${id}:`, error);
      throw new InternalServerErrorException('No se pudo obtener el objetivo.');
    }
  }

  // ======================================================
  // UPDATE OBJETIVO + DETALLES (CORREGIDO)
  // ======================================================
  async update(id: number, user: AuthUser, dto: UpdateObjetivoDto) {
    return await this.prisma.$transaction(async (tx) => {
      const objetivo = await tx.objetivo.findUnique({
        where: { idObjetivo: id },
      });

      if (!objetivo || !objetivo.estado)
        throw new NotFoundException('Objetivo no encontrado');

      await tx.objetivo.update({
        where: { idObjetivo: id },
        data: {
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
        },
      });

      await tx.objetivoDetalle.deleteMany({
        where: { idObjetivo: id },
      });

      await tx.objetivoDetalle.createMany({
        data:
          dto.objetivoDetalles?.map((d, i) => ({
            idObjetivo: id,
            secuencial: i + 1,
            tipoCalculo: d.tipoCalculo,
            descripcion: d.descripcion,
            descripcionIniciativa: d.descripcionIniciativa || null,
            unidadMedida: d.unidadMedida,
            pesoEspecifico: d.pesoEspecifico,
            metaObjetivo: d.metaObjetivo,
            metaAlcanzada: d.metaAlcanzada ?? null,
            fechaCulminacion: new Date(d.fechaCulminacion),
            porcentajeLogrado: d.porcentajeLogrado ?? null,
            estado: true,
            creadoPorId: user.idUsuario,
            actualizadoPorId: user.idUsuario,
          })) ?? [],
      });

      return await tx.objetivo.findUnique({
        where: { idObjetivo: id },
        include: { objetivoDetalles: true, empleado: true },
      });
    });
  }

  // ======================================================
  // SOFT DELETE
  // ======================================================
  async remove(user: AuthUser, id: number) {
    try {
      const exist = await this.prisma.objetivo.findFirst({
        where: { idObjetivo: id },
      });

      if (!exist || !exist.estado)
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado.`);

      return await this.prisma.objetivo.update({
        where: { idObjetivo: id },
        data: {
          estado: false,
          actualizadoPorId: user.idUsuario,
          fechaModificacion: new Date(),
          objetivoDetalles: {
            updateMany: {
              where: { idObjetivo: id },
              data: { estado: false },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error al eliminar objetivo ${id}:`, error);
      throw new InternalServerErrorException(
        'No se pudo eliminar el objetivo.',
      );
    }
  }

  // ======================================================
  // CREATE OBJETIVO + DETALLES
  // ======================================================
  async createConDetalles(user: AuthUser, dto: CreateObjetivoConDetallesDto) {
    if (dto.objetivoDetalles.length < 1)
      throw new BadRequestException('Debe enviar al menos un detalle.');

    try {
      return await this.prisma.$transaction(async (tx) => {
        const objetivo = await tx.objetivo.create({
          data: {
            idEmpleado: dto.idEmpleado,
            creadoPorId: user.idUsuario,
            estado: true,
            objetivoDetalles: {
              create: dto.objetivoDetalles.map((detalle, index) => ({
                secuencial: index + 1,
                tipoCalculo: detalle.tipoCalculo,
                descripcion: detalle.descripcion,
                descripcionIniciativa: detalle.descripcionIniciativa || null,
                unidadMedida: detalle.unidadMedida,
                pesoEspecifico: detalle.pesoEspecifico,
                metaObjetivo: detalle.metaObjetivo,
                metaAlcanzada: detalle.metaAlcanzada ?? null,
                fechaCulminacion: new Date(detalle.fechaCulminacion), // ← FIX CLAVE
                porcentajeLogrado: detalle.porcentajeLogrado ?? null,
                estado: true,
                creadoPorId: user.idUsuario,
              })),
            },
          },
        });

        return await tx.objetivo.findUnique({
          where: { idObjetivo: objetivo.idObjetivo },
          include: { objetivoDetalles: true, empleado: true },
        });
      });
    } catch (error) {
      this.logger.error('Error creando objetivo:', error);
      throw new InternalServerErrorException(
        'No se pudo crear el objetivo con detalles.',
      );
    }
  }

  // ======================================================
  // ⭐ CREAR OBJETIVOS MASIVOS (usando codigoEmpleado)
  // ======================================================
  async createMasivo(user: AuthUser, dto: CreateObjetivosMasivosDto) {
    if (!dto.objetivos?.length)
      throw new BadRequestException('Debe enviar un arreglo con objetivos.');

    return await this.prisma.$transaction(async (tx) => {
      const results: any[] = [];

      for (const item of dto.objetivos) {
        if (!item.objetivoDetalles?.length)
          throw new BadRequestException(
            `Debe enviar al menos un detalle para el código ${item.codigoEmpleado}`,
          );

        const empleado = await tx.empleado.findFirst({
          where: { codigoEmpleado: item.codigoEmpleado },
        });

        if (!empleado)
          throw new NotFoundException(
            `Empleado ${item.codigoEmpleado} no existe`,
          );

        const objetivo = await tx.objetivo.create({
          data: {
            idEmpleado: empleado.idEmpleado,
            creadoPorId: user.idUsuario,
            estado: true,
            objetivoDetalles: {
              create: item.objetivoDetalles.map((d, i) => ({
                secuencial: i + 1,
                tipoCalculo: d.tipoCalculo,
                descripcion: d.descripcion,
                descripcionIniciativa: d.descripcionIniciativa || null,
                unidadMedida: d.unidadMedida,
                pesoEspecifico: d.pesoEspecifico,
                metaObjetivo: d.metaObjetivo,
                metaAlcanzada: d.metaAlcanzada ?? null,
                fechaCulminacion: new Date(d.fechaCulminacion),
                porcentajeLogrado: d.porcentajeLogrado ?? null,
                estado: true,
                creadoPorId: user.idUsuario,
              })),
            },
          },
        });

        results.push(
          await tx.objetivo.findUnique({
            where: { idObjetivo: objetivo.idObjetivo },
            include: { empleado: true, objetivoDetalles: true },
          }),
        );
      }

      return results;
    });
  }

  // ============================================================
  // GET ALL BY JEFE (OBJETIVOS DE SUBORDINADOS)
  // ============================================================
  async findAllByJefe(idEmpleadoJefe: number) {
    try {
      // 1. Validar que exista el jefe
      const jefe = await this.prisma.empleado.findUnique({
        where: { idEmpleado: idEmpleadoJefe, estado: true },
        select: { codigoEmpleado: true },
      });

      if (!jefe) {
        throw new NotFoundException(
          `El empleado jefe con ID ${idEmpleadoJefe} no existe.`,
        );
      }

      if (!jefe.codigoEmpleado) {
        throw new BadRequestException(
          `El empleado jefe con ID ${idEmpleadoJefe} no tiene un código de empleado válido.`,
        );
      }

      // 2. Obtener subordinados del jefe
      const subordinados = await this.prisma.empleado.findMany({
        where: {
          codigoEmpleadoJefe: jefe.codigoEmpleado,
          estado: true,
        },
        select: { idEmpleado: true },
      });

      if (subordinados.length === 0) {
        return [];
      }

      const subordinadosIds = subordinados.map((s) => s.idEmpleado);

      // 3. Obtener objetivos de los subordinados
      return await this.prisma.objetivo.findMany({
        where: {
          estado: true,
          idEmpleado: { in: subordinadosIds },
        },
        orderBy: { fechaCreacion: 'desc' },
        include: {
          empleado: true,
          objetivoDetalles: true,
        },
      });
    } catch (error) {
      this.logger.error('Error al obtener objetivos de subordinados:', error);

      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'No se pudieron obtener los objetivos de subordinados.',
      );
    }
  }

  // ======================================================
  // ⭐ EVALUAR OBJETIVO DE SUBORDINADO
  // ======================================================
  async evaluarObjetivo(
    idObjetivo: number,
    user: AuthUser,
    dto: EvaluarObjetivoDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // --------------------------------------------------
      // 1. Obtener objetivo con empleado
      // --------------------------------------------------
      const objetivo = await tx.objetivo.findUnique({
        where: { idObjetivo },
        include: {
          empleado: {
            select: {
              idEmpleado: true,
              codigoEmpleado: true,
              codigoEmpleadoJefe: true,
            },
          },
          objetivoDetalles: {
            where: { estado: true },
          },
        },
      });

      if (!objetivo || !objetivo.estado)
        throw new NotFoundException('Objetivo no encontrado');

      // --------------------------------------------------
      // 2. Validar que el usuario sea JEFE directo
      // --------------------------------------------------
      const jefe = await tx.empleado.findUnique({
        where: { idUsuario: user.idUsuario },
        select: { codigoEmpleado: true },
      });

      if (!jefe) throw new BadRequestException('Jefe no válido');

      if (objetivo.empleado.codigoEmpleadoJefe !== jefe.codigoEmpleado)
        throw new BadRequestException(
          'No tiene permisos para evaluar este objetivo',
        );

      // --------------------------------------------------
      // 3. Validar detalles enviados
      // --------------------------------------------------
      if (!dto.detalles?.length)
        throw new BadRequestException('Debe enviar al menos un detalle');

      const detallesIds = objetivo.objetivoDetalles.map(
        (d) => d.idObjetivoDetalle,
      );

      // --------------------------------------------------
      // 4. Evaluar cada detalle
      // --------------------------------------------------
      for (const detalle of dto.detalles) {
        if (!detallesIds.includes(detalle.idObjetivoDetalle)) {
          throw new BadRequestException(
            `El detalle ${detalle.idObjetivoDetalle} no pertenece al objetivo`,
          );
        }

        if (detalle.porcentajeLogrado < 0 || detalle.porcentajeLogrado > 100) {
          throw new BadRequestException(
            'El porcentaje logrado debe estar entre 0 y 100',
          );
        }

        await tx.objetivoDetalle.update({
          where: { idObjetivoDetalle: detalle.idObjetivoDetalle },
          data: {
            metaAlcanzada: detalle.metaAlcanzada,
            porcentajeLogrado: detalle.porcentajeLogrado,
            actualizadoPorId: user.idUsuario,
            fechaModificacion: new Date(),
          },
        });
      }

      // --------------------------------------------------
      // 5. Retornar objetivo evaluado
      // --------------------------------------------------
      return await tx.objetivo.findUnique({
        where: { idObjetivo },
        include: {
          empleado: true,
          objetivoDetalles: true,
        },
      });
    });
  }
}
