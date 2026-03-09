// This script checks what environment variables are available in production
// We'll simulate what the production environment would see

console.log('=== CHECKING PRODUCTION ENVIRONMENT VARIABLES ===');

// Check current environment variables
console.log('🔍 Environment variables:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('   NODE_ENV:', process.env.NODE_ENV || '❌ Not set');

// Check if we're in production mode
if (process.env.NODE_ENV === 'production') {
    console.log('\n🏭 Running in production mode');
    
    // In production, the ReportsService would use different logic
    // Let's simulate what happens when email credentials are missing
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n⚠️  PRODUCTION ISSUE DETECTED:');
        console.log('   Email credentials are not configured in production');
        console.log('   This would cause the email transporter to be null');
        console.log('   The service would log the email instead of sending it');
        console.log('   But it should still return success, not a 500 error');
    } else {
        console.log('\n✅ Email credentials are available in production');
        console.log('   The email should be sent successfully');
    }
} else {
    console.log('\n🔧 Running in development mode');
    console.log('   This explains why our test works but production might fail');
}

// Simulate the exact production logic
console.log('\n🔍 Simulating production ReportsService initialization...');

// This mimics the constructor logic in ReportsService
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('✅ Email transporter would be created');
    emailTransporter = 'mock-transporter';
} else {
    console.log('❌ Email credentials not configured. Email sharing will be logged only.');
    emailTransporter = null;
}

// Simulate the sharing logic
console.log('\n📧 Simulating shareAuditReport logic...');
try {
    if (emailTransporter) {
        console.log('✅ Would attempt to send email via transporter');
    } else {
        console.log('📝 Would log email details (no actual sending)');
        console.log('   This should still return success, not cause 500 error');
    }
    
    console.log('✅ Should return success response');
    console.log('❌ If you\'re getting 500 error, there might be another issue');
    
} catch (error) {
    console.error('❌ Unexpected error in simulation:', error.message);
}

console.log('\n🎯 Most likely causes of 500 error in production:');
console.log('1. JWT token decoding issue');
console.log('2. Database connection issue in production');
console.log('3. PDF generation failure in production environment');
console.log('4. Missing required environment variables');
console.log('5. Different error handling in production vs development');

console.log('\n🔧 Recommended debugging steps:');
console.log('1. Check production backend logs for detailed error');
console.log('2. Verify the JWT token is being sent correctly');
console.log('3. Check if production database has audit ID 15');
console.log('4. Verify all environment variables are set in production');
