const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');
const Doubt = require('./models/Doubt');
const Content = require('./models/Content');
const Task = require('./models/Task');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Assignment.deleteMany({});
    await Doubt.deleteMany({});
    await Content.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Teachers (passwords will be hashed by User model's pre-save hook)
    const teacherData = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@school.edu',
        password: 'password123', // Will be hashed by pre-save hook
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
        password: 'password123', // Will be hashed by pre-save hook
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
        password: 'password123', // Will be hashed by pre-save hook
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
    ];
    
    const teachers = await User.insertMany(teacherData);
    console.log('👨‍🏫 Created teachers');

    // Create Classes
    const classes = await Class.insertMany([
      {
        name: 'Algebra I',
        subject: 'Mathematics',
        grade: '9th Grade',
        description: 'Introduction to algebraic concepts and problem solving',
        teacher: teachers[0]._id,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '10:00 AM',
          room: 'Room 101'
        },
        settings: {
          allowLateSubmissions: true,
          autoGrading: false,
          notificationsEnabled: true
        },
        isActive: true
      },
      {
        name: 'Advanced Physics',
        subject: 'Physics',
        grade: '12th Grade',
        description: 'Advanced physics concepts including quantum mechanics',
        teacher: teachers[1]._id,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '2:00 PM',
          room: 'Lab 201'
        },
        settings: {
          allowLateSubmissions: false,
          autoGrading: true,
          notificationsEnabled: true
        },
        isActive: true
      },
      {
        name: 'Organic Chemistry',
        subject: 'Chemistry',
        grade: '11th Grade',
        description: 'Introduction to organic compounds and reactions',
        teacher: teachers[2]._id,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '9:00 AM',
          room: 'Lab 102'
        },
        settings: {
          allowLateSubmissions: true,
          autoGrading: false,
          notificationsEnabled: true
        },
        isActive: true
      }
    ]);

    // Generate class codes
    classes.forEach(cls => {
      cls.generateClassCode();
    });
    await Class.bulkSave(classes);
    console.log('📚 Created classes with codes');

    // Create Students
    const students = await Student.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice.j@student.edu',
        studentId: 'STU001',
        classes: [{
          class: classes[0]._id,
          joinedAt: new Date(),
          status: 'active'
        }],
        profile: {
          phone: '555-2001',
          grade: '9th',
          parentEmail: 'parent@example.com'
        },
        performance: {
          averageScore: 92,
          totalAssignments: 5,
          completedAssignments: 5,
          attendance: 98
        },
        isActive: true
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@student.edu',
        studentId: 'STU002',
        classes: [{
          class: classes[0]._id,
          joinedAt: new Date(),
          status: 'active'
        }],
        profile: {
          phone: '555-2002',
          grade: '9th',
          parentEmail: 'parent2@example.com'
        },
        performance: {
          averageScore: 88,
          totalAssignments: 5,
          completedAssignments: 4,
          attendance: 95
        },
        isActive: true
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@student.edu',
        studentId: 'STU003',
        classes: [{
          class: classes[1]._id,
          joinedAt: new Date(),
          status: 'active'
        }],
        profile: {
          phone: '555-2003',
          grade: '12th',
          parentEmail: 'parent3@example.com'
        },
        performance: {
          averageScore: 85,
          totalAssignments: 3,
          completedAssignments: 3,
          attendance: 90
        },
        isActive: true
      }
    ]);

    // Update classes with students
    classes[0].students = [students[0]._id, students[1]._id];
    classes[0].studentCount = 2;
    
    classes[1].students = [students[2]._id];
    classes[1].studentCount = 1;
    
    await Class.bulkSave(classes);
    console.log('👨‍🎓 Created students and enrolled in classes');

    // Create Assignments
    const assignments = await Assignment.insertMany([
      {
        title: 'Algebra Practice: Linear Equations',
        description: 'Solve 10 linear equations and show your work',
        type: 'Assignment',
        assignmentType: 'text',
        class: classes[0]._id,
        teacher: teachers[0]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalMarks: 100,
        status: 'active',
        instructions: 'Complete all problems showing step-by-step solutions',
        questions: [
          {
            question: 'Solve: 2x + 5 = 15',
            type: 'short-answer',
            points: 10
          },
          {
            question: 'Solve: 3y - 7 = 20',
            type: 'short-answer',
            points: 10
          }
        ],
        stats: {
          totalSubmissions: 2,
          averageScore: 90
        }
      },
      {
        title: 'Physics Quiz: Mechanics',
        description: 'Test on basic mechanical concepts',
        type: 'Quiz',
        assignmentType: 'quiz',
        class: classes[1]._id,
        teacher: teachers[1]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalMarks: 50,
        status: 'active',
        instructions: 'Answer all questions with detailed explanations',
        questions: [
          {
            question: 'What is Newton\'s first law of motion?',
            type: 'short-answer',
            points: 15
          }
        ],
        stats: {
          totalSubmissions: 1,
          averageScore: 85
        }
      }
    ]);
    console.log('📝 Created assignments');

    // Create Doubts
    const doubts = await Doubt.insertMany([
      {
        title: 'Understanding Quadratic Equations',
        question: 'I don\'t understand how to factor quadratic equations. Can you help?',
        subject: 'Mathematics',
        student: {
          name: students[0].name,
          email: students[0].email,
          avatar: students[0].avatar
        },
        class: classes[0]._id,
        teacher: teachers[0]._id,
        status: 'pending',
        priority: 'medium',
        category: 'concept',
        tags: ['algebra', 'quadratic'],
        views: 5,
        upvotes: 2
      },
      {
        title: 'Help with Force and Motion',
        question: 'Can someone explain the difference between velocity and acceleration?',
        subject: 'Physics',
        student: {
          name: students[2].name,
          email: students[2].email,
          avatar: students[2].avatar
        },
        class: classes[1]._id,
        teacher: teachers[1]._id,
        status: 'answered',
        priority: 'high',
        category: 'concept',
        tags: ['physics', 'mechanics'],
        responses: [{
          author: teachers[1].name,
          authorType: 'teacher',
          message: 'Velocity is the speed of an object in a particular direction, while acceleration is the rate of change of velocity.',
          createdAt: new Date()
        }],
        views: 8,
        upvotes: 5,
        isResolved: true
      }
    ]);
    console.log('❓ Created doubts');

    // Create Content
    const content = await Content.insertMany([
      {
        title: 'Introduction to Algebra',
        description: 'Basic algebraic concepts and operations',
        type: 'video',
        class: classes[0]._id,
        teacher: teachers[0]._id,
        subject: 'Mathematics',
        chapter: {
          id: 'ch1',
          name: 'Chapter 1: Basics',
          description: 'Foundational concepts'
        },
        file: {
          url: 'https://example.com/videos/intro-algebra.mp4'
        },
        status: 'published',
        visibility: 'class-only',
        stats: {
          views: 50,
          downloads: 10,
          likes: 15
        }
      },
      {
        title: 'Quantum Mechanics Notes',
        description: 'Lecture notes on quantum mechanics',
        type: 'pdf',
        class: classes[1]._id,
        teacher: teachers[1]._id,
        subject: 'Physics',
        chapter: {
          id: 'ch5',
          name: 'Chapter 5: Quantum',
          description: 'Advanced quantum concepts'
        },
        file: {
          url: 'https://example.com/files/quantum-notes.pdf'
        },
        status: 'published',
        visibility: 'class-only',
        stats: {
          views: 30,
          downloads: 20,
          likes: 12
        }
      }
    ]);
    console.log('📄 Created content');

    // Create Tasks
    const tasks = await Task.insertMany([
      {
        title: 'Grade Assignment #1',
        description: 'Review and grade Algebra assignments',
        teacher: teachers[0]._id,
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        dueTime: '11:00 AM',
        subject: 'Mathematics',
        category: 'grading',
        relatedClass: classes[0]._id,
        relatedAssignment: assignments[0]._id
      },
      {
        title: 'Prepare Lecture: Organic Reactions',
        description: 'Prepare lecture slides for organic reactions',
        teacher: teachers[2]._id,
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        subject: 'Chemistry',
        category: 'planning'
      }
    ]);
    console.log('✅ Created tasks');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Assignments: ${assignments.length}`);
    console.log(`   - Doubts: ${doubts.length}`);
    console.log(`   - Content: ${content.length}`);
    console.log(`   - Tasks: ${tasks.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Teacher: sarah.johnson@school.edu / password123');
    console.log('   Teacher: michael.chen@school.edu / password123');
    console.log('\n🎓 Class Codes:');
    classes.forEach(cls => {
      console.log(`   ${cls.name}: ${cls.classCode}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();

