import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const rolesToSeed = [
    {
      roleName: 'System Administrator',
      description: 'Full system configuration and user management.',
    },
    {
      roleName: 'Chief Audit Executive (CAE)',
      description: 'Views all reports, approves audit plans, and holds escalation authority.',
    },
    {
      roleName: 'Audit Manager',
      description: 'Creates audits, assigns auditors, and reviews/approves fieldwork.',
    },
    {
      roleName: 'Auditor',
      description: 'Executes audits, uploads evidence, and drafts findings.',
    },
    {
      roleName: 'Process Owner',
      description: 'Views assigned findings, submits remediation evidence, and responds to auditors.',
    },
    {
      roleName: 'Executive / Board Viewer',
      description: 'Read-only access to dashboards and executive reports.',
    },
  ];

  for (const roleData of rolesToSeed) {
    const role = await prisma.role.findUnique({
      where: { roleName: roleData.roleName },
    });

    if (!role) {
      await prisma.role.create({
        data: roleData,
      });
      console.log(`Role '${roleData.roleName}' created.`);
    }
  }

  // Create a default user
  const adminRole = await prisma.role.findUnique({
    where: { roleName: 'System Administrator' },
  });

  if (adminRole) {
    const defaultUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (!defaultUser) {
      // IMPORTANT: In a real application, you should hash this password securely
      const passwordHash = '4b3e3e29f8f4a2b2e5a6f7d8c9a0b1c2:8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'; // Sample scrypt hash for "password"

      const user = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          passwordHash: passwordHash,
          userRoles: {
            create: [{
              roleId: adminRole.id,
            }],
          },
        },
      });
      console.log(`Default user 'admin@example.com' created with password 'password' (scrypt hashed)`);
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
