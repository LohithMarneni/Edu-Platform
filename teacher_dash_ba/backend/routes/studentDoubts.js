const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const Class = require('../models/Class');
const Student = require('../models/Student');

// GET /api/student-doubts/:email  - get all doubts for this student
router.get('/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    const doubts = await Doubt.find({ 'student.email': email })
      .populate('class', 'name subject grade')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: doubts.length, data: doubts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/student-doubts/:email/:id  - get single doubt thread
router.get('/:email/:id', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    const doubt = await Doubt.findOne({ _id: req.params.id, 'student.email': email })
      .populate('class', 'name subject grade');

    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

    // increment views
    doubt.views = (doubt.views || 0) + 1;
    await doubt.save();

    res.json({ success: true, data: doubt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/student-doubts  - student creates a doubt
router.post('/', async (req, res) => {
  try {
    const { studentEmail, studentName, title, question, subject, category, priority, classId } = req.body;

    if (!studentEmail || !title || !question || !subject) {
      return res.status(400).json({ success: false, message: 'studentEmail, title, question and subject are required' });
    }

    // Resolve class: use provided classId or find first class where student is enrolled
    let resolvedClassId = classId;
    if (!resolvedClassId) {
      const studentRecord = await Student.findOne({ email: studentEmail.toLowerCase() });
      if (studentRecord && studentRecord.classes && studentRecord.classes.length > 0) {
        resolvedClassId = studentRecord.classes[0].class;
      }
    }

    if (!resolvedClassId) {
      // Fallback: use any active class
      const anyClass = await Class.findOne({ isActive: true });
      if (anyClass) resolvedClassId = anyClass._id;
    }

    if (!resolvedClassId) {
      return res.status(400).json({ success: false, message: 'No class found. Please join a class first.' });
    }

    const classItem = await Class.findById(resolvedClassId);
    if (!classItem) return res.status(404).json({ success: false, message: 'Class not found' });

    const doubt = await Doubt.create({
      title,
      question,
      subject,
      category: category || 'general',
      priority: priority || 'medium',
      student: {
        name: studentName || studentEmail.split('@')[0],
        email: studentEmail.toLowerCase()
      },
      class: resolvedClassId,
      teacher: classItem.teacher,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: doubt, message: 'Doubt submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/student-doubts/:email/:id/reply - student replies on thread
router.post('/:email/:id/reply', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    const doubt = await Doubt.findOne({ _id: req.params.id, 'student.email': email });

    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

    doubt.responses.push({
      author: doubt.student.name,
      authorType: 'student',
      message: req.body.message
    });
    await doubt.save();

    res.json({ success: true, data: doubt, message: 'Reply added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/student-doubts/:email/:id/resolve - student marks as resolved
router.put('/:email/:id/resolve', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    const doubt = await Doubt.findOne({ _id: req.params.id, 'student.email': email });

    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

    doubt.status = 'resolved';
    doubt.isResolved = true;
    doubt.resolvedAt = new Date();
    await doubt.save();

    res.json({ success: true, data: doubt, message: 'Doubt resolved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/student-doubts/:email/:id - student deletes their own doubt (any status)
router.delete('/:email/:id', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase().trim();
    const doubt = await Doubt.findOne({ _id: req.params.id, 'student.email': email });

    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

    await doubt.deleteOne();
    res.json({ success: true, message: 'Doubt deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
