const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function checkUserRoles() {
    try {
        console.log('=== CHECKING USER ROLES FOR EMAIL SHARING ===');
        
        // Check all users and their roles
        const users = await prisma.user.findMany({
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });
        
        console.log('📋 All users and their roles:');
        users.forEach(user => {
            console.log(`\n👤 ${user.name} (${user.email})`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Roles: ${user.userRoles.map(ur => ur.role.name).join(', ') || 'No roles assigned'}`);
            
            // Check if user can share reports
            const canShare = user.userRoles.some(ur => 
                ['Chief Auditor', 'System Administrator', 'Audit Manager'].includes(ur.role.name)
            );
            console.log(`   Can share reports: ${canShare ? '✅ Yes' : '❌ No'}`);
        });
        
        // Check specifically for Chief Auditor role
        const chiefAuditors = users.filter(user => 
            user.userRoles.some(ur => ur.role.name === 'Chief Auditor')
        );
        
        console.log(`\n🎯 Chief Auditors (${chiefAuditors.length}):`);
        chiefAuditors.forEach(user => {
            console.log(`   - ${user.name} (${user.email})`);
        });
        
        if (chiefAuditors.length === 0) {
            console.log('\n⚠️  No Chief Auditors found. Users with this role can share reports.');
        }
        
    } catch (error) {
        console.error('❌ Error checking user roles:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserRoles();
