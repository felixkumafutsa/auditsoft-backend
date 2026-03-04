import { PrismaClient } from '@prisma/client';
import { promisify } from 'util';
import { randomBytes, scrypt } from 'crypto';

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function main() {
  console.log('Starting DB reset and seed (admin only)');

  // Disable FK checks so we can truncate tables in any order
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  // Get all tables in the current database
  const tables = (await prisma.$queryRawUnsafe(
    `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE();`
  )) as Array<{ TABLE_NAME: string }>;

  const skip = new Set(['_prisma_migrations', 'prisma_migrations', 'migrations']);

  for (const r of tables) {
    const table = r.TABLE_NAME;
    if (!table) continue;
    if (skip.has(table)) continue;
    if (table.startsWith('sqlite_')) continue;

    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
      console.log(`Truncated table ${table}`);
    } catch (err) {
      console.warn(`Skipping truncate for ${table}:`, err instanceof Error ? err.message : err);
    }
  }

  // Re-enable FK checks
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

  // Create System Administrator role if missing
  const roleName = 'System Administrator';
  let role = await prisma.role.findUnique({ where: { roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { roleName, description: 'Full system administrator' } });
    console.log(`Created role '${roleName}'`);
  }

  // Create admin user
  const email = 'admin@auditsoft.space';
  const password = 'Audit-pass';

  // ensure no existing user with same email
  await prisma.user.deleteMany({ where: { email } });

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email,
      passwordHash,
      status: 'active',
      userRoles: {
        create: [{ roleId: role.id }],
      },
    },
  });

  console.log(`Created admin user '${email}' with password '${password}'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
