const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTeacher() {
  try {
    console.log('🚀 Creating teacher account...');

    // Check if teacher already exists
    const existingTeacher = await User.findOne({ role: 'teacher' });
    if (existingTeacher) {
      console.log('✅ Teacher already exists:', existingTeacher.email);
      return existingTeacher;
    }

    // Create teacher account
    const teacher = await User.create({
      fullName: 'Dr. John Smith',
      email: 'john.smith@teacher.edu',
      password: 'password123',
      role: 'teacher',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=4f46e5&color=fff',
      isEmailVerified: true,
      lastLogin: new Date()
    });

    console.log('✅ Teacher created successfully:', teacher.email);
    return teacher;
    
  } catch (error) {
    console.error('❌ Error creating teacher:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTeacher();

