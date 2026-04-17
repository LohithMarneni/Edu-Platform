const mongoose = require('mongoose');

const teacherNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the note'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content for the note']
  },
  subject: {
    type: String,
    required: [true, 'Please specify the subject for the note'],
    trim: true
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String
  }],
  linkedClasses: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Class'
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Index for better query performance
teacherNoteSchema.index({ teacher: 1, subject: 1 });
teacherNoteSchema.index({ linkedClasses: 1 });

module.exports = mongoose.model('TeacherNote', teacherNoteSchema);
