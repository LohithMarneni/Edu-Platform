const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Class = require('./models/Class');
const Assignment = require('./models/Assignment');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function checkConnections() {
  try {
    console.log('🔍 Checking database connections...\n');
    
    // 1. Check Teachers
    console.log('👨‍🏫 TEACHERS:');
    const teachers = await User.find({ role: 'teacher' });
    console.log(`   Total: ${teachers.length}`);
    teachers.forEach(t => {
      console.log(`   - ${t.name} (${t.email}) - ID: ${t._id}`);
    });
    
    // 2. Check Students
    console.log('\n👨‍🎓 STUDENTS:');
    const students = await Student.find({});
    console.log(`   Total: ${students.length}`);
    students.forEach(s => {
      console.log(`   - ${s.name} (${s.email}) - ID: ${s._id}`);
      console.log(`     Enrolled in ${s.classes?.length || 0} classes`);
    });
    
    // 3. Check Classes
    console.log('\n📚 CLASSES:');
    const classes = await Class.find({}).populate('teacher', 'name email').populate('students', 'name email');
    console.log(`   Total: ${classes.length}`);
    
    for (const cls of classes) {
      console.log(`\n   📖 ${cls.name} (${cls.subject}) - ID: ${cls._id}`);
      console.log(`      Teacher: ${cls.teacher?.name || 'NOT ASSIGNED'} (${cls.teacher?.email || 'N/A'})`);
      console.log(`      Teacher ID: ${cls.teacher?._id || 'MISSING'}`);
      console.log(`      Students: ${cls.students?.length || 0}/${cls.studentCount || 0}`);
      
      if (cls.students && cls.students.length > 0) {
        console.log(`      Student List:`);
        cls.students.forEach(student => {
          console.log(`         - ${student.name || 'NO NAME'} (${student.email || 'NO EMAIL'})`);
        });
      } else {
        console.log(`      ⚠️  No students enrolled in this class`);
      }
    }
    
    // 4. Check Assignments
    console.log('\n📝 ASSIGNMENTS:');
    const assignments = await Assignment.find({}).populate('class', 'name').populate('teacher', 'name');
    console.log(`   Total: ${assignments.length}`);
    assignments.forEach(a => {
      console.log(`   - ${a.title}`);
      console.log(`     Class: ${a.class?.name || 'NOT ASSIGNED'}`);
      console.log(`     Teacher: ${a.teacher?.name || 'NOT ASSIGNED'}`);
    });
    
    // 5. Verify connections
    console.log('\n🔗 CONNECTION VERIFICATION:');
    let connectionIssues = [];
    
    for (const cls of classes) {
      if (!cls.teacher) {
        connectionIssues.push(`Class "${cls.name}" has no teacher assigned`);
      }
      
      if (!cls.teacher?._id) {
        connectionIssues.push(`Class "${cls.name}" teacher reference is invalid`);
      }
    }
    
    if (connectionIssues.length === 0) {
      console.log('   ✅ All connections are valid!');
    } else {
      console.log('   ⚠️  Connection issues found:');
      connectionIssues.forEach(issue => console.log(`      - ${issue}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📦 Connection closed');
    process.exit(0);
  }
}

connectDB().then(() => {
  checkConnections();
});

