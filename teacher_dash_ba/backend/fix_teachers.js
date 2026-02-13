const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function fixTeachers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard');
    console.log('✅ Connected to MongoDB');

    // Delete existing users
    await User.deleteMany({});
    console.log('🗑️  Deleted existing users');

    // Create new users with properly hashed passwords
    const teachers = await User.create([
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@school.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'teacher',
        profile: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '555-0101',
          subject: 'Mathematics',
          bio: 'Passionate mathematics educator with 10 years of experience'
        },
        isActive: true
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@school.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'teacher',
        profile: {
          firstName: 'Michael',
          lastName: 'Chen',
          phone: '555-0102',
          subject: 'Physics',
          bio: 'Physics professor specializing in quantum mechanics'
        },
        isActive: true
      },
      {
        name: 'Ms. Emily Davis',
        email: 'emily.davis@school.edu',
        password: await bcrypt.hash('password123', 10),
        role: 'teacher',
        profile: {
          firstName: 'Emily',
          lastName: 'Davis',
          phone: '555-0103',
          subject: 'Chemistry',
          bio: 'Dedicated chemistry teacher with expertise in organic chemistry'
        },
        isActive: true
      }
    ]);

    console.log('✅ Created teachers with proper password hashing');
    console.log('\n🔑 Login Credentials:');
    console.log('1. Email: sarah.johnson@school.edu / Password: password123');
    console.log('2. Email: michael.chen@school.edu / Password: password123');
    console.log('3. Email: emily.davis@school.edu / Password: password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixTeachers();

