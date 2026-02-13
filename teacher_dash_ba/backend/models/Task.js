const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  dueTime: String,
  subject: {
    type: String,
    default: 'General'
  },
  category: {
    type: String,
    enum: ['grading', 'planning', 'admin', 'teaching', 'meeting', 'other'],
    default: 'other'
  },
  relatedClass: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class'
  },
  relatedAssignment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Assignment'
  },
  completedAt: Date,
  notes: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);