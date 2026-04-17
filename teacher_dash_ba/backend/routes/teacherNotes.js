const express = require('express');
const {
  getTeacherNotes,
  createTeacherNote,
  updateTeacherNote,
  deleteTeacherNote
} = require('../controllers/teacherNotes');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getTeacherNotes)
  .post(protect, createTeacherNote);

router.route('/:id')
  .put(protect, updateTeacherNote)
  .delete(protect, deleteTeacherNote);

module.exports = router;
