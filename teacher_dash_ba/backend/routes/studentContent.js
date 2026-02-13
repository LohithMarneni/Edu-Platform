const express = require('express');
const { getPublishedContentForStudent } = require('../controllers/content');

const router = express.Router();

// @desc    Get published content for students (by class)
// @route   GET /api/content/student
// @access  Public (students)
router.get('/', getPublishedContentForStudent);

module.exports = router;

