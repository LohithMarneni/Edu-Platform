import React, { useState } from 'react';
import { MessageCircle, Clock, CheckCircle, User, Send, Search, Filter, Brain, AlertTriangle, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

const Doubts = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [expandedDoubt, setExpandedDoubt] = useState(null);
  const [responseText, setResponseText] = useState('');
  
  

  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: '8A', name: '8th Grade A' },
    { id: '8B', name: '8th Grade B' },
    { id: '9C', name: '9th Grade C' },
    { id: '10A', name: '10th Grade A' },
  ];
  const [doubts, setDoubts] = useState([
    {
      id: 1,
      student: 'Sarah Johnson',
      class: '8th Grade A',
      subject: 'Quadratic Equations',
      question: 'I\'m having trouble understanding how to solve quadratic equations using the quadratic formula. Can you explain the steps?',
      timestamp: '2024-03-05T10:30:00Z',
      status: 'pending',
      priority: 'high',
      responses: [],
    },
    {
      id: 2,
      student: 'Mike Chen',
      class: '8th Grade B',
      subject: 'Geometry - Triangles',
      question: 'What\'s the difference between isosceles and equilateral triangles? I keep getting confused.',
      timestamp: '2024-03-05T09:15:00Z',
      status: 'answered',
      priority: 'medium',
      responses: [
        {
          id: 1,
          author: 'Teacher',
          message: 'Great question! An isosceles triangle has two equal sides, while an equilateral triangle has all three sides equal.',
          timestamp: '2024-03-05T09:45:00Z',
        }
      ],
    },
    {
      id: 3,
      student: 'Emma Davis',
      class: '9th Grade C',
      subject: 'Algebra - Factoring',
      question: 'How do I factor polynomials? I understand the concept but struggle with the actual steps.',
      timestamp: '2024-03-04T16:20:00Z',
      status: 'pending',
      priority: 'medium',
      responses: [],
    },
    {
      id: 4,
      student: 'John Smith',
      class: '10th Grade A',
      subject: 'Statistics',
      question: 'Can you help me understand standard deviation? The formula is confusing.',
      timestamp: '2024-03-04T14:10:00Z',
      status: 'pending',
      priority: 'low',
      responses: [],
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'answered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredDoubts = doubts.filter(doubt => {
    const matchesFilter = filter === 'all' || doubt.status === filter;
    const matchesClass = selectedClass === 'all' || doubt.class === selectedClass;
    const matchesSearch = doubt.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doubt.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doubt.question.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesClass && matchesSearch;
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleAnswer = (doubtId) => {
    setExpandedDoubt(expandedDoubt === doubtId ? null : doubtId);
  };

  const handleSendResponse = (doubtId) => {
    if (responseText.trim()) {
      const newResponse = {
        id: Date.now(),
        author: 'Teacher',
        message: responseText,
        timestamp: new Date().toISOString(),
      };
      
      setDoubts(doubts.map(doubt => 
        doubt.id === doubtId 
          ? { 
              ...doubt, 
              responses: [...doubt.responses, newResponse],
              status: 'answered'
            }
          : doubt
      ));
      
      setResponseText('');
      setExpandedDoubt(null);
    }
  };

  const stats = [
    {
      label: 'Total Doubts',
      value: doubts.length,
      icon: MessageCircle,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Solved',
      value: doubts.filter(d => d.status === 'answered').length,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Pending',
      value: doubts.filter(d => d.status === 'pending').length,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      label: 'High Priority',
      value: doubts.filter(d => d.priority === 'high').length,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-700 border-red-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Doubt Resolution</h1>
              <p className="text-gray-600">View and respond to student questions across all classes</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button className="bg-violet-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Help</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search doubts by student, subject, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="answered">Answered</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`rounded-xl p-4 border-2 ${stat.color}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-80">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <Icon className="w-6 h-6 opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doubts List */}
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => (
            <div key={doubt.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="p-6">
                {/* Doubt Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{doubt.student}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{doubt.class}</span>
                      </div>
                      <p className="text-sm font-medium text-blue-600">{doubt.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(doubt.priority)}`}>
                      {doubt.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doubt.status)}`}>
                      {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Doubt Question */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-gray-900 font-medium">{doubt.question}</p>
                  <p className="text-xs text-gray-500 mt-2">Asked {formatTime(doubt.timestamp)}</p>
                </div>

                {/* Existing Responses */}
                {doubt.responses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {doubt.responses.map((response) => (
                      <div key={response.id} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-900">{response.author}</span>
                          <span className="text-xs text-blue-600">{formatTime(response.timestamp)}</span>
                        </div>
                        <p className="text-blue-900">{response.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleAnswer(doubt.id)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Send className="w-4 h-4" />
                      <span>Answer</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-xl hover:bg-violet-100 transition-colors font-medium">
                      <Brain className="w-4 h-4" />
                      <span>AI Suggest</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {doubt.status === 'pending' ? 'Awaiting response' : 'Resolved'}
                  </div>
                </div>

                {/* Expandable Response Section */}
                {expandedDoubt === doubt.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-4 h-4 text-violet-600" />
                        <span className="text-sm font-medium text-gray-700">AI Suggestion:</span>
                        <button className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full hover:bg-violet-200 transition-colors">
                          Generate
                        </button>
                      </div>
                      <div className="space-y-3">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type your response..."
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                        />
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => setExpandedDoubt(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendResponse(doubt.id)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>Send Response</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDoubts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doubts found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms or filters.'
                : 'No student questions at the moment.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doubts;