import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });
    
    // Check if user ID 1 exists
    const user1 = await prisma.user.findUnique({
      where: { id: 1 },
      select: { id: true, name: true, email: true }
    });
    
    if (user1) {
      console.log(`✅ User ID 1 exists: ${user1.name} (${user1.email})`);
    } else {
      console.log(`❌ User ID 1 does not exist`);
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('🎉 User check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 User check failed:', error);
      process.exit(1);
    });
}

export default checkUsers;
