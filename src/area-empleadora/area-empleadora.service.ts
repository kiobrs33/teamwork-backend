import { aplicarCabecera } from 'src/common/excel/estilo-excel';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAreaEmpleadoraDto } from './dto/create-area-empleadora.dto';
import { UpdateAreaEmpleadoraDto } from './dto/update-area-empleadora.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { Prisma } from '@prisma/client';
import { AreaQueryDto } from './dto/area-query.dto';
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
export class AreaEmpleadoraService {
  private readonly logger = new Logger(AreaEmpleadoraService.name);
  constructor(private prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateAreaEmpleadoraDto) {
    try {
      const descripcion = nombreLimpio(dto.descripcion);
      await exigirNombreLibre(
        this.prisma,
        'area',
        Number(dto.idEmpresaEmpleadora),
        descripcion,
      );
      const area = await this.prisma.areaEmpleadora.create({
        data: {
          ...dto,
          descripcion,
          creadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return area;
    } catch (error) {
      console.error('Error al crear área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async findAll({
    page,
    limit,
    search,
    idAreaEmpleadora,
    descripcion,
    nombreEmpresaEmpleadora,
    idEmpresaEmpleadora,
    ruc,
  }: AreaQueryDto) {
    try {
      const where: Prisma.AreaEmpleadoraWhereInput = {
        estado: true,

        // La empresa del selector del front (columna directa, no por nombre).
        ...(idEmpresaEmpleadora && {
          idEmpresaEmpleadora: Number(idEmpresaEmpleadora),
        }),

        ...(idAreaEmpleadora && {
          idAreaEmpleadora: Number(idAreaEmpleadora),
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
                { idAreaEmpleadora: Number(String(search).trim()) },
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

      const include: Prisma.AreaEmpleadoraInclude = {
        empresaEmpleadora: true,
        // Trabajadores vigentes (no cesados): cuántos se verían afectados.
        _count: {
          select: { empleados: { where: { situacion: { not: 'CESADO' } } } },
        },
      };

      if (Number(limit) === 0) {
        const data = await this.prisma.areaEmpleadora.findMany({
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
        this.prisma.areaEmpleadora.count({ where }),
        this.prisma.areaEmpleadora.findMany({
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
      this.logger.error('Error al obtener los empleados:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async findOne(id: number) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id, estado: true },
        include: { empresaEmpleadora: true },
      });

      if (!area) {
        throw new NotFoundException('Área no encontrada');
      }

      return area;
    } catch (error) {
      console.error('Error al obtener el área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async update(user: AuthUser, id: number, dto: UpdateAreaEmpleadoraDto) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id, estado: true },
      });

      if (!area) {
        throw new NotFoundException('Área no encontrada');
      }

      // Las reglas se miran sobre cómo queda el registro, no sobre lo que llega.
      const idEmpresa =
        dto.idEmpresaEmpleadora !== undefined
          ? Number(dto.idEmpresaEmpleadora)
          : area.idEmpresaEmpleadora;
      if (idEmpresa !== area.idEmpresaEmpleadora)
        await exigirSinTrabajadoresParaMudar(this.prisma, 'area', id);
      const descripcion =
        dto.descripcion !== undefined
          ? nombreLimpio(dto.descripcion)
          : area.descripcion;
      await exigirNombreLibre(this.prisma, 'area', idEmpresa, descripcion, id);

      const updatedArea = await this.prisma.areaEmpleadora.update({
        where: { idAreaEmpleadora: id },
        data: {
          ...dto,
          descripcion,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
        include: { empresaEmpleadora: true },
      });
      return updatedArea;
    } catch (error) {
      console.error('Error al actualizar el área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async remove(user: AuthUser, id: number) {
    try {
      const area = await this.prisma.areaEmpleadora.findUnique({
        where: { idAreaEmpleadora: id, estado: true },
      });

      if (!area) {
        throw new NotFoundException('Área no encontrada');
      }

      await exigirSinTrabajadoresParaEliminar(this.prisma, 'area', id);

      const deletedArea = await this.prisma.areaEmpleadora.update({
        where: { idAreaEmpleadora: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
      return deletedArea;
    } catch (error) {
      console.error('Error al eliminar el área:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async importData(user: AuthUser, data: CreateAreaEmpleadoraDto[]) {
    try {
      const { nuevas, omitidas } = await filtrarImportacion(
        this.prisma,
        'area',
        data,
      );
      const registros = nuevas.map((row) => ({
        descripcion: row.descripcion,
        idEmpresaEmpleadora: row.idEmpresaEmpleadora,
        creadoPorId: user.idUsuario,
      }));

      const { count } = await this.prisma.areaEmpleadora.createMany({
        data: registros,
      });
      return { count, omitidas };
    } catch (error) {
      console.error('Error al importar datos:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async findByEmpresaId(id: number) {
    try {
      return await this.prisma.areaEmpleadora.findMany({
        where: {
          estado: true,
          idEmpresaEmpleadora: id,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener areas por empresa:', error);
      handlePrismaError(error, 'area empleadora');
    }
  }

  async exportExcel(query: AreaQueryDto) {
    try {
      const where: Prisma.AreaEmpleadoraWhereInput = {
        estado: true,

        // El controlador ya resolvió la empresa (`empresaDelListado`); sin
        // esta línea el Excel traía los registros de todas las empresas,
        // también a RR. HH., aunque el listado en pantalla sí filtraba.
        ...(query.idEmpresaEmpleadora && {
          idEmpresaEmpleadora: Number(query.idEmpresaEmpleadora),
        }),

        ...(query.idAreaEmpleadora && {
          idAreaEmpleadora: Number(query.idAreaEmpleadora),
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
                { idAreaEmpleadora: Number(String(query.search).trim()) },
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

      const areas = await this.prisma.areaEmpleadora.findMany({
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
      const worksheet = workbook.addWorksheet('Áreas');

      // Se exporta desde el espacio de una empresa (el front manda la activa):
      // «Empresa» repetiría el mismo nombre en cada fila. Solo va si el archivo
      // mezcla empresas.
      const variasEmpresas =
        !query.idEmpresaEmpleadora &&
        new Set(areas.map((x) => x.idEmpresaEmpleadora)).size > 1;
      const columnasEmpresa = variasEmpresas
        ? [
            { header: 'ID empresa', key: 'idEmpresaEmpleadora', width: 14 },
            { header: 'Empresa', key: 'empresa', width: 50 },
          ]
        : [];

      worksheet.columns = [
        {
          header: 'ID área',
          key: 'idAreaEmpleadora',
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

      areas.forEach((item) => {
        worksheet.addRow({
          idAreaEmpleadora: item.idAreaEmpleadora,
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
      handlePrismaError(error, 'area empleadora');
    }
  }
}
