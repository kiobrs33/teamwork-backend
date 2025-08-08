import { PrismaClient } from '@prisma/client';
//import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('12345678', 10);

  const admin = await prisma.usuario.create({
    data: {
      codigoUsuario: 'admin',
      contrasena: hashedPassword,
      rol: 'ADMIN',
    },
  });

  await prisma.usuario.create({
    data: {
      codigoUsuario: 'AU001',
      contrasena: hashedPassword,
      rol: 'JEFE',
    },
  });

  await prisma.usuario.create({
    data: {
      codigoUsuario: 'AU002',
      contrasena: hashedPassword,
      rol: 'EMPLEADO',
    },
  });
}

main()
  .then(() => {
    console.log('✅ Datos de prueba generados correctamente.');
  })
  .catch((e) => {
    console.error('❌ Error al sembrar datos:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
