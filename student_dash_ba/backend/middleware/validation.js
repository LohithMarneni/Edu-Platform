const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Auth validation rules
const validateRegister = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Quiz validation rules
const validateQuiz = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Quiz title must be between 3 and 200 characters'),
  
  body('subject')
    .isIn(['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science'])
    .withMessage('Invalid subject'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Quiz must have at least one question'),
  
  body('questions.*.question')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Each question must be at least 10 characters long'),
  
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Each question must have between 2 and 6 options'),
  
  body('questions.*.correctAnswer')
    .notEmpty()
    .withMessage('Each question must have a correct answer'),
  
  body('questions.*.explanation')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Each question must have an explanation of at least 10 characters'),
  
  handleValidationErrors
];

const validateQuizAttempt = [
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Quiz attempt must include answers'),
  
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Invalid question ID'),
  
  body('answers.*.selectedAnswer')
    .notEmpty()
    .withMessage('Selected answer is required for each question'),
  
  body('timeSpent')
    .isInt({ min: 1 })
    .withMessage('Time spent must be a positive integer'),
  
  handleValidationErrors
];

// Doubt validation rules
const validateDoubt = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Doubt title must be between 10 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Doubt description must be between 20 and 2000 characters'),
  
  body('subject')
    .isIn(['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science'])
    .withMessage('Invalid subject'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  handleValidationErrors
];

const validateDoubtAnswer = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Answer content must be between 10 and 2000 characters'),
  
  body('answerType')
    .isIn(['ai', 'teacher', 'student'])
    .withMessage('Answer type must be ai, teacher, or student'),
  
  handleValidationErrors
];

// Course validation rules
const validateCourse = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage('Course description must be between 20 and 500 characters'),
  
  body('category')
    .isIn(['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science'])
    .withMessage('Invalid category'),
  
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),
  
  handleValidationErrors
];

// Collection validation rules
const validateCollectionItem = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Item title must be between 3 and 200 characters'),
  
  body('type')
    .isIn(['ai-notes', 'user-notes', 'ai-videos', 'important-doubts', 'document', 'image'])
    .withMessage('Invalid item type'),
  
  body('metadata.subject')
    .optional()
    .isIn(['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history', 'computer-science'])
    .withMessage('Invalid subject'),
  
  handleValidationErrors
];

// Progress validation rules
const validateProgressUpdate = [
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer'),
  
  handleValidationErrors
];

// Common parameter validations
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateQuiz,
  validateQuizAttempt,
  validateDoubt,
  validateDoubtAnswer,
  validateCourse,
  validateCollectionItem,
  validateProgressUpdate,
  validateMongoId,
  validatePagination
};