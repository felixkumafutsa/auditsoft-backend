
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dashboard data...');

  // 1. Ensure a user exists to be the owner
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found. Please run initial setup/seed first.');
    return;
  }
  console.log(`Using user ID ${user.id} as owner.`);

  // 2. Create Sample Audits with different statuses
  const auditStatuses = ['Planned', 'In Progress', 'In Progress', 'Review', 'Closed', 'Finalized'];
  const auditTypes = ['Operational', 'IT', 'Compliance', 'Financial'];

  for (let i = 0; i < 10; i++) {
    const status = auditStatuses[i % auditStatuses.length];
    const type = auditTypes[i % auditTypes.length];
    
    await prisma.audit.create({
      data: {
        auditName: `Sample Audit ${i + 1} - ${type}`,
        auditType: type,
        status: status,
        startDate: new Date(),
        assignedManagerId: user.id,
      },
    });
  }
  console.log('Created 10 sample audits.');

  // 3. Create Sample Risks and KRIs
  const riskCategories = ['Operational', 'Financial', 'Compliance', 'IT'];
  const kriStatuses = ['Stable', 'Warning', 'Critical', 'Stable', 'Stable'];

  for (let i = 0; i < 5; i++) {
    const risk = await prisma.risk.create({
      data: {
        riskId: `RISK-${100 + i}`,
        title: `Sample Risk ${i + 1}`,
        category: riskCategories[i % riskCategories.length],
        impact: 'High',
        likelihood: 'Medium',
        status: 'Open',
        ownerId: user.id,
      },
    });

    await prisma.kRI.create({
      data: {
        kriId: `KRI-${100 + i}`,
        name: `KRI for ${risk.title}`,
        metricType: 'Percentage',
        targetValue: 95,
        warningThreshold: 90,
        criticalThreshold: 85,
        currentValue: 88, // Just a dummy value
        status: kriStatuses[i % kriStatuses.length],
        frequency: 'Monthly',
        riskId: risk.id,
        ownerId: user.id,
      },
    });
  }
  console.log('Created 5 sample Risks and KRIs.');

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
