"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
const prisma = new client_1.PrismaClient();
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const hash = (await scryptAsync(password, salt, 64));
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
    const adminRole = await prisma.role.findUnique({
        where: { roleName: 'System Administrator' },
    });
    if (adminRole) {
        const defaultUser = await prisma.user.findUnique({
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
//# sourceMappingURL=seed.js.map