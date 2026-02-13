const express = require('express');
const { CourseProgress, DailyActivity, WeeklyGoal } = require('../models/Progress');
const User = require('../models/User');
const { validateProgressUpdate, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get user's course progress
// @route   GET /api/progress/courses
// @access  Private
router.get('/courses', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courseProgress = await CourseProgress.find({ user: req.user._id })
      .populate('course', 'name icon color category')
      .sort({ lastAccessed: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CourseProgress.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        progress: courseProgress,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching course progress'
    });
  }
});

// @desc    Update course progress
// @route   PUT /api/progress/courses/:id
// @access  Private
router.put('/courses/:id', validateProgressUpdate, async (req, res) => {
  try {
    const { progress, timeSpent, topicId, notes } = req.body;

    let courseProgress = await CourseProgress.findOne({
      user: req.user._id,
      course: req.params.id
    });

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        user: req.user._id,
        course: req.params.id,
        modules: [],
        overallProgress: 0
      });
    }

    // Update specific topic progress if provided
    if (topicId) {
      // Find or create module and topic progress
      // This is a simplified version - you'd need to implement the full logic
      courseProgress.lastAccessed = new Date();
      courseProgress.timeSpent += timeSpent || 0;
    }

    courseProgress.calculateProgress();
    await courseProgress.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress: courseProgress }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating progress'
    });
  }
});

// @desc    Get weekly goals
// @route   GET /api/progress/goals
// @access  Private
router.get('/goals', async (req, res) => {
  try {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let weeklyGoals = await WeeklyGoal.findOne({
      user: req.user._id,
      'week.start': { $lte: weekStart },
      'week.end': { $gte: weekEnd }
    });

    if (!weeklyGoals) {
      // Create default goals for the week
      weeklyGoals = await WeeklyGoal.create({
        user: req.user._id,
        week: { start: weekStart, end: weekEnd },
        goals: [
          {
            id: 1,
            title: 'Complete 3 lessons',
            description: 'Finish 3 video lessons this week',
            targetValue: 3,
            currentValue: 0,
            unit: 'lessons',
            category: 'learning',
            points: 100
          },
          {
            id: 2,
            title: 'Score 80% in quizzes',
            description: 'Maintain high performance in assessments',
            targetValue: 80,
            currentValue: 0,
            unit: 'percentage',
            category: 'practice',
            points: 150
          },
          {
            id: 3,
            title: 'Study 5 hours',
            description: 'Dedicate focused study time',
            targetValue: 5,
            currentValue: 0,
            unit: 'hours',
            category: 'learning',
            points: 200
          }
        ]
      });
    }

    res.status(200).json({
      success: true,
      data: { goals: weeklyGoals }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching goals'
    });
  }
});

// @desc    Create/Update weekly goal
// @route   POST /api/progress/goals
// @access  Private
router.post('/goals', async (req, res) => {
  try {
    const { title, description, targetValue, unit, category } = req.body;

    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let weeklyGoals = await WeeklyGoal.findOne({
      user: req.user._id,
      'week.start': { $lte: weekStart },
      'week.end': { $gte: weekEnd }
    });

    if (!weeklyGoals) {
      weeklyGoals = await WeeklyGoal.create({
        user: req.user._id,
        week: { start: weekStart, end: weekEnd },
        goals: []
      });
    }

    const newGoal = {
      id: weeklyGoals.goals.length + 1,
      title,
      description,
      targetValue,
      currentValue: 0,
      unit,
      category,
      points: targetValue * 10 // Simple point calculation
    };

    weeklyGoals.goals.push(newGoal);
    await weeklyGoals.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal: newGoal }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating goal'
    });
  }
});

// @desc    Get activity data
// @route   GET /api/progress/activity
// @access  Private
router.get('/activity', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const activities = await DailyActivity.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Fill in missing days with zero activity
    const activityMap = {};
    activities.forEach(activity => {
      const dateKey = activity.date.toISOString().split('T')[0];
      activityMap[dateKey] = activity;
    });

    const completeActivity = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      completeActivity.push(activityMap[dateKey] || {
        date: date,
        activities: {
          videosWatched: 0,
          quizzesTaken: 0,
          doubtsAsked: 0,
          doubtsAnswered: 0,
          timeSpent: 0,
          pointsEarned: 0,
          topicsCompleted: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { activities: completeActivity }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching activity'
    });
  }
});

module.exports = router;