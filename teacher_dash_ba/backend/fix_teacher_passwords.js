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

async function fixTeacherPasswords() {
  try {
    console.log('🔧 Fixing teacher passwords...');

    // Find all teachers
    const teachers = await User.find({ role: 'teacher' });
    
    if (teachers.length === 0) {
      console.log('ℹ️  No teachers found in database');
      mongoose.connection.close();
      return;
    }

    console.log(`Found ${teachers.length} teachers to fix`);
    
    // Reset passwords to 'password123' for each teacher
    for (const teacher of teachers) {
      teacher.password = 'password123'; // This will be hashed by pre-save hook
      await teacher.save();
      console.log(`✅ Fixed password for: ${teacher.email}`);
    }

    console.log('\n✅ All teacher passwords have been fixed!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: Use any teacher email from database');
    console.log('   Password: password123');
    
    // Print all teacher emails
    console.log('\n👨‍🏫 Available teachers:');
    teachers.forEach(teacher => {
      console.log(`   - ${teacher.email} (${teacher.name})`);
    });

  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📦 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
connectDB().then(() => {
  fixTeacherPasswords();
});

