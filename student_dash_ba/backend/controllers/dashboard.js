const Course = require('../models/Course');
const { CourseProgress } = require('../models/Progress');
const { Quiz } = require('../models/Quiz');
const Doubt = require('../models/Doubt');

// @desc    Get dashboard data for student
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get enrolled courses with progress
    const progressRecords = await CourseProgress.find({ user: userId })
      .populate('course', 'name description thumbnail instructor')
      .populate('course.instructor', 'name');

    // Get recent activities
    const recentActivities = await CourseProgress.find({ user: userId })
      .populate('course', 'name')
      .sort({ lastAccessed: -1 })
      .limit(5);

    // Get quiz attempts
    const quizAttempts = await Quiz.find({ 'attempts.user': userId })
      .populate('course', 'name category')
      .populate('createdBy', 'name email')
      .limit(5);

    // Get pending doubts
    const pendingDoubts = await Doubt.find({ 
      user: userId, 
      status: { $in: ['pending', 'in_progress'] } 
    })
    .populate('course', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate statistics
    const totalCourses = progressRecords.length;
    const completedCourses = progressRecords.filter(p => p.overallProgress === 100).length;
    const totalLessons = progressRecords.reduce((sum, p) => sum + (p.totalLessons || 0), 0);
    const completedLessons = progressRecords.reduce((sum, p) => sum + (p.completedLessons || 0), 0);
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Get streak data
    const streakData = await getStreakData(userId);

    // Get weekly progress
    const weeklyProgress = await getWeeklyProgress(userId);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCourses,
          completedCourses,
          totalLessons,
          completedLessons,
          overallProgress: Math.round(overallProgress),
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak
        },
        recentActivities: recentActivities.map(activity => ({
          id: activity._id,
          courseTitle: activity.course?.title || 'Unknown Course',
          lastAccessed: activity.lastAccessed,
          progress: activity.overallProgress || 0
        })),
        quizAttempts: quizAttempts.map(quiz => {
          const userAttempt = quiz.attempts && Array.isArray(quiz.attempts) 
            ? quiz.attempts.find(a => a && a.user && a.user.toString() === userId.toString())
            : null;
          
          return {
            id: quiz._id,
            title: quiz.title,
            courseTitle: quiz.course?.name || quiz.subject,
            score: userAttempt?.score || 0,
            completedAt: userAttempt?.completedAt
          };
        }),
        pendingDoubts: pendingDoubts.map(doubt => ({
          id: doubt._id,
          title: doubt.title,
          courseTitle: doubt.course.title,
          status: doubt.status,
          createdAt: doubt.createdAt
        })),
        weeklyProgress,
        courses: progressRecords.map(record => ({
          id: record.course?._id,
          title: record.course?.title || 'Unknown Course',
          description: record.course?.description || '',
          thumbnail: record.course?.thumbnail || '',
          instructor: record.course?.instructor || null,
          progress: record.overallProgress || 0,
          completedLessons: record.completedLessons || 0,
          totalLessons: record.totalLessons || 0,
          enrolledAt: record.startedAt || record.createdAt,
          lastAccessed: record.lastAccessed
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting dashboard data',
      error: error.message
    });
  }
};

// Helper function to get streak data
async function getStreakData(userId) {
  try {
    const progressRecords = await CourseProgress.find({ user: userId })
      .sort({ lastAccessed: -1 });

    if (progressRecords.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < progressRecords.length; i++) {
      const record = progressRecords[i];
      const lastAccessed = new Date(record.lastAccessed);
      lastAccessed.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today - lastAccessed) / (1000 * 60 * 60 * 24));

      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      } else if (daysDiff <= 1) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  } catch (error) {
    console.error('Streak calculation error:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
}

// Helper function to get weekly progress
async function getWeeklyProgress(userId) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const progressRecords = await CourseProgress.find({
      user: userId,
      lastAccessed: { $gte: oneWeekAgo }
    });

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayProgress = progressRecords.filter(record => {
        const recordDate = new Date(record.lastAccessed);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === date.getTime();
      });

      weeklyData.push({
        date: date.toISOString().split('T')[0],
        lessonsCompleted: dayProgress.reduce((sum, record) => sum + (record.completedLessons || 0), 0),
        coursesAccessed: dayProgress.length
      });
    }

    return weeklyData;
  } catch (error) {
    console.error('Weekly progress calculation error:', error);
    return [];
  }
}
