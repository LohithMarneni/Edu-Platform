const TeacherNote = require('../models/TeacherNote');
const Class = require('../models/Class');
const mongoose = require('mongoose');

// @desc    Get all teacher notes
// @route   GET /api/teacher-notes
// @access  Private
exports.getTeacherNotes = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const query = { teacher: req.user.id };
    
    if (subject) {
      query.subject = subject;
    }

    const notes = await TeacherNote.find(query)
      .populate('linkedClasses', 'name subject grade')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new teacher note
// @route   POST /api/teacher-notes
// @access  Private
exports.createTeacherNote = async (req, res, next) => {
  try {
    req.body.teacher = req.user.id;
    
    const note = await TeacherNote.create(req.body);

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update a teacher note
// @route   PUT /api/teacher-notes/:id
// @access  Private
exports.updateTeacherNote = async (req, res, next) => {
  try {
    let note = await TeacherNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Make sure user owns the note
    if (note.teacher.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this note' });
    }

    note = await TeacherNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('linkedClasses', 'name subject grade');

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete a teacher note
// @route   DELETE /api/teacher-notes/:id
// @access  Private
exports.deleteTeacherNote = async (req, res, next) => {
  try {
    const note = await TeacherNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Make sure user owns the note
    if (note.teacher.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get notes by classId (For Student Public Access)
// @route   GET /api/student-notes/:classId
// @access  Public
exports.getStudentNotes = async (req, res, next) => {
  try {
    const { classId } = req.params;
    
    // Notes where linkedClasses includes this classId
    const notes = await TeacherNote.find({ 
      linkedClasses: classId,
      status: 'published'
    }).populate('teacher', 'name email').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
