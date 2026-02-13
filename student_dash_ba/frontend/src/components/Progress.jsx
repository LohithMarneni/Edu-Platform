import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  AcademicCapIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Progress = () => {
  const [progressData, setProgressData] = useState({
    totalCourses: 0,
    completedCourses: 0,
    currentStreak: 0,
    badgesEarned: 0,
    courses: [],
    weeklyActivity: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [0, 0, 0, 0, 0, 0, 0],
    },
    achievements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching progress data from API...');
        
        // Fetch dashboard data which includes progress information
        const dashboardResponse = await apiService.getDashboard();
        console.log('📡 Dashboard API Response:', dashboardResponse);
        
        if (dashboardResponse.success) {
          const dashboardData = dashboardResponse.data;
          
          // Transform dashboard data to match our component structure
          const transformedData = {
            totalCourses: dashboardData.stats?.totalCourses || 0,
            completedCourses: dashboardData.stats?.completedCourses || 0,
            currentStreak: dashboardData.stats?.currentStreak || 0,
            badgesEarned: 12, // Mock for now
            courses: dashboardData.courses?.map(course => ({
              name: course.title || 'Unknown Course',
              progress: course.progress || 0,
              timeLeft: '2 weeks', // Mock for now
              nextLesson: 'Next Lesson', // Mock for now
            })) || [],
            weeklyActivity: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              data: dashboardData.weeklyProgress?.map(day => day.lessonsCompleted || 0) || [0, 0, 0, 0, 0, 0, 0],
            },
            achievements: [
              {
                name: 'Quick Learner',
                description: 'Completed 5 lessons in one day',
                icon: '🚀',
              },
              {
                name: 'Perfect Score',
                description: '100% in Physics Quiz',
                icon: '🎯',
              },
              {
                name: 'Consistent Learner',
                description: `${dashboardData.stats?.currentStreak || 0}-day study streak`,
                icon: '🔥',
              },
            ],
          };
          
          console.log('✅ Progress data transformed successfully');
          setProgressData(transformedData);
        } else {
          console.error('❌ API returned error:', dashboardResponse.message);
          setError('Failed to fetch progress data');
        }
      } catch (err) {
        console.error('❌ Error fetching progress data:', err);
        setError('Error loading progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  // Chart configurations
  const weeklyActivityConfig = {
    labels: progressData.weeklyActivity.labels,
    datasets: [
      {
        label: 'Hours Studied',
        data: progressData.weeklyActivity.data,
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Progress...</h2>
            <p className="text-gray-600">Fetching your learning data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Progress</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Learning Progress</h1>
        <p className="text-gray-600">Track your journey and achievements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-indigo-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <h3 className="text-2xl font-bold text-indigo-600">
                {progressData.totalCourses}
              </h3>
            </div>
            <AcademicCapIcon className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <h3 className="text-2xl font-bold text-green-600">
                {progressData.completedCourses}
              </h3>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <h3 className="text-2xl font-bold text-orange-600">
                {progressData.currentStreak} days
              </h3>
            </div>
            <FireIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Badges Earned</p>
              <h3 className="text-2xl font-bold text-purple-600">
                {progressData.badgesEarned}
              </h3>
            </div>
            <TrophyIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Personalized Message */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-2">
          You're on fire! Keep up the great work! 🔥
        </h2>
        <p>Your dedication is showing in your progress. Let's maintain this momentum!</p>
      </div>

      {/* Course Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Course Progress</h2>
          <div className="space-y-6">
            {progressData.courses.map((course, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{course.name}</span>
                  <span className="text-gray-600">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-600">
                    Est. time left: {course.timeLeft}
                  </span>
                  <span className="text-indigo-600">
                    Next: {course.nextLesson}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Weekly Activity</h2>
          <Line data={weeklyActivityConfig} options={chartOptions} />
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Activity Overview</h2>
        <CalendarHeatmap
          startDate={new Date('2024-01-01')}
          endDate={new Date('2024-12-31')}
          values={[
            { date: '2024-01-01', count: 1 },
            { date: '2024-01-03', count: 4 },
            { date: '2024-01-06', count: 2 },
            // Add more dates as needed
          ]}
          classForValue={(value) => {
            if (!value) {
              return 'color-empty';
            }
            return `color-scale-${value.count}`;
          }}
        />
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progressData.achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6"
            >
              <div className="text-3xl mb-4">{achievement.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;