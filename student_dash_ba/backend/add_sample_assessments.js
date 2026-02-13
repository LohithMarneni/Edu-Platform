const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');
const Course = require('./models/Course');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/student_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedAssessments();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

async function seedAssessments() {
  try {
    // Clear existing assessments
    await Assessment.deleteMany({});
    console.log('Cleared existing assessments');

    // Get a teacher user
    let teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      console.log('No teacher found, creating one...');
      const newTeacher = new User({
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'password123',
        role: 'teacher',
        department: 'Computer Science'
      });
      await newTeacher.save();
      teacher = newTeacher;
    }

    // Get courses
    let courses = await Course.find({});
    if (courses.length === 0) {
      console.log('No courses found, creating sample courses...');
      const sampleCourses = [
        {
          title: 'Introduction to Programming',
          subject: 'Computer Science',
          description: 'Learn the basics of programming',
          instructor: teacher._id,
          isPublished: true
        },
        {
          title: 'Data Structures and Algorithms',
          subject: 'Computer Science',
          description: 'Advanced programming concepts',
          instructor: teacher._id,
          isPublished: true
        },
        {
          title: 'Mathematics for Engineers',
          subject: 'Mathematics',
          description: 'Mathematical foundations for engineering',
          instructor: teacher._id,
          isPublished: true
        },
        {
          title: 'Physics Fundamentals',
          subject: 'Physics',
          description: 'Basic physics principles',
          instructor: teacher._id,
          isPublished: true
        }
      ];

      for (const courseData of sampleCourses) {
        const course = new Course(courseData);
        await course.save();
      }
      console.log('Created sample courses');
    }

    // Get updated courses
    courses = await Course.find({});

    // Create sample assessments
    const sampleAssessments = [
      {
        title: 'Assignment 1: Basic Programming Concepts',
        description: 'Complete the programming exercises covering variables, loops, and functions.',
        instructions: 'Write a Python program that calculates the factorial of a number. Submit your code file and a brief explanation of your approach.',
        course: courses[0]._id,
        instructor: teacher._id,
        subject: 'Computer Science',
        points: 25,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        type: 'assignment',
        attachments: [
          {
            name: 'assignment1_instructions.pdf',
            url: '/files/assignment1_instructions.pdf',
            type: 'PDF'
          }
        ]
      },
      {
        title: 'Quiz 1: Data Structures',
        description: 'Test your understanding of arrays, linked lists, and stacks.',
        instructions: 'Answer all questions within the time limit. Each question is worth 2 points.',
        course: courses[1]._id,
        instructor: teacher._id,
        subject: 'Computer Science',
        points: 20,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        type: 'quiz'
      },
      {
        title: 'Project: Calculator Application',
        description: 'Build a calculator application with basic arithmetic operations.',
        instructions: 'Create a GUI calculator using any programming language. Include addition, subtraction, multiplication, and division. Submit the source code and a demo video.',
        course: courses[0]._id,
        instructor: teacher._id,
        subject: 'Computer Science',
        points: 50,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        type: 'project',
        attachments: [
          {
            name: 'project_requirements.pdf',
            url: '/files/project_requirements.pdf',
            type: 'PDF'
          },
          {
            name: 'sample_code.py',
            url: '/files/sample_code.py',
            type: 'Python'
          }
        ]
      },
      {
        title: 'Assignment 2: Linear Algebra',
        description: 'Solve problems related to matrices, vectors, and linear transformations.',
        instructions: 'Complete all 10 problems showing your work. Submit as a PDF document.',
        course: courses[2]._id,
        instructor: teacher._id,
        subject: 'Mathematics',
        points: 30,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        type: 'assignment'
      },
      {
        title: 'Lab Report: Newton\'s Laws',
        description: 'Conduct experiments and write a lab report on Newton\'s laws of motion.',
        instructions: 'Perform the experiments as described in the lab manual. Record your observations and write a detailed report with conclusions.',
        course: courses[3]._id,
        instructor: teacher._id,
        subject: 'Physics',
        points: 40,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        type: 'assignment',
        attachments: [
          {
            name: 'lab_manual.pdf',
            url: '/files/lab_manual.pdf',
            type: 'PDF'
          }
        ]
      },
      {
        title: 'Midterm Exam: Advanced Algorithms',
        description: 'Comprehensive exam covering sorting, searching, and graph algorithms.',
        instructions: 'This is a closed-book exam. You have 2 hours to complete all questions. Show your work for partial credit.',
        course: courses[1]._id,
        instructor: teacher._id,
        subject: 'Computer Science',
        points: 100,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: 'quiz'
      }
    ];

    // Create assessments
    for (const assessmentData of sampleAssessments) {
      const assessment = new Assessment(assessmentData);
      await assessment.save();
      console.log(`Created assessment: ${assessment.title}`);
    }

    console.log('✅ Successfully seeded assessments database');
    console.log(`Created ${sampleAssessments.length} assessments`);

    // Display summary
    const assessments = await Assessment.find({}).populate('course', 'title').populate('instructor', 'name');
    console.log('\n📋 Assessment Summary:');
    assessments.forEach((assessment, index) => {
      console.log(`${index + 1}. ${assessment.title} (${assessment.subject}) - Due: ${assessment.dueDate.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('Error seeding assessments:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}
