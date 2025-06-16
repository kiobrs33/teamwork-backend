// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('123456', 10);

  const admin = await prisma.usuario.create({
    data: {
      codigoUsuario: 'admin',
      // correoElectronico: faker.internet.email(),
      contrasena: hashedPassword,
      rol: 'ADMIN',
    },
  });
  /**const hashedPassword = await hash('123456', 10);

  const admin = await prisma.usuario.create({
    data: {
      codigoUsuario: "admin",
     // correoElectronico: faker.internet.email(),
      contrasena: hashedPassword,
      rol: 'ADMIN',
    },
  });

  for (let i = 0; i < 5; i++) {
    const empresa = await prisma.empresaEmpleadora.create({
      data: {
        nombreEmpresa: faker.company.name(),
        ruc: faker.string.numeric(11),
        direccionEmpresa: faker.location.streetAddress(),
        urlLogo: faker.image.url(),
        fechaVigenciaInicio: faker.date.past(),
        fechaVigenciaFin: faker.date.future(),
        creadoPorId: admin.idUsuario,
      },
    });

    const equipo = await prisma.equipoEmpleadora.create({
      data: {
        descripcion: faker.commerce.department(),
        idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
        creadoPorId: admin.idUsuario,
      },
    });

    const puesto = await prisma.puestoEmpleadora.create({
      data: {
        descripcion: faker.person.jobTitle(),
        idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
        creadoPorId: admin.idUsuario,
      },
    });

    const unidad = await prisma.unidadEmpleadora.create({
      data: {
        descripcion: faker.company.catchPhrase(),
        idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
        creadoPorId: admin.idUsuario,
      },
    });

    for (let j = 0; j < 5; j++) {
      const empleado = await prisma.empleado.create({
        data: {
          nombres: faker.person.firstName(),
          apellidoPaterno: faker.person.lastName(),
          apellidoMaterno: faker.person.lastName(),
          idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
          idEquipoEmpleadora: equipo.idEquipoEmpleadora,
          idPuestoEmpleadora: puesto.idPuestoEmpleadora,
          idUnidadEmpleadora: unidad.idUnidadEmpleadora,
          idUsuario: admin.idUsuario,
          creadoPorId: admin.idUsuario,
        },
      });

      const objetivo = await prisma.objetivo.create({
        data: {
          fechaVigenciaInicia: faker.date.past(),
          fechaVigenciaFin: faker.date.future(),
          idEmpresaEmpleadora: empresa.idEmpresaEmpleadora,
          idEmpleado: empleado.idEmpleado,
          creadoPorId: admin.idUsuario,
        },
      });

      for (let k = 0; k < 3; k++) {
        await prisma.objetivoDetalle.create({
          data: {
            idObjetivo: objetivo.idObjetivo,
            secuencial: k + 1,
            descripcion: faker.lorem.sentence(),
            descripcionIniciativa: faker.lorem.sentence(),
            unidadMedida: 'unidades',
            pesoEspecifico: parseFloat(
              faker.number.float({ min: 5, max: 30 }).toFixed(2),
            ),
            creadoPorId: admin.idUsuario,
          },
        });
      }
    }
  }

  console.log('✅ Datos de prueba generados correctamente.');**/
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar datos:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
