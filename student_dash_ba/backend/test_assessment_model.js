const mongoose = require('mongoose');
require('dotenv').config();

// Import all necessary models
const Assessment = require('./models/Assessment');
const Course = require('./models/Course');
const User = require('./models/User');

async function testAssessmentModel() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test basic query
    console.log('\n🔍 Testing Assessment model:');
    const count = await Assessment.countDocuments();
    console.log(`  Total assessments: ${count}`);

    if (count > 0) {
      const sample = await Assessment.findOne();
      console.log(`  Sample title: ${sample.title}`);
      console.log(`  Sample course: ${sample.course}`);
      console.log(`  Sample instructor: ${sample.instructor}`);
      console.log(`  Sample submissions: ${sample.submissions ? sample.submissions.length : 'undefined'}`);
    }

    // Test query with population
    console.log('\n🔍 Testing Assessment query with population:');
    const assessments = await Assessment.find({ isActive: true })
      .populate('course', 'name category')
      .populate('instructor', 'name email')
      .limit(2);

    console.log(`  Found ${assessments.length} assessments`);
    assessments.forEach((assessment, index) => {
      console.log(`  ${index + 1}. ${assessment.title}`);
      console.log(`     Course: ${assessment.course?.name || 'No course'}`);
      console.log(`     Instructor: ${assessment.instructor?.name || 'No instructor'}`);
      console.log(`     Submissions: ${assessment.submissions ? assessment.submissions.length : 'undefined'}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAssessmentModel();
