const Doubt = require('../models/Doubt');
const User = require('../models/User');

// @desc    Get all doubts for a student
// @route   GET /api/doubts
// @access  Private
exports.getDoubts = async (req, res, next) => {
  try {
    const { status, subject, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by user's doubts or public doubts
    if (req.query.my === 'true') {
      query.askedBy = req.user._id;
    } else {
      query.isPublic = true;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (subject) {
      query.subject = subject;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const doubts = await Doubt.find(query)
      .populate('askedBy', 'fullName email avatar')
      .populate('answers.answeredBy', 'fullName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doubt.countDocuments(query);

    res.status(200).json({
      success: true,
      count: doubts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: doubts
    });
  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting doubts',
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
      .populate('askedBy', 'fullName email avatar')
      .populate('answers.answeredBy', 'fullName email avatar')
      .populate('relatedDoubts', 'title description status');

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Increment views
    await doubt.incrementViews();

    res.status(200).json({
      success: true,
      data: doubt
    });
  } catch (error) {
    console.error('Get doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting doubt',
      error: error.message
    });
  }
};

// @desc    Create new doubt
// @route   POST /api/doubts
// @access  Private
exports.createDoubt = async (req, res, next) => {
  try {
    const { title, description, subject, topic, difficulty, tags, attachments, assignedTo, assignmentType, courseId } = req.body;

    const doubt = await Doubt.create({
      title,
      description,
      subject,
      topic,
      course: courseId || undefined,
      difficulty,
      tags: tags || [],
      attachments: attachments || [],
      askedBy: req.user._id,
      assignedTo: assignedTo || undefined,
      assignmentType: assignmentType || 'ai',
      status: 'open'
    });

    const populatedDoubt = await Doubt.findById(doubt._id)
      .populate('askedBy', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Doubt created successfully',
      data: populatedDoubt
    });
  } catch (error) {
    console.error('Create doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating doubt',
      error: error.message
    });
  }
};

// @desc    Update doubt
// @route   PUT /api/doubts/:id
// @access  Private
exports.updateDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Check if user owns the doubt
    if (doubt.askedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doubt'
      });
    }

    const updatedDoubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('askedBy', 'fullName email avatar');

    res.status(200).json({
      success: true,
      message: 'Doubt updated successfully',
      data: updatedDoubt
    });
  } catch (error) {
    console.error('Update doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating doubt',
      error: error.message
    });
  }
};

// @desc    Delete doubt
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

    // Check if user owns the doubt
    if (doubt.askedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this doubt'
      });
    }

    await Doubt.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Doubt deleted successfully'
    });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting doubt',
      error: error.message
    });
  }
};

// @desc    Add answer to doubt
// @route   POST /api/doubts/:id/answers
// @access  Private
exports.addAnswer = async (req, res, next) => {
  try {
    const { content, answerType, attachments, hasVideo, videoUrl } = req.body;

    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    const answer = {
      content,
      answeredBy: req.user._id,
      answerType: answerType || 'student',
      attachments: attachments || [],
      hasVideo: hasVideo || false,
      videoUrl: videoUrl || null
    };

    doubt.answers.push(answer);
    doubt.status = 'answered';
    await doubt.save();

    const populatedDoubt = await Doubt.findById(doubt._id)
      .populate('askedBy', 'fullName email avatar')
      .populate('answers.answeredBy', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Answer added successfully',
      data: populatedDoubt
    });
  } catch (error) {
    console.error('Add answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding answer',
      error: error.message
    });
  }
};

// @desc    Vote on answer
// @route   POST /api/doubts/:id/answers/:answerId/vote
// @access  Private
exports.voteAnswer = async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const { id, answerId } = req.params;

    const doubt = await Doubt.findById(id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    const answer = doubt.answers.id(answerId);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Remove existing votes from this user
    answer.votes.upvotes = answer.votes.upvotes.filter(
      vote => vote.user.toString() !== req.user._id.toString()
    );
    answer.votes.downvotes = answer.votes.downvotes.filter(
      vote => vote.user.toString() !== req.user._id.toString()
    );

    // Add new vote
    if (voteType === 'upvote') {
      answer.votes.upvotes.push({ user: req.user._id });
    } else if (voteType === 'downvote') {
      answer.votes.downvotes.push({ user: req.user._id });
    }

    await doubt.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: answer
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error voting on answer',
      error: error.message
    });
  }
};

// @desc    Like doubt
// @route   POST /api/doubts/:id/like
// @access  Private
exports.likeDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    await doubt.addLike(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Doubt liked successfully',
      data: doubt
    });
  } catch (error) {
    console.error('Like doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error liking doubt',
      error: error.message
    });
  }
};

// @desc    Bookmark doubt
// @route   POST /api/doubts/:id/bookmark
// @access  Private
exports.bookmarkDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    await doubt.addBookmark(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Doubt bookmarked successfully',
      data: doubt
    });
  } catch (error) {
    console.error('Bookmark doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error bookmarking doubt',
      error: error.message
    });
  }
};

// @desc    Update doubt status
// @route   PUT /api/doubts/:id/status
// @access  Private
exports.updateDoubtStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    // Check if user owns the doubt
    if (doubt.askedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doubt'
      });
    }

    doubt.status = status;
    await doubt.save();

    res.status(200).json({
      success: true,
      message: 'Doubt status updated successfully',
      data: doubt
    });
  } catch (error) {
    console.error('Update doubt status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating doubt status',
      error: error.message
    });
  }
};
