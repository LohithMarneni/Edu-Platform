const Doubt = require('../models/Doubt');
const Class = require('../models/Class');

// @desc    Get all doubts
// @route   GET /api/doubts
// @access  Private
exports.getDoubts = async (req, res, next) => {
  try {
    const { status, priority, class: classId, subject } = req.query;
    
    let query = {};
    
    // If classId is provided, filter by class
    if (classId) {
      query.class = classId;
    } else {
      // Get all classes for the teacher
      const teacherClasses = await Class.find({ teacher: req.user.id }).select('_id');
      query.class = { $in: teacherClasses.map(c => c._id) };
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (subject) query.subject = subject;

    const doubts = await Doubt.find(query)
      .populate('class', 'name subject grade')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doubts.length,
      data: doubts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single doubt
// @route   GET /api/doubts/:id
// @access  Private
exports.getDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('class', 'name subject grade');

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Increment views
    doubt.views += 1;
    await doubt.save();

    res.status(200).json({
      success: true,
      data: doubt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new doubt
// @route   POST /api/doubts
// @access  Private
exports.createDoubt = async (req, res, next) => {
  try {
    // Verify class exists
    const classItem = await Class.findById(req.body.class);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    req.body.teacher = classItem.teacher;

    const doubt = await Doubt.create(req.body);

    res.status(201).json({
      success: true,
      data: doubt,
      message: 'Doubt created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during doubt creation',
      error: error.message
    });
  }
};

// @desc    Update doubt
// @route   PUT /api/doubts/:id
// @access  Private
exports.updateDoubt = async (req, res, next) => {
  try {
    let doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    doubt = await Doubt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: doubt,
      message: 'Doubt updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during doubt update',
      error: error.message
    });
  }
};

// @desc    Delete doubt (teacher can only delete resolved doubts)
// @route   DELETE /api/doubts/:id
// @access  Private
exports.deleteDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Teachers can only delete doubts that the student has marked as resolved
    if (doubt.status !== 'resolved') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete doubts that have been marked as resolved by the student.'
      });
    }

    await doubt.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doubt deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during doubt deletion',
      error: error.message
    });
  }
};

// @desc    Respond to doubt
// @route   POST /api/doubts/:id/respond
// @access  Private
exports.respondToDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    const response = {
      author: req.user.fullName || req.user.name || 'Teacher',
      authorType: 'teacher',
      message: req.body.message,
      attachments: req.body.attachments || []
    };

    doubt.responses.push(response);
    doubt.status = 'answered';
    await doubt.save();

    res.status(200).json({
      success: true,
      data: doubt,
      message: 'Response added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Resolve doubt (Disabled for teachers - only students can resolve)
// @route   PUT /api/doubts/:id/resolve
// @access  Private
exports.resolveDoubt = async (req, res, next) => {
  return res.status(403).json({
    success: false,
    message: 'Only students can mark a doubt as resolved. Teachers can only provide answers.'
  });
};

// @desc    Get doubt statistics
// @route   GET /api/doubts/stats/overview
// @access  Private
exports.getDoubtStats = async (req, res, next) => {
  try {
    // Get all classes for the teacher
    const teacherClasses = await Class.find({ teacher: req.user.id }).select('_id');
    const classIds = teacherClasses.map(c => c._id);

    const totalDoubts = await Doubt.countDocuments({ class: { $in: classIds } });
    const solvedDoubts = await Doubt.countDocuments({ 
      class: { $in: classIds }, 
      status: { $in: ['answered', 'resolved'] } 
    });
    const pendingDoubts = await Doubt.countDocuments({ 
      class: { $in: classIds }, 
      status: 'pending' 
    });
    const highPriorityDoubts = await Doubt.countDocuments({ 
      class: { $in: classIds }, 
      priority: 'high' 
    });

    const stats = {
      total: totalDoubts,
      solved: solvedDoubts,
      pending: pendingDoubts,
      highPriority: highPriorityDoubts
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate AI suggestion for doubt
// @route   POST /api/doubts/:id/ai-suggestion
// @access  Private
exports.generateAISuggestion = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Mock AI suggestion - in production, integrate with actual AI service
    const aiSuggestion = {
      suggestion: `Based on the question about "${doubt.subject}", I suggest starting with the basic concepts and providing step-by-step examples. Consider using visual aids or diagrams to help explain the concept better.`,
      confidence: 0.85,
      generatedAt: new Date()
    };

    doubt.aiSuggestion = aiSuggestion;
    await doubt.save();

    res.status(200).json({
      success: true,
      data: aiSuggestion,
      message: 'AI suggestion generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};