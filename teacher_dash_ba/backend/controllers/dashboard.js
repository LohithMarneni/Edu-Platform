const Task = require('../models/Task');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Doubt = require('../models/Doubt');
const Content = require('../models/Content');
const Student = require('../models/Student');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get teacher's classes
    const classes = await Class.find({ teacher: req.user.id, isActive: true });
    const classIds = classes.map(c => c._id);

    // Get counts
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
    const pendingTasks = await Task.countDocuments({ 
      teacher: req.user.id, 
      status: { $ne: 'completed' } 
    });
    const pendingDoubts = await Doubt.countDocuments({ 
      class: { $in: classIds }, 
      status: 'pending' 
    });

    // Get recent assignments
    const recentAssignments = await Assignment.find({ 
      teacher: req.user.id 
    })
    .populate('class', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get upcoming deadlines
    const upcomingDeadlines = await Assignment.find({
      teacher: req.user.id,
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: 'active'
    })
    .populate('class', 'name')
    .sort({ dueDate: 1 })
    .limit(5);

    const stats = {
      overview: {
        totalClasses,
        totalStudents,
        pendingTasks,
        pendingDoubts
      },
      recentAssignments,
      upcomingDeadlines,
      classes: classes.map(cls => ({
        id: cls._id,
        name: cls.name,
        subject: cls.subject,
        studentCount: cls.studentCount,
        stats: cls.stats
      }))
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

// @desc    Get tasks
// @route   GET /api/dashboard/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, date } = req.query;
    
    let query = { teacher: req.user.id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.dueDate = { $gte: startDate, $lt: endDate };
    }

    const tasks = await Task.find(query)
      .populate('relatedClass', 'name subject')
      .populate('relatedAssignment', 'title')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create task
// @route   POST /api/dashboard/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    req.body.teacher = req.user.id;

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during task creation',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/dashboard/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task
    if (task.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // If marking as completed, set completedAt
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during task update',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/dashboard/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task
    if (task.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during task deletion',
      error: error.message
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.user.id }).select('_id');
    const classIds = classes.map(c => c._id);

    // Get recent assignments submissions (mock data for now)
    const recentActivity = [
      {
        id: 1,
        student: 'Sarah Johnson',
        action: 'submitted Algebra Quiz',
        time: '2 hours ago',
        type: 'submission',
        class: 'Math 8A'
      },
      {
        id: 2,
        student: 'Mike Chen',
        action: 'asked about Quadratic Equations',
        time: '4 hours ago',
        type: 'doubt',
        class: 'Math 8B'
      },
      {
        id: 3,
        student: 'Emma Davis',
        action: 'completed Chapter 5 reading',
        time: '6 hours ago',
        type: 'progress',
        class: 'Math 9C'
      },
      {
        id: 4,
        student: 'John Smith',
        action: 'submitted Geometry assignment',
        time: '1 day ago',
        type: 'submission',
        class: 'Math 10A'
      }
    ];

    res.status(200).json({
      success: true,
      count: recentActivity.length,
      data: recentActivity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get schedule
// @route   GET /api/dashboard/schedule
// @access  Private
exports.getSchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Mock schedule data - in production, this would come from a schedule model
    const schedule = [
      {
        time: '08:00',
        subject: 'Math',
        grade: '9th A',
        room: '201',
        status: 'completed',
        class: 'Mathematics - Advanced'
      },
      {
        time: '09:30',
        subject: 'Math',
        grade: '8th B',
        room: '203',
        status: 'completed',
        class: 'Mathematics - Basic'
      },
      {
        time: '10:30',
        subject: 'Math',
        grade: '8th A',
        room: '204',
        status: 'current',
        class: 'Mathematics - Intermediate'
      },
      {
        time: '12:00',
        subject: 'Math',
        grade: '10th A',
        room: '205',
        status: 'upcoming',
        class: 'Mathematics - Advanced'
      },
      {
        time: '14:00',
        subject: 'Math',
        grade: '9th C',
        room: '202',
        status: 'upcoming',
        class: 'Mathematics - Basic'
      }
    ];

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get notifications
// @route   GET /api/dashboard/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    // Mock notifications - in production, this would come from a notifications model
    const notifications = [
      {
        id: 1,
        title: 'New doubt submitted',
        message: 'Sarah Johnson asked about Quadratic Equations',
        type: 'doubt',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 2,
        title: 'Assignment due soon',
        message: 'Geometry Problem Set due in 2 days',
        type: 'assignment',
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        id: 3,
        title: 'New student enrolled',
        message: 'Mike Chen joined Math 8B',
        type: 'enrollment',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};