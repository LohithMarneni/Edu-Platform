// Test the API call that the frontend is making
const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Call...\n');

  try {
    // Test login first
    console.log('🔐 Testing login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'alice.johnson@student.edu',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful, token received');
      
      // Test courses API exactly as frontend would call it
      console.log('\n📚 Testing courses API call...');
      const coursesResponse = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/courses',
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Courses API Status:', coursesResponse.status);
      console.log('Courses API Success:', coursesResponse.data.success);
      console.log('Courses Count:', coursesResponse.data.count);
      
      if (coursesResponse.data.success && coursesResponse.data.data.length > 0) {
        console.log('✅ API is working correctly');
        console.log('Sample course data structure:');
        console.log('- Course name:', coursesResponse.data.data[0].name);
        console.log('- Course progress:', coursesResponse.data.data[0].progress);
        console.log('- Course modules:', coursesResponse.data.data[0].modules?.length || 0);
      } else {
        console.log('❌ API returned no data or failed');
        console.log('Response:', JSON.stringify(coursesResponse.data, null, 2));
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testFrontendAPI();

