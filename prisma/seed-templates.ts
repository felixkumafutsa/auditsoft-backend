import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Audit Templates...');

  const templates = [
    {
      name: 'ISO 27001 Compliance',
      type: 'Compliance',
      programs: [
        { procedureName: 'Review Information Security Policy', controlReference: 'A.5.1.1', expectedOutcome: 'Policy document exists and is approved.' },
        { procedureName: 'Check Access Control', controlReference: 'A.9.1.1', expectedOutcome: 'Access control policy is documented.' },
      ]
    },
    {
      name: 'GDPR Compliance',
      type: 'Compliance',
      programs: [
        { procedureName: 'Verify Data Processing Records', controlReference: 'Art. 30', expectedOutcome: 'Records of processing activities are maintained.' },
        { procedureName: 'Check Consent Mechanisms', controlReference: 'Art. 7', expectedOutcome: 'Consent forms are compliant.' },
      ]
    },
    {
      name: 'Operational Efficiency',
      type: 'Operational',
      programs: [
        { procedureName: 'Review Process Documentation', controlReference: 'OP-01', expectedOutcome: 'Process maps are up to date.' },
        { procedureName: 'Analyze KPI Reporting', controlReference: 'OP-02', expectedOutcome: 'KPIs are reported monthly.' },
      ]
    }
  ];

  for (const t of templates) {
    const existing = await prisma.audit.findFirst({
      where: { auditName: t.name, status: 'Template' }
    });

    if (!existing) {
      await prisma.audit.create({
        data: {
          auditName: t.name,
          auditType: t.type,
          status: 'Template',
          auditPrograms: {
            create: t.programs
          }
        }
      });
      console.log(`Created template: ${t.name}`);
    } else {
      console.log(`Template already exists: ${t.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
