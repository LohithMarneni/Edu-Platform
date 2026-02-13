const fetch = require('node-fetch');

async function testBackends() {
  console.log('🧪 Testing Backend Connections...\n');

  // Test Teacher Backend
  try {
    console.log('📚 Testing Teacher Backend (Port 5001)...');
    const teacherResponse = await fetch('http://localhost:5001/api/health');
    const teacherData = await teacherResponse.json();
    console.log('✅ Teacher Backend:', teacherData.message);
  } catch (error) {
    console.log('❌ Teacher Backend Error:', error.message);
  }

  // Test Student Backend
  try {
    console.log('\n🎓 Testing Student Backend (Port 5000)...');
    const studentResponse = await fetch('http://localhost:5000/api/health');
    const studentData = await studentResponse.json();
    console.log('✅ Student Backend:', studentData.message);
  } catch (error) {
    console.log('❌ Student Backend Error:', error.message);
  }

  // Test Teacher Login
  try {
    console.log('\n🔐 Testing Teacher Login...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarah.johnson@school.edu',
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    if (loginData.success) {
      console.log('✅ Teacher Login Success:', loginData.data.user.name);
    } else {
      console.log('❌ Teacher Login Failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Teacher Login Error:', error.message);
  }

  // Test Student Login
  try {
    console.log('\n🔐 Testing Student Login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.johnson@student.edu',
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    if (loginData.success) {
      console.log('✅ Student Login Success:', loginData.data.user.fullName);
    } else {
      console.log('❌ Student Login Failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Student Login Error:', error.message);
  }

  console.log('\n🎉 Backend testing completed!');
}

testBackends();
