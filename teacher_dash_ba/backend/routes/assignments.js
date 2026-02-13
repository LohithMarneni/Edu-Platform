const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  gradeSubmission,
  getSubmissions,
  getAssignmentStats
} = require('../controllers/assignments');
const { validateAssignment, validate } = require('../middleware/validation');

const router = express.Router();

// Teacher routes (protected)
router.route('/')
  .get(getAssignments)
  .post(validateAssignment, validate, createAssignment);

router.route('/:id')
  .get(getAssignment)
  .put(updateAssignment)
  .delete(deleteAssignment);

router.put('/:id/publish', publishAssignment);
router.put('/:id/submissions/:submissionId/grade', gradeSubmission);
router.get('/:id/submissions', getSubmissions);
router.get('/:id/stats', getAssignmentStats);

module.exports = router;