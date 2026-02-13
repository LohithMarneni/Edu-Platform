const Assessment = require('../models/Assessment');
const { CourseProgress } = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all assessments for a student
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = async (req, res, next) => {
  try {
    const { subject, status } = req.query;
    
    // Get student's enrolled courses
    const enrolledCourses = await CourseProgress.find({ 
      user: req.user._id 
    }).populate('course', 'name category') || [];

    const enrolledCourseIds = (enrolledCourses || []).map(progress => progress.course?._id).filter(id => id);

    let query = { 
      isActive: true
    };

    // Show all assessments regardless of enrollment
    // Students can see all available assessments

    if (subject) {
      query.subject = subject;
    }

    const assessments = await Assessment.find(query)
      .populate('course', 'name category')
      .populate('instructor', 'name email')
      .sort({ dueDate: 1 }) || [];

    // Safe handling for undefined assessments
    if (!Array.isArray(assessments)) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: {}
      });
    }

    // Add student's submission status
    const assessmentsWithStatus = assessments.map(assessment => {
      const studentSubmission = assessment.submissions.find(
        submission => submission.student.toString() === req.user._id.toString()
      );

      let studentStatus = 'pending';
      if (studentSubmission) {
        studentStatus = studentSubmission.status;
      }

      return {
        ...assessment.toObject(),
        studentStatus,
        studentSubmission: studentSubmission || null
      };
    });

    // Group local assessments by subject
    const groupedBySubject = (assessmentsWithStatus || []).reduce((acc, assessment) => {
      const subject = assessment.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(assessment);
      return acc;
    }, {});

    // Fetch assignments from teacher backend
    let teacherAssignments = {};
    try {
      const teacherApiUrl = process.env.TEACHER_API_URL || 'http://localhost:5001';
      const studentEmail = encodeURIComponent(req.user.email);
      const url = `${teacherApiUrl}/api/assignments/student/${studentEmail}`;
      
      console.log(`🔄 Fetching assignments from teacher backend for: ${req.user.email}`);
      console.log(`📡 URL: ${url}`);
      
      const teacherResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`📡 Teacher backend response status: ${teacherResponse.status} ${teacherResponse.statusText}`);

      if (teacherResponse.ok) {
        const teacherData = await teacherResponse.json();
        console.log(`📦 Teacher backend response:`, {
          success: teacherData.success,
          count: teacherData.count,
          hasData: !!teacherData.data,
          dataKeys: teacherData.data ? Object.keys(teacherData.data) : []
        });
        
        if (teacherData.success && teacherData.data) {
          teacherAssignments = teacherData.data;
          console.log(`✅ Fetched ${teacherData.count || 0} assignments from teacher backend`);
          if (teacherData.message) {
            console.log(`ℹ️ Message: ${teacherData.message}`);
          }
        }
      } else {
        const errorData = await teacherResponse.json().catch(() => ({}));
        console.warn(`⚠️ Could not fetch assignments from teacher backend:`, {
          status: teacherResponse.status,
          statusText: teacherResponse.statusText,
          error: errorData.message || errorData.error || 'Unknown error'
        });
      }
    } catch (teacherError) {
      console.error('❌ Error fetching from teacher backend:', {
        message: teacherError.message,
        stack: teacherError.stack,
        code: teacherError.code
      });
      // Continue without teacher assignments if there's an error
    }

    // Merge local assessments and teacher assignments
    const allAssignments = { ...groupedBySubject };
    
    // Add teacher assignments to the grouped data
    Object.keys(teacherAssignments).forEach(subject => {
      if (!allAssignments[subject]) {
        allAssignments[subject] = [];
      }
      // Transform teacher assignment format to match student assessment format
      teacherAssignments[subject].forEach(assignment => {
        allAssignments[subject].push({
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          type: assignment.type || 'Assignment',
          subject: assignment.subject,
          dueDate: assignment.dueDate,
          totalMarks: assignment.totalMarks,
          instructions: assignment.instructions,
          attachments: assignment.attachments || [],
          questions: assignment.questions || [],
          course: assignment.class,
          instructor: assignment.teacher,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
          studentStatus: assignment.studentStatus || 'pending',
          studentSubmission: assignment.studentSubmission || null,
          isLate: assignment.isLate,
          isFromTeacher: true // Flag to indicate this came from teacher backend
        });
      });
    });

    // Filter by status if provided
    let filteredAssessments = allAssignments;
    if (status) {
      Object.keys(filteredAssessments).forEach(subj => {
        filteredAssessments[subj] = filteredAssessments[subj].filter(
          assessment => assessment.studentStatus === status
        );
      });
    }

    res.status(200).json({
      success: true,
      data: filteredAssessments
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting assessments',
      error: error.message
    });
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessment = async (req, res, next) => {
  try {
    // First try to find in local database
    let assessment = await Assessment.findById(req.params.id)
      .populate('course', 'name category')
      .populate('instructor', 'name email')
      .populate('submissions.student', 'name email');

    // If not found locally, try fetching from teacher backend
    if (!assessment) {
      try {
        const teacherApiUrl = process.env.TEACHER_API_URL || 'http://localhost:5001';
        const teacherResponse = await fetch(
          `${teacherApiUrl}/api/assignments/student/${req.user.email}/${req.params.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          if (teacherData.success && teacherData.data) {
            // Transform teacher assignment to student assessment format
            const teacherAssignment = teacherData.data;
            
            // Transform studentSubmission to include files in both formats
            let studentSubmission = null;
            if (teacherAssignment.studentSubmission) {
              studentSubmission = {
                ...teacherAssignment.studentSubmission,
                // Ensure we have both attachments (teacher format) and files (student format)
                attachments: teacherAssignment.studentSubmission.attachments || [],
                files: teacherAssignment.studentSubmission.attachments 
                  ? teacherAssignment.studentSubmission.attachments.map((att, idx) => ({
                      id: idx,
                      name: att.originalName || att.filename || `Attachment ${idx + 1}`,
                      type: att.mimetype || 'FILE',
                      url: att.path || att.url || '',
                      uploadedAt: att.uploadedAt || new Date().toLocaleString()
                    }))
                  : []
              };
            }
            
            return res.status(200).json({
              success: true,
              data: {
                _id: teacherAssignment._id,
                title: teacherAssignment.title,
                description: teacherAssignment.description,
                type: teacherAssignment.type || 'Assignment',
                subject: teacherAssignment.class?.subject || 'General',
                dueDate: teacherAssignment.dueDate,
                totalMarks: teacherAssignment.totalMarks,
                points: teacherAssignment.totalMarks,
                instructions: teacherAssignment.instructions,
                attachments: teacherAssignment.attachments || [],
                questions: teacherAssignment.questions || [],
                course: teacherAssignment.class,
                instructor: teacherAssignment.teacher,
                createdAt: teacherAssignment.createdAt,
                updatedAt: teacherAssignment.updatedAt,
                studentSubmission: studentSubmission,
                studentStatus: teacherAssignment.studentStatus || 'pending',
                isFromTeacher: true
              }
            });
          }
        }
      } catch (teacherError) {
        console.warn('⚠️ Error fetching from teacher backend:', teacherError.message);
      }

      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get student's submission
    const studentSubmission = assessment.submissions.find(
      submission => submission.student._id.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        ...assessment.toObject(),
        studentSubmission: studentSubmission || null
      }
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting assessment',
      error: error.message
    });
  }
};

// @desc    Submit assessment
// @route   POST /api/assessments/:id/submit
// @access  Private
exports.submitAssessment = async (req, res, next) => {
  try {
    const { files, status, content } = req.body;
    const assessmentId = req.params.id;
    
    console.log('📤 Submit assessment request received:', {
      assessmentId: assessmentId,
      filesCount: files?.length || 0,
      status: status,
      url: req.originalUrl,
      user: req.user ? { id: req.user._id, email: req.user.email } : 'NO USER'
    });

    // Verify user is authenticated
    if (!req.user) {
      console.error('❌ No user in request - authentication failed');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Check if it's a valid MongoDB ObjectId format
    const mongoose = require('mongoose');
    const isValidId = mongoose.Types.ObjectId.isValid(assessmentId);
    console.log('🔍 Assessment ID validation:', { assessmentId, isValidId });

    // If not a valid ObjectId, it's definitely a teacher assignment
    if (!isValidId) {
      console.log('✅ Invalid ObjectId format - treating as teacher assignment');
      // Continue to teacher backend submission
    } else {
      // Try to find locally only if valid ID format
      let assessment = null;
      try {
        assessment = await Assessment.findById(assessmentId);
        console.log('🔍 Local assessment lookup result:', assessment ? 'Found' : 'Not found');
        
        // If found locally, handle locally
        if (assessment) {
          // Handle local assessment submission
          // Check if due date has passed
          if (new Date() > assessment.dueDate) {
            return res.status(400).json({
              success: false,
              message: 'Assessment due date has passed'
            });
          }

          // Find existing submission or create new one
          let submissionIndex = assessment.submissions.findIndex(
            submission => submission.student.toString() === req.user._id.toString()
          );

          if (submissionIndex === -1) {
            // Create new submission
            assessment.submissions.push({
              student: req.user._id,
              files: files || [],
              status: status || 'submitted',
              submittedAt: new Date()
            });
          } else {
            // Update existing submission
            assessment.submissions[submissionIndex].files = files || assessment.submissions[submissionIndex].files;
            assessment.submissions[submissionIndex].status = status || 'submitted';
            if (status === 'submitted') {
              assessment.submissions[submissionIndex].submittedAt = new Date();
            }
          }

          await assessment.save();

          return res.status(200).json({
            success: true,
            message: 'Assessment submitted successfully',
            data: assessment.submissions[submissionIndex === -1 ? assessment.submissions.length - 1 : submissionIndex]
          });
        }
      } catch (dbError) {
        console.log('⚠️ Database error during lookup:', dbError.message);
        // If it's a CastError, treat as teacher assignment
        if (dbError.name === 'CastError') {
          console.log('✅ CastError - treating as teacher assignment');
        }
      }
    }

    // If not found locally or invalid ID, check if it's a teacher assignment
    // Try submitting to teacher backend
    try {
      const teacherApiUrl = process.env.TEACHER_API_URL || 'http://localhost:5001';
      
      // Normalize attachments for teacher backend expected shape
      const normalizedAttachments = (files || []).map((f) => ({
        filename: f.name || f.fileName || 'attachment',
        originalName: f.name || f.fileName || 'attachment',
        path: f.url || f.fileUrl || '',
        mimetype: f.type || f.fileType || '',
        size: f.size || 0
      }));

      console.log('📤 Submitting assignment to teacher backend:', {
        assignmentId: assessmentId,
        studentEmail: req.user.email,
        attachmentsCount: normalizedAttachments.length,
        attachments: normalizedAttachments
      });

      const submitUrl = `${teacherApiUrl}/api/assignments/student/submit/${assessmentId}`;
      console.log('📡 Submit URL:', submitUrl);

      const submitPayload = {
        studentId: req.user._id.toString(),
        studentEmail: req.user.email,
        studentName: req.user.fullName || req.user.name,
        content: content || '',
        attachments: normalizedAttachments,
        status: status || 'submitted'
      };

      console.log('📦 Payload:', JSON.stringify(submitPayload, null, 2));

      const teacherResponse = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitPayload)
      });

      console.log('📡 Teacher backend response status:', teacherResponse.status, teacherResponse.statusText);

      const responseData = await teacherResponse.json().catch(() => ({}));
      console.log('📦 Teacher backend response data:', responseData);

      if (teacherResponse.ok) {
        return res.status(200).json({
          success: true,
          message: 'Assignment submitted successfully',
          data: responseData.data || responseData
        });
      } else {
        console.error('❌ Teacher backend error:', {
          status: teacherResponse.status,
          statusText: teacherResponse.statusText,
          error: responseData
        });
        return res.status(teacherResponse.status).json({
          success: false,
          message: responseData.message || responseData.error || 'Failed to submit assignment',
          error: responseData
        });
      }
    } catch (teacherError) {
      console.error('❌ Error submitting to teacher backend:', {
        message: teacherError.message,
        stack: teacherError.stack,
        code: teacherError.code
      });
      return res.status(500).json({
        success: false,
        message: `Failed to connect to teacher backend: ${teacherError.message}`,
        error: teacherError.message
      });
    }
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting assessment',
      error: error.message
    });
  }
};

// @desc    Upload file to assessment
// @route   POST /api/assessments/:id/upload
// @access  Private
exports.uploadFile = async (req, res, next) => {
  try {
    const { fileName, fileUrl, fileType } = req.body;
    const assessmentId = req.params.id;
    
    console.log('📤 Upload file request received:', {
      assessmentId: assessmentId,
      fileName: fileName,
      fileType: fileType,
      url: req.originalUrl
    });

    // Check if it's a valid MongoDB ObjectId format
    const mongoose = require('mongoose');
    const isValidId = mongoose.Types.ObjectId.isValid(assessmentId);
    console.log('🔍 Assessment ID validation:', { assessmentId, isValidId });

    // If not a valid ObjectId, it's definitely a teacher assignment
    if (!isValidId) {
      console.log('✅ Invalid ObjectId format - treating as teacher assignment');
      return res.status(200).json({
        success: true,
        message: 'File ready for submission',
        data: {
          id: Date.now(),
          name: fileName,
          url: fileUrl,
          type: fileType,
          uploadedAt: new Date().toISOString()
        }
      });
    }

    let assessment = null;
    try {
      assessment = await Assessment.findById(assessmentId);
      console.log('🔍 Local assessment lookup result:', assessment ? 'Found' : 'Not found');
    } catch (dbError) {
      console.log('⚠️ Database error during lookup:', dbError.message);
      // If it's a CastError, treat as teacher assignment
      if (dbError.name === 'CastError') {
        console.log('✅ CastError - treating as teacher assignment');
        return res.status(200).json({
          success: true,
          message: 'File ready for submission',
          data: {
            id: Date.now(),
            name: fileName,
            url: fileUrl,
            type: fileType,
            uploadedAt: new Date().toISOString()
          }
        });
      }
    }

    // If not found locally, it's a teacher assignment - store in local state only
    // (We'll send files with submission to teacher backend)
    if (!assessment) {
      console.log('✅ Assessment not found locally - treating as teacher assignment');
      // For teacher assignments, we just return success - files will be sent on submit
      return res.status(200).json({
        success: true,
        message: 'File ready for submission',
        data: {
          id: Date.now(),
          name: fileName,
          url: fileUrl,
          type: fileType,
          uploadedAt: new Date().toISOString()
        }
      });
    }

    // Find student's submission
    let submissionIndex = assessment.submissions.findIndex(
      submission => submission.student.toString() === req.user._id.toString()
    );

    if (submissionIndex === -1) {
      // Create new submission
      assessment.submissions.push({
        student: req.user._id,
        files: [],
        status: 'draft'
      });
      submissionIndex = assessment.submissions.length - 1;
    }

    // Add file to submission
    assessment.submissions[submissionIndex].files.push({
      name: fileName,
      url: fileUrl,
      type: fileType,
      uploadedAt: new Date()
    });

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: assessment.submissions[submissionIndex].files[assessment.submissions[submissionIndex].files.length - 1]
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading file',
      error: error.message
    });
  }
};

// @desc    Delete file from assessment
// @route   DELETE /api/assessments/:id/files/:fileId
// @access  Private
exports.deleteFile = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Find student's submission
    const submissionIndex = assessment.submissions.findIndex(
      submission => submission.student.toString() === req.user._id.toString()
    );

    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'No submission found'
      });
    }

    // Remove file from submission
    assessment.submissions[submissionIndex].files = assessment.submissions[submissionIndex].files.filter(
      file => file._id.toString() !== req.params.fileId
    );

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting file',
      error: error.message
    });
  }
};
