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
    console.log(`Starting to seed another admin user...`);

    const adminRole = await prisma.role.findUnique({
        where: { roleName: 'System Administrator' },
    });

    if (!adminRole) {
        console.error("Role 'System Administrator' not found. Please run the main seed script first.");
        return;
    }

    const newAdminEmail = 'felix.admin@example.com';
    const newAdminName = 'Felix Admin';
    const newAdminPassword = 'password123';

    let existingUser = await prisma.user.findUnique({
        where: { email: newAdminEmail },
    });

    if (!existingUser) {
        const passwordHash = await hashPassword(newAdminPassword);

        const user = await prisma.user.create({
            data: {
                name: newAdminName,
                email: newAdminEmail,
                passwordHash: passwordHash,
                userRoles: {
                    create: [{
                        roleId: adminRole.id,
                    }],
                },
            },
        });
        console.log(`New admin user '${newAdminEmail}' created with name '${newAdminName}' and password '${newAdminPassword}'`);
    } else {
        console.log(`User '${newAdminEmail}' already exists.`);
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
