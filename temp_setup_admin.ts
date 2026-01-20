import { PrismaService } from './prisma/prisma.service';
import { UserService } from './src/user/user.service';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function bootstrap() {
  const prismaService = new PrismaService();
  await prismaService.onModuleInit(); // Connect to the database

  const userService = new UserService(prismaService);

  const adminEmail = 'admin@example.com';
  const newPassword = 'password123'; // The desired new password

  // 1. Generate a new hashed password for "password123"
  const salt = randomBytes(16).toString('hex');
  const passwordHash = (await scryptAsync(newPassword, salt, 64)) as Buffer;
  const newHashedPassword = `${salt}:${passwordHash.toString('hex')}`;

  console.log(`Generated hash for '${newPassword}': ${newHashedPassword}`);

  try {
    // 2. Find or Create 'Admin' Role
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
    } else {
      console.log('"Admin" role already exists.');
    }

    // 3. Find or Create 'admin@example.com' user
    let adminUser = await userService.findByEmail(adminEmail);

    if (adminUser) {
      // User exists, update password and ensure admin role
      await userService.update(adminUser.id, { password: newPassword }); // userService.update will hash it
      console.log(`Updated password for existing user: ${adminEmail}`);

      const hasAdminRole = (adminUser as any).userRoles.some(
        (ur) => ur.role.roleName === 'Admin'
      );
      if (!hasAdminRole) {
        await userService.assignRole(adminUser.id, adminRole.id);
        console.log(`Assigned "Admin" role to ${adminEmail}`);
      } else {
        console.log(`${adminEmail} already has "Admin" role.`);
      }
    } else {
      // User does not exist, create new user and assign admin role
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

    console.log(
      `Admin user ${adminEmail} is now set up with password: ${newPassword}`
    );
  } catch (error) {
    console.error('Error during admin setup:', error);
  } finally {
    await prismaService.onModuleDestroy(); // Disconnect from the database
  }
}

bootstrap();
