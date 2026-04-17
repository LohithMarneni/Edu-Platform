const express = require('express');
const { getStudentNotes } = require('../controllers/teacherNotes');

const router = express.Router();

// Public route for students to fetch notes by classId
router.get('/:classId', getStudentNotes);

module.exports = router;
