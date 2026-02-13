const express = require('express');
const VideoNote = require('../models/VideoNote');
const { validateMongoId } = require('../middleware/validation');

const router = express.Router();

// @desc    Get video notes for a specific video
// @route   GET /api/videos/:videoId/notes
// @access  Private
router.get('/:videoId/notes', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const notes = await VideoNote.find({
      user: req.user._id,
      videoId: videoId
    }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: { notes }
    });
  } catch (error) {
    console.error('Get video notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching video notes'
    });
  }
});

// @desc    Save video note
// @route   POST /api/videos/:videoId/notes
// @access  Private
router.post('/:videoId/notes', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { topicId, timestamp, content, formattedTime, tags } = req.body;

    if (!topicId || !timestamp || !content || !formattedTime) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID, timestamp, content, and formatted time are required'
      });
    }

    const note = await VideoNote.create({
      user: req.user._id,
      videoId,
      topicId,
      timestamp,
      content,
      formattedTime,
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'Note saved successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Save video note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving note'
    });
  }
});

// @desc    Update video note
// @route   PUT /api/videos/notes/:noteId
// @access  Private
router.put('/notes/:noteId', validateMongoId('noteId'), async (req, res) => {
  try {
    const { content, tags, isBookmarked } = req.body;

    const note = await VideoNote.findOne({
      _id: req.params.noteId,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isBookmarked !== undefined) note.isBookmarked = isBookmarked;

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  } catch (error) {
    console.error('Update video note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating note'
    });
  }
});

// @desc    Delete video note
// @route   DELETE /api/videos/notes/:noteId
// @access  Private
router.delete('/notes/:noteId', validateMongoId('noteId'), async (req, res) => {
  try {
    const note = await VideoNote.findOneAndDelete({
      _id: req.params.noteId,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete video note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting note'
    });
  }
});

module.exports = router;