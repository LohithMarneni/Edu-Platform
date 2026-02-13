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

async function testCoursesAPI() {
  console.log('🧪 Testing Courses API Debug...\n');

  try {
    // Test login
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
    
    console.log('Login response:', loginResponse.data.success ? '✅ Success' : '❌ Failed');
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('Token received:', token ? '✅ Yes' : '❌ No');
      
      // Test courses API
      console.log('\n📚 Testing courses API...');
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
      
      console.log('Courses response:', coursesResponse.data.success ? '✅ Success' : '❌ Failed');
      console.log('Courses status:', coursesResponse.status);
      
      if (coursesResponse.data.success) {
        console.log('Courses count:', coursesResponse.data.count);
        console.log('First course:', JSON.stringify(coursesResponse.data.data[0], null, 2));
      } else {
        console.log('Courses error:', coursesResponse.data.message);
        console.log('Full response:', JSON.stringify(coursesResponse.data, null, 2));
      }
    } else {
      console.log('Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testCoursesAPI();

