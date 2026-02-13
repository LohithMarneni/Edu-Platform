const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');
const { CourseProgress } = require('./models/Progress');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function enrollStudentsInCourses() {
  try {
    console.log('🚀 Enrolling students in courses...');

    // Get all students
    const students = await User.find({ role: 'student' });
    if (students.length === 0) {
      console.log('❌ No students found. Please create student accounts first.');
      return;
    }

    // Get all published courses
    const courses = await Course.find({ isPublished: true });
    if (courses.length === 0) {
      console.log('❌ No published courses found. Please create courses first.');
      return;
    }

    console.log(`📚 Found ${courses.length} courses`);
    console.log(`👥 Found ${students.length} students`);

    // Clear existing progress records
    await CourseProgress.deleteMany({});
    console.log('🗑️ Cleared existing progress records');

    // Enroll all students in all courses
    const progressRecords = [];
    
    for (const student of students) {
      for (const course of courses) {
        // Create progress record for each student-course combination
        const progressRecord = new CourseProgress({
          user: student._id,
          course: course._id,
          courseName: course.name,
          overallProgress: Math.floor(Math.random() * 30), // Random progress 0-30%
          completedLessons: Math.floor(Math.random() * 3), // Random completed lessons 0-3
          totalLessons: course.totalLessons || 0,
          timeSpent: Math.floor(Math.random() * 120), // Random time spent 0-120 minutes
          lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random last access within last week
          startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random start date within last month
        });

        progressRecords.push(progressRecord);
      }
    }

    // Save all progress records
    await CourseProgress.insertMany(progressRecords);
    console.log(`✅ Created ${progressRecords.length} progress records`);

    // Update enrollment count for courses
    for (const course of courses) {
      course.enrollmentCount = students.length;
      await course.save();
    }

    console.log('🎉 Students enrolled in courses successfully!');
    
    // Display summary
    console.log('\n📊 Enrollment Summary:');
    for (const course of courses) {
      const progressCount = await CourseProgress.countDocuments({ course: course._id });
      console.log(`📚 ${course.name}: ${progressCount} students enrolled`);
    }

  } catch (error) {
    console.error('❌ Error enrolling students:', error);
  } finally {
    mongoose.connection.close();
  }
}

enrollStudentsInCourses();
