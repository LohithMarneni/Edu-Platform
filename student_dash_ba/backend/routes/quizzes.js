const express = require('express');
const { protect } = require('../middleware/auth');
const { getQuizzes, getQuiz, submitQuizAttempt, getQuizResults } = require('../controllers/quizzes');

const router = express.Router();

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
router.get('/', protect, getQuizzes);

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
router.get('/:id', protect, getQuiz);

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private
router.post('/:id/attempt', protect, submitQuizAttempt);

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
router.get('/:id/results', protect, getQuizResults);

module.exports = router;