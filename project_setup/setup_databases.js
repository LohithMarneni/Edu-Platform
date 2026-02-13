// Database Setup Script for EduPlatform
// Run this script to create and initialize the databases

const mongoose = require('mongoose');

// Database connection strings
const TEACHER_DB_URI = 'mongodb://localhost:27017/teacher_dashboard';
const STUDENT_DB_URI = 'mongodb://localhost:27017/student_dashboard';

// Connect to Teacher Database
const teacherConnection = mongoose.createConnection(TEACHER_DB_URI);

// Connect to Student Database  
const studentConnection = mongoose.createConnection(STUDENT_DB_URI);

// Teacher Database Models
const teacherUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['teacher', 'admin'],
    default: 'teacher'
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    subject: String,
    bio: String,
    avatar: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true,
    maxlength: [100, 'Class name cannot be more than 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  grade: {
    type: String,
    required: [true, 'Please add a grade'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Student'
  }],
  studentCount: {
    type: Number,
    default: 0
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: String,
    room: String
  },
  settings: {
    allowLateSubmissions: {
      type: Boolean,
      default: true
    },
    autoGrading: {
      type: Boolean,
      default: false
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalAssignments: { type: Number, default: 0 },
    totalContent: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  classCode: {
    type: String,
    unique: true,
    sparse: true
  },
  codeExpiry: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Student Database Models
const studentUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.fullName)}&background=4f46e5&color=fff&size=128`;
    }
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  profile: {
    phone: String,
    dateOfBirth: Date,
    grade: String,
    school: String,
    bio: String
  },
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'English'
    }
  },
  stats: {
    totalPoints: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    totalQuizzes: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    badgesEarned: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    points: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  refreshToken: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create models
const TeacherUser = teacherConnection.model('User', teacherUserSchema);
const Class = teacherConnection.model('Class', classSchema);

const StudentUser = studentConnection.model('User', studentUserSchema);

// Sample data for testing
const sampleTeacher = {
  name: 'John Doe',
  email: 'teacher@example.com',
  password: 'password123',
  role: 'teacher',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    subject: 'Mathematics',
    bio: 'Experienced mathematics teacher with 10+ years of experience'
  }
};

const sampleStudent = {
  fullName: 'Jane Smith',
  email: 'student@example.com',
  password: 'password123',
  role: 'student',
  profile: {
    phone: '+1234567891',
    grade: '10th Grade',
    school: 'Example High School',
    bio: 'Enthusiastic student passionate about learning'
  }
};

async function setupDatabases() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Test connections
    await teacherConnection.asPromise();
    console.log('✅ Connected to teacher_dashboard database');
    
    await studentConnection.asPromise();
    console.log('✅ Connected to student_dashboard database');
    
    // Create sample teacher
    const existingTeacher = await TeacherUser.findOne({ email: sampleTeacher.email });
    if (!existingTeacher) {
      const teacher = new TeacherUser(sampleTeacher);
      await teacher.save();
      console.log('✅ Created sample teacher account');
    } else {
      console.log('ℹ️  Sample teacher account already exists');
    }
    
    // Create sample student
    const existingStudent = await StudentUser.findOne({ email: sampleStudent.email });
    if (!existingStudent) {
      const student = new StudentUser(sampleStudent);
      await student.save();
      console.log('✅ Created sample student account');
    } else {
      console.log('ℹ️  Sample student account already exists');
    }
    
    // Create indexes for better performance
    await TeacherUser.collection.createIndex({ email: 1 }, { unique: true });
    await Class.collection.createIndex({ teacher: 1, createdAt: -1 });
    await Class.collection.createIndex({ classCode: 1 }, { unique: true, sparse: true });
    await StudentUser.collection.createIndex({ email: 1 }, { unique: true });
    await StudentUser.collection.createIndex({ 'stats.totalPoints': -1 });
    
    console.log('✅ Created database indexes');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   Teacher Database: teacher_dashboard');
    console.log('   Student Database: student_dashboard');
    console.log('\n👤 Sample Accounts Created:');
    console.log('   Teacher: teacher@example.com / password123');
    console.log('   Student: student@example.com / password123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    // Close connections
    await teacherConnection.close();
    await studentConnection.close();
    console.log('\n🔌 Database connections closed');
    process.exit(0);
  }
}

// Run the setup
setupDatabases();
