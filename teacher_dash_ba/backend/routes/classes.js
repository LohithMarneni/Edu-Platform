const express = require('express');
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getClassStats,
  getClassStudents,
  addStudent,
  removeStudent,
  generateClassCode,
  getClassCode,
  joinClassByCode
} = require('../controllers/classes');
const { validateClass, validate } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .get(getClasses)
  .post(validateClass, validate, createClass);

router.route('/:id')
  .get(getClass)
  .put(updateClass)
  .delete(deleteClass);

router.get('/:id/stats', getClassStats);
router.get('/:id/students', getClassStudents);
router.post('/:id/students', addStudent);
router.delete('/:id/students/:studentId', removeStudent);

// Class code routes
router.post('/:id/generate-code', generateClassCode);
router.get('/:id/code', getClassCode);
router.post('/join', joinClassByCode);

// Get student's classes
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

    res.status(200).json({
      success: true,
      data: student.classes || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;