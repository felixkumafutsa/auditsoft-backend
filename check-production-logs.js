// This script simulates what happens when the API receives the actual request from UI
const https = require('https');

function testProductionAPI() {
    console.log('=== TESTING PRODUCTION API ENDPOINT ===');
    
    // Test the exact same endpoint the UI is calling
    const options = {
        hostname: 'api.mw265.com',
        port: 443,
        path: '/api/reports/audit/15/share',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Note: We don't have the actual JWT token, so this will likely fail with 401
            // But we can see what error we get
        }
    };
    
    const data = JSON.stringify({
        email: 'felixkumafutsa@gmail.com',
        message: 'Please find the attached audit report: Audit Report - Audit inu. This report contains important audit findings and recommendations that require your attention.'
    });
    
    const req = https.request(options, (res) => {
        console.log('📡 Response status:', res.statusCode);
        console.log('📡 Response headers:', res.headers);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(responseData);
                console.log('📡 Response body:', parsedData);
            } catch (e) {
                console.log('📡 Response body (raw):', responseData);
            }
            
            if (res.statusCode === 401) {
                console.log('\n🔍 Analysis: Got 401 Unauthorized');
                console.log('   This confirms the API requires authentication');
                console.log('   The UI needs to provide a valid JWT token');
            } else if (res.statusCode === 500) {
                console.log('\n🔍 Analysis: Got 500 Internal Server Error');
                console.log('   This suggests an error in the backend code');
                console.log('   Check backend logs for detailed error information');
            } else if (res.statusCode === 403) {
                console.log('\n🔍 Analysis: Got 403 Forbidden');
                console.log('   This suggests the user has the wrong role');
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Request error:', error.message);
    });
    
    req.write(data);
    req.end();
}

testProductionAPI();
