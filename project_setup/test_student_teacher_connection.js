const mongoose = require('mongoose');
require('dotenv').config({ path: './teacher_dash_ba/project/backend/.env' });

const Student = require('../teacher_dash_ba/frontend/backend/models/Student');
const Class = require('../teacher_dash_ba/frontend/backend/models/Class');
const Assignment = require('../teacher_dash_ba/frontend/backend/models/Assignment');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard');
    console.log('✅ Connected to teacher database\n');

    // Check Sarah Johnson's classes
    const User = require('../teacher_dash_ba/frontend/backend/models/User');
    const sarah = await User.findOne({ email: 'sarah.johnson@school.edu' });
    console.log(`👩‍🏫 Teacher: ${sarah?.name || 'Not found'} (${sarah?.email || 'N/A'})\n`);

    if (sarah) {
      const sarahClasses = await Class.find({ teacher: sarah._id, isActive: true });
      console.log(`📚 Sarah's Classes (${sarahClasses.length}):`);
      sarahClasses.forEach(c => {
        console.log(`  - ${c.name} (${c.subject}) - ID: ${c._id}`);
        console.log(`    Students: ${c.students.length}`);
        console.log(`    Class Code: ${c.classCode || 'Not generated'}`);
      });

      // Check assignments for Sarah's classes
      const classIds = sarahClasses.map(c => c._id);
      const assignments = await Assignment.find({
        class: { $in: classIds },
        status: 'active'
      }).populate('class', 'name subject');
      
      console.log(`\n📝 Active Assignments (${assignments.length}):`);
      assignments.forEach(a => {
        console.log(`  - ${a.title}`);
        console.log(`    Class: ${a.class?.name} (${a.class?.subject})`);
        console.log(`    Status: ${a.status}`);
        console.log(`    Due: ${a.dueDate}`);
      });
    }

    // Check Alice Johnson
    console.log(`\n👩‍🎓 Checking Alice Johnson:`);
    const alice = await Student.findOne({ email: /alice/i });
    if (alice) {
      console.log(`  Found: ${alice.name} - ${alice.email}`);
      console.log(`  Student ID: ${alice._id}`);
      console.log(`  Enrolled in ${alice.classes.length} classes`);
      
      alice.classes.forEach(async (c) => {
        const classObj = await Class.findById(c.class);
        if (classObj) {
          console.log(`    - ${classObj.name} (${classObj.subject})`);
          console.log(`      Class ID: ${classObj._id}`);
          console.log(`      Class has ${classObj.students.length} students`);
          console.log(`      Alice enrolled: ${classObj.students.includes(alice._id)}`);
          
          // Check assignments for this class
          const classAssignments = await Assignment.find({
            class: classObj._id,
            status: 'active'
          });
          console.log(`      Active assignments: ${classAssignments.length}`);
          classAssignments.forEach(a => {
            console.log(`        - ${a.title} (${a.status})`);
          });
        }
      });
    } else {
      console.log(`  ❌ Alice not found in teacher backend`);
      console.log(`  💡 Need to create Student record with email matching student portal`);
    }

    // List all students
    console.log(`\n📋 All Students in Teacher Backend:`);
    const allStudents = await Student.find({}).select('email name classes');
    allStudents.forEach(s => {
      console.log(`  - ${s.email} (${s.name})`);
      console.log(`    Classes: ${s.classes.length}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testConnection();


