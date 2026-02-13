const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../student_dash_ba/backend/models/User');
const Assessment = require('../student_dash_ba/backend/models/Assessment');
const Course = require('../student_dash_ba/backend/models/Course');

async function testDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne({ role: 'student' });
      if (sampleUser) {
        console.log(`👤 Sample student: ${sampleUser.name} (${sampleUser.email})`);
      }
    }

    // Check courses
    const courseCount = await Course.countDocuments();
    console.log(`📚 Total courses: ${courseCount}`);
    
    if (courseCount > 0) {
      const sampleCourse = await Course.findOne();
      console.log(`📖 Sample course: ${sampleCourse.name} (${sampleCourse.category})`);
    }

    // Check assessments
    const assessmentCount = await Assessment.countDocuments();
    console.log(`📝 Total assessments: ${assessmentCount}`);
    
    if (assessmentCount > 0) {
      const sampleAssessment = await Assessment.findOne().populate('course', 'name category').populate('instructor', 'name');
      console.log(`📋 Sample assessment: ${sampleAssessment.title}`);
      console.log(`   Course: ${sampleAssessment.course?.name || 'No course'}`);
      console.log(`   Instructor: ${sampleAssessment.instructor?.name || 'No instructor'}`);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDatabase();



