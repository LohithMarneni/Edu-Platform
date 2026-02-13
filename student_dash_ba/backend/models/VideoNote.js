const mongoose = require('mongoose');

const videoNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Number,
    required: true // in seconds
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  formattedTime: {
    type: String,
    required: true // e.g., "5:30"
  },
  tags: [String],
  isBookmarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
videoNoteSchema.index({ user: 1, videoId: 1 });
videoNoteSchema.index({ user: 1, topicId: 1 });
videoNoteSchema.index({ timestamp: 1 });

module.exports = mongoose.model('VideoNote', videoNoteSchema);