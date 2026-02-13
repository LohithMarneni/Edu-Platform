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

    // Make request to teacher backend to join class
    const response = await fetch(`${process.env.TEACHER_API_URL || 'http://localhost:5001'}/api/classes/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
      },
      body: JSON.stringify({ 
        classCode,
        email: req.user.email,
        name: req.user.name || req.user.fullName,
        studentId: req.user.studentId
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
    // This would typically make a request to the teacher backend
    // For now, we'll simulate the response
    const response = await fetch(`${process.env.TEACHER_API_URL || 'http://localhost:5001'}/api/classes/student/${req.user.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
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
