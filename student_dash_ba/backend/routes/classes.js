const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Join class by code
// @route   POST /api/classes/join
// @access  Private (requires authenticated student)
router.post('/join', protect, async (req, res) => {
  try {
    const { classCode } = req.body;

    if (!classCode) {
      return res.status(400).json({
        success: false,
        message: 'Class code is required'
      });
    }

    // Call teacher backend to join class (no auth header - teacher endpoint accepts body only)
    const response = await fetch(`${process.env.TEACHER_API_URL || 'http://localhost:5001'}/api/classes/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classCode: classCode.trim().toUpperCase(),
        email: req.user.email,
        name: req.user.name || req.user.fullName || req.user.email,
        studentId: req.user.studentId || req.user.id
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining class',
      error: error.message
    });
  }
});

// @desc    Get student's classes
// @route   GET /api/classes
// @access  Private (requires authenticated student)
router.get('/', protect, async (req, res) => {
  try {
    const teacherApiUrl = process.env.TEACHER_API_URL || 'http://localhost:5001';
    let enrolledClasses = [];
    
    // Try with student ID first
    try {
      const idResponse = await fetch(
        `${teacherApiUrl}/api/classes/student/${req.user.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (idResponse.ok) {
        const idData = await idResponse.json();
        enrolledClasses = idData.data || (idData.success ? (idData.data || []) : []);
        console.log('✅ Found enrolled classes by ID:', enrolledClasses.length);
      }
    } catch (idError) {
      console.warn('⚠️ Could not fetch classes by ID, trying with email');
    }

    // If no classes found, try with email
    if (enrolledClasses.length === 0 && req.user.email) {
      try {
        const emailResponse = await fetch(
          `${teacherApiUrl}/api/classes/student/${encodeURIComponent(req.user.email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          enrolledClasses = emailData.data || (emailData.success ? (emailData.data || []) : []);
          console.log('✅ Found enrolled classes by email:', enrolledClasses.length);
        }
      } catch (emailError) {
        console.warn('⚠️ Could not fetch classes by email either:', emailError.message);
      }
    }

    // Return success even if no classes found (empty array)
    res.status(200).json({
      success: true,
      data: enrolledClasses
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching classes',
      error: error.message
    });
  }
});

module.exports = router;
