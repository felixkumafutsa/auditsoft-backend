import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@auditsoft.space';

  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exitCode = 2;
    return;
  }

  console.log('Admin user found:');
  console.log(JSON.stringify(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      roles: user.userRoles?.map(ur => ur.role?.roleName),
      createdAt: user.createdAt,
    },
    null,
    2
  ));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
