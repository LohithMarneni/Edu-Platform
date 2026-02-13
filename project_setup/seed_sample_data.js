// Sample Data Seeding Script
// This script populates the databases with sample data for testing

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const TEACHER_DB_URI = 'mongodb://localhost:27017/teacher_dashboard';
const STUDENT_DB_URI = 'mongodb://localhost:27017/student_dashboard';

async function seedSampleData() {
  const teacherClient = new MongoClient(TEACHER_DB_URI);
  const studentClient = new MongoClient(STUDENT_DB_URI);

  try {
    console.log('🌱 Seeding sample data...\n');

    // Connect to databases
    await teacherClient.connect();
    await studentClient.connect();
    
    const teacherDb = teacherClient.db('teacher_dashboard');
    const studentDb = studentClient.db('student_dashboard');

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Teacher Database Sample Data
    console.log('👨‍🏫 Seeding Teacher Database...');

    // Sample Teachers
    const teachers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@school.edu',
        password: hashedPassword,
        role: 'teacher',
        profile: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '+1234567890',
          subject: 'Mathematics',
          bio: 'PhD in Mathematics with 15+ years of teaching experience'
        },
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@school.edu',
        password: hashedPassword,
        role: 'teacher',
        profile: {
          firstName: 'Michael',
          lastName: 'Chen',
          phone: '+1234567891',
          subject: 'Physics',
          bio: 'Physics professor specializing in quantum mechanics'
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert teachers
    const teacherResult = await teacherDb.collection('users').insertMany(teachers);
    console.log(`   ✅ Created ${teacherResult.insertedCount} teachers`);

    // Sample Classes
    const classes = [
      {
        name: 'Advanced Mathematics',
        subject: 'Mathematics',
        grade: '12th Grade',
        description: 'Advanced calculus and algebra for senior students',
        teacher: teacherResult.insertedIds[0],
        students: [],
        studentCount: 0,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '10:00 AM',
          room: 'Room 201'
        },
        settings: {
          allowLateSubmissions: true,
          autoGrading: false,
          notificationsEnabled: true
        },
        stats: {
          totalAssignments: 0,
          totalContent: 0,
          averageScore: 0,
          engagement: 0
        },
        isActive: true,
        classCode: 'MATH12',
        codeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Physics Fundamentals',
        subject: 'Physics',
        grade: '11th Grade',
        description: 'Introduction to physics concepts and principles',
        teacher: teacherResult.insertedIds[1],
        students: [],
        studentCount: 0,
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '2:00 PM',
          room: 'Lab 101'
        },
        settings: {
          allowLateSubmissions: true,
          autoGrading: true,
          notificationsEnabled: true
        },
        stats: {
          totalAssignments: 0,
          totalContent: 0,
          averageScore: 0,
          engagement: 0
        },
        isActive: true,
        classCode: 'PHYS11',
        codeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert classes
    const classResult = await teacherDb.collection('classes').insertMany(classes);
    console.log(`   ✅ Created ${classResult.insertedCount} classes`);

    // Sample Students
    const students = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@student.edu',
        studentId: 'STU001',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=4f46e5&color=fff&size=128',
        classes: [
          {
            class: classResult.insertedIds[0],
            joinedAt: new Date(),
            status: 'active'
          }
        ],
        profile: {
          phone: '+1234567892',
          parentEmail: 'parent1@email.com',
          parentPhone: '+1234567893',
          address: '123 Student St, City, State',
          dateOfBirth: new Date('2005-03-15'),
          grade: '12th Grade'
        },
        performance: {
          averageScore: 85,
          totalAssignments: 0,
          completedAssignments: 0,
          attendance: 95,
          doubtsAsked: 0,
          lastActive: new Date()
        },
        subjects: [
          {
            name: 'Mathematics',
            scores: [85, 90, 88],
            averageScore: 87.7,
            weakTopics: ['Calculus'],
            strongTopics: ['Algebra', 'Geometry']
          }
        ],
        notes: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@student.edu',
        studentId: 'STU002',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=10b981&color=fff&size=128',
        classes: [
          {
            class: classResult.insertedIds[1],
            joinedAt: new Date(),
            status: 'active'
          }
        ],
        profile: {
          phone: '+1234567894',
          parentEmail: 'parent2@email.com',
          parentPhone: '+1234567895',
          address: '456 Student Ave, City, State',
          dateOfBirth: new Date('2006-07-22'),
          grade: '11th Grade'
        },
        performance: {
          averageScore: 78,
          totalAssignments: 0,
          completedAssignments: 0,
          attendance: 88,
          doubtsAsked: 0,
          lastActive: new Date()
        },
        subjects: [
          {
            name: 'Physics',
            scores: [75, 80, 79],
            averageScore: 78,
            weakTopics: ['Mechanics'],
            strongTopics: ['Thermodynamics']
          }
        ],
        notes: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert students
    const studentResult = await teacherDb.collection('students').insertMany(students);
    console.log(`   ✅ Created ${studentResult.insertedCount} students`);

    // Student Database Sample Data
    console.log('\n🎓 Seeding Student Database...');

    // Sample Students
    const studentUsers = [
      {
        fullName: 'Alice Johnson',
        email: 'alice.johnson@student.edu',
        password: hashedPassword,
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=4f46e5&color=fff&size=128',
        role: 'student',
        profile: {
          phone: '+1234567892',
          dateOfBirth: new Date('2005-03-15'),
          grade: '12th Grade',
          school: 'Example High School',
          bio: 'Passionate about mathematics and science'
        },
        preferences: {
          darkMode: false,
          emailNotifications: true,
          pushNotifications: true,
          weeklyReports: true,
          language: 'English'
        },
        stats: {
          totalPoints: 150,
          currentStreak: 5,
          longestStreak: 12,
          lastActiveDate: new Date(),
          totalQuizzes: 3,
          averageScore: 87,
          badgesEarned: 2
        },
        achievements: [
          {
            name: 'First Quiz',
            description: 'Completed your first quiz',
            icon: '🎯',
            earnedAt: new Date(),
            points: 50
          },
          {
            name: 'Week Warrior',
            description: 'Studied for 7 consecutive days',
            icon: '🔥',
            earnedAt: new Date(),
            points: 100
          }
        ],
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'Bob Smith',
        email: 'bob.smith@student.edu',
        password: hashedPassword,
        avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=10b981&color=fff&size=128',
        role: 'student',
        profile: {
          phone: '+1234567894',
          dateOfBirth: new Date('2006-07-22'),
          grade: '11th Grade',
          school: 'Example High School',
          bio: 'Interested in physics and technology'
        },
        preferences: {
          darkMode: true,
          emailNotifications: true,
          pushNotifications: true,
          weeklyReports: true,
          language: 'English'
        },
        stats: {
          totalPoints: 75,
          currentStreak: 2,
          longestStreak: 8,
          lastActiveDate: new Date(),
          totalQuizzes: 1,
          averageScore: 78,
          badgesEarned: 1
        },
        achievements: [
          {
            name: 'First Quiz',
            description: 'Completed your first quiz',
            icon: '🎯',
            earnedAt: new Date(),
            points: 50
          }
        ],
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert student users
    const studentUserResult = await studentDb.collection('users').insertMany(studentUsers);
    console.log(`   ✅ Created ${studentUserResult.insertedCount} student users`);

    // Sample Courses
    const courses = [
      {
        name: 'Advanced Mathematics',
        description: 'Comprehensive course covering calculus, algebra, and advanced mathematical concepts',
        icon: '📐',
        color: 'bg-blue-50',
        iconColor: 'text-blue-500',
        borderColor: 'border-blue-200',
        category: 'mathematics',
        level: 'advanced',
        modules: [
          {
            name: 'Calculus Fundamentals',
            description: 'Introduction to differential and integral calculus',
            topics: [
              {
                name: 'Limits and Continuity',
                description: 'Understanding limits and continuous functions',
                duration: '45 minutes',
                videoUrl: 'https://example.com/video1',
                thumbnail: 'https://example.com/thumb1.jpg',
                content: {
                  notes: 'Key concepts of limits and continuity',
                  resources: ['Textbook Chapter 1', 'Practice Problems'],
                  keyPoints: ['Definition of limit', 'Continuity conditions']
                },
                difficulty: 'intermediate',
                order: 0,
                isCompleted: false
              },
              {
                name: 'Derivatives',
                description: 'Introduction to derivatives and their applications',
                duration: '60 minutes',
                videoUrl: 'https://example.com/video2',
                thumbnail: 'https://example.com/thumb2.jpg',
                content: {
                  notes: 'Derivative rules and applications',
                  resources: ['Derivative Rules Sheet', 'Practice Exercises'],
                  keyPoints: ['Power rule', 'Chain rule', 'Product rule']
                },
                difficulty: 'intermediate',
                order: 1,
                isCompleted: false
              }
            ],
            order: 0,
            estimatedDuration: '2 hours'
          }
        ],
        instructor: studentUserResult.insertedIds[0],
        totalLessons: 2,
        estimatedDuration: '2 hours',
        prerequisites: ['Basic Algebra', 'Trigonometry'],
        learningOutcomes: [
          'Understand fundamental calculus concepts',
          'Apply derivative rules to solve problems',
          'Analyze functions using calculus techniques'
        ],
        tags: ['calculus', 'mathematics', 'advanced'],
        isPublished: true,
        enrollmentCount: 1,
        rating: {
          average: 4.5,
          count: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Physics Fundamentals',
        description: 'Introduction to physics concepts including mechanics, thermodynamics, and waves',
        icon: '⚛️',
        color: 'bg-purple-50',
        iconColor: 'text-purple-500',
        borderColor: 'border-purple-200',
        category: 'physics',
        level: 'beginner',
        modules: [
          {
            name: 'Mechanics',
            description: 'Study of motion and forces',
            topics: [
              {
                name: 'Newton\'s Laws',
                description: 'Understanding the three laws of motion',
                duration: '50 minutes',
                videoUrl: 'https://example.com/video3',
                thumbnail: 'https://example.com/thumb3.jpg',
                content: {
                  notes: 'Newton\'s three laws of motion',
                  resources: ['Physics Textbook', 'Simulation Lab'],
                  keyPoints: ['First law: Inertia', 'Second law: F=ma', 'Third law: Action-reaction']
                },
                difficulty: 'beginner',
                order: 0,
                isCompleted: false
              }
            ],
            order: 0,
            estimatedDuration: '1 hour'
          }
        ],
        instructor: studentUserResult.insertedIds[1],
        totalLessons: 1,
        estimatedDuration: '1 hour',
        prerequisites: ['Basic Mathematics'],
        learningOutcomes: [
          'Understand fundamental physics principles',
          'Apply Newton\'s laws to solve problems',
          'Analyze motion in various scenarios'
        ],
        tags: ['physics', 'mechanics', 'beginner'],
        isPublished: true,
        enrollmentCount: 1,
        rating: {
          average: 4.0,
          count: 1
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert courses
    const courseResult = await studentDb.collection('courses').insertMany(courses);
    console.log(`   ✅ Created ${courseResult.insertedCount} courses`);

    console.log('\n🎉 Sample data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   Teacher Database:');
    console.log('     - 2 teachers created');
    console.log('     - 2 classes created');
    console.log('     - 2 students created');
    console.log('   Student Database:');
    console.log('     - 2 student users created');
    console.log('     - 2 courses created');
    console.log('\n🔑 Test Credentials:');
    console.log('   Teacher: sarah.johnson@school.edu / password123');
    console.log('   Teacher: michael.chen@school.edu / password123');
    console.log('   Student: alice.johnson@student.edu / password123');
    console.log('   Student: bob.smith@student.edu / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  } finally {
    await teacherClient.close();
    await studentClient.close();
    console.log('\n🔌 Database connections closed');
    process.exit(0);
  }
}

seedSampleData();
