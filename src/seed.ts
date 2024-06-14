import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const password = process.env.ADMIN_PASSWORD;
const salt_rounds = Number(process.env.SALT_ROUNDS) || 10;

async function main() {
  if (!password) {
    throw new Error('ADMIN_PASSWORD not set');
  }
  await prisma.user.upsert({
    where: { nationalId: '29643379' },
    update: {},
    create: {
      fullname: 'José Vielma',
      email: 'josevglod@gmail.com',
      nationalId: '29643379',
      password: await bcrypt.hash(password, salt_rounds),
      role: 'ADMIN',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
