const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function testEmailSending() {
    try {
        console.log('=== TESTING EMAIL SENDING FOR AUDIT ID 15 ===');
        console.log('Environment variables loaded:');
        console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
        
        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('❌ Email credentials not configured');
            console.log('Please set EMAIL_USER and EMAIL_PASS in your .env file');
            console.log('Example:');
            console.log('EMAIL_USER=your-gmail@gmail.com');
            console.log('EMAIL_PASS=your-app-password');
            return;
        }
        
        console.log('✅ Email credentials found');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        
        // Check if audit ID 15 exists
        const audit = await prisma.audit.findUnique({
            where: { id: 15 },
            include: {
                assignedManager: {
                    select: { name: true, email: true }
                }
            }
        });
        
        if (!audit) {
            console.log('❌ Audit with ID 15 not found');
            return;
        }
        
        console.log('✅ Audit found:', audit.auditName);
        console.log('   Assigned Manager:', audit.assignedManager?.name || 'Unassigned');
        
        // Initialize email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Test email configuration
        console.log('📧 Testing email configuration...');
        await transporter.verify();
        console.log('✅ Email transporter verified');
        
        // Create test email
        const emailSubject = `Audit Report: ${audit.auditName}`;
        const emailBody = `This is a test email for audit report "${audit.auditName}". 
        
Audit Details:
- Audit ID: ${audit.id}
- Audit Name: ${audit.auditName}
- Status: ${audit.status}
- Assigned Manager: ${audit.assignedManager?.name || 'Unassigned'}

This is a test to verify email sending functionality.`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'felixkumafutsa@gmail.com',
            subject: emailSubject,
            text: emailBody
        };
        
        // Send test email
        console.log('📤 Sending test email to felixkumafutsa@gmail.com...');
        const result = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('   Response:', result.response);
        
        console.log('\n=== EMAIL TEST COMPLETED SUCCESSFULLY ===');
        console.log('Please check your inbox at felixkumafutsa@gmail.com');
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        if (error.code === 'EAUTH') {
            console.log('\n🔧 Authentication Error - Possible solutions:');
            console.log('1. Check EMAIL_USER and EMAIL_PASS are correct');
            console.log('2. For Gmail, ensure you\'re using an App Password');
            console.log('3. Enable 2-factor authentication on your Gmail account');
            console.log('4. Generate App Password: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ECONNECTION') {
            console.log('\n🔧 Connection Error - Possible solutions:');
            console.log('1. Check your internet connection');
            console.log('2. Verify firewall settings');
            console.log('3. Try again later');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testEmailSending();
