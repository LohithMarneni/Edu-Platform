const mongoose = require('mongoose');
require('dotenv').config({ path: './teacher_dash_ba/project/backend/.env' });

const Student = require('../teacher_dash_ba/frontend/backend/models/Student');
const Class = require('../teacher_dash_ba/frontend/backend/models/Class');
const Assignment = require('../teacher_dash_ba/frontend/backend/models/Assignment');

async function testAssignmentVisibility() {
  try {
    // Connect to teacher database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to teacher database\n');

    // Get all students
    const students = await Student.find({}).select('email name classes');
    console.log(`📚 Found ${students.length} students:\n`);
    students.forEach(s => {
      console.log(`  - ${s.email} (${s.name})`);
      console.log(`    Classes: ${s.classes.length}`);
      s.classes.forEach(c => {
        console.log(`      - Class ID: ${c.class}`);
      });
    });

    // Get all classes
    const classes = await Class.find({}).select('name subject students');
    console.log(`\n📖 Found ${classes.length} classes:\n`);
    classes.forEach(c => {
      console.log(`  - ${c.name} (${c.subject})`);
      console.log(`    Students: ${c.students.length}`);
      c.students.forEach(sId => {
        console.log(`      - Student ID: ${sId}`);
      });
    });

    // Get all assignments
    const assignments = await Assignment.find({}).select('title status class').populate('class', 'name subject');
    console.log(`\n📝 Found ${assignments.length} assignments:\n`);
    assignments.forEach(a => {
      console.log(`  - ${a.title}`);
      console.log(`    Status: ${a.status}`);
      console.log(`    Class: ${a.class?.name || 'N/A'} (${a.class?.subject || 'N/A'})`);
    });

    // Test specific student email
    const testEmail = process.argv[2];
    if (testEmail) {
      console.log(`\n🔍 Testing for student email: ${testEmail}\n`);
      const student = await Student.findOne({ email: testEmail });
      
      if (!student) {
        console.log(`❌ Student not found with email: ${testEmail}`);
        console.log(`\n💡 To enroll this student:`);
        console.log(`   1. Make sure student logs in to student portal`);
        console.log(`   2. Use class code to join class`);
        console.log(`   3. Or manually add student to class in teacher portal`);
      } else {
        console.log(`✅ Found student: ${student.name} (${student._id})`);
        
        // Get classes for this student
        const studentClasses = await Class.find({ 
          students: student._id,
          isActive: true 
        }).select('name subject _id');
        
        console.log(`📚 Student enrolled in ${studentClasses.length} classes:`);
        studentClasses.forEach(c => {
          console.log(`  - ${c.name} (${c.subject}) - ${c._id}`);
        });
        
        if (studentClasses.length === 0) {
          console.log(`\n⚠️ Student is NOT enrolled in any classes!`);
          console.log(`\n💡 To fix:`);
          console.log(`   1. Have student join a class using class code`);
          console.log(`   2. Or manually add student to class in teacher portal`);
        } else {
          const classIds = studentClasses.map(c => c._id);
          
          // Get assignments for these classes
          const activeAssignments = await Assignment.find({
            class: { $in: classIds },
            status: 'active'
          }).populate('class', 'name subject');
          
          console.log(`\n📝 Found ${activeAssignments.length} active assignments:`);
          activeAssignments.forEach(a => {
            console.log(`  - ${a.title}`);
            console.log(`    Class: ${a.class?.name || 'N/A'}`);
            console.log(`    Subject: ${a.class?.subject || 'N/A'}`);
            console.log(`    Due: ${a.dueDate}`);
          });
          
          if (activeAssignments.length === 0) {
            console.log(`\n⚠️ No active assignments found!`);
            console.log(`\n💡 To fix:`);
            console.log(`   1. Make sure teacher has created assignments`);
            console.log(`   2. Make sure assignments are PUBLISHED (status: 'active')`);
          }
        }
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAssignmentVisibility();

