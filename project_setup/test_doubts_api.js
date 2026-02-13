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

async function testDoubtsAPI() {
  console.log('🧪 Testing Doubts API...\n');

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
      
      // Test doubts API
      console.log('\n📚 Testing doubts API...');
      const doubtsResponse = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/doubts',
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Doubts API Status:', doubtsResponse.status);
      console.log('Doubts API Success:', doubtsResponse.data.success);
      console.log('Doubts Count:', doubtsResponse.data.count);
      console.log('Doubts Data Type:', Array.isArray(doubtsResponse.data.data) ? 'Array' : typeof doubtsResponse.data.data);
      
      if (doubtsResponse.data.success && Array.isArray(doubtsResponse.data.data)) {
        console.log('✅ Doubts API is working correctly');
        console.log('Sample doubt:', JSON.stringify(doubtsResponse.data.data[0], null, 2));
      } else {
        console.log('❌ Doubts API returned unexpected data format');
        console.log('Full response:', JSON.stringify(doubtsResponse.data, null, 2));
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDoubtsAPI();

