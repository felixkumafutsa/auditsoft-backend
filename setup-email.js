const fs = require('fs');
const path = require('path');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Add email credentials if they don't exist
if (!envContent.includes('EMAIL_USER=')) {
    envContent += '\n# Email Configuration\nEMAIL_USER=your-gmail@gmail.com\nEMAIL_PASS=your-app-password\n';
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Email configuration added to .env file');
    console.log('Please update EMAIL_USER and EMAIL_PASS with your actual credentials');
} else {
    console.log('✅ Email configuration already exists in .env file');
}

// Show current email settings
const lines = envContent.split('\n');
const emailUser = lines.find(line => line.startsWith('EMAIL_USER='));
const emailPass = lines.find(line => line.startsWith('EMAIL_PASS='));

console.log('\nCurrent email settings:');
console.log(emailUser || 'EMAIL_USER not found');
console.log(emailPass ? 'EMAIL_PASS is set' : 'EMAIL_PASS not found');
