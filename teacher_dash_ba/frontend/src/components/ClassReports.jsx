import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Mail,
  MessageSquare,
  FileText,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  BookOpen,
  HelpCircle,
  Plus,
  Eye,
  Share2,
  X,
  Send,
  Loader,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';

const ClassReports = ({ classId }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('positive');

  useEffect(() => {
    if (classId) {
      fetchData();
    }
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch students, assignments, and doubts in parallel
      const [studentsRes, assignmentsRes, doubtsRes] = await Promise.all([
        apiService.getClassStudents(classId),
        apiService.getAssignments(`?class=${classId}&status=active`),
        apiService.getDoubts(`?class=${classId}`)
      ]);

      setStudents(studentsRes.data || []);
      setAssignments(assignmentsRes.data || []);
      setDoubts(doubtsRes.data || []);
      
      // Set first student as selected by default
      if (studentsRes.data && studentsRes.data.length > 0 && !selectedStudent) {
        setSelectedStudent(studentsRes.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate student performance metrics
  const calculateStudentMetrics = (studentId) => {
    const studentAssignments = assignments.filter(a => 
      a.submissions?.some(s => String(s.student?._id || s.student) === String(studentId))
    );
    
    const completedAssignments = studentAssignments.filter(a => 
      a.submissions?.some(s => String(s.student?._id || s.student) === String(studentId) && s.status === 'submitted')
    );
    
    const studentDoubts = doubts.filter(d => 
      d.student?.email && students.find(s => s._id === studentId)?.email === d.student.email
    );
    
    const scores = studentAssignments
      .map(a => {
        const submission = a.submissions?.find(s => String(s.student?._id || s.student) === String(studentId));
        return submission?.score;
      })
      .filter(s => s !== undefined && s !== null);
    
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;
    
    const recentScores = scores.slice(-5);
    const trend = recentScores.length >= 2
      ? recentScores[recentScores.length - 1] > recentScores[0] ? 'up' 
      : recentScores[recentScores.length - 1] < recentScores[0] ? 'down' : 'stable'
      : 'stable';
    
    const trendValue = recentScores.length >= 2
      ? Math.round(recentScores[recentScores.length - 1] - recentScores[0])
      : 0;

    return {
      totalAssignments: assignments.length,
      completedAssignments: completedAssignments.length,
      avgScore,
      trend,
      trendValue,
      doubtsAsked: studentDoubts.length,
      recentScores: scores.slice(-5),
      attendance: 95 // This would come from attendance data if available
    };
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      alert(`Message sent to ${selectedStudentData?.name}: "${messageText}"`);
      setMessageText('');
      setShowMessageModal(false);
    }
  };

  const handleAddNote = () => {
    if (noteText.trim() && selectedStudent) {
      // In a real app, this would save to backend
      alert(`Note added for ${selectedStudentData?.name}`);
      setNoteText('');
      setShowAddNoteModal(false);
    }
  };

  const handleDownloadReport = () => {
    alert(`Downloading full report for ${selectedStudentData?.name}...`);
  };

  const handleShareWithParent = () => {
    alert(`Sharing report with ${selectedStudentData?.name}'s parents...`);
  };

  const handleGeneratePlan = () => {
    alert(`Generating AI-powered learning plan for ${selectedStudentData?.name}...`);
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudentData = students.find(s => s._id === selectedStudent);
  const studentMetrics = selectedStudentData ? calculateStudentMetrics(selectedStudentData._id) : null;

  const getTrendIcon = (trend, value) => {
    const baseClasses = "w-4 h-4";
    if (trend === 'up') return <TrendingUp className={`${baseClasses} text-green-600`} />;
    if (trend === 'down') return <TrendingDown className={`${baseClasses} text-red-600`} />;
    return <Minus className={`${baseClasses} text-gray-600`} />;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getNoteTypeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'improvement':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-2xl p-8 max-w-md shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full space-x-6">
      {/* Left Panel - Student List */}
      <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Students</h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Student List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No students found</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const metrics = calculateStudentMetrics(student._id);
              return (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudent(student._id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedStudent === student._id
                      ? 'bg-blue-50 border-2 border-blue-200 shadow-md'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{getInitials(student.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{student.name || 'Student'}</h3>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(metrics.trend, metrics.trendValue)}
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getScoreColor(metrics.avgScore)}`}>
                            {metrics.avgScore}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{student.email || ''}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {metrics.completedAssignments}/{metrics.totalAssignments} assignments
                        </span>
                        <span className="text-xs text-gray-500">{metrics.attendance}% attendance</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Student Details */}
      <div className="flex-1 space-y-6">
        {selectedStudentData && studentMetrics ? (
          <>
            {/* Student Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{getInitials(selectedStudentData.name)}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedStudentData.name || 'Student'}</h1>
                    <p className="text-gray-600">{selectedStudentData.email || ''}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowMessageModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button 
                    onClick={handleDownloadReport}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Full Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-blue-600" />
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(studentMetrics.trend, studentMetrics.trendValue)}
                    <span className={`text-xs font-medium ${
                      studentMetrics.trend === 'up' ? 'text-green-600' :
                      studentMetrics.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {studentMetrics.trendValue > 0 ? '+' : ''}{studentMetrics.trendValue}%
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{studentMetrics.avgScore}%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <HelpCircle className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{studentMetrics.doubtsAsked}</p>
                <p className="text-sm text-gray-600">Doubts Asked</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                  <div className="text-right">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${studentMetrics.totalAssignments ? ((studentMetrics.completedAssignments / studentMetrics.totalAssignments) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {studentMetrics.completedAssignments}/{studentMetrics.totalAssignments}
                </p>
                <p className="text-sm text-gray-600">Assignments</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-amber-600" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    studentMetrics.attendance >= 95 ? 'bg-green-100 text-green-800' :
                    studentMetrics.attendance >= 85 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {studentMetrics.attendance >= 95 ? 'Excellent' :
                     studentMetrics.attendance >= 85 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{studentMetrics.attendance}%</p>
                <p className="text-sm text-gray-600">Attendance</p>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6 text-violet-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-violet-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">Performance Trend</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Score trend: {studentMetrics.trend === 'up' ? 'Improving' : studentMetrics.trend === 'down' ? 'Declining' : 'Stable'}
                    {studentMetrics.trendValue !== 0 && ` (${studentMetrics.trendValue > 0 ? '+' : ''}${studentMetrics.trendValue}%)`}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-violet-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-gray-900">Engagement</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {studentMetrics.doubtsAsked > 10 ? 'Very active' : 'Moderately active'} in doubt forum
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-violet-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">Completion Rate</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {studentMetrics.totalAssignments > 0 
                      ? Math.round((studentMetrics.completedAssignments / studentMetrics.totalAssignments) * 100)
                      : 0}% of assignments completed
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className="flex items-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Message Student</span>
                </button>
                <button 
                  onClick={handleDownloadReport}
                  className="flex items-center space-x-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
                <button 
                  onClick={handleShareWithParent}
                  className="flex items-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share with Parent</span>
                </button>
                <button 
                  onClick={handleGeneratePlan}
                  className="flex items-center space-x-2 p-3 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Generate Plan</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
            <p className="text-gray-600">Choose a student from the list to view their detailed performance report</p>
          </div>
        )}
      </div>

      {/* Message Student Modal */}
      {showMessageModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Message Student</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{getInitials(selectedStudentData.name)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedStudentData.name}</p>
                    <p className="text-sm text-gray-600">{selectedStudentData.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Type your message..."
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Teacher Note</h3>
              <button 
                onClick={() => setShowAddNoteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNoteType('positive')}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      noteType === 'positive' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Positive</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteType('improvement')}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      noteType === 'improvement' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Target className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">Improvement</div>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add your note about the student..."
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddNoteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassReports;
