"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = require("./prisma/prisma.service");
const user_service_1 = require("./src/user/user.service");
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
async function bootstrap() {
    const prismaService = new prisma_service_1.PrismaService();
    await prismaService.onModuleInit();
    const userService = new user_service_1.UserService(prismaService);
    const adminEmail = 'admin@example.com';
    const newPassword = 'password123';
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const passwordHash = (await scryptAsync(newPassword, salt, 64));
    const newHashedPassword = `${salt}:${passwordHash.toString('hex')}`;
    console.log(`Generated hash for '${newPassword}': ${newHashedPassword}`);
    try {
        let adminRole = await prismaService.role.findUnique({
            where: { roleName: 'Admin' },
        });
        if (!adminRole) {
            adminRole = await prismaService.role.create({
                data: {
                    roleName: 'Admin',
                    description: 'Administrator role with full access',
                },
            });
            console.log('Created "Admin" role.');
        }
        else {
            console.log('"Admin" role already exists.');
        }
        let adminUser = await userService.findByEmail(adminEmail);
        if (adminUser) {
            await userService.update(adminUser.id, { password: newPassword });
            console.log(`Updated password for existing user: ${adminEmail}`);
            const hasAdminRole = adminUser.userRoles.some((ur) => ur.role.roleName === 'Admin');
            if (!hasAdminRole) {
                await userService.assignRole(adminUser.id, adminRole.id);
                console.log(`Assigned "Admin" role to ${adminEmail}`);
            }
            else {
                console.log(`${adminEmail} already has "Admin" role.`);
            }
        }
        else {
            const createdUser = await userService.create({
                name: 'Admin User',
                email: adminEmail,
                password: newPassword,
                status: 'active',
                mfaEnabled: false,
            });
            console.log(`Created new user: ${adminEmail}`);
            await userService.assignRole(createdUser.id, adminRole.id);
            console.log(`Assigned "Admin" role to ${adminEmail}`);
        }
        console.log(`Admin user ${adminEmail} is now set up with password: ${newPassword}`);
    }
    catch (error) {
        console.error('Error during admin setup:', error);
    }
    finally {
        await prismaService.onModuleDestroy();
    }
}
bootstrap();
//# sourceMappingURL=temp_setup_admin.js.map