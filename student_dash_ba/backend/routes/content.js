const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getContent, getContentItem } = require('../controllers/content');

const router = express.Router();

// @desc    Get content for student's enrolled classes
// @route   GET /api/content
// @access  Private (student only)
router.get('/', protect, authorize('student'), getContent);

// @desc    Get single content item
// @route   GET /api/content/:id
// @access  Private (student only)
router.get('/:id', protect, authorize('student'), getContentItem);

module.exports = router;

