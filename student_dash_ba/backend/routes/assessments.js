const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
  getAssessments, 
  getAssessment, 
  submitAssessment, 
  uploadFile, 
  deleteFile 
} = require('../controllers/assessments');

const router = express.Router();

// Apply protect + role middleware to all routes
router.use(protect, authorize('student'));

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
router.get('/', getAssessments);

// IMPORTANT: More specific routes must come BEFORE less specific ones
// @desc    Submit assessment
// @route   POST /api/assessments/:id/submit
// @access  Private
router.post('/:id/submit', (req, res, next) => {
  console.log('✅ Route matched: POST /api/assessments/:id/submit');
  console.log('📋 Params:', req.params);
  console.log('📋 Body:', req.body);
  next();
}, submitAssessment);

// @desc    Upload file to assessment
// @route   POST /api/assessments/:id/upload
// @access  Private
router.post('/:id/upload', uploadFile);

// @desc    Delete file from assessment
// @route   DELETE /api/assessments/:id/files/:fileId
// @access  Private
router.delete('/:id/files/:fileId', deleteFile);

// @desc    Get single assessment (must come AFTER more specific routes)
// @route   GET /api/assessments/:id
// @access  Private
router.get('/:id', getAssessment);

module.exports = router;
