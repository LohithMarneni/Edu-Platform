const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function createDemoTeacher() {
  try {
    console.log('🚀 Creating demo teacher account...');

    // Check if demo teacher already exists
    const existingTeacher = await User.findOne({ email: 'teacher@demo.com' });
    if (existingTeacher) {
      console.log('✅ Demo teacher already exists:', existingTeacher.email);
      console.log('   Email: teacher@demo.com');
      console.log('   Password: demo123');
      return existingTeacher;
    }

    // Create demo teacher account with plain password (will be hashed by pre-save hook)
    const teacher = await User.create({
      name: 'Demo Teacher',
      email: 'teacher@demo.com',
      password: 'demo123', // Will be hashed by pre-save hook in User model
      role: 'teacher',
      profile: {
        firstName: 'Demo',
        lastName: 'Teacher',
        phone: '555-0000',
        subject: 'General',
        bio: 'Demo teacher account for testing purposes'
      },
      isActive: true,
      lastLogin: new Date()
    });

    console.log('✅ Demo teacher created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: teacher@demo.com');
    console.log('   Password: demo123');
    console.log('\n🎓 Profile:');
    console.log(`   Name: ${teacher.name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Role: ${teacher.role}`);
    return teacher;
    
  } catch (error) {
    console.error('❌ Error creating demo teacher:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📦 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
connectDB().then(() => {
  createDemoTeacher();
});

