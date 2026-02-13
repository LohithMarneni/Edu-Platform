const Course = require('../models/Course');
const { CourseProgress } = require('../models/Progress');

// @desc    Get distinct subjects (categories) and sample courses
// @route   GET /api/courses/subjects
// @access  Private
exports.getSubjects = async (req, res, next) => {
  try {
    // Distinct categories from courses
    const categories = await Course.distinct('category', { isPublished: true });
    const courses = await Course.find({ isPublished: true })
      .select('_id name category');

    res.status(200).json({
      success: true,
      data: {
        subjects: categories,
        coursesBySubject: categories.reduce((acc, cat) => {
          acc[cat] = courses.filter(c => c.category === cat).map(c => ({ id: c._id, name: c.name }));
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting subjects',
      error: error.message
    });
  }
};
// @desc    Get all courses for a student
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
  try {
    // Get user's progress records (enrollments)
    const progressRecords = await CourseProgress.find({ user: req.user._id })
      .select('course overallProgress completedLessons lastAccessed');
    const progressByCourseId = new Map(progressRecords.map(pr => [pr.course.toString(), pr]));

    // Always return ALL courses, and mark which ones are enrolled
    const allCourses = await Course.find({})
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 });

    const coursesWithProgress = allCourses.map(course => {
      const pr = progressByCourseId.get(course._id.toString());
      const overallProgress = pr?.overallProgress || 0;
      const completedLessons = pr?.completedLessons || 0;
      const totalLessons = course.totalLessons || 0;
      return {
        ...course.toObject(),
        progress: {
          overallProgress,
          completedLessons,
          totalLessons,
          lastAccessed: pr?.lastAccessed || null,
          isCompleted: overallProgress === 100,
          isEnrolled: Boolean(pr)
        }
      };
    });

    res.status(200).json({ success: true, count: coursesWithProgress.length, data: coursesWithProgress });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting courses',
      error: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get user's progress for this course
    const progress = await CourseProgress.findOne({
      user: req.user._id,
      course: course._id
    });

    // Calculate progress based on modules and topics
    let overallProgress = 0;
    let completedLessons = 0;
    let totalLessons = course.totalLessons || 0;

    if (progress) {
      overallProgress = progress.overallProgress || 0;
      completedLessons = progress.completedLessons || 0;
    }

    const courseWithProgress = {
      ...course.toObject(),
      progress: {
        overallProgress,
        completedLessons,
        totalLessons,
        lastAccessed: progress?.lastAccessed || null,
        isCompleted: overallProgress === 100
      }
    };

    res.status(200).json({
      success: true,
      data: courseWithProgress
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting course',
      error: error.message
    });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingProgress = await CourseProgress.findOne({
      user: req.user._id,
      course: course._id
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create progress record
    const progress = await CourseProgress.create({
      user: req.user._id,
      course: course._id,
      enrolledAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: progress
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error enrolling in course',
      error: error.message
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
  try {
    const { lessonId, completed } = req.body;

    const progress = await CourseProgress.findOne({
      user: req.user._id,
      course: req.params.id
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Course progress not found'
      });
    }

    if (completed) {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    } else {
      progress.completedLessons = progress.completedLessons.filter(
        id => id.toString() !== lessonId
      );
    }

    progress.lastAccessed = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating progress',
      error: error.message
    });
  }
};
