const mongoose = require('mongoose');

/**
 * Comprehensive script to check the mapping between:
 * 1. Teacher Backend (Student model) and Student Backend (User model)
 * 2. Class enrollment
 * 3. Assignment visibility
 * 4. Email matching
 */

async function checkMapping() {
  const path = require('path');
  console.log('🔍 Checking Assignment Mapping Between Systems\n');
  console.log('='.repeat(80));

  // Connect to Teacher Backend Database
  const teacherDbUri = process.env.TEACHER_MONGODB_URI || 'mongodb://localhost:27017/teacher_dashboard';
  const studentDbUri = process.env.STUDENT_MONGODB_URI || 'mongodb://localhost:27017/student_dashboard';

  try {
    // ============================================
    // TEACHER BACKEND CHECK
    // ============================================
    console.log('\n📚 TEACHER BACKEND DATABASE');
    console.log('-'.repeat(80));
    
    await mongoose.connect(teacherDbUri);
    console.log('✅ Connected to Teacher Backend Database\n');

    const TeacherUser = require(path.join(__dirname, 'teacher_dash_ba/project/backend/models/User'));
    const TeacherStudent = require(path.join(__dirname, 'teacher_dash_ba/project/backend/models/Student'));
    const Class = require(path.join(__dirname, 'teacher_dash_ba/project/backend/models/Class'));
    const Assignment = require(path.join(__dirname, 'teacher_dash_ba/project/backend/models/Assignment'));

    // Check Sarah Johnson (Teacher)
    console.log('👩‍🏫 TEACHER: Sarah Johnson');
    const sarah = await TeacherUser.findOne({ email: 'sarah.johnson@school.edu' });
    if (!sarah) {
      console.log('   ❌ Sarah Johnson not found!');
      console.log('   💡 Available teachers:');
      const allTeachers = await TeacherUser.find({ role: 'teacher' }).select('name email');
      allTeachers.forEach(t => console.log(`      - ${t.email} (${t.name})`));
    } else {
      console.log(`   ✅ Found: ${sarah.name}`);
      console.log(`   📧 Email: ${sarah.email}`);
      console.log(`   🆔 ID: ${sarah._id}`);

      // Check Sarah's Classes
      const sarahClasses = await Class.find({ teacher: sarah._id, isActive: true });
      console.log(`\n   📚 Sarah's Classes (${sarahClasses.length}):`);
      sarahClasses.forEach((c, idx) => {
        console.log(`      ${idx + 1}. ${c.name}`);
        console.log(`         Subject: ${c.subject}`);
        console.log(`         Class ID: ${c._id}`);
        console.log(`         Students: ${c.students.length}`);
        console.log(`         Class Code: ${c.classCode || 'Not set'}`);
      });

      // Check Assignments for Sarah's Classes
      if (sarahClasses.length > 0) {
        const classIds = sarahClasses.map(c => c._id);
        const assignments = await Assignment.find({
          class: { $in: classIds }
        }).populate('class', 'name subject').sort({ createdAt: -1 });

        console.log(`\n   📝 Assignments (${assignments.length} total):`);
        assignments.forEach((a, idx) => {
          console.log(`      ${idx + 1}. ${a.title}`);
          console.log(`         Status: ${a.status} ${a.status === 'active' ? '✅' : '❌'}`);
          console.log(`         Class: ${a.class?.name} (${a.class?.subject})`);
          console.log(`         Due: ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}`);
          console.log(`         Created: ${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}`);
        });
      }
    }

    // Check Alice Johnson (Student in Teacher Backend)
    console.log('\n\n👩‍🎓 STUDENT IN TEACHER BACKEND: Alice Johnson');
    const aliceInTeacher = await TeacherStudent.findOne({ 
      $or: [
        { email: /alice/i },
        { name: /alice/i }
      ]
    });
    
    if (!aliceInTeacher) {
      console.log('   ❌ Alice Johnson not found in Teacher Backend Student model!');
      console.log('   💡 Available students:');
      const allStudents = await TeacherStudent.find({}).select('name email').limit(10);
      allStudents.forEach(s => console.log(`      - ${s.email} (${s.name})`));
    } else {
      console.log(`   ✅ Found: ${aliceInTeacher.name}`);
      console.log(`   📧 Email: ${aliceInTeacher.email}`);
      console.log(`   🆔 Student ID: ${aliceInTeacher._id}`);
      console.log(`   📋 Student ID Number: ${aliceInTeacher.studentId || 'N/A'}`);
      console.log(`   📚 Enrolled in ${aliceInTeacher.classes.length} classes`);

      // Check which classes Alice is enrolled in
      if (aliceInTeacher.classes.length > 0) {
        console.log('\n   Classes Alice is enrolled in:');
        for (const classRef of aliceInTeacher.classes) {
          const classObj = await Class.findById(classRef.class || classRef);
          if (classObj) {
            console.log(`      - ${classObj.name} (${classObj.subject})`);
            console.log(`        Class ID: ${classObj._id}`);
            console.log(`        Teacher: ${classObj.teacher}`);
            console.log(`        Is Alice in class.students array? ${classObj.students.includes(aliceInTeacher._id) ? '✅' : '❌'}`);
            
            // Check if there are active assignments for this class
            const classAssignments = await Assignment.find({
              class: classObj._id,
              status: 'active'
            });
            console.log(`        Active assignments: ${classAssignments.length}`);
            classAssignments.forEach(a => {
              console.log(`          - ${a.title} (Due: ${new Date(a.dueDate).toLocaleDateString()})`);
            });
          }
        }
      }

      // Check if Alice is in any class's students array
      const classesWithAlice = await Class.find({ 
        students: aliceInTeacher._id,
        isActive: true 
      });
      console.log(`\n   ✅ Classes where Alice is in students array: ${classesWithAlice.length}`);
      classesWithAlice.forEach(c => {
        console.log(`      - ${c.name} (${c.subject})`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from Teacher Backend\n');

    // ============================================
    // STUDENT BACKEND CHECK
    // ============================================
    console.log('\n📚 STUDENT BACKEND DATABASE');
    console.log('-'.repeat(80));
    
    await mongoose.connect(studentDbUri);
    console.log('✅ Connected to Student Backend Database\n');

    const StudentUser = require(path.join(__dirname, 'student_dash_ba/project/backend/models/User'));

    // Check Alice Johnson (User in Student Backend)
    console.log('👩‍🎓 STUDENT IN STUDENT BACKEND: Alice Johnson');
    const aliceInStudent = await StudentUser.findOne({ 
      $or: [
        { email: /alice/i },
        { fullName: /alice/i }
      ]
    });

    if (!aliceInStudent) {
      console.log('   ❌ Alice Johnson not found in Student Backend User model!');
      console.log('   💡 Available students:');
      const allStudents = await StudentUser.find({ role: 'student' }).select('fullName email').limit(10);
      allStudents.forEach(s => console.log(`      - ${s.email} (${s.fullName})`));
    } else {
      console.log(`   ✅ Found: ${aliceInStudent.fullName}`);
      console.log(`   📧 Email: ${aliceInStudent.email}`);
      console.log(`   🆔 User ID: ${aliceInStudent._id}`);
      console.log(`   👤 Role: ${aliceInStudent.role}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from Student Backend\n');

    // ============================================
    // MAPPING VERIFICATION
    // ============================================
    console.log('\n🔗 MAPPING VERIFICATION');
    console.log('='.repeat(80));

    if (aliceInTeacher && aliceInStudent) {
      console.log('\n📧 EMAIL MATCHING:');
      if (aliceInTeacher.email.toLowerCase() === aliceInStudent.email.toLowerCase()) {
        console.log(`   ✅ Emails match: ${aliceInTeacher.email}`);
      } else {
        console.log(`   ❌ EMAIL MISMATCH!`);
        console.log(`      Teacher Backend: ${aliceInTeacher.email}`);
        console.log(`      Student Backend: ${aliceInStudent.email}`);
        console.log(`   💡 This is the main issue! The student backend will try to fetch assignments using`);
        console.log(`      "${aliceInStudent.email}" but the teacher backend has "${aliceInTeacher.email}"`);
      }
    } else {
      console.log('   ❌ Cannot verify mapping - one or both Alice records missing');
    }

    // Check if Alice is enrolled in Sarah's Math class
    if (aliceInTeacher && sarah) {
      await mongoose.connect(teacherDbUri);
      const sarahMathClass = await Class.findOne({ 
        teacher: sarah._id, 
        subject: /math/i,
        isActive: true 
      });

      if (sarahMathClass) {
        const isEnrolled = sarahMathClass.students.includes(aliceInTeacher._id);
        console.log('\n📚 CLASS ENROLLMENT:');
        console.log(`   Sarah's Math Class: ${sarahMathClass.name}`);
        console.log(`   Alice enrolled: ${isEnrolled ? '✅' : '❌'}`);
        
        if (!isEnrolled) {
          console.log(`   💡 Alice needs to be added to class.students array`);
        }
      }
      await mongoose.disconnect();
    }

    // ============================================
    // API ENDPOINT TEST
    // ============================================
    console.log('\n🌐 API ENDPOINT TEST');
    console.log('-'.repeat(80));
    
    if (aliceInStudent) {
      const testEmail = aliceInStudent.email;
      const testUrl = `http://localhost:5001/api/assignments/student/${encodeURIComponent(testEmail)}`;
      console.log(`\n   📡 Test URL: ${testUrl}`);
      console.log(`   📧 Using email: ${testEmail}`);
      console.log(`   💡 This is what the student backend will call`);
      console.log(`   💡 Make sure teacher backend is running on port 5001`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Mapping check complete!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the check
checkMapping().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

