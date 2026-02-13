import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BookOpenIcon,
  UserCircleIcon,
  BellIcon,
  XMarkIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  ArrowRightIcon,
  ChatBubbleLeftEllipsisIcon,
  AcademicCapIcon,
  StarIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { 
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import apiService from '../services/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const Dashboard = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target: '' });

  // State for API data
  const [dashboardData, setDashboardData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, userResponse] = await Promise.all([
        apiService.getDashboard(),
        apiService.getCurrentUser()
      ]);

      setDashboardData(dashboardResponse.data);
      setUserData(userResponse.data.user);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const weeklyGoals = [
    { id: 1, title: 'Complete 3 Math topics', progress: 66, completed: false },
    { id: 2, title: 'Score 85% in Physics quiz', progress: 100, completed: true },
    { id: 3, title: 'Watch 5 video lessons', progress: 80, completed: false },
  ];

  const notifications = [
    { id: 1, title: 'New Physics course added', time: '2 hours ago', type: 'course', read: false },
    { id: 2, title: 'Math assessment due tomorrow', time: '5 hours ago', type: 'assessment', read: false },
    { id: 3, title: 'Your doubt was answered', time: '1 day ago', type: 'doubt', read: true },
  ];

  const recommendations = [
    {
      id: 1,
      title: 'Complete Calculus Basics',
      description: 'You left off at derivatives',
      type: 'continue',
      progress: 65,
      thumbnail: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=300',
      timeLeft: '15 mins left',
    },
    {
      id: 2,
      title: 'Quantum Physics Introduction',
      description: 'Based on your Physics progress',
      type: 'recommended',
      difficulty: 'Intermediate',
      thumbnail: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 4.8,
    },
    {
      id: 3,
      title: 'Organic Chemistry Reactions',
      description: 'Strengthen your weak areas',
      type: 'improvement',
      lastScore: '72%',
      thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=300',
      priority: 'High',
    },
  ];

  const recentVideos = [
    {
      id: 1,
      title: 'Linear Algebra Fundamentals',
      thumbnail: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=200',
      duration: '12:45',
      progress: 80,
    },
    {
      id: 2,
      title: 'Newton\'s Laws Explained',
      thumbnail: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=200',
      duration: '18:30',
      progress: 45,
    },
    {
      id: 3,
      title: 'Chemical Bonding Basics',
      thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=200',
      duration: '22:15',
      progress: 30,
    },
  ];

  const communityHighlights = [
    {
      id: 1,
      question: 'How to solve quadratic equations faster?',
      answers: 12,
      likes: 45,
      author: 'Sarah M.',
      time: '2 hours ago',
    },
    {
      id: 2,
      question: 'Best way to memorize periodic table?',
      answers: 8,
      likes: 32,
      author: 'Mike R.',
      time: '4 hours ago',
    },
    {
      id: 3,
      question: 'Understanding calculus derivatives?',
      answers: 15,
      likes: 67,
      author: 'Alex K.',
      time: '6 hours ago',
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Chen', points: 2450, avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=10b981&color=fff' },
    { rank: 2, name: 'Sarah Johnson', points: 2380, avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=f59e0b&color=fff' },
    { rank: 3, name: 'You', points: 1250, avatar: userData?.avatar || 'https://ui-avatars.com/api/?name=You&background=4f46e5&color=fff', isCurrentUser: true },
    { rank: 4, name: 'Mike Rodriguez', points: 1180, avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=8b5cf6&color=fff' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleContinueLearning = () => {
    navigate('/courses');
    toast.success('Continuing your learning journey!');
  };

  const handleAskDoubt = () => {
    navigate('/doubts');
    toast.success('AI tutor is ready to help!');
  };
  const handleCreateGoal = () => {
    if (!newGoal.title.trim() || !newGoal.target) {
      toast.error('Please fill in all required fields');
      return;
    }

    const goalData = {
      id: weeklyGoals.length + 1,
      title: newGoal.title,
      progress: 0,
      completed: false,
      target: parseInt(newGoal.target)
    };

    setWeeklyGoals([...weeklyGoals, goalData]);
    setNewGoal({ title: '', description: '', target: '' });
    setShowNewGoalModal(false);
    toast.success('New goal created successfully!');
  };

  const toggleGoalCompletion = (goalId) => {
    setWeeklyGoals(goals => 
      goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed, progress: goal.completed ? goal.progress : 100 }
          : goal
      )
    );
  };

  // Get progress data from dashboard data or use defaults
  const progressData = dashboardData?.stats || {
    topicsCompleted: 75,
    assessmentsCompleted: 60,
    weeklyStreak: 6,
  };

  // Chart configurations
  const progressChartData = {
    datasets: [{
      data: [progressData.topicsCompleted || 75, 100 - (progressData.topicsCompleted || 75)],
      backgroundColor: ['#4F46E5', '#E5E7EB'],
      borderWidth: 0,
      cutout: '75%',
    }],
  };

  const assessmentChartData = {
    datasets: [{
      data: [progressData.assessmentsCompleted || 60, 100 - (progressData.assessmentsCompleted || 60)],
      backgroundColor: ['#10B981', '#E5E7EB'],
      borderWidth: 0,
      cutout: '75%',
    }],
  };

  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Hours',
      data: [2, 4, 3, 5, 3, 4, 2],
      fill: true,
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
    },
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md"
      >
        <Bars3Icon className="h-6 w-6 text-gray-600" />
      </button>

      {/* Floating Chat Bot */}
      <button
        onClick={handleAskDoubt}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Section 1: Welcome + Key Actions */}
        <div className="mb-8 lg:mb-12">
          <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
              <div className="flex items-center space-x-4 lg:space-x-6 mb-4 lg:mb-0">
                <img
                  src={userData?.avatar || 'https://ui-avatars.com/api/?name=Student&background=4f46e5&color=fff'}
                  alt="Profile"
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-indigo-100 shadow-md"
                />
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {getGreeting()}, {userData?.fullName || 'Student'}! 👋
                  </h1>
                  <p className="text-gray-600 flex items-center space-x-3 text-sm lg:text-lg">
                    <ClockIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span>Last active: {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'Recently'}</span>
                    <span className="text-indigo-600 font-semibold">• {userData?.level || 'Student'}</span>
                  </p>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <BellIcon className="h-6 w-6 lg:h-7 lg:w-7" />
                  <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <button
                onClick={handleContinueLearning}
                className="flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-md"
              >
                <PlayCircleIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>Continue Learning</span>
              </button>
              <button
                onClick={handleAskDoubt}
                className="flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-md"
              >
                <QuestionMarkCircleIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                <span>Ask a Doubt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: What's New Banner */}
        {showWhatsNew && (
          <div className="mb-8 lg:mb-12">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-md">
              <button
                onClick={() => setShowWhatsNew(false)}
                className="absolute top-4 lg:top-6 right-4 lg:right-6 text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="bg-white bg-opacity-20 p-3 lg:p-4 rounded-full">
                  <StarIconSolid className="h-6 w-6 lg:h-8 lg:w-8" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-2">🎉 New AI Features Added!</h3>
                  <p className="text-purple-100 text-base lg:text-lg">Get personalized learning recommendations powered by advanced AI</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Quick Access + Resume Watching - First Priority */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Quick Access Cards */}
          <div>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Quick Access</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {[
                { icon: BookOpenIcon, label: 'My Courses', path: '/courses', color: 'bg-blue-50 text-blue-600', bgColor: 'hover:bg-blue-100' },
                { icon: ClipboardDocumentListIcon, label: 'Assessments', path: '/assessments', color: 'bg-green-50 text-green-600', bgColor: 'hover:bg-green-100' },
                { icon: ChartBarIcon, label: 'Progress', path: '/progress', color: 'bg-purple-50 text-purple-600', bgColor: 'hover:bg-purple-100' },
                { icon: UserCircleIcon, label: 'Profile', path: '/profile', color: 'bg-orange-50 text-orange-600', bgColor: 'hover:bg-orange-100' },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`${item.color} ${item.bgColor} p-3 lg:p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-md`}
                >
                  <item.icon className="h-5 w-5 lg:h-6 lg:w-6 mb-2 lg:mb-3 mx-auto" />
                  <p className="font-semibold text-gray-900 text-xs lg:text-sm text-center">{item.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Resume Watching */}
          <div>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Resume Watching</h2>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {recentVideos.map(video => (
                <div key={video.id} className="bg-white rounded-xl p-3 lg:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="relative flex-shrink-0">
                      <img src={video.thumbnail} alt={video.title} className="w-16 h-10 lg:w-20 lg:h-12 rounded-lg object-cover" />
                      <div className="absolute bottom-0.5 right-0.5 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded text-xs">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1.5 text-sm lg:text-base line-clamp-2">{video.title}</h3>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2 mb-1.5">
                        <div className="bg-indigo-600 h-1.5 lg:h-2 rounded-full transition-all duration-300" style={{ width: `${video.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{video.progress}% completed</p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 hover:scale-110 transition-all">
                      <PlayCircleIcon className="h-6 w-6 lg:h-8 lg:w-8" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Weekly Goals - Second Priority */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Weekly Goals</h2>
            <button 
              onClick={() => setShowNewGoalModal(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm lg:text-base"
            >
              Set New Goal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {weeklyGoals.map(goal => (
              <div key={goal.id} className="bg-white rounded-xl p-4 lg:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => toggleGoalCompletion(goal.id)}
                    className={`flex-shrink-0 w-6 h-6 lg:w-7 lg:h-7 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
                      goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {goal.completed && <CheckCircleIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm lg:text-base mb-2 lg:mb-3 ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {goal.title}
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-2.5 mb-2">
                      <div 
                        className={`h-2 lg:h-2.5 rounded-full transition-all duration-300 ${goal.completed ? 'bg-green-500' : 'bg-indigo-600'}`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{goal.progress}% completed</span>
                      {goal.completed && <span className="text-green-600 font-medium text-xs lg:text-sm">✓ Done!</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Your Progress - Third Priority */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Your Progress</h2>
            <button 
              onClick={() => navigate('/progress')}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 text-sm lg:text-base"
            >
              <span>View Details</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Topics Progress */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Topics</h3>
                <BookOpenIcon className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-500" />
              </div>
              <div className="relative h-20 lg:h-24 mb-4 lg:mb-6">
                <Doughnut data={progressChartData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg lg:text-2xl font-bold text-indigo-600">{progressData.topicsCompleted}%</span>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-gray-600 text-center">Great progress!</p>
            </div>

            {/* Assessments Progress */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Tests</h3>
                <ClipboardDocumentListIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
              </div>
              <div className="relative h-20 lg:h-24 mb-4 lg:mb-6">
                <Doughnut data={assessmentChartData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg lg:text-2xl font-bold text-green-600">{progressData.assessmentsCompleted}%</span>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-gray-600 text-center">Keep it up!</p>
            </div>

            {/* Streak Counter */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Streak</h3>
                <FireIconSolid className="h-5 w-5 lg:h-6 lg:w-6 text-orange-500" />
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-2">{userData?.stats?.currentStreak || 0}</div>
                <div className="text-xs lg:text-sm text-gray-600 mb-1">days</div>
                <div className="text-xs lg:text-sm text-orange-600 font-semibold">🔥 On fire!</div>
              </div>
            </div>

            {/* Total Points */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="font-semibold text-gray-700 text-sm lg:text-base">Points</h3>
                <TrophyIcon className="h-5 w-5 lg:h-6 lg:w-6 text-purple-500" />
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">{userData?.stats?.totalPoints || 0}</div>
                <div className="text-xs lg:text-sm text-gray-600 mb-1">earned</div>
                <div className="text-xs lg:text-sm text-purple-600 font-semibold">🏆 Great!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Recommended for You - Fourth Priority */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Recommended for You</h2>
            <button 
              onClick={() => navigate('/courses')}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 text-sm lg:text-base"
            >
              <span>View All</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {recommendations.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-32 lg:h-40 object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.type === 'continue' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'recommended' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.type === 'continue' ? 'Continue' : 
                       item.type === 'recommended' ? 'Recommended' : 'Improve'}
                    </span>
                  </div>
                  {item.progress && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      {item.timeLeft}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 text-base lg:text-lg">{item.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm lg:text-base">{item.description}</p>
                  {item.progress && (
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                  )}
                  {item.rating && (
                    <div className="flex items-center mb-3">
                      <StarIconSolid className="h-5 w-5 text-yellow-400" />
                      <span className="text-gray-600 ml-2 font-medium text-sm">{item.rating}</span>
                    </div>
                  )}
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 lg:py-3 rounded-lg font-semibold transition-colors shadow-sm text-sm lg:text-base">
                    {item.type === 'continue' ? 'Continue' : 'Start Learning'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Community & Leaderboard - Remaining Same */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* Community Highlights */}
          <div>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Community Highlights</h2>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="space-y-6">
                {communityHighlights.map(item => (
                  <div key={item.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">{item.question}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">by {item.author}</span>
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                          {item.answers}
                        </span>
                        <span className="flex items-center">
                          <HeartIconSolid className="h-4 w-4 mr-1 text-red-500" />
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/doubts')}
                className="w-full mt-6 text-indigo-600 hover:text-indigo-700 font-semibold py-3 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                View All Discussions →
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Top Learners</h2>
            </div>
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
                {leaderboard.map(user => (
                  <div key={user.rank} className={`flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-lg transition-all ${user.isCurrentUser ? 'bg-indigo-50 border-2 border-indigo-200' : 'hover:bg-gray-50'}`}>
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.rank}
                    </div>
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-gray-200" />
                    <div className="flex-1">
                      <p className={`font-semibold text-lg ${user.isCurrentUser ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {user.name}
                      </p>
                      <p className="text-gray-500 font-medium text-sm">{user.points} points</p>
                    </div>
                    {user.rank <= 3 && (
                      <TrophyIcon className={`h-5 w-5 lg:h-6 lg:w-6 ${
                        user.rank === 1 ? 'text-yellow-500' :
                        user.rank === 2 ? 'text-gray-400' :
                        'text-orange-500'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 text-indigo-600 hover:text-indigo-700 font-semibold py-3 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
                View Full Leaderboard →
              </button>
            </div>
          </div>
        </div>

        {/* Section 8: Weekly Activity Chart - Remaining Same */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Weekly Activity</h2>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 text-sm lg:text-base">
              <span>View Analytics</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="h-48 lg:h-64">
              <Line data={weeklyActivityData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Section 9: Footer - Remaining Same */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap justify-center space-x-4 lg:space-x-8 text-gray-600 mb-6">
            <a href="#" className="hover:text-gray-900 transition-colors font-medium text-sm lg:text-base">Help Center</a>
            <a href="#" className="hover:text-gray-900 transition-colors font-medium text-sm lg:text-base">Terms & Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors font-medium text-sm lg:text-base">About Team</a>
            <a href="#" className="hover:text-gray-900 transition-colors font-medium text-sm lg:text-base">Contact</a>
          </div>
          <div className="text-center text-gray-500 text-sm lg:text-base">
            © 2024 EduPlatform. Made with <HeartIcon className="h-4 w-4 inline text-red-500" /> for learners worldwide.
          </div>
        </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Set New Weekly Goal</h3>
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Complete 5 lessons this week"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional details about your goal"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Number *
                </label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowNewGoalModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;