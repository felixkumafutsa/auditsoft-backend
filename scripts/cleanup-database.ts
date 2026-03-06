import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🧹 Starting database cleanup...');
  
  try {
    // Get counts before cleanup
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const userRoleCount = await prisma.userRole.count();
    
    console.log(`📊 Preserving: ${userCount} users, ${roleCount} roles, ${userRoleCount} user roles`);
    
    // Clear tables in dependency order
    const tables = [
      // Notifications and messages
      { name: 'Notification', model: prisma.notification },
      { name: 'Message', model: prisma.message },
      
      // Evidence and versions
      { name: 'EvidenceVersion', model: prisma.evidenceVersion },
      { name: 'Evidence', model: prisma.evidence },
      
      // Audit program related
      { name: 'ControlMapping', model: prisma.controlMapping },
      { name: 'Workpaper', model: prisma.workpaper },
      
      // Findings and action plans
      { name: 'ActionPlan', model: prisma.actionPlan },
      { name: 'Finding', model: prisma.finding },
      
      // Audit programs and reports
      { name: 'AuditProgram', model: prisma.auditProgram },
      { name: 'Report', model: prisma.report },
      { name: 'Timesheet', model: prisma.timesheet },
      { name: 'Audit', model: prisma.audit },
      
      // Risk and KRI
      { name: 'KRI', model: prisma.kRI },
      { name: 'Risk', model: prisma.risk },
      
      // Audit universe
      { name: 'AuditUniverse', model: prisma.auditUniverse },
      
      // Compliance and policies
      { name: 'PolicyMapping', model: prisma.policyMapping },
      { name: 'Policy', model: prisma.policy },
      { name: 'ComplianceFramework', model: prisma.complianceFramework },
      
      // Automation
      { name: 'ControlRun', model: prisma.controlRun },
      { name: 'AutomatedControl', model: prisma.automatedControl },
      
      // Integrations
      { name: 'Integration', model: prisma.integration },
      
      // Audit logs
      { name: 'AuditLog', model: prisma.auditLog },
    ];

    // Clear each table
    for (const table of tables) {
      try {
        const result = await (table.model as any).deleteMany();
        console.log(`✅ Cleared ${table.name}: ${result.count} records`);
      } catch (error) {
        console.log(`⚠️  ${table.name}: ${error.message}`);
      }
    }
    
    // Verify preserved data
    const finalUserCount = await prisma.user.count();
    const finalRoleCount = await prisma.role.count();
    const finalUserRoleCount = await prisma.userRole.count();
    
    console.log('\n📋 Summary:');
    console.log(`👤 Users: ${finalUserCount} (preserved)`);
    console.log(`🔑 Roles: ${finalRoleCount} (preserved)`);
    console.log(`🔗 UserRoles: ${finalUserRoleCount} (preserved)`);
    
    console.log('\n✨ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log('🎉 Cleanup process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup failed:', error);
      process.exit(1);
    });
}

export default clearDatabase;
