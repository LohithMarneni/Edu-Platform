import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, User, Send, Brain, AlertCircle, Loader, X } from 'lucide-react';
import apiService from '../services/api';

const ClassDoubts = ({ classId }) => {
  const [filter, setFilter] = useState('all');
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchDoubts();
    }
  }, [classId, filter]);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = `?class=${classId}${filter !== 'all' ? `&status=${filter}` : ''}`;
      const response = await apiService.getDoubts(query);
      setDoubts(response.data || []);
    } catch (err) {
      console.error('Error fetching doubts:', err);
      setError(err.message || 'Failed to load doubts');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async (doubtId) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setResponding(true);
      await apiService.respondToDoubt(doubtId, {
        message: responseText
      });
      setResponseText('');
      setSelectedDoubt(null);
      await fetchDoubts(); // Refresh doubts
    } catch (err) {
      console.error('Error responding to doubt:', err);
      alert(err.message || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const handleResolveDoubt = async (doubtId) => {
    if (!confirm('Mark this doubt as resolved?')) return;
    
    try {
      await apiService.resolveDoubt(doubtId);
      await fetchDoubts(); // Refresh doubts
    } catch (err) {
      console.error('Error resolving doubt:', err);
      alert(err.message || 'Failed to resolve doubt');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'answered':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed':
        return <X className="w-4 h-4 text-gray-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'answered':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDoubts = doubts.filter(doubt => {
    if (filter === 'all') return true;
    if (filter === 'answered') return doubt.status === 'answered' || doubt.status === 'resolved';
    return doubt.status === filter;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading doubts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-white rounded-2xl p-8 max-w-md shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Doubts</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDoubts}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Student Doubts
          </h2>
          <p className="text-gray-600 mt-1">View and respond to student questions</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
        <nav className="flex space-x-8 px-6 py-2">
          {[
            { key: 'all', label: 'All Doubts', count: doubts.length },
            { key: 'pending', label: 'Pending', count: doubts.filter(d => d.status === 'pending').length },
            { key: 'answered', label: 'Answered', count: doubts.filter(d => d.status === 'answered' || d.status === 'resolved').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-3 px-4 border-b-3 font-semibold text-sm transition-all duration-300 hover:scale-105 rounded-t-lg ${
                filter === tab.key
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Doubts List */}
      <div className="space-y-6">
        {filteredDoubts.map((doubt) => (
          <div key={doubt._id} className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{doubt.student?.name || 'Student'}</h3>
                    <p className="text-sm text-gray-600">{doubt.subject || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(doubt.status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(doubt.status)}`}>
                    {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
                  </span>
                </div>
              </div>

              {doubt.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{doubt.title}</h4>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-4 mb-4 border border-indigo-100">
                <p className="text-gray-900">{doubt.question}</p>
                <p className="text-xs text-indigo-500 font-medium mt-2">Asked on {formatTime(doubt.createdAt)}</p>
              </div>

              {/* Responses */}
              {doubt.responses && doubt.responses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {doubt.responses.map((response, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-blue-900">{response.author || 'Teacher'}</span>
                        <span className="text-xs text-blue-600 font-medium">{formatTime(response.createdAt)}</span>
                      </div>
                      <p className="text-blue-900">{response.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Response Form */}
              {doubt.status === 'pending' || doubt.status === 'answered' ? (
                <div className="border-t border-gray-200/50 pt-4">
                  {selectedDoubt === doubt._id ? (
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                            rows={4}
                            disabled={responding}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => {
                            setSelectedDoubt(null);
                            setResponseText('');
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          disabled={responding}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendResponse(doubt._id)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={responding}
                        >
                          {responding ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Send Response</span>
                            </>
                          )}
                        </button>
                        {doubt.status === 'answered' && (
                          <button
                            onClick={() => handleResolveDoubt(doubt._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDoubt(doubt._id)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                        <span>Answer This Doubt</span>
                      </button>
                      {doubt.status === 'answered' && (
                        <button
                          onClick={() => handleResolveDoubt(doubt._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : doubt.status === 'resolved' ? (
                <div className="border-t border-gray-200/50 pt-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">This doubt has been resolved</span>
                    </div>
                    {doubt.resolvedAt && (
                      <p className="text-sm text-green-600 mt-2">Resolved on {formatTime(doubt.resolvedAt)}</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {filteredDoubts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No doubts found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No student questions at the moment.'
              : `No ${filter} doubts at the moment.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassDoubts;
