const express = require('express');
const User = require('../models/User');
const { validateMongoId, validatePagination } = require('../middleware/validation');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('achievements');

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          level: user.level,
          profile: user.profile,
          preferences: user.preferences,
          stats: user.stats,
          achievements: user.achievements,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @desc    Get list of teachers (limited fields)
// @route   GET /api/users/teachers
// @access  Private (any authenticated user)
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isActive: true })
      .select('_id fullName email avatar profile.subject');

    res.status(200).json({
      success: true,
      data: {
        teachers: teachers.map(t => ({
          id: t._id,
          fullName: t.fullName,
          email: t.email,
          avatar: t.avatar,
          subject: t.profile?.subject
        }))
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teachers'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const { fullName, profile, preferences } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          profile: user.profile,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
router.get('/leaderboard', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('fullName avatar stats.totalPoints stats.currentStreak')
      .sort({ 'stats.totalPoints': -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isActive: true });

    // Get current user's rank
    const currentUserRank = await User.countDocuments({
      'stats.totalPoints': { $gt: req.user.stats.totalPoints },
      isActive: true
    }) + 1;

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      id: user._id,
      name: user.fullName,
      avatar: user.avatar,
      points: user.stats.totalPoints,
      streak: user.stats.currentStreak,
      isCurrentUser: user._id.toString() === req.user._id.toString()
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        currentUser: {
          rank: currentUserRank,
          points: req.user.stats.totalPoints
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    });
  }
});

// @desc    Get user achievements
// @route   GET /api/users/achievements
// @access  Private
router.get('/achievements', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Available achievements (could be moved to a separate model)
    const availableAchievements = [
      {
        id: 'first_quiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        points: 50,
        category: 'milestone'
      },
      {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Complete 10 quizzes',
        icon: '🏆',
        points: 200,
        category: 'milestone'
      },
      {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '⭐',
        points: 100,
        category: 'performance'
      },
      {
        id: 'streak_week',
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        points: 150,
        category: 'consistency'
      },
      {
        id: 'social_learner',
        name: 'Social Learner',
        description: 'Play 5 multiplayer quizzes',
        icon: '👥',
        points: 100,
        category: 'social'
      }
    ];

    // Check which achievements user has earned
    const earnedAchievements = user.achievements || [];
    const earnedIds = earnedAchievements.map(a => a.name);

    const achievements = availableAchievements.map(achievement => ({
      ...achievement,
      earned: earnedIds.includes(achievement.name),
      earnedAt: earnedAchievements.find(a => a.name === achievement.name)?.earnedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        achievements,
        stats: {
          totalEarned: earnedAchievements.length,
          totalAvailable: availableAchievements.length,
          totalPoints: earnedAchievements.reduce((sum, a) => sum + (a.points || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching achievements'
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin)
router.get('/:id', authorize('admin'), validateMongoId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('achievements');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          level: user.level,
          profile: user.profile,
          stats: user.stats,
          achievements: user.achievements,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
router.get('/', authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, role, isActive } = req.query;

    // Build filter
    let filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          level: user.level,
          stats: user.stats,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
router.put('/:id/role', authorize('admin'), validateMongoId('id'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, teacher, or admin'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user role'
    });
  }
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
router.put('/:id/status', authorize('admin'), validateMongoId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', async (req, res) => {
  try {
    // This is a placeholder for file upload functionality
    // In a real implementation, you would use multer and cloudinary/AWS S3
    
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const user = await User.findById(req.user._id);
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading avatar'
    });
  }
});

module.exports = router;