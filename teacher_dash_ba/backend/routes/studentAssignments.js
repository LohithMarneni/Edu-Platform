const express = require('express');
const {
  getStudentAssignments,
  getStudentAssignment,
  submitAssignment
} = require('../controllers/assignments');

const router = express.Router();

// IMPORTANT: More specific routes must come first
// Submit route must come before email routes to avoid conflicts
router.post('/submit/:assignmentId', submitAssignment);

// Student-facing routes (no auth required, verified by email)
router.get('/:studentEmail', getStudentAssignments);
router.get('/:studentEmail/:assignmentId', getStudentAssignment);

module.exports = router;

