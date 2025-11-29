import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('12345678', 10);

  // 1. Crear empresa y grupos base
  const empresa = await prisma.empresaEmpleadora.create({
    data: {
      nombreEmpresa: 'TeamWork SAC',
      ruc: faker.string.numeric(11),
      direccionEmpresa: faker.location.streetAddress(),
      urlLogo: faker.image.url(),
      modeloEmpresa: '90',
      fechaVigenciaInicio: new Date(),
      fechaVigenciaFin: new Date('2030-12-31'),
      fechaVigenciaInicioObjetivo: new Date(),
      fechaVigenciaFinObjetivo: new Date('2030-12-31'),
      creadoPorId: 1,
    },
  });

  const area = await prisma.areaEmpleadora.create({
    data: {
      descripcion: 'Área General TeamWork SAC',
      idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
      creadoPorId: 1,
    },
  });

  const puesto = await prisma.puestoEmpleadora.create({
    data: {
      descripcion: 'Puesto Base TeamWork SAC',
      idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
      creadoPorId: 1,
    },
  });

  const gerencia = await prisma.gerenciaEmpleadora.create({
    data: {
      descripcion: 'Gerencia General TeamWork SAC',
      idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
      creadoPorId: 1,
    },
  });

  const unidad = await prisma.unidadOcupacionalEmpleadora.create({
    data: {
      descripcion: 'Unidad General TeamWork SAC',
      idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
      creadoPorId: 1,
    },
  });

  // Helper rápido para crear usuario + empleado
  async function crearUsuarioYEmpleado(
    codigoUsuario: string,
    rol: string,
    jefeCodigo = '',
  ) {
    const user = await prisma.usuario.create({
      data: { codigoUsuario, contrasena: hashedPassword, rol, creadoPorId: 1 },
    });

    await prisma.empleado.create({
      data: {
        codigoEmpleado: faker.string.alphanumeric(6).toUpperCase(),
        nombres: faker.person.firstName(),
        apellidos: faker.person.lastName(),
        documento: faker.string.numeric(8),
        sede: faker.location.city(),
        tiempoEmpresaValor: 1,
        tiempoEmpresaUnidad: 'AÑOS',
        idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
        idAreaEmpleadora: area.idAreaEmpleadora,
        idPuestoEmpleadora: puesto.idPuestoEmpleadora,
        idGerenciaEmpleadora: gerencia.idGerenciaEmpleadora,
        idUnidadOcupacionalEmpleadora: unidad.idUnidadOcupacionalEmpleadora,
        codigoEmpleadoJefe: jefeCodigo,
        idUsuario: user.idUsuario,
        creadoPorId: 1,
      },
    });

    return user;
  }

  // 2. Crear usuarios ADMIN, JEFE, EMPLEADO
  const adminUser = await crearUsuarioYEmpleado('admin', 'ADMIN');
  const jefeUser = await crearUsuarioYEmpleado('jefe', 'JEFE');
  const empleadoUser = await crearUsuarioYEmpleado('empleado', 'EMPLEADO');

  console.log('Users', adminUser, jefeUser, empleadoUser);

  // =========================
  // 2. Crear empresas
  // =========================
  // const totalEmpresas = 20;
  // const empresas: any[] = [];

  // for (let i = 0; i < totalEmpresas; i++) {
  //   const empresa = await prisma.empresaEmpleadora.create({
  //     data: {
  //       nombreEmpresa: `${faker.company.name()} SAC`,
  //       ruc: faker.string.numeric(11),
  //       direccionEmpresa: faker.location.streetAddress(),
  //       urlLogo: faker.image.url(),
  //       modeloEmpresa: faker.helpers.arrayElement(['90', '180']),
  //       fechaVigenciaInicio: new Date(),
  //       fechaVigenciaFin: new Date('2030-12-31'),
  //       fechaVigenciaInicioObjetivo: new Date(),
  //       fechaVigenciaFinObjetivo: new Date('2030-12-31'),
  //       creadoPorId: adminUser.idUsuario,
  //     },
  //   });
  //   empresas.push(empresa);
  // }

  // =========================
  // 3. Crear estructuras por empresa
  // =========================
  // const registrosPorEmpresa = 5;

  // for (const empresa of empresas) {
  //   console.log(
  //     `📌 Creando estructuras para Empresa ${empresa.idEmpresaEmpleadora}`,
  //   );

  //   const promesas: any[] = [];

  //   for (let i = 0; i < registrosPorEmpresa; i++) {
  //     promesas.push(
  //       prisma.areaEmpleadora.create({
  //         data: {
  //           descripcion: `Área ${faker.commerce.department()} - ${empresa.nombreEmpresa}`,
  //           idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
  //           creadoPorId: adminUser.idUsuario,
  //         },
  //       }),

  //       prisma.puestoEmpleadora.create({
  //         data: {
  //           descripcion: `${faker.person.jobTitle()} - ${empresa.nombreEmpresa}`,
  //           idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
  //           creadoPorId: adminUser.idUsuario,
  //         },
  //       }),

  //       prisma.gerenciaEmpleadora.create({
  //         data: {
  //           descripcion: `Gerencia de ${faker.commerce.department()}`,
  //           idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
  //           creadoPorId: adminUser.idUsuario,
  //         },
  //       }),

  //       prisma.unidadOcupacionalEmpleadora.create({
  //         data: {
  //           descripcion: `Unidad ${faker.word.adjective()} ${faker.word.noun()}`,
  //           idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
  //           creadoPorId: adminUser.idUsuario,
  //         },
  //       }),
  //     );
  //   }

  //   await Promise.all(promesas);

  //   console.log(
  //     `✔️ Estructuras creadas para Empresa ${empresa.idEmpresaEmpleadora}`,
  //   );
  // }
}

main()
  .then(() => console.log('✅ Datos de prueba generados correctamente.'))
  .catch((e) => {
    console.error('❌ Error al sembrar datos:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
