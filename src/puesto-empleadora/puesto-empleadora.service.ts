import { aplicarCabecera } from 'src/common/excel/estilo-excel';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePuestoEmpleadoraDto } from './dto/create-puesto-empleadora.dto';
import { UpdatePuestoEmpleadoraDto } from './dto/update-puesto-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Prisma } from '@prisma/client';
import { PuestoQueryDto } from './dto/puesto-query.dto';
import { handlePrismaError } from 'src/prisma/helpers/prisma-error.handler';

import * as ExcelJS from 'exceljs';

import {
  exigirNombreLibre,
  exigirSinTrabajadoresParaEliminar,
  exigirSinTrabajadoresParaMudar,
  filtrarImportacion,
  nombreLimpio,
} from 'src/common/estructura/estructura';

@Injectable()
export class PuestoEmpleadoraService {
  private readonly logger = new Logger(PuestoEmpleadoraService.name);

  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreatePuestoEmpleadoraDto) {
    try {
      const descripcion = nombreLimpio(dto.descripcion);
      await exigirNombreLibre(
        this.prisma,
        'puesto',
        Number(dto.idEmpresaEmpleadora),
        descripcion,
      );
      const puesto = await this.prisma.puestoEmpleadora.create({
        data: {
          ...dto,
          descripcion,
          creadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return puesto;
    } catch (error) {
      console.error('Error al crear puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async findAll({
    page,
    limit,
    search,
    idPuestoEmpleadora,
    descripcion,
    ruc,
    nombreEmpresaEmpleadora,
    idEmpresaEmpleadora,
  }: PuestoQueryDto) {
    try {
      const where: Prisma.PuestoEmpleadoraWhereInput = {
        estado: true,

        // La empresa del selector del front (columna directa, no por nombre).
        ...(idEmpresaEmpleadora && {
          idEmpresaEmpleadora: Number(idEmpresaEmpleadora),
        }),

        ...(idPuestoEmpleadora && {
          idPuestoEmpleadora: Number(idPuestoEmpleadora),
        }),

        ...(descripcion && {
          descripcion: {
            contains: descripcion,
            mode: 'insensitive',
          },
        }),

        // Empresa y RUC van en un solo filtro de la relación: como dos spreads
        // de `empresaEmpleadora`, el segundo pisaba al primero.
        ...((nombreEmpresaEmpleadora || ruc) && {
          empresaEmpleadora: {
            ...(nombreEmpresaEmpleadora && {
              nombreEmpresa: {
                contains: nombreEmpresaEmpleadora,
                mode: 'insensitive' as const,
              },
            }),
            ...(ruc && {
              ruc: { contains: ruc, mode: 'insensitive' as const },
            }),
          },
        }),

        ...(search && {
          // Un número busca por ID o en el nombre, no en el RUC de la empresa
          // (el de SEAL tiene un 6 y coincidían todas).
          OR: /^\d+$/.test(String(search).trim())
            ? [
                { idPuestoEmpleadora: Number(String(search).trim()) },
                { descripcion: { contains: String(search).trim() } },
              ]
            : [
                {
                  descripcion: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  empresaEmpleadora: {
                    nombreEmpresa: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  empresaEmpleadora: {
                    ruc: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
        }),
      };

      const include: Prisma.PuestoEmpleadoraInclude = {
        empresaEmpleadora: true,
        // Trabajadores vigentes (no cesados): cuántos se verían afectados.
        _count: {
          select: { empleados: { where: { situacion: { not: 'CESADO' } } } },
        },
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.puestoEmpleadora.findMany({
          where,
          include,
          orderBy: { fechaCreacion: 'desc' },
        });

        return {
          data,
          meta: {
            total: data.length,
            page: 1,
            limit: 0,
            totalPages: 1,
          },
        };
      }

      const safeLimit = Math.min(Number(limit) || 10, 100);
      const safePage = Math.max(Number(page) || 1, 1);
      const skip = (safePage - 1) * safeLimit;

      const [total, data] = await Promise.all([
        this.prisma.puestoEmpleadora.count({ where }),
        this.prisma.puestoEmpleadora.findMany({
          where,
          skip,
          take: safeLimit,
          include,
          orderBy: { fechaCreacion: 'desc' },
        }),
      ]);

      return {
        data,
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      this.logger.error('Error al obtener los puestos:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async findOne(id: number) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.findUnique({
        where: { idPuestoEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!puesto) {
        throw new NotFoundException('Puesto no encontrado');
      }

      return puesto;
    } catch (error) {
      console.error('Error al obtener el puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async update(user: AuthUser, id: number, dto: UpdatePuestoEmpleadoraDto) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.findUnique({
        where: { idPuestoEmpleadora: id, estado: true },
      });

      if (!puesto) {
        throw new NotFoundException('Puesto no encontrado');
      }

      // Las reglas se miran sobre cómo queda el registro, no sobre lo que llega.
      const idEmpresa =
        dto.idEmpresaEmpleadora !== undefined
          ? Number(dto.idEmpresaEmpleadora)
          : puesto.idEmpresaEmpleadora;
      if (idEmpresa !== puesto.idEmpresaEmpleadora)
        await exigirSinTrabajadoresParaMudar(this.prisma, 'puesto', id);
      const descripcion =
        dto.descripcion !== undefined
          ? nombreLimpio(dto.descripcion)
          : puesto.descripcion;
      await exigirNombreLibre(
        this.prisma,
        'puesto',
        idEmpresa,
        descripcion,
        id,
      );

      return await this.prisma.puestoEmpleadora.update({
        where: { idPuestoEmpleadora: id },
        data: {
          ...dto,
          descripcion,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
    } catch (error) {
      console.error('Error al actualizar el puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const puesto = await this.prisma.puestoEmpleadora.findUnique({
        where: { idPuestoEmpleadora: id, estado: true },
      });

      if (!puesto) {
        throw new NotFoundException('Puesto no encontrado');
      }

      await exigirSinTrabajadoresParaEliminar(this.prisma, 'puesto', id);

      return await this.prisma.puestoEmpleadora.update({
        where: { idPuestoEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      console.error('Error al eliminar el puesto:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async importData(user: AuthUser, data: CreatePuestoEmpleadoraDto[]) {
    try {
      const { nuevas, omitidas } = await filtrarImportacion(
        this.prisma,
        'puesto',
        data,
      );
      const registros = nuevas.map((row) => ({
        descripcion: row.descripcion,
        idEmpresaEmpleadora: row.idEmpresaEmpleadora,
        creadoPorId: user.idUsuario,
      }));

      const { count } = await this.prisma.puestoEmpleadora.createMany({
        data: registros,
      });
      return { count, omitidas };
    } catch (error) {
      console.error('Error al importar datos:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async findByEmpresaId(id: number) {
    try {
      return await this.prisma.puestoEmpleadora.findMany({
        where: {
          estado: true,
          idEmpresaEmpleadora: id,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener puestos por empresa:', error);
      handlePrismaError(error, 'puesto empleadora');
    }
  }

  async exportExcel(query: PuestoQueryDto) {
    try {
      const where: Prisma.PuestoEmpleadoraWhereInput = {
        estado: true,

        // El controlador ya resolvió la empresa (`empresaDelListado`); sin
        // esta línea el Excel traía los registros de todas las empresas,
        // también a RR. HH., aunque el listado en pantalla sí filtraba.
        ...(query.idEmpresaEmpleadora && {
          idEmpresaEmpleadora: Number(query.idEmpresaEmpleadora),
        }),

        ...(query.idPuestoEmpleadora && {
          idPuestoEmpleadora: Number(query.idPuestoEmpleadora),
        }),

        ...(query.descripcion && {
          descripcion: {
            contains: query.descripcion,
            mode: 'insensitive',
          },
        }),

        ...((query.nombreEmpresaEmpleadora || query.ruc) && {
          empresaEmpleadora: {
            ...(query.nombreEmpresaEmpleadora && {
              nombreEmpresa: {
                contains: query.nombreEmpresaEmpleadora,
                mode: 'insensitive' as const,
              },
            }),
            ...(query.ruc && {
              ruc: { contains: query.ruc, mode: 'insensitive' as const },
            }),
          },
        }),

        ...(query.search && {
          // Un número busca por ID o en el nombre, no en el RUC de la empresa
          // (el de SEAL tiene un 6 y coincidían todas).
          OR: /^\d+$/.test(String(query.search).trim())
            ? [
                { idPuestoEmpleadora: Number(String(query.search).trim()) },
                { descripcion: { contains: String(query.search).trim() } },
              ]
            : [
                {
                  descripcion: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
                {
                  empresaEmpleadora: {
                    nombreEmpresa: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  empresaEmpleadora: {
                    ruc: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
        }),
      };

      const puestos = await this.prisma.puestoEmpleadora.findMany({
        where,
        include: {
          empresaEmpleadora: true,
          _count: {
            select: { empleados: { where: { situacion: { not: 'CESADO' } } } },
          },
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Puestos');

      // Se exporta desde el espacio de una empresa (el front manda la activa):
      // «Empresa» repetiría el mismo nombre en cada fila. Solo va si el archivo
      // mezcla empresas.
      const variasEmpresas =
        !query.idEmpresaEmpleadora &&
        new Set(puestos.map((x) => x.idEmpresaEmpleadora)).size > 1;
      const columnasEmpresa = variasEmpresas
        ? [
            { header: 'ID empresa', key: 'idEmpresaEmpleadora', width: 14 },
            { header: 'Empresa', key: 'empresa', width: 50 },
          ]
        : [];

      worksheet.columns = [
        {
          header: 'ID puesto',
          key: 'idPuestoEmpleadora',
          width: 20,
        },
        {
          header: 'Nombre',
          key: 'descripcion',
          width: 40,
        },
        { header: 'Trabajadores', key: 'trabajadores', width: 14 },
        ...columnasEmpresa,
      ];

      puestos.forEach((item) => {
        worksheet.addRow({
          idPuestoEmpleadora: item.idPuestoEmpleadora,
          descripcion: item.descripcion,
          trabajadores: item._count.empleados,
          idEmpresaEmpleadora: item.idEmpresaEmpleadora,
          empresa: item.empresaEmpleadora.nombreEmpresa,
        });
      });

      aplicarCabecera(worksheet);

      const buffer = await workbook.xlsx.writeBuffer();

      return buffer;
    } catch (error) {
      handlePrismaError(error, 'puesto empleadora');
    }
  }
}
