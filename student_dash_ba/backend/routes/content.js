const express = require('express');
const { protect } = require('../middleware/auth');
const { getContent, getContentItem } = require('../controllers/content');

const router = express.Router();

// @desc    Get content for student's enrolled classes
// @route   GET /api/content
// @access  Private
router.get('/', protect, getContent);

// @desc    Get single content item
// @route   GET /api/content/:id
// @access  Private
router.get('/:id', protect, getContentItem);

module.exports = router;

