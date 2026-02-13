const API_BASE_URL = 'http://localhost:5000/api';

async function testAssessmentsAPI() {
  try {
    console.log('🧪 Testing Assessments API...\n');

    // Test 1: Health check
    console.log('1. Testing GET /api/health');
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log('✅ Health check:', data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test 2: Get all assessments (will fail auth, but we can see the structure)
    console.log('\n2. Testing GET /api/assessments');
    try {
      const response = await fetch(`${API_BASE_URL}/assessments`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      const data = await response.json();
      console.log('✅ Success:', data);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    console.log('\n🎉 API tests completed!');
    console.log('\n📝 To test with real data:');
    console.log('1. Start the backend server: cd student_dash_ba/project/backend && npm start');
    console.log('2. Start the frontend: cd student_dash_ba/project && npm run dev');
    console.log('3. Login and navigate to Assessments page');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssessmentsAPI();
