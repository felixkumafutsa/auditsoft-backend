const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function debugShareError() {
    try {
        console.log('=== DEBUGGING SHARE ERROR FOR AUDIT ID 15 ===');
        
        // Simulate the exact same request from UI
        const mockUser = {
            id: 1,
            sub: 1,
            name: 'Audit Manager',
            email: 'audit.manager@mw265.com',
            role: 'Audit Manager'
        };
        
        const auditId = 15;
        const email = 'felixkumafutsa@gmail.com';
        const message = 'Please find the attached audit report: Audit Report - Audit inu. This report contains important audit findings and recommendations that require your attention.';
        
        console.log('📧 Debug parameters:');
        console.log('   Audit ID:', auditId);
        console.log('   Email:', email);
        console.log('   User:', mockUser.name, '(', mockUser.role, ')');
        console.log('   Message:', message);
        
        // Import the ReportsService
        const { ReportsService } = require('./dist/src/reports/reports.service');
        
        // Create a mock notification service
        const mockNotificationService = {
            create: async (data) => {
                console.log('📢 Notification created:', data.title);
            }
        };
        
        // Initialize ReportsService
        const reportsService = new ReportsService(prisma, mockNotificationService);
        
        console.log('\n🔍 Testing shareAuditReport with detailed error handling...');
        
        try {
            const result = await reportsService.shareAuditReport(auditId, email, message, mockUser);
            console.log('✅ Share successful:', result);
        } catch (error) {
            console.error('❌ Share failed with error:');
            console.error('   Error message:', error.message);
            console.error('   Error stack:', error.stack);
            
            // Check if it's a specific type of error
            if (error.name === 'NotFoundException') {
                console.log('   🔍 This is a "Not Found" error - audit or related data missing');
            } else if (error.name === 'InternalServerErrorException') {
                console.log('   🔍 This is an "Internal Server Error" - something went wrong during processing');
            } else if (error.message.includes('PDF')) {
                console.log('   🔍 This appears to be PDF generation related');
            } else if (error.message.includes('email') || error.message.includes('nodemailer')) {
                console.log('   🔍 This appears to be email related');
            }
            
            // Try to check what step failed
            console.log('\n🔍 Checking individual components...');
            
            // 1. Check if audit exists
            try {
                const audit = await prisma.audit.findUnique({
                    where: { id: auditId },
                    include: {
                        assignedManager: {
                            select: { name: true, email: true }
                        }
                    }
                });
                if (audit) {
                    console.log('✅ Audit exists:', audit.auditName);
                } else {
                    console.log('❌ Audit not found');
                }
            } catch (auditError) {
                console.log('❌ Error checking audit:', auditError.message);
            }
            
            // 2. Check email configuration
            try {
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
                    await transporter.verify();
                    console.log('✅ Email configuration verified');
                } else {
                    console.log('❌ Email credentials not configured');
                }
            } catch (emailError) {
                console.log('❌ Email configuration error:', emailError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Debug script failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugShareError();
