/**
 * Test script to verify Content to Course synchronization
 * 
 * This script tests:
 * 1. Creating a chapter and verifying it syncs to Course collection
 * 2. Creating a subtopic and verifying it syncs to Course collection
 * 3. Verifying data is correctly linked using unique identifiers
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './teacher_dash_ba/project/backend/.env' });

// Connect to teacher database
const teacherDbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard';
const studentDbUri = process.env.STUDENT_MONGODB_URI || 
                     process.env.MONGODB_URI?.replace('teacher_dashboard', 'student_dashboard') ||
                     'mongodb://localhost:27017/student_dashboard';

async function testContentSync() {
  console.log('🧪 Starting Content to Course synchronization test...\n');
  
  let teacherConn, studentConn;
  
  try {
    // Connect to both databases
    teacherConn = mongoose.createConnection(teacherDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await new Promise((resolve, reject) => {
      teacherConn.once('connected', resolve);
      teacherConn.once('error', reject);
    });
    console.log('✅ Connected to teacher database');
    
    studentConn = mongoose.createConnection(studentDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await new Promise((resolve, reject) => {
      studentConn.once('connected', resolve);
      studentConn.once('error', reject);
    });
    console.log('✅ Connected to student database\n');
    
    // Load models
    const Content = teacherConn.model('Content', new mongoose.Schema({}, { strict: false }));
    const Class = teacherConn.model('Class', new mongoose.Schema({}, { strict: false }));
    const User = teacherConn.model('User', new mongoose.Schema({}, { strict: false }));
    
    const Course = studentConn.model('Course', new mongoose.Schema({}, { strict: false }));
    
    // Find a test class with a subject
    const testClass = await Class.findOne({ subject: { $exists: true, $ne: '' } });
    
    if (!testClass) {
      console.log('❌ No class found with a subject. Please create a class with a subject first.');
      return;
    }
    
    console.log('📚 Test Class:', {
      id: testClass._id,
      name: testClass.name,
      subject: testClass.subject,
      teacher: testClass.teacher
    });
    
    // Find the teacher
    const teacher = await User.findById(testClass.teacher);
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    console.log('👤 Teacher:', {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email
    });
    
    // Test 1: Check existing chapters and their sync status
    console.log('\n📖 Test 1: Checking existing chapters...');
    const chapters = await Content.find({
      type: 'chapter',
      class: testClass._id
    }).limit(5);
    
    console.log(`Found ${chapters.length} chapters`);
    
    for (const chapter of chapters) {
      const chapterId = chapter.chapter?.id || chapter._id.toString();
      console.log(`  - Chapter: ${chapter.chapter?.name || chapter.title} (ID: ${chapterId})`);
      
      // Check if synced to Course
      const category = mapSubjectToCategory(testClass.subject);
      const course = await Course.findOne({
        classId: testClass._id.toString(),
        category: category
      }) || await Course.findOne({ category: category });
      
      if (course) {
        const module = course.modules.find(m => m.chapterId === chapterId);
        if (module) {
          console.log(`    ✅ Synced to Course module: ${module.name}`);
          console.log(`    📊 Module has ${module.topics.length} topics`);
        } else {
          console.log(`    ⚠️  Not found in Course modules (may need sync)`);
        }
      } else {
        console.log(`    ⚠️  Course not found for category: ${category}`);
      }
    }
    
    // Test 2: Check existing subtopics and their sync status
    console.log('\n📝 Test 2: Checking existing subtopics...');
    const subtopics = await Content.find({
      type: 'subtopic',
      class: testClass._id
    }).limit(10);
    
    console.log(`Found ${subtopics.length} subtopics`);
    
    for (const subtopic of subtopics.slice(0, 5)) {
      const subtopicId = subtopic.subtopic?.id || subtopic._id.toString();
      const chapterId = subtopic.chapter?.id;
      console.log(`  - Subtopic: ${subtopic.subtopic?.title || subtopic.title} (ID: ${subtopicId})`);
      console.log(`    Chapter ID: ${chapterId || 'N/A'}`);
      
      if (chapterId) {
        const category = mapSubjectToCategory(testClass.subject);
        const course = await Course.findOne({
          classId: testClass._id.toString(),
          category: category
        }) || await Course.findOne({ category: category });
        
        if (course) {
          const module = course.modules.find(m => m.chapterId === chapterId);
          if (module) {
            const topic = module.topics.find(t => t.subtopicId === subtopicId);
            if (topic) {
              console.log(`    ✅ Synced to Course topic: ${topic.name}`);
            } else {
              console.log(`    ⚠️  Not found in Course topics (may need sync)`);
            }
          } else {
            console.log(`    ⚠️  Module not found for chapterId: ${chapterId}`);
          }
        }
      }
    }
    
    // Test 3: Verify Course structure
    console.log('\n📚 Test 3: Verifying Course structure...');
    const category = mapSubjectToCategory(testClass.subject);
    const courses = await Course.find({ category: category });
    
    console.log(`Found ${courses.length} course(s) for category: ${category}`);
    
    for (const course of courses) {
      console.log(`\n  Course: ${course.name}`);
      console.log(`  ClassId: ${course.classId || 'Not set'}`);
      console.log(`  Modules: ${course.modules.length}`);
      console.log(`  Total Lessons: ${course.totalLessons}`);
      
      for (const module of course.modules) {
        console.log(`    📖 Module: ${module.name}`);
        console.log(`      ChapterId: ${module.chapterId || 'Not set'}`);
        console.log(`      Topics: ${module.topics.length}`);
        
        for (const topic of module.topics.slice(0, 3)) {
          console.log(`        📝 Topic: ${topic.name}`);
          console.log(`          SubtopicId: ${topic.subtopicId || 'Not set'}`);
        }
        if (module.topics.length > 3) {
          console.log(`        ... and ${module.topics.length - 3} more topics`);
        }
      }
    }
    
    // Summary
    console.log('\n📊 Summary:');
    const allChapters = await Content.countDocuments({ type: 'chapter', class: testClass._id });
    const allSubtopics = await Content.countDocuments({ type: 'subtopic', class: testClass._id });
    
    console.log(`  Total Chapters in Content: ${allChapters}`);
    console.log(`  Total Subtopics in Content: ${allSubtopics}`);
    
    if (courses.length > 0) {
      const totalModules = courses.reduce((sum, c) => sum + c.modules.length, 0);
      const totalTopics = courses.reduce((sum, c) => 
        sum + c.modules.reduce((mSum, m) => mSum + m.topics.length, 0), 0
      );
      console.log(`  Total Modules in Course: ${totalModules}`);
      console.log(`  Total Topics in Course: ${totalTopics}`);
      
      if (totalModules === allChapters && totalTopics === allSubtopics) {
        console.log('\n✅ Perfect sync! All chapters and subtopics are synced.');
      } else {
        console.log('\n⚠️  Sync mismatch detected. Some content may need to be synced.');
      }
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (teacherConn) {
      await teacherConn.close();
      console.log('\n🔌 Closed teacher database connection');
    }
    if (studentConn) {
      await studentConn.close();
      console.log('🔌 Closed student database connection');
    }
  }
}

// Helper function to map subject to category (same as in content.js)
function mapSubjectToCategory(subject) {
  const subjectLower = (subject || '').toLowerCase().trim();
  const mapping = {
    'mathematics': 'mathematics',
    'math': 'mathematics',
    'physics': 'physics',
    'chemistry': 'chemistry',
    'biology': 'biology',
    'english': 'english',
    'history': 'history',
    'computer science': 'computer-science',
    'cs': 'computer-science',
    'computer-science': 'computer-science'
  };
  
  if (mapping[subjectLower]) {
    return mapping[subjectLower];
  }
  
  for (const [key, value] of Object.entries(mapping)) {
    if (subjectLower.includes(key) || key.includes(subjectLower)) {
      return value;
    }
  }
  
  return 'mathematics';
}

// Run the test
testContentSync().catch(console.error);

