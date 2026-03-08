import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function main() {
  console.log(`Start seeding ...`);

  const rolesToSeed = [
    {
      roleName: 'System Administrator',
      description: 'Full system configuration and user management.',
    },
    {
      roleName: 'Chief Auditor',
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
      roleName: 'Board Member',
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
    let defaultUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (!defaultUser) {
      const passwordHash = await hashPassword('password');

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
      console.log(`Default user 'admin@example.com' created with password 'password'`);
    }
  }

  const caeRole = await prisma.role.findUnique({
    where: { roleName: 'Chief Auditor' },
  });

  if (caeRole) {
    let caeUser = await prisma.user.findUnique({
      where: { email: 'chief.auditor@example.com' },
    });

    if (!caeUser) {
      const passwordHash = await hashPassword('password');

      const user = await prisma.user.create({
        data: {
          name: 'Chief Auditor',
          email: 'chief.auditor@example.com',
          passwordHash: passwordHash,
          userRoles: {
            create: [{
              roleId: caeRole.id,
            }],
          },
        },
      });
      console.log(`Chief Auditor 'chief.auditor@example.com' created with password 'password'`);
    }
  }

    const auditorRole = await prisma.role.findUnique({
    where: { roleName: 'Auditor' },
  });

  if (auditorRole) {
    let auditorUser = await prisma.user.findUnique({
      where: { email: 'auditor@example.com' },
    });

    if (!auditorUser) {
      const passwordHash = await hashPassword('password');

      const user = await prisma.user.create({
        data: {
          name: 'Auditor User',
          email: 'auditor@example.com',
          passwordHash: passwordHash,
          userRoles: {
            create: [{
              roleId: auditorRole.id,
            }],
          },
        },
      });
      console.log(`Auditor user 'auditor@example.com' created with password 'password'`);
    }
  }

      const processOwnerRole = await prisma.role.findUnique({
    where: { roleName: 'Process Owner' },
  });

  if (processOwnerRole) {
    let processOwnerUser = await prisma.user.findUnique({
      where: { email: 'process@example.com' },
    });

    if (!processOwnerUser) {
      const passwordHash = await hashPassword('password');

      const user = await prisma.user.create({
        data: {
          name: 'Process Owner User',
          email: 'process@example.com',
          passwordHash: passwordHash,
          userRoles: {
            create: [{
              roleId: processOwnerRole.id,
            }],
          },
        },
      });
      console.log(`Process Owner user 'process@example.com' created with password 'password'`);
    }
  }

  const managerRole = await prisma.role.findUnique({
    where: { roleName: 'Audit Manager' },
  });

  if (managerRole) {
    let managerUser = await prisma.user.findUnique({
      where: { email: 'manager@example.com' },
    });

    if (!managerUser) {
      const passwordHash = await hashPassword('password');

      const user = await prisma.user.create({
        data: {
          name: 'Audit Manager User',
          email: 'manager@example.com',
          passwordHash: passwordHash,
          userRoles: {
            create: [{
              roleId: managerRole.id,
            }],
          },
        },
      });
      console.log(`Audit Manager user 'manager@example.com' created with password 'password'`);
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
