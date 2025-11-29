import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { hash } from 'bcryptjs';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Injectable()
export class EmpleadoService {
  private readonly logger = new Logger(EmpleadoService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================
  // UTILITY: VALIDAR UNICIDAD
  // ============================================================
  private async validateUniqueFields(body: CreateEmpleadoDto) {
    // ============================================================
    // VALIDAR CÓDIGO DE USUARIO
    // ============================================================
    const existsUser = await this.prisma.usuario.findUnique({
      where: { codigoUsuario: body.codigoUsuario },
      select: { idUsuario: true },
    });
    if (existsUser) {
      throw new BadRequestException(
        `El código de usuario "${body.codigoUsuario}" ya está registrado.`,
      );
    }

    // ============================================================
    // VALIDAR CÓDIGO DE EMPLEADO
    // ============================================================
    const existsEmpleado = await this.prisma.empleado.findUnique({
      where: { codigoEmpleado: body.codigoEmpleado },
      select: { idEmpleado: true },
    });

    if (existsEmpleado) {
      throw new BadRequestException(
        `El código de empleado "${body.codigoEmpleado}" ya está registrado.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA LA EMPRESA EMPLEADORA
    // ============================================================
    const empresa = await this.prisma.empresaEmpleadora.findUnique({
      where: { idEmpresaEmpleadora: body.idEmpresaEmpleadora },
      select: { idEmpresaEmpleadora: true },
    });

    if (!empresa) {
      throw new BadRequestException(
        `La empresa empleadora con ID "${body.idEmpresaEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA EL ÁREA EMPLEADORA
    // ============================================================
    const area = await this.prisma.areaEmpleadora.findUnique({
      where: { idAreaEmpleadora: body.idAreaEmpleadora },
      select: { idAreaEmpleadora: true },
    });

    if (!area) {
      throw new BadRequestException(
        `El área empleadora con ID "${body.idAreaEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA EL PUESTO EMPLEADORA
    // ============================================================
    const puesto = await this.prisma.puestoEmpleadora.findUnique({
      where: { idPuestoEmpleadora: body.idPuestoEmpleadora },
      select: { idPuestoEmpleadora: true },
    });

    if (!puesto) {
      throw new BadRequestException(
        `El puesto empleadora con ID "${body.idPuestoEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA LA GERENCIA EMPLEADORA
    // ============================================================
    const gerencia = await this.prisma.gerenciaEmpleadora.findUnique({
      where: { idGerenciaEmpleadora: body.idGerenciaEmpleadora },
      select: { idGerenciaEmpleadora: true },
    });

    if (!gerencia) {
      throw new BadRequestException(
        `La gerencia empleadora con ID "${body.idGerenciaEmpleadora}" no existe.`,
      );
    }

    // ============================================================
    // VALIDAR QUE EXISTA LA UNIDAD OCUPACIONAL EMPLEADORA
    // ============================================================
    const unidad = await this.prisma.unidadOcupacionalEmpleadora.findUnique({
      where: {
        idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
      },
      select: { idUnidadOcupacionalEmpleadora: true },
    });

    if (!unidad) {
      throw new BadRequestException(
        `La unidad ocupacional empleadora con ID "${body.idUnidadOcupacionalEmpleadora}" no existe.`,
      );
    }
  }

  // ============================================================
  // CREATE
  // ============================================================
  async create(user: AuthUser, body: CreateEmpleadoDto) {
    try {
      await this.validateUniqueFields(body);

      return await this.prisma.$transaction(async (tx) => {
        const hashedPassword = await hash(body.contrasena, 10);

        const usuario = await tx.usuario.create({
          data: {
            codigoUsuario: body.codigoUsuario,
            contrasena: hashedPassword,
            rol: body.rol,
            creadoPorId: user.idUsuario,
          },
        });

        const empleado = await tx.empleado.create({
          data: {
            codigoEmpleado: body.codigoEmpleado, // obligatorio
            nombres: body.nombres,
            apellidos: body.apellidos,
            documento: body.documento,
            sede: body.sede,
            tiempoEmpresaValor: body.tiempoEmpresaValor,
            tiempoEmpresaUnidad: body.tiempoEmpresaUnidad, // string
            idEmpresaEmpleadora: body.idEmpresaEmpleadora,
            idAreaEmpleadora: body.idAreaEmpleadora,
            idPuestoEmpleadora: body.idPuestoEmpleadora,
            idGerenciaEmpleadora: body.idGerenciaEmpleadora,
            idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
            codigoEmpleadoJefe: body.codigoEmpleadoJefe ?? null,
            idUsuario: usuario.idUsuario,
            creadoPorId: user.idUsuario,
          },
          include: { usuario: true },
        });

        return empleado;
      });
    } catch (error) {
      this.logger.error('Error al crear empleado:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('No se pudo crear al empleado.');
    }
  }

  // ============================================================
  // FIND ALL
  // ============================================================
  async findAll() {
    try {
      return await this.prisma.empleado.findMany({
        where: { estado: true },
        include: { usuario: true },
        orderBy: { fechaCreacion: 'desc' },
      });
    } catch (error) {
      this.logger.error('Error al obtener los empleados:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los empleados.',
      );
    }
  }

  // ============================================================
  // FIND ONE
  // ============================================================
  async findOne(id: number) {
    try {
      const empleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        include: { usuario: true },
      });

      if (!empleado) throw new NotFoundException('Empleado no encontrado');

      return empleado;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error al obtener el empleado:', error);
      throw new InternalServerErrorException('No se pudo obtener al empleado.');
    }
  }

  // ============================================================
  // FIND EMPLEADO BY ID USUARIO
  // ============================================================
  async findOneByUsuario(id: number) {
    try {
      const empleado = await this.prisma.empleado.findFirst({
        where: { idUsuario: id, estado: true },
        include: { usuario: true, empresaEmpleadora: true },
      });

      if (!empleado) throw new NotFoundException('Empleado no encontrado');

      return empleado;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error al obtener el empleado por usuario:', error);
      throw new InternalServerErrorException('No se pudo obtener al empleado.');
    }
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(user: AuthUser, id: number, body: UpdateEmpleadoDto) {
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id, estado: true },
        select: { idEmpleado: true, idUsuario: true },
      });

      if (!existEmpleado) throw new NotFoundException('Empleado no encontrado');

      // Validación de unicidad: códigoUsuario
      if (body.codigoUsuario) {
        const existsUser = await this.prisma.usuario.findUnique({
          where: { codigoUsuario: body.codigoUsuario },
        });

        if (existsUser && existsUser.idUsuario !== existEmpleado.idUsuario) {
          throw new BadRequestException(
            `El código de usuario "${body.codigoUsuario}" ya está registrado.`,
          );
        }
      }

      // Validación de unicidad: códigoEmpleado
      if (body.codigoEmpleado) {
        const existsEmp = await this.prisma.empleado.findUnique({
          where: { codigoEmpleado: body.codigoEmpleado },
        });

        if (existsEmp && existsEmp.idEmpleado !== id) {
          throw new BadRequestException(
            `El código de empleado "${body.codigoEmpleado}" ya está registrado.`,
          );
        }
      }

      // --------- Actualizar Usuario ----------
      const usuarioUpdateData: any = {
        codigoUsuario: body.codigoUsuario,
        rol: body.rol,
        fechaModificacion: new Date(),
        actualizadoPorId: user.idUsuario,
      };

      if (body.contrasena) {
        usuarioUpdateData.contrasena = await hash(body.contrasena, 10);
      }

      await this.prisma.usuario.update({
        where: { idUsuario: existEmpleado.idUsuario },
        data: usuarioUpdateData,
      });

      // --------- Actualizar Empleado ----------
      const empleadoUpdateData = {
        codigoEmpleado: body.codigoEmpleado,
        nombres: body.nombres,
        apellidos: body.apellidos,
        documento: body.documento,
        sede: body.sede,
        tiempoEmpresaValor: body.tiempoEmpresaValor,
        tiempoEmpresaUnidad: body.tiempoEmpresaUnidad,
        idEmpresaEmpleadora: body.idEmpresaEmpleadora,
        idAreaEmpleadora: body.idAreaEmpleadora,
        idPuestoEmpleadora: body.idPuestoEmpleadora,
        idGerenciaEmpleadora: body.idGerenciaEmpleadora,
        idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
        codigoEmpleadoJefe: body.codigoEmpleadoJefe ?? null,
        fechaModificacion: new Date(),
        actualizadoPorId: user.idUsuario,
      };

      return await this.prisma.empleado.update({
        where: { idEmpleado: id },
        data: empleadoUpdateData,
        include: { usuario: true },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error al actualizar al empleado:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar al empleado.',
      );
    }
  }

  // ============================================================
  // REMOVE (INACTIVAR)
  // ============================================================
  async remove(user: AuthUser, id: number) {
    try {
      const existEmpleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado: id },
        select: { idEmpleado: true },
      });

      if (!existEmpleado) throw new NotFoundException('Empleado no encontrado');

      return await this.prisma.empleado.update({
        where: { idEmpleado: id },
        data: {
          estado: false,
          fechaModificacion: new Date(),
          actualizadoPorId: user.idUsuario,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Error al eliminar (inactivar) al empleado:', error);
      throw new InternalServerErrorException(
        'No se pudo eliminar al empleado.',
      );
    }
  }

  // ============================================================
  // CREATE MASSIVE
  // ============================================================
  async createMany(user: AuthUser, data: CreateEmpleadoDto[]) {
    try {
      const codesUser = new Set();
      const codesEmpleado = new Set();

      for (const body of data) {
        if (codesUser.has(body.codigoUsuario)) {
          throw new BadRequestException(
            `Código de usuario duplicado dentro del archivo: ${body.codigoUsuario}`,
          );
        }
        codesUser.add(body.codigoUsuario);

        if (codesEmpleado.has(body.codigoEmpleado)) {
          throw new BadRequestException(
            `Código de empleado duplicado dentro del archivo: ${body.codigoEmpleado}`,
          );
        }
        codesEmpleado.add(body.codigoEmpleado);

        await this.validateUniqueFields(body);
      }

      return await this.prisma.$transaction(async (tx) => {
        const createdEmployees: any[] = [];

        for (const body of data) {
          const hashedPassword = await hash(body.contrasena, 10);

          const usuario = await tx.usuario.create({
            data: {
              codigoUsuario: body.codigoUsuario,
              contrasena: hashedPassword,
              rol: body.rol,
              creadoPorId: user.idUsuario,
            },
          });

          const empleado = await tx.empleado.create({
            data: {
              codigoEmpleado: body.codigoEmpleado,
              nombres: body.nombres,
              apellidos: body.apellidos,
              documento: body.documento,
              sede: body.sede,
              tiempoEmpresaValor: body.tiempoEmpresaValor,
              tiempoEmpresaUnidad: body.tiempoEmpresaUnidad,
              idEmpresaEmpleadora: body.idEmpresaEmpleadora,
              idAreaEmpleadora: body.idAreaEmpleadora,
              idPuestoEmpleadora: body.idPuestoEmpleadora,
              idGerenciaEmpleadora: body.idGerenciaEmpleadora,
              idUnidadOcupacionalEmpleadora: body.idUnidadOcupacionalEmpleadora,
              codigoEmpleadoJefe: body.codigoEmpleadoJefe ?? null,
              idUsuario: usuario.idUsuario,
              creadoPorId: user.idUsuario,
            },
            include: { usuario: true },
          });

          createdEmployees.push(empleado);
        }

        return createdEmployees;
      });
    } catch (error) {
      this.logger.error('Error en creación masiva de empleados:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'No se pudo completar la creación masiva de empleados.',
      );
    }
  }

  // ============================================================
  // OBTENER SUBORDINADOS POR USUARIO LOGUEADO
  // ============================================================
  async findSubordinadosByUsuario(id: number) {
    try {
      // 1. Obtener el empleado asociado al usuario
      const empleado = await this.prisma.empleado.findFirst({
        where: {
          idUsuario: id,
          estado: true,
        },
        select: {
          codigoEmpleado: true,
        },
      });

      if (!empleado) {
        throw new NotFoundException(
          'El usuario no tiene un empleado asociado o no existe.',
        );
      }

      // 2. Buscar todos los empleados cuyo jefe sea el código del empleado logueado
      const subordinados = await this.prisma.empleado.findMany({
        where: {
          codigoEmpleadoJefe: empleado.codigoEmpleado,
          estado: true,
        },
        include: {
          usuario: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      return subordinados;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error('Error al obtener subordinados por usuario:', error);
      throw new InternalServerErrorException(
        'No se pudo obtener los subordinados.',
      );
    }
  }

  // ============================================================
  // OBTENER EMPLEADOS POR EMPRESA EMPLEADORA
  // ============================================================
  async findByEmpresa(idEmpresaEmpleadora: number) {
    try {
      // 1. Validar existencia de la empresa empleadora
      const empresa = await this.prisma.empresaEmpleadora.findUnique({
        where: { idEmpresaEmpleadora },
        select: { idEmpresaEmpleadora: true },
      });

      if (!empresa) {
        throw new NotFoundException(
          `La empresa empleadora con ID ${idEmpresaEmpleadora} no existe.`,
        );
      }

      // 2. Obtener empleados asociados a dicha empresa
      const empleados = await this.prisma.empleado.findMany({
        where: {
          estado: true,
          idEmpresaEmpleadora,
        },
        include: {
          usuario: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      return empleados;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Error al obtener empleados por empresa empleadora:',
        error,
      );
      throw new InternalServerErrorException(
        'No se pudieron obtener los empleados por empresa empleadora.',
      );
    }
  }

  // ============================================================
  // SUBORDINADOS (POR ID DEL JEFE) + COMPETENCIAS DE LA UO
  // ============================================================
  async findSubordinadosWithCompetenciasByJefe(idEmpleadoJefe: number) {
    try {
      // 1. Obtener datos del jefe (para sacar su códigoEmpleado)
      const jefe = await this.prisma.empleado.findFirst({
        where: {
          idEmpleado: idEmpleadoJefe,
          estado: true,
        },
        select: {
          codigoEmpleado: true,
        },
      });

      if (!jefe) {
        throw new NotFoundException(
          `El empleado jefe con ID ${idEmpleadoJefe} no existe.`,
        );
      }

      // 2. Obtener subordinados directos
      const subordinados = await this.prisma.empleado.findMany({
        where: {
          codigoEmpleadoJefe: jefe.codigoEmpleado,
          estado: true,
        },
        include: {
          unidadOcupacionalEmpleadora: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });

      // 3. Para cada subordinado obtener competencias de su unidad ocupacional
      const results: any[] = [];

      for (const sub of subordinados) {
        const competencias =
          await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
            where: {
              idUnidadOcupacionalEmpleadora: sub.idUnidadOcupacionalEmpleadora,
            },
            include: {
              competencia: true,
              competenciaNivel: {
                include: {
                  items: true,
                },
              },
            },
          });

        results.push({
          subordinado: sub,
          competenciasAsignadas: competencias,
        });
      }

      return results;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        'Error al obtener subordinados con competencias:',
        error,
      );
      throw new InternalServerErrorException(
        'No se pudo obtener los subordinados con competencias.',
      );
    }
  }

  // ============================================================
  // COMPETENCIAS ASIGNADAS DE UN EMPLEADO (POR ID EMPLEADO)
  // ============================================================
  async findCompetenciasByEmpleado(idEmpleado: number) {
    try {
      // 1. Buscar empleado
      const empleado = await this.prisma.empleado.findUnique({
        where: { idEmpleado, estado: true },
        select: {
          idEmpleado: true,
          idUnidadOcupacionalEmpleadora: true,
          nombres: true,
          apellidos: true,
        },
      });

      if (!empleado) {
        throw new NotFoundException(
          `Empleado con ID ${idEmpleado} no encontrado.`,
        );
      }

      // 2. Buscar competencias según su unidad ocupacional
      const competencias =
        await this.prisma.unidadOcupacionalCompetenciaNivel.findMany({
          where: {
            idUnidadOcupacionalEmpleadora:
              empleado.idUnidadOcupacionalEmpleadora,
          },
          include: {
            competencia: true,
            competenciaNivel: {
              include: {
                items: true,
              },
            },
          },
        });

      return {
        empleado,
        competenciasAsignadas: competencias,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        `Error al obtener competencias del empleado ${idEmpleado}:`,
        error,
      );
      throw new InternalServerErrorException(
        'No se pudo obtener las competencias asignadas del empleado.',
      );
    }
  }
}
