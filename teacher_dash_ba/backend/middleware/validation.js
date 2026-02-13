const { body, validationResult } = require('express-validator');

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Class validation rules
exports.validateClass = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Class name must be between 2 and 100 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('grade')
    .trim()
    .notEmpty()
    .withMessage('Grade is required'),
  body('studentCount')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Student count must be between 0 and 100')
];

// Assignment validation rules
exports.validateAssignment = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Assignment title must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('totalMarks')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total marks must be between 1 and 1000'),
  body('type')
    .isIn(['Assignment', 'Quiz', 'Homework', 'Project', 'Exam'])
    .withMessage('Invalid assignment type')
];

// Doubt validation rules
exports.validateDoubt = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Doubt title must be between 5 and 200 characters'),
  body('question')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Question must be between 10 and 2000 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('student.name')
    .trim()
    .notEmpty()
    .withMessage('Student name is required')
];

// Content validation rules
exports.validateContent = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Content title must be between 2 and 200 characters'),
  body('type')
    .isIn(['video', 'pdf', 'quiz', 'link', 'image', 'audio', 'presentation', 'assignment', 'chapter', 'subtopic', 'document'])
    .withMessage('Invalid content type'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
];

// Task validation rules
exports.validateTask = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Task title must be between 2 and 200 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level')
];