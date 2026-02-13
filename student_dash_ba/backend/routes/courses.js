const express = require('express');
const { protect } = require('../middleware/auth');
const { getCourses, getCourse, enrollInCourse, updateProgress, getSubjects } = require('../controllers/courses');

const router = express.Router();

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
router.get('/', protect, getCourses);

// @desc    Get subjects and course mapping
// @route   GET /api/courses/subjects
// @access  Private
router.get('/subjects', protect, getSubjects);

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
router.get('/:id', protect, getCourse);

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
router.post('/:id/enroll', protect, enrollInCourse);

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
router.put('/:id/progress', protect, updateProgress);

module.exports = router;