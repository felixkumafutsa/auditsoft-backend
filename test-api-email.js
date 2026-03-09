const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function testApiEmailSending() {
    try {
        console.log('=== TESTING API EMAIL SENDING FOR AUDIT ID 15 ===');
        
        // Simulate authenticated user with proper role
        const mockUser = {
            id: 1,
            sub: 1,
            name: 'Test Admin',
            email: 'admin@auditsoft.com',
            role: 'Chief Auditor'
        };
        
        console.log('✅ Mock user:', mockUser.name, '(', mockUser.role, ')');
        
        // Import the ReportsService to test the actual API method
        const { ReportsService } = require('./dist/src/reports/reports.service');
        
        // Create a mock notification service
        const mockNotificationService = {
            create: async (data) => {
                console.log('📢 Notification created:', data.title);
            }
        };
        
        // Initialize ReportsService
        const reportsService = new ReportsService(prisma, mockNotificationService);
        
        console.log('📧 Testing API shareAuditReport method...');
        
        // Test the actual API method used by the UI
        const result = await reportsService.shareAuditReport(
            15, // auditId
            'felixkumafutsa@gmail.com', // email
            'Test email from API for audit report ID 15', // message
            mockUser // authenticated user
        );
        
        console.log('✅ API email sharing successful!');
        console.log('Result:', result);
        
        console.log('\n=== API EMAIL TEST COMPLETED SUCCESSFULLY ===');
        console.log('The UI should now be able to send emails successfully');
        
    } catch (error) {
        console.error('❌ API email test failed:', error.message);
        console.error('Full error:', error);
        
        if (error.message.includes('Audit not found')) {
            console.log('\n🔧 Possible solutions:');
            console.log('1. Verify audit ID 15 exists in the database');
            console.log('2. Check database connection');
        } else if (error.message.includes('Email')) {
            console.log('\n🔧 Email-related solutions:');
            console.log('1. Verify EMAIL_USER and EMAIL_PASS are correct');
            console.log('2. Check Gmail App Password configuration');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testApiEmailSending();
