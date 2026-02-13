const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res, next) => {
  try {
    const { status, class: classId, type } = req.query;
    
    let query = { teacher: req.user.id };
    
    if (status) query.status = status;
    if (classId) query.class = classId;
    if (type) query.type = type;

    const assignments = await Assignment.find(query)
      .populate('class', 'name subject grade')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('class', 'name subject grade students')
      .populate('submissions.student', 'fullName name email avatar');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Make sure user is assignment teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this assignment'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private
exports.createAssignment = async (req, res, next) => {
  try {
    // Add teacher to req.body
    req.body.teacher = req.user.id;

    // Verify class belongs to teacher
    const classItem = await Class.findById(req.body.class);
    if (!classItem || classItem.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create assignment for this class'
      });
    }

    const assignment = await Assignment.create(req.body);

    // Update class stats
    classItem.stats.totalAssignments += 1;
    await classItem.save();

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Assignment created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during assignment creation',
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private
exports.updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Make sure user is assignment teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: assignment,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during assignment update',
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Make sure user is assignment teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this assignment'
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during assignment deletion',
      error: error.message
    });
  }
};

// @desc    Publish assignment
// @route   PUT /api/assignments/:id/publish
// @access  Private
exports.publishAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Make sure user is assignment teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to publish this assignment'
      });
    }

    assignment.status = 'active';
    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
      message: 'Assignment published successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit assignment (for students)
