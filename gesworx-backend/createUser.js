import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  const hashedPassword = await bcrypt.hash('senha123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'teste@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('User created:', user);
}

createUser()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
