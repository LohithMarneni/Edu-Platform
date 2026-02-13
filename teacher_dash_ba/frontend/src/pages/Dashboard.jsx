import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Brain,
  Plus,
  Calendar,
  PlayCircle,
  Bell,
  Target,
  Zap,
  ChevronRight,
  Upload,
  PenTool,
  Star,
  Activity,
  Award,
  MessageSquare,
  Eye,
  BarChart3,
  Sparkles,
  Timer,
  BookmarkCheck,
  X,
  Save,
  Send
} from 'lucide-react';
import apiService from '../services/api';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showClassDetailsModal, setShowClassDetailsModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    priority: 'medium',
    dueTime: '',
    subject: 'General'
  });
  
  // State for API data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data with error handling for each call
      try {
        const statsResponse = await apiService.getDashboardStats();
        setDashboardStats(statsResponse.data);
      } catch (err) {
        console.warn('Failed to load dashboard stats:', err);
        setDashboardStats({ overview: { totalClasses: 0, totalStudents: 0, pendingTasks: 0, pendingDoubts: 0 } });
      }

      try {
        const tasksResponse = await apiService.getTasks();
        setTasks(tasksResponse.data || []);
      } catch (err) {
        console.warn('Failed to load tasks:', err);
        setTasks([]);
      }

      try {
        const activityResponse = await apiService.getRecentActivity();
        setRecentActivity(activityResponse.data || []);
      } catch (err) {
        console.warn('Failed to load recent activity:', err);
        setRecentActivity([]);
      }

      try {
        const notificationsResponse = await apiService.getNotifications();
        setNotifications(notificationsResponse.data || []);
      } catch (err) {
        console.warn('Failed to load notifications:', err);
        setNotifications([]);
      }

      try {
        const scheduleResponse = await apiService.getSchedule();
        setSchedule(scheduleResponse.data || []);
      } catch (err) {
        console.warn('Failed to load schedule:', err);
        setSchedule([]);
      }
    } catch (err) {
      // Only set error state if all API calls fail
      if (!dashboardStats && !tasks && !recentActivity && !notifications && !schedule) {
        setError(err.message || 'Failed to load dashboard data');
      }
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [todayTasks, setTodayTasks] = useState([
    { id: 1, task: 'Grade Algebra Quiz - 8th A', priority: 'high', completed: false, dueTime: '2:00 PM', subject: 'Math' },
    { id: 2, task: 'Prepare Geometry Notes', priority: 'medium', completed: false, dueTime: '4:00 PM', subject: 'Math' },
    { id: 3, task: 'Review Assignment Submissions', priority: 'high', completed: false, dueTime: 'Tomorrow', subject: 'General' },
    { id: 4, task: 'Update Parent Progress Reports', priority: 'low', completed: true, dueTime: 'Done', subject: 'Admin' },
    { id: 5, task: 'Plan Next Week\'s Lessons', priority: 'medium', completed: false, dueTime: 'Friday', subject: 'Planning' },
  ]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const quickStats = [
    { 
      label: 'Classes', 
      value: dashboardStats?.overview?.totalClasses || '0', 
      icon: BookOpen, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Students', 
      value: dashboardStats?.overview?.totalStudents || '0', 
      icon: Users, 
      color: 'text-emerald-600' 
    },
    { 
      label: 'Pending Tasks', 
      value: dashboardStats?.overview?.pendingTasks || '0', 
      icon: Clock, 
      color: 'text-amber-600' 
    },
    { 
      label: 'Doubts', 
      value: dashboardStats?.overview?.pendingDoubts || '0', 
      icon: HelpCircle, 
      color: 'text-violet-600' 
    },
  ];

  const quickActions = [
    { 
      name: 'Create Assignment', 
      icon: PenTool, 
      href: '/assignments',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    { 
      name: 'Upload Content', 
      icon: Upload, 
      href: '/content',
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700'
    },
    { 
      name: 'Resolve Doubts', 
      icon: MessageSquare, 
      href: '/doubts',
      color: 'bg-gradient-to-r from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700'
    },
    { 
      name: 'View Classes', 
      icon: Users, 
      href: '/classes',
      color: 'bg-gradient-to-r from-violet-500 to-violet-600',
      hoverColor: 'hover:from-violet-600 hover:to-violet-700'
    },
  ];

  const nextClass = {
    subject: 'Mathematics',
    grade: '8th Grade A',
    time: '10:30 AM',
    room: 'Room 204',
    studentsCount: 30,
    topic: 'Quadratic Equations',
    timeUntil: '45 minutes',
    color: 'from-indigo-500 to-purple-600'
  };

  const todaySchedule = [
    { time: '08:00', subject: 'Math', grade: '9th A', room: '201', status: 'completed', color: 'bg-emerald-100 text-emerald-700' },
    { time: '09:30', subject: 'Math', grade: '8th B', room: '203', status: 'completed', color: 'bg-emerald-100 text-emerald-700' },
    { time: '10:30', subject: 'Math', grade: '8th A', room: '204', status: 'current', color: 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' },
    { time: '12:00', subject: 'Math', grade: '10th A', room: '205', status: 'upcoming', color: 'bg-gray-100 text-gray-700' },
    { time: '14:00', subject: 'Math', grade: '9th C', room: '202', status: 'upcoming', color: 'bg-gray-100 text-gray-700' },
  ];

  const handleAddTask = (e) => {
    e.preventDefault();
    const newTaskData = {
      id: todayTasks.length + 1,
      task: newTask.task,
      priority: newTask.priority,
      completed: false,
      dueTime: newTask.dueTime,
      subject: newTask.subject
    };
    
    setTodayTasks([...todayTasks, newTaskData]);
    setShowAddTaskModal(false);
    setNewTask({
      task: '',
      priority: 'medium',
      dueTime: '',
      subject: 'General'
    });
  };

  const handleToggleTask = (taskId) => {
    setTodayTasks(todayTasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const handleViewClassDetails = () => {
    setShowClassDetailsModal(true);
  };

  const aiSuggestions = [
    {
      id: 1,
      title: 'Generate Quiz from Notes',
      description: 'Create quiz from Trigonometry notes',
      action: 'Generate',
      icon: Brain,
      color: 'from-violet-500 to-purple-600'
    },
    {
      id: 2,
      title: 'Analyze Performance',
      description: 'Get insights on 8th Grade A',
      action: 'Analyze',
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 3,
      title: 'Create Study Guide',
      description: 'Auto-generate exam materials',
      action: 'Create',
      icon: BookmarkCheck,
      color: 'from-blue-500 to-indigo-600'
    },
  ];

  const mockRecentActivity = [
    {
      id: 1,
      student: 'Sarah Johnson',
      action: 'submitted Algebra Quiz',
      time: '2 hours ago',
      type: 'submission',
      icon: CheckCircle,
      color: 'text-emerald-600'
    },
    {
      id: 2,
      student: 'Mike Chen',
      action: 'asked about Quadratic Equations',
      time: '4 hours ago',
      type: 'doubt',
      icon: HelpCircle,
      color: 'text-amber-600'
    },
    {
      id: 3,
      student: 'Emma Davis',
      action: 'completed Chapter 5 reading',
      time: '6 hours ago',
      type: 'progress',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      id: 4,
      student: 'John Smith',
      action: 'submitted Geometry assignment',
      time: '1 day ago',
      type: 'submission',
      icon: FileText,
      color: 'text-violet-600'
    },
  ];

  // Use API data if available, otherwise use mock data
  const displayRecentActivity = recentActivity.length > 0 ? recentActivity : mockRecentActivity;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, John! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
              <Clock className="w-6 h-6 text-blue-600" />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap gap-4 mt-6">
            {quickStats.map((stat) => {
              const Icon = stat.icon || BookOpen; // Default to BookOpen icon if undefined
              return (
                <div key={stat.label} className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                  <Icon className={`w-5 h-5 ${stat.color || 'text-gray-600'}`} />
                  <span className="font-semibold text-gray-900">{stat.value}</span>
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon || BookOpen; // Default to BookOpen icon if undefined
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className={`group ${action.color} ${action.hoverColor} text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-6 h-6" />
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="font-semibold">{action.name}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Class Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Next Class */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`bg-gradient-to-r ${nextClass.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Next Class</h3>
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{nextClass.subject}</div>
                  <div className="text-indigo-100">{nextClass.grade} • {nextClass.room}</div>
                  <div className="flex items-center space-x-2 text-indigo-200">
                    <Timer className="w-4 h-4" />
                    <span>{nextClass.time} • in {nextClass.timeUntil}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Topic: {nextClass.topic}</span>
                  <span>{nextClass.studentsCount} students</span>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div key={index} className={`p-3 rounded-xl transition-all duration-200 ${item.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-bold">{item.time}</div>
                        <div className="text-sm">
                          <div className="font-medium">{item.subject}</div>
                          <div className="text-xs opacity-75">{item.grade} • {item.room}</div>
                        </div>
                      </div>
                      {item.status === 'current' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 mt-4">
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="flex-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium py-2 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  View Full Schedule
                </button>
                <button 
                  onClick={() => setShowClassDetailsModal(true)}
                  className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  View Class Details
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Tasks & AI */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks & AI Suggestions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Tasks */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Today's Tasks</h3>
                  <Target className="w-5 h-5 text-gray-500" />
                </div>
                <div className="space-y-3">
                  {todayTasks.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleTask(item.id)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.task}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{item.dueTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={() => setShowTaskModal(true)}
                    className="flex-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium py-2 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    View All Tasks
                  </button>
                  <button 
                    onClick={() => setShowAddTaskModal(true)}
                    className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    <h3 className="text-lg font-bold text-gray-900">AI Suggestions</h3>
                  </div>
                  <div className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-xs font-medium">
                    Smart
                  </div>
                </div>
                <div className="space-y-4">
                  {aiSuggestions.map((suggestion) => {
                    const Icon = suggestion.icon || Brain; // Default to Brain icon if undefined
                    return (
                      <div key={suggestion.id} className="p-4 rounded-xl border-2 border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${suggestion.color || 'from-violet-500 to-purple-600'}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <button className="bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                            {suggestion.action}
                          </button>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <Activity className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                {displayRecentActivity.map((activity) => {
                  const Icon = activity.icon || Activity; // Default to Activity icon if undefined
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className={`w-4 h-4 ${activity.color || 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium text-gray-900">{activity.student}</span>
                          <span className="text-gray-600"> {activity.action}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowActivityModal(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center mx-auto space-x-1 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
                >
                  <span>View All Activity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View All Tasks Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">All Tasks</h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.task}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{task.dueTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowAddTaskModal(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Task</h3>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
                <input
                  type="text"
                  value={newTask.task}
                  onChange={(e) => setNewTask({...newTask, task: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Grade Math Quiz"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
                <input
                  type="text"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask({...newTask, dueTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 2:00 PM, Tomorrow, Friday"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={newTask.subject}
                  onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Math">Math</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="General">General</option>
                  <option value="Admin">Admin</option>
                  <option value="Planning">Planning</option>
                </select>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Full Schedule</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
                <div key={index} className={`p-4 rounded-xl transition-all duration-200 ${item.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold">{item.time}</div>
                      <div>
                        <div className="font-medium">{item.subject}</div>
                        <div className="text-sm opacity-75">{item.grade} • {item.room}</div>
                      </div>
                    </div>
                    {item.status === 'current' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Current</span>
                      </div>
                    )}
                    {item.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {item.status === 'upcoming' && (
                      <Clock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">All Recent Activity</h3>
              <button 
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {displayRecentActivity.map((activity) => {
                const Icon = activity.icon || Activity; // Default to Activity icon if undefined
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Icon className={`w-5 h-5 ${activity.color || 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{activity.student}</span>
                        <span className="text-gray-600"> {activity.action}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {showClassDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Class Details - {nextClass.subject}</h3>
              <button 
                onClick={() => setShowClassDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <h4 className="text-xl font-bold mb-2">{nextClass.subject}</h4>
                <p className="text-indigo-100 mb-4">{nextClass.grade} • {nextClass.room}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-indigo-200">Time</p>
                    <p className="font-semibold">{nextClass.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-200">Students</p>
                    <p className="font-semibold">{nextClass.studentsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-200">Topic</p>
                    <p className="font-semibold">{nextClass.topic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-200">Starts In</p>
                    <p className="font-semibold">{nextClass.timeUntil}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Quick Actions</h5>
                  <div className="space-y-2">
                    <button className="w-full text-left p-2 hover:bg-white rounded-lg transition-colors">
                      📋 Take Attendance
                    </button>
                    <button className="w-full text-left p-2 hover:bg-white rounded-lg transition-colors">
                      📝 Start Assignment
                    </button>
                    <button className="w-full text-left p-2 hover:bg-white rounded-lg transition-colors">
                      💬 Open Discussion
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Class Materials</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg transition-colors">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Chapter 5 Notes</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg transition-colors">
                      <PlayCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Video Lecture</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg transition-colors">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Practice Quiz</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowClassDetailsModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <Link 
                  to="/classes/8A"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Go to Class
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;