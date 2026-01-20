import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password,
      role: 'ADMIN',
    },
  });

  console.log('Admin user seeded');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
