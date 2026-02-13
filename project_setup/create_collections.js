// MongoDB Collection Creation Script
// This script creates all necessary collections with proper indexes

const { MongoClient } = require('mongodb');

const TEACHER_DB_URI = 'mongodb://localhost:27017/teacher_dashboard';
const STUDENT_DB_URI = 'mongodb://localhost:27017/student_dashboard';

async function createCollections() {
  const teacherClient = new MongoClient(TEACHER_DB_URI);
  const studentClient = new MongoClient(STUDENT_DB_URI);

  try {
    console.log('🚀 Creating database collections...\n');

    // Connect to databases
    await teacherClient.connect();
    await studentClient.connect();
    
    const teacherDb = teacherClient.db('teacher_dashboard');
    const studentDb = studentClient.db('student_dashboard');

    // Teacher Database Collections
    console.log('📚 Creating Teacher Database Collections...');
    
    // Users collection
    await teacherDb.createCollection('users');
    await teacherDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await teacherDb.collection('users').createIndex({ role: 1 });
    console.log('   ✅ users collection created');

    // Classes collection
    await teacherDb.createCollection('classes');
    await teacherDb.collection('classes').createIndex({ teacher: 1, createdAt: -1 });
    await teacherDb.collection('classes').createIndex({ classCode: 1 }, { unique: true, sparse: true });
    await teacherDb.collection('classes').createIndex({ subject: 1, grade: 1 });
    console.log('   ✅ classes collection created');

    // Students collection
    await teacherDb.createCollection('students');
    await teacherDb.collection('students').createIndex({ email: 1 }, { unique: true });
    await teacherDb.collection('students').createIndex({ studentId: 1 }, { unique: true });
    await teacherDb.collection('students').createIndex({ 'classes.class': 1 });
    console.log('   ✅ students collection created');

    // Assignments collection
    await teacherDb.createCollection('assignments');
    await teacherDb.collection('assignments').createIndex({ class: 1, dueDate: 1 });
    await teacherDb.collection('assignments').createIndex({ teacher: 1, createdAt: -1 });
    await teacherDb.collection('assignments').createIndex({ status: 1 });
    console.log('   ✅ assignments collection created');

    // Content collection
    await teacherDb.createCollection('content');
    await teacherDb.collection('content').createIndex({ class: 1, type: 1 });
    await teacherDb.collection('content').createIndex({ teacher: 1, createdAt: -1 });
    await teacherDb.collection('content').createIndex({ subject: 1, status: 1 });
    await teacherDb.collection('content').createIndex({ title: 'text', description: 'text' });
    console.log('   ✅ content collection created');

    // Doubts collection
    await teacherDb.createCollection('doubts');
    await teacherDb.collection('doubts').createIndex({ class: 1, status: 1 });
    await teacherDb.collection('doubts').createIndex({ teacher: 1, createdAt: -1 });
    await teacherDb.collection('doubts').createIndex({ subject: 1, priority: 1 });
    await teacherDb.collection('doubts').createIndex({ title: 'text', question: 'text' });
    console.log('   ✅ doubts collection created');

    // Tasks collection
    await teacherDb.createCollection('tasks');
    await teacherDb.collection('tasks').createIndex({ teacher: 1, status: 1 });
    await teacherDb.collection('tasks').createIndex({ dueDate: 1 });
    await teacherDb.collection('tasks').createIndex({ category: 1, priority: 1 });
    console.log('   ✅ tasks collection created');

    // Student Database Collections
    console.log('\n🎓 Creating Student Database Collections...');

    // Users collection
    await studentDb.createCollection('users');
    await studentDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await studentDb.collection('users').createIndex({ role: 1 });
    await studentDb.collection('users').createIndex({ 'stats.totalPoints': -1 });
    console.log('   ✅ users collection created');

    // Courses collection
    await studentDb.createCollection('courses');
    await studentDb.collection('courses').createIndex({ category: 1, level: 1 });
    await studentDb.collection('courses').createIndex({ instructor: 1 });
    await studentDb.collection('courses').createIndex({ 'rating.average': -1 });
    await studentDb.collection('courses').createIndex({ name: 'text', description: 'text' });
    console.log('   ✅ courses collection created');

    // Quizzes collection
    await studentDb.createCollection('quizzes');
    await studentDb.collection('quizzes').createIndex({ subject: 1, difficulty: 1 });
    await studentDb.collection('quizzes').createIndex({ createdBy: 1 });
    await studentDb.collection('quizzes').createIndex({ tags: 1 });
    await studentDb.collection('quizzes').createIndex({ isPublished: 1 });
    console.log('   ✅ quizzes collection created');

    // QuizAttempts collection
    await studentDb.createCollection('quizattempts');
    await studentDb.collection('quizattempts').createIndex({ user: 1, createdAt: -1 });
    await studentDb.collection('quizattempts').createIndex({ quiz: 1 });
    await studentDb.collection('quizattempts').createIndex({ user: 1, quiz: 1 });
    await studentDb.collection('quizattempts').createIndex({ status: 1, result: 1 });
    console.log('   ✅ quizattempts collection created');

    // CourseProgress collection
    await studentDb.createCollection('courseprogresses');
    await studentDb.collection('courseprogresses').createIndex({ user: 1, course: 1 }, { unique: true });
    await studentDb.collection('courseprogresses').createIndex({ user: 1, lastAccessed: -1 });
    await studentDb.collection('courseprogresses').createIndex({ overallProgress: -1 });
    await studentDb.collection('courseprogresses').createIndex({ isCompleted: 1 });
    console.log('   ✅ courseprogresses collection created');

    // DailyActivities collection
    await studentDb.createCollection('dailyactivities');
    await studentDb.collection('dailyactivities').createIndex({ user: 1, date: -1 }, { unique: true });
    await studentDb.collection('dailyactivities').createIndex({ date: -1 });
    console.log('   ✅ dailyactivities collection created');

    // WeeklyGoals collection
    await studentDb.createCollection('weeklygoals');
    await studentDb.collection('weeklygoals').createIndex({ user: 1, 'week.start': -1 });
    await studentDb.collection('weeklygoals').createIndex({ user: 1, createdAt: -1 });
    console.log('   ✅ weeklygoals collection created');

    // UserCollections collection
    await studentDb.createCollection('usercollections');
    await studentDb.collection('usercollections').createIndex({ user: 1 }, { unique: true });
    await studentDb.collection('usercollections').createIndex({ 'subjects.subjectId': 1 });
    await studentDb.collection('usercollections').createIndex({ 'recentItems.accessedAt': -1 });
    console.log('   ✅ usercollections collection created');

    // Doubts collection
    await studentDb.createCollection('doubts');
    await studentDb.collection('doubts').createIndex({ askedBy: 1, createdAt: -1 });
    await studentDb.collection('doubts').createIndex({ subject: 1, status: 1 });
    await studentDb.collection('doubts').createIndex({ tags: 1 });
    await studentDb.collection('doubts').createIndex({ title: 'text', description: 'text' });
    await studentDb.collection('doubts').createIndex({ views: -1 });
    console.log('   ✅ doubts collection created');

    // VideoNotes collection
    await studentDb.createCollection('videonotes');
    await studentDb.collection('videonotes').createIndex({ user: 1, videoId: 1 });
    await studentDb.collection('videonotes').createIndex({ user: 1, topicId: 1 });
    await studentDb.collection('videonotes').createIndex({ timestamp: 1 });
    console.log('   ✅ videonotes collection created');

    console.log('\n🎉 All collections created successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   Teacher Database: teacher_dashboard');
    console.log('     - users, classes, students, assignments, content, doubts, tasks');
    console.log('   Student Database: student_dashboard');
    console.log('     - users, courses, quizzes, quizattempts, courseprogresses,');
    console.log('       dailyactivities, weeklygoals, usercollections, doubts, videonotes');

  } catch (error) {
    console.error('❌ Error creating collections:', error.message);
    process.exit(1);
  } finally {
    await teacherClient.close();
    await studentClient.close();
    console.log('\n🔌 Database connections closed');
    process.exit(0);
  }
}

createCollections();