// @route   POST /api/assignments/student/submit/:assignmentId
// @access  Public (students submit via this endpoint)
exports.submitAssignment = async (req, res, next) => {
  try {
    // Get assignmentId from params (route is /submit/:assignmentId)
    const assignmentId = req.params.assignmentId;
    console.log('📥 Submit assignment request:', {
      assignmentId: assignmentId,
      params: req.params,
      bodyKeys: Object.keys(req.body),
      studentEmail: req.body.studentEmail,
      studentName: req.body.studentName
    });
    
    // Find assignment and populate class with students
    const assignment = await Assignment.findById(assignmentId)
      .populate({
        path: 'class',
        select: 'name subject grade students studentCount',
        populate: {
          path: 'students',
          select: 'name email'
        }
      });

    if (!assignment) {
      console.error('❌ Assignment not found:', assignmentId);
      const allAssignments = await Assignment.find({}).select('_id title').limit(5);
      console.error('💡 Available assignments:');
      allAssignments.forEach(a => console.error(`   - ${a._id}: ${a.title}`));
      
      return res.status(404).json({
        success: false,
        message: `Assignment not found with ID: ${assignmentId}`
      });
    }

    console.log('✅ Assignment found:', assignment.title);
    console.log('📚 Class:', assignment.class?.name, 'Students:', assignment.class?.students?.length || 0);

    // Find or create student (using unified User model)
    const User = require('../models/User');
    let student = null;
    const studentEmail = req.body.studentEmail?.toLowerCase().trim();
    
    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        message: 'Student email is required'
      });
    }

    console.log('🔍 Looking for student with email:', studentEmail);

    // Try multiple ways to find student (must have role='student')
    try {
      // Method 1: Exact match (case-insensitive) with role='student'
      student = await User.findOne({ 
        email: { $regex: new RegExp(`^${studentEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        role: 'student'
      });
      
      // Method 2: Lowercase exact match
      if (!student) {
        student = await User.findOne({ email: studentEmail, role: 'student' });
      }
      
      // Method 3: Case-insensitive with MongoDB $regex
      if (!student) {
        student = await User.findOne({ 
          $expr: { $eq: [{ $toLower: "$email" }, studentEmail] },
          role: 'student'
        });
      }
      
      console.log(student ? `✅ Found student: ${student.email}` : '❌ Student not found');
    } catch (findError) {
      console.error('❌ Error finding student:', findError);
    }

    // If student not found, create them
    if (!student) {
      console.log('📝 Creating new student:', studentEmail);
      
      try {
        // Create student user with role='student'
        student = await User.create({
          fullName: req.body.studentName || studentEmail.split('@')[0] || 'Student',
          email: studentEmail,
          role: 'student',
          isActive: true
        });
        
        console.log('✅ Created new student:', {
          id: student._id,
          email: student.email,
          name: student.fullName || student.name,
          role: student.role
        });
      } catch (createError) {
        console.error('❌ Error creating student:', createError.message);
        console.error('Error code:', createError.code);
        console.error('Error name:', createError.name);
        console.error('Error keyPattern:', createError.keyPattern);
        console.error('Error keyValue:', createError.keyValue);
        
        // If duplicate key error (email), try to find again
        if (createError.code === 11000) {
          console.log('⚠️ Duplicate key error, trying to find existing student...');
          
          // Try to find by email (most likely duplicate)
          student = await User.findOne({ email: studentEmail, role: 'student' });
          
          if (!student) {
            // Try with different email variations
            const emailVariations = [
              studentEmail,
              studentEmail.toLowerCase(),
              studentEmail.toUpperCase(),
              studentEmail.trim()
            ];
            
            for (const emailVar of emailVariations) {
              student = await User.findOne({ email: emailVar, role: 'student' });
              if (student) {
                console.log(`✅ Found student with variation: ${emailVar}`);
                break;
              }
            }
          } else {
            console.log('✅ Found existing student by email:', student.email);
          }
        }
        
        // If still not found after error handling, return detailed error
        if (!student) {
          const allStudents = await User.find({ role: 'student' }).select('email fullName name').limit(10);
          console.error('📋 Available students in database:');
          allStudents.forEach(s => console.error(`   - "${s.email}" (${s.fullName || s.name})`));
          
          return res.status(500).json({
            success: false,
            message: `Failed to create student: ${createError.message}. Email: ${studentEmail}`,
            error: createError.message,
            errorCode: createError.code,
            duplicateField: createError.keyPattern ? Object.keys(createError.keyPattern)[0] : null
          });
        }
      }
    }

    // Ensure student is enrolled in the class
    const Class = require('../models/Class');
    const classItem = await Class.findById(assignment.class._id);
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if student is in class's students array
    const isInClassStudents = classItem.students.some(
      s => s.toString() === student._id.toString()
    );

    // Check if class is in student's classes array
    const isInStudentClasses = student.classes.some(
      c => c.class && c.class.toString() === assignment.class._id.toString()
    );

    // Auto-enroll if not enrolled
    if (!isInClassStudents || !isInStudentClasses) {
      console.log('⚠️ Student not fully enrolled, auto-enrolling...');
      
      // Add to class's students array
      if (!isInClassStudents) {
        classItem.students.push(student._id);
        classItem.studentCount = classItem.students.length;
        await classItem.save();
        console.log('✅ Added student to class');
      }
      
      // Add to student's classes array
      if (!isInStudentClasses) {
        student.classes.push({
          class: assignment.class._id,
          joinedAt: new Date(),
          status: 'active'
        });
        await student.save();
        console.log('✅ Added class to student');
      }
    }

    // Verify assignment is active
    if (assignment.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Assignment is not active. Please contact your teacher.'
      });
    }

    // Check for existing submission
    const existingSubmissionIndex = assignment.submissions.findIndex(
      sub => sub.student && sub.student.toString() === student._id.toString()
    );

    console.log('📥 Processing submission:', {
      assignmentId: assignmentId,
      studentId: student._id,
      studentEmail: student.email,
      attachmentsCount: req.body.attachments?.length || 0,
      content: req.body.content ? 'Yes' : 'No',
      status: req.body.status || 'submitted',
      existingSubmission: existingSubmissionIndex !== -1
    });

    const submissionData = {
      student: student._id,
      content: req.body.content || '',
      attachments: req.body.attachments || [],
      isLate: new Date() > assignment.dueDate,
      submittedAt: new Date(),
      status: req.body.status || 'submitted'
    };

    // Update or create submission
    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      const existingSubmission = assignment.submissions[existingSubmissionIndex];
      existingSubmission.content = submissionData.content;
      existingSubmission.attachments = submissionData.attachments;
      existingSubmission.isLate = submissionData.isLate;
      existingSubmission.submittedAt = submissionData.submittedAt;
      existingSubmission.status = submissionData.status;
      console.log('✅ Updated existing submission at index:', existingSubmissionIndex);
    } else {
      // Create new submission
      assignment.submissions.push(submissionData);
      console.log('✅ Created new submission, total submissions:', assignment.submissions.length);
    }

    // Save assignment
    await assignment.save();
    console.log('💾 Assignment saved successfully');
    
    // Reload to get updated data with populated student
    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('submissions.student', 'fullName name email');
    
    const finalSubmissionIndex = updatedAssignment.submissions.findIndex(
      sub => sub.student && sub.student._id.toString() === student._id.toString()
    );
    
    if (finalSubmissionIndex === -1) {
      console.error('❌ Submission not found after save');
      return res.status(500).json({
        success: false,
        message: 'Failed to save submission. Please try again.'
      });
    }
    
    const savedSubmission = updatedAssignment.submissions[finalSubmissionIndex];
    console.log('✅ Submission saved successfully:', {
      student: savedSubmission.student?.name || savedSubmission.student?.email,
      attachmentsCount: savedSubmission.attachments?.length || 0,
      status: savedSubmission.status,
      submittedAt: savedSubmission.submittedAt
    });

    res.status(200).json({
      success: true,
      data: savedSubmission,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('❌ Submit assignment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error submitting assignment',
      error: error.message
    });
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/:id/submissions/:submissionId/grade
// @access  Private
exports.gradeSubmission = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Make sure user is assignment teacher
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to grade this assignment'
      });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.score = req.body.score;
    submission.feedback = req.body.feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await assignment.save();

    res.status(200).json({
      success: true,
      data: submission,
      message: 'Submission graded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assignment submissions
// @route   GET /api/assignments/:id/submissions
// @access  Private
exports.getSubmissions = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'fullName name email avatar');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      count: assignment.submissions.length,
      data: assignment.submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assignment statistics
// @route   GET /api/assignments/:id/stats
// @access  Private
exports.getAssignmentStats = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment.stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assignments for students (student-facing endpoint)
// @route   GET /api/assignments/student/:studentEmail
// @access  Public (with student email verification)
exports.getStudentAssignments = async (req, res, next) => {
  try {
    let { studentEmail } = req.params;
    
    // Decode email in case it's URL encoded
    studentEmail = decodeURIComponent(studentEmail);
    
    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        message: 'Student email is required'
      });
    }

    console.log(`🔍 Fetching assignments for student: ${studentEmail}`);

    // Find student by email (case-insensitive search) - using unified User model
    const User = require('../models/User');
    let student = await User.findOne({ 
      email: { $regex: new RegExp(`^${studentEmail}$`, 'i') },
      role: 'student'
    });
    
    // If still not found, try exact match
    if (!student) {
      student = await User.findOne({ email: studentEmail.toLowerCase(), role: 'student' });
    }
    
    // If student not found, try to find similar or create placeholder
    if (!student) {
      console.log(`⚠️ Student not found with email: ${studentEmail}`);
      console.log(`📝 Searching in database...`);
      
      // List all students to help debug
      const allStudents = await User.find({ role: 'student' }).select('email fullName name').limit(10);
      console.log(`📝 Available students in database:`);
      allStudents.forEach(s => console.log(`   - "${s.email}" (${s.fullName || s.name})`));
      
      // Try to find similar email (partial match)
      const similarStudent = await User.findOne({ 
        email: { $regex: studentEmail.split('@')[0], $options: 'i' },
        role: 'student'
      });
      
      if (similarStudent) {
        console.log(`💡 Found similar student: "${similarStudent.email}"`);
        console.log(`⚠️ Email mismatch! Student portal email: "${studentEmail}" vs Teacher backend: "${similarStudent.email}"`);
        console.log(`💡 Solution: Student must log in with email: "${similarStudent.email}" OR update teacher backend User email to match`);
        
        // Use the similar student but log warning
        student = similarStudent;
        console.log(`✅ Using similar student record: ${student.fullName || student.name}`);
      } else {
        // Return empty assignments - student needs to be enrolled first
        console.log(`❌ No matching student found. Student needs to be enrolled in a class first.`);
        return res.status(200).json({
          success: true,
          count: 0,
          data: {},
          message: `Student not found. Please ensure you are enrolled in a class. If you just joined a class, try refreshing. Available students: ${allStudents.map(s => s.email).join(', ')}`
        });
      }
    }

    console.log(`✅ Found student: ${student.name} (${student._id})`);

    // Get all classes the student is enrolled in
    const classes = await Class.find({ 
      students: student._id,
      isActive: true 
    }).select('_id name subject');

    console.log(`📚 Student enrolled in ${classes.length} classes:`, classes.map(c => c.name));

    if (classes.length === 0) {
      console.log(`⚠️ Student is not enrolled in any classes`);
      return res.status(200).json({
        success: true,
        count: 0,
        data: {},
        message: 'No classes found. Please join a class using a class code.'
      });
    }

    const classIds = classes.map(c => c._id);

    // Get all active assignments for these classes
    const assignments = await Assignment.find({
      class: { $in: classIds },
      status: 'active'
    })
      .populate('class', 'name subject grade')
      .populate('teacher', 'name email')
      .sort({ dueDate: 1 });

    console.log(`📝 Found ${assignments.length} active assignments for student`);

    // Add student's submission status
    const assignmentsWithStatus = assignments.map(assignment => {
      const studentSubmission = assignment.submissions.find(
        sub => sub.student && sub.student.toString() === student._id.toString()
      );

      return {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        assignmentType: assignment.assignmentType,
        class: assignment.class,
        teacher: assignment.teacher,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        instructions: assignment.instructions,
        attachments: assignment.attachments || [],
        questions: assignment.questions || [],
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        subject: assignment.class?.subject || 'General',
        studentStatus: studentSubmission ? 'submitted' : 'pending',
        studentSubmission: studentSubmission || null,
        isLate: new Date() > assignment.dueDate
      };
    });

    // Group by subject
    const groupedBySubject = assignmentsWithStatus.reduce((acc, assignment) => {
      const subject = assignment.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(assignment);
      return acc;
    }, {});

    console.log(`✅ Returning ${assignmentsWithStatus.length} assignments grouped by ${Object.keys(groupedBySubject).length} subjects`);

    res.status(200).json({
      success: true,
      count: assignmentsWithStatus.length,
      data: groupedBySubject
    });
  } catch (error) {
    console.error('❌ Get student assignments error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single assignment for student
// @route   GET /api/assignments/student/:studentEmail/:assignmentId
// @access  Public (with student email verification)
exports.getStudentAssignment = async (req, res, next) => {
  try {
    const { studentEmail, assignmentId } = req.params;
    
    if (!studentEmail || !assignmentId) {
      return res.status(400).json({
        success: false,
        message: 'Student email and assignment ID are required'
      });
    }

    // Find student by email - using unified User model
    const User = require('../models/User');
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get assignment
    const assignment = await Assignment.findById(assignmentId)
      .populate('class', 'name subject grade students')
      .populate('teacher', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Verify student is enrolled in the class
    const isEnrolled = assignment.class.students.some(
      s => s.toString() === student._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this assignment'
      });
    }

    // Get student's submission
    const studentSubmission = assignment.submissions.find(
      sub => sub.student && sub.student.toString() === student._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        ...assignment.toObject(),
        studentSubmission: studentSubmission || null,
        studentStatus: studentSubmission ? 'submitted' : 'pending'
      }
    });
  } catch (error) {
    console.error('Get student assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};