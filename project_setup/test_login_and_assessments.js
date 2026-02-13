const API_BASE_URL = 'http://localhost:5000/api';

async function testLoginAndAssessments() {
  try {
    console.log('🧪 Testing Login and Assessments API...\n');

    // Step 1: Try to register a test user
    console.log('1. Registering test user...');
    try {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'Test Student',
          email: 'test@student.com',
          password: 'password123'
        })
      });
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        console.log('✅ User registered successfully');
      } else {
        const errorData = await registerResponse.json();
        if (errorData.message.includes('already exists')) {
          console.log('✅ User already exists (expected)');
        } else {
          console.log('❌ Registration error:', errorData.message);
        }
      }
    } catch (error) {
      console.log('❌ Registration error:', error.message);
    }

    // Step 2: Login to get a token
    console.log('\n2. Logging in...');
    let token = null;
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'alice.johnson@student.edu',
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.token;
        console.log('✅ Login successful, token received');
      } else {
        const errorData = await loginResponse.json();
        console.log('❌ Login error:', errorData.message);
        return;
      }
    } catch (error) {
      console.log('❌ Login error:', error.message);
      return;
    }

    // Step 3: Test assessments endpoint with valid token
    console.log('\n3. Testing assessments endpoint with valid token...');
    try {
      const assessmentsResponse = await fetch(`${API_BASE_URL}/assessments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (assessmentsResponse.ok) {
        const assessmentsData = await assessmentsResponse.json();
        console.log('✅ Assessments fetched successfully!');
        console.log('📊 Data structure:', Object.keys(assessmentsData.data));
        console.log('📋 Sample subjects:', Object.keys(assessmentsData.data).slice(0, 3));
        
        // Show first subject's assessments
        const firstSubject = Object.keys(assessmentsData.data)[0];
        if (firstSubject) {
          console.log(`\n📚 ${firstSubject} assessments:`, assessmentsData.data[firstSubject].length);
          if (assessmentsData.data[firstSubject].length > 0) {
            console.log('   First assessment:', assessmentsData.data[firstSubject][0].title);
          }
        }
      } else {
        const errorData = await assessmentsResponse.json();
        console.log('❌ Assessments error:', errorData.message);
      }
    } catch (error) {
      console.log('❌ Assessments error:', error.message);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📝 To fix the frontend:');
    console.log('1. Make sure you are logged in to the frontend');
    console.log('2. Check that the token is stored in localStorage');
    console.log('3. The assessments should now load from the database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginAndAssessments();
