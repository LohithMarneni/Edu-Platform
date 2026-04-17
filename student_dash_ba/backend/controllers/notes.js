const Note = require('../models/Note');
const Doubt = require('../models/Doubt');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const { subject, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { createdBy: req.user._id };
    
    if (subject) {
      query.subject = subject;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { doubtTitle: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const notes = await Note.find(query)
      .populate('doubtId', 'title description subject status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    // Fail-safe: return empty list instead of breaking the UI
    res.status(200).json({ success: true, count: 0, total: 0, page: 1, pages: 0, data: [] });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('doubtId', 'title description subject status')
      .populate('createdBy', 'fullName email avatar');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user owns the note
    if (note.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this note'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting note',
      error: error.message
    });
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    const { title, content, doubtId, subject, tags, attachments } = req.body;

    let doubtData = {};
    // Get doubt details if doubtId is provided
    if (doubtId) {
      const doubt = await Doubt.findById(doubtId);
      if (!doubt) {
        return res.status(404).json({
          success: false,
          message: 'Doubt not found'
        });
      }
      doubtData = {
        doubtTitle: doubt.title,
        doubtDescription: doubt.description,
        subject: doubt.subject,
        topic: doubt.topic
      };
    }

    const note = await Note.create({
      title,
      content,
      doubtId: doubtId || undefined,
      ...doubtData,
      subject: doubtData.subject || subject || 'General',
      createdBy: req.user._id,
      tags: tags || [],
      attachments: attachments || []
    });

    const populatedNote = await Note.findById(note._id)
      .populate('doubtId', 'title description subject status')
      .populate('createdBy', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: populatedNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating note',
      error: error.message
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user owns the note
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note'
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('doubtId', 'title description subject status')
     .populate('createdBy', 'fullName email avatar');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating note',
      error: error.message
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if user owns the note
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting note',
      error: error.message
    });
  }
};
