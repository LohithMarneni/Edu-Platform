const express = require('express');
const { joinClassByCode } = require('../controllers/classes');

const router = express.Router();

// Student join class by code - NO auth so student backend can call with body (classCode, email, name).
// The student backend already authenticates the student before forwarding the request.
router.post('/join', joinClassByCode);

// Get student's classes (used by student backend and content sync)
// This route is intentionally not protected by teacher authorization
// so that the student backend can call it with just the student identifier.
router.get('/student/:studentId', async (req, res) => {
  try {
    const Student = require('../models/Student');
    const studentIdParam = req.params.studentId;

    // Try multiple lookup methods: by _id, email, or studentId field
    let student = null;

    // First, try by _id (MongoDB ObjectId)
    if (studentIdParam.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(studentIdParam)
        .populate('classes.class', 'name subject grade classCode');
    }

    // If not found, try by email
    if (!student && studentIdParam.includes('@')) {
      student = await Student.findOne({ email: studentIdParam })
        .populate('classes.class', 'name subject grade classCode');
    }

    // If still not found, try by studentId field
    if (!student) {
      student = await Student.findOne({ studentId: studentIdParam })
        .populate('classes.class', 'name subject grade classCode');
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        searchedBy: studentIdParam
      });
    }

    return res.status(200).json({
      success: true,
      data: student.classes || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
