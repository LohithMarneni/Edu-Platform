import React from 'react';
import { Users, FileText, HelpCircle, TrendingUp, Calendar, Clock, Eye } from 'lucide-react';

const ClassOverview = ({ classId, classData, students = [] }) => {
  // Get stats from classData or use defaults
  const totalStudents = students.length || classData?.studentCount || 0;
  const activeAssignments = classData?.stats?.totalAssignments || 0;
  const avgPerformance = classData?.stats?.averageScore || 0;
  
  const stats = [
    { name: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Assignments', value: activeAssignments, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Pending Doubts', value: '0', icon: HelpCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Avg. Performance', value: `${avgPerformance}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentActivity = [
    { student: 'Sarah Johnson', action: 'Submitted Assignment: Algebra Quiz', time: '2 hours ago' },
    { student: 'Mike Chen', action: 'Asked doubt about Quadratic Equations', time: '4 hours ago' },
    { student: 'Emma Davis', action: 'Completed Chapter 5 Notes', time: '6 hours ago' },
    { student: 'John Smith', action: 'Submitted Assignment: Geometry Problems', time: '1 day ago' },
  ];

  const upcomingEvents = [
    { title: 'Midterm Exam', date: 'March 15, 2024', type: 'exam' },
    { title: 'Assignment Due: Trigonometry', date: 'March 12, 2024', type: 'assignment' },
    { title: 'Parent-Teacher Meeting', date: 'March 20, 2024', type: 'meeting' },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <div className={`${stat.bg} p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-fit">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors duration-200">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">
                    {activity.student.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{activity.student}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-indigo-500 font-medium mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-fit">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-indigo-100 hover:shadow-md hover:scale-102 transition-all duration-200">
                <div className={`p-2 rounded-lg ${
                  event.type === 'exam' ? 'bg-red-100 shadow-red-200' :
                  event.type === 'assignment' ? 'bg-yellow-100 shadow-yellow-200' : 'bg-blue-100 shadow-blue-200'
                }`}>
                  {event.type === 'exam' ? (
                    <FileText className={`w-4 h-4 ${
                      event.type === 'exam' ? 'text-red-600' :
                      event.type === 'assignment' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  ) : event.type === 'assignment' ? (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <Calendar className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students List */}
      {students.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Class Students ({students.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student, index) => {
              const initials = student.name
                ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : 'ST';
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
              const colorIndex = index % colors.length;
              
              return (
                <div key={student._id || index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-indigo-100 hover:shadow-md transition-all duration-200">
                  <div className={`${colors[colorIndex]} w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{student.name || 'Student'}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email || ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Chart Placeholder */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Class Performance Overview</h3>
        </div>
        <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center border border-indigo-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Performance Chart</p>
            <p className="text-sm text-gray-500">Interactive analytics dashboard coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassOverview;