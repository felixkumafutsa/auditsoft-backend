import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAudits() {
  try {
    console.log('🔍 Checking audits in database...');
    
    const audits = await prisma.audit.findMany({
      select: {
        id: true,
        auditName: true,
        status: true,
      },
      take: 5, // Limit to first 5 for brevity
    });
    
    console.log(`Found ${audits.length} audits (showing first 5):`);
    audits.forEach(audit => {
      console.log(`ID: ${audit.id}, Name: ${audit.auditName}, Status: ${audit.status}`);
    });
    
    if (audits.length === 0) {
      console.log('⚠️  No audits found. You may need to create some audits first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking audits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkAudits()
    .then(() => {
      console.log('🎉 Audit check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Audit check failed:', error);
      process.exit(1);
    });
}

export default checkAudits;
