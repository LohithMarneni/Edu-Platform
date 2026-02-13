const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  checkUsers();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...\n');
    
    const users = await User.find({});
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    if (users.length === 0) {
      console.log('\n📝 No users found. Creating a test student...');
      
      const testStudent = new User({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      });
      
      await testStudent.save();
      console.log('✅ Test student created successfully');
      console.log('Email: student@test.com');
      console.log('Password: password123');
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}




