const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function fixUserRoles() {
    try {
        console.log('=== FIXING USER ROLES FOR EMAIL SHARING ===');
        
        // Check what roles exist
        const roles = await prisma.role.findMany();
        console.log('📋 Available roles:');
        roles.forEach(role => {
            console.log(`   - ${role.roleName} (ID: ${role.id})`);
        });
        
        // Get users who should have sharing permissions
        const chiefAuditor = await prisma.user.findFirst({ 
            where: { email: { contains: 'chief.auditor' } } 
        });
        const systemAdmin = await prisma.user.findFirst({ 
            where: { email: { contains: 'admin@mw265' } } 
        });
        const auditManager = await prisma.user.findFirst({ 
            where: { email: { contains: 'audit.manager' } } 
        });
        
        console.log('\n🎯 Assigning roles to key users:');
        
        // Assign Chief Auditor role
        if (chiefAuditor) {
            const chiefAuditorRole = roles.find(r => r.roleName === 'Chief Auditor');
            if (chiefAuditorRole) {
                await prisma.userRole.upsert({
                    where: { userId_roleId: { userId: chiefAuditor.id, roleId: chiefAuditorRole.id } },
                    update: {},
                    create: { userId: chiefAuditor.id, roleId: chiefAuditorRole.id }
                });
                console.log(`✅ Chief Auditor role assigned to: ${chiefAuditor.name} (${chiefAuditor.email})`);
            }
        }
        
        // Assign System Administrator role
        if (systemAdmin) {
            const systemAdminRole = roles.find(r => r.roleName === 'System Administrator');
            if (systemAdminRole) {
                await prisma.userRole.upsert({
                    where: { userId_roleId: { userId: systemAdmin.id, roleId: systemAdminRole.id } },
                    update: {},
                    create: { userId: systemAdmin.id, roleId: systemAdminRole.id }
                });
                console.log(`✅ System Administrator role assigned to: ${systemAdmin.name} (${systemAdmin.email})`);
            }
        }
        
        // Assign Audit Manager role
        if (auditManager) {
            const auditManagerRole = roles.find(r => r.roleName === 'Audit Manager');
            if (auditManagerRole) {
                await prisma.userRole.upsert({
                    where: { userId_roleId: { userId: auditManager.id, roleId: auditManagerRole.id } },
                    update: {},
                    create: { userId: auditManager.id, roleId: auditManagerRole.id }
                });
                console.log(`✅ Audit Manager role assigned to: ${auditManager.name} (${auditManager.email})`);
            }
        }
        
        console.log('\n🔄 Verification - Updated user roles:');
        const updatedUsers = await prisma.user.findMany({
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            },
            where: {
                userRoles: {
                    some: {}
                }
            }
        });
        
        updatedUsers.forEach(user => {
            console.log(`👤 ${user.name} (${user.email})`);
            console.log(`   Roles: ${user.userRoles.map(ur => ur.role.roleName).join(', ')}`);
            
            const canShare = user.userRoles.some(ur => 
                ['Chief Auditor', 'System Administrator', 'Audit Manager'].includes(ur.role.roleName)
            );
            console.log(`   Can share reports: ${canShare ? '✅ Yes' : '❌ No'}`);
        });
        
        console.log('\n✅ User roles fixed! Email sharing should now work in the UI.');
        console.log('Please log out and log back in to refresh your user permissions.');
        
    } catch (error) {
        console.error('❌ Error fixing user roles:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixUserRoles();
