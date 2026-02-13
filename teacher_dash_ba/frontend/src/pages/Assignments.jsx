import React, { useState } from 'react';
import { Plus, FileText, Clock, CheckCircle, Users, Search, Filter, ChevronDown, Trophy, AlertCircle, Calendar, MoreHorizontal, Eye, X } from 'lucide-react';

const Assignments = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    type: 'Assignment',
    class: 'all',
    dueDate: '',
    description: '',
    totalMarks: 100
  });
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Algebra Quiz - Chapter 5',
      class: '8A',
      className: 'Class 8A',
      type: 'Quiz',
      dueDate: '2024-03-15',
      status: 'active',
      submitted: 18,
      total: 30,
      description: 'Test on quadratic equations and polynomials',
      createdDate: '2024-03-01',
      icon: '√x',
      iconBg: 'bg-purple-500',
      progress: 60,
    },
    {
      id: 2,
      title: 'Geometry Problem Set',
      class: '8B',
      className: 'Class 8B',
      type: 'Assignment',
      dueDate: '2024-03-12',
      status: 'active',
      submitted: 25,
      total: 28,
      description: 'Practice problems on triangles and circles',
      createdDate: '2024-02-28',
      icon: '△',
      iconBg: 'bg-emerald-500',
      progress: 89,
    },
    {
      id: 3,
      title: 'Trigonometry Review',
      class: '9C',
      className: 'Class 9C',
      type: 'Homework',
      dueDate: '2024-03-08',
      status: 'completed',
      submitted: 32,
      total: 32,
      description: 'Review exercises for midterm preparation',
      createdDate: '2024-02-25',
      icon: '∿',
      iconBg: 'bg-emerald-500',
      progress: 100,
    },
    {
      id: 4,
      title: 'Statistics Project',
      class: '10A',
      className: 'Class 10A',
      type: 'Project',
      dueDate: '2024-03-20',
      status: 'draft',
      submitted: 0,
      total: 25,
      description: 'Data collection and analysis project',
      createdDate: '2024-03-05',
      icon: '📊',
      iconBg: 'bg-blue-500',
      progress: 0,
    },
    {
      id: 5,
      title: 'Calculus Assignment',
      class: '10A',
      className: 'Class 10A',
      type: 'Assignment',
      dueDate: '2024-03-10',
      status: 'active',
      submitted: 15,
      total: 25,
      description: 'Derivatives and integration problems',
      createdDate: '2024-02-20',
      icon: '∫',
      iconBg: 'bg-orange-500',
      progress: 60,
    },
  ]);

  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: '8A', name: 'Class 8A' },
    { id: '8B', name: 'Class 8B' },
    { id: '9C', name: 'Class 9C' },
    { id: '10A', name: 'Class 10A' },
  ];

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    const newAssignmentData = {
      id: assignments.length + 1,
      title: newAssignment.title,
      class: newAssignment.class === 'all' ? '8A' : newAssignment.class,
      className: `Class ${newAssignment.class === 'all' ? '8A' : newAssignment.class}`,
      type: newAssignment.type,
      dueDate: newAssignment.dueDate,
      status: 'draft',
      submitted: 0,
      total: 30,
      description: newAssignment.description,
      createdDate: new Date().toISOString().split('T')[0],
      icon: newAssignment.type === 'Quiz' ? '?' : newAssignment.type === 'Project' ? '📊' : '📝',
      iconBg: 'bg-blue-500',
      progress: 0,
    };
    
    setAssignments([...assignments, newAssignmentData]);
    setShowCreateModal(false);
    setNewAssignment({
      title: '',
      type: 'Assignment',
      class: 'all',
      dueDate: '',
      description: '',
      totalMarks: 100
    });
  };

  const handlePublish = (assignmentId) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, status: 'active' }
        : assignment
    ));
  };

  const handleGrade = (assignment) => {
    setSelectedAssignment(assignment);
    setShowGradeModal(true);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesTab = activeTab === 'all' || assignment.status === activeTab;
    const matchesClass = selectedClass === 'all' || assignment.class === selectedClass;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.className.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesClass && matchesSearch;
  });

  const getStatusCounts = () => {
    const active = assignments.filter(a => a.status === 'active').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const draft = assignments.filter(a => a.status === 'draft').length;
    const total = assignments.length;
    
    return { active, completed, draft, total };
  };

  const getClassStats = () => {
    const filtered = selectedClass === 'all' ? assignments : assignments.filter(a => a.class === selectedClass);
    const mostGraded = filtered.filter(a => a.status === 'completed').length;
    const dueSoon = filtered.filter(a => {
      const dueDate = new Date(a.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0 && a.status === 'active';
    }).length;
    const lateSubmissions = filtered.filter(a => {
      const dueDate = new Date(a.dueDate);
      const today = new Date();
      return dueDate < today && a.status === 'active' && a.submitted < a.total;
    }).length;

    return { mostGraded, dueSoon, lateSubmissions };
  };

  const { active, completed, draft, total } = getStatusCounts();
  const { mostGraded, dueSoon, lateSubmissions } = getClassStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-1">Manage and track all your assignments</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{mostGraded}</p>
                <p className="text-sm text-gray-600">Most Graded</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dueSoon}</p>
                <p className="text-sm text-gray-600">Due Soon</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{lateSubmissions}</p>
                <p className="text-sm text-gray-600">Late Submissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('draft')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'draft'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Completed
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>

          {/* Assignments List */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                  {filteredAssignments.length}
                </span>
              </h3>
              {activeTab === 'active' && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Beta
                </span>
              )}
            </div>

            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`${assignment.iconBg} p-3 rounded-xl flex items-center justify-center min-w-[48px] h-12`}>
                        <span className="text-white font-bold text-lg">{assignment.icon}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                          {getStatusBadge(assignment.status)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{assignment.className}</span>
                          <span>•</span>
                          <span>{assignment.type}</span>
                          <span>•</span>
                          <span>Due {formatDate(assignment.dueDate)}</span>
                        </div>

                        {assignment.status !== 'draft' && (
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {assignment.progress}% Submitted
                              </span>
                            </div>
                            <div className="flex-1 max-w-xs">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${assignment.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {assignment.submitted} / {assignment.total}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {assignment.status === 'active' && (
                        <button onClick={() => handleGrade(assignment)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                          Grade
                        </button>
                      )}
                      {assignment.status === 'draft' && (
                        <button onClick={() => handlePublish(assignment.id)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                          Publish
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {assignment.status === 'draft' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{assignment.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredAssignments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters.'
                    : `No ${activeTab} assignments for the selected class.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Assignment</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Chapter 5 Quiz"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newAssignment.type}
                    onChange={(e) => setNewAssignment({...newAssignment, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Homework">Homework</option>
                    <option value="Project">Project</option>
                    <option value="Exam">Exam</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={newAssignment.class}
                    onChange={(e) => setNewAssignment({...newAssignment, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the assignment details..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                <input
                  type="number"
                  value={newAssignment.totalMarks}
                  onChange={(e) => setNewAssignment({...newAssignment, totalMarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {showGradeModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Grade: {selectedAssignment.title}</h3>
              <button 
                onClick={() => setShowGradeModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Assignment Details</h4>
                <p className="text-gray-600">{selectedAssignment.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Due: {formatDate(selectedAssignment.dueDate)}</span>
                  <span>Submissions: {selectedAssignment.submitted}/{selectedAssignment.total}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample student submissions */}
                {[
                  { name: 'Sarah Johnson', score: 85, status: 'graded' },
                  { name: 'Mike Chen', score: null, status: 'pending' },
                  { name: 'Emma Davis', score: 92, status: 'graded' },
                  { name: 'John Smith', score: null, status: 'pending' },
                  { name: 'Lisa Wang', score: 78, status: 'graded' },
                  { name: 'David Brown', score: null, status: 'pending' }
                ].map((student, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{student.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'graded' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.status === 'graded' ? 'Graded' : 'Pending'}
                      </span>
                    </div>
                    {student.status === 'graded' ? (
                      <div className="text-2xl font-bold text-green-600">{student.score}/100</div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Score"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          max="100"
                        />
                        <button className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          Grade
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowGradeModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                  Export Grades
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Assignments;