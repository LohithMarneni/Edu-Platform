import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Clock, CheckCircle, User, Send, Search, Brain, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, X, Trash2 } from 'lucide-react';
import apiService from '../services/api';

const TEACHER_BASE = 'http://localhost:5001/api';

const Doubts = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [expandedDoubt, setExpandedDoubt] = useState(null);
  const [expandedCreateNote, setExpandedCreateNote] = useState(null);
  const [responseText, setResponseText] = useState('');
  
  // Note Creation States
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState('');
  const [toast, setToast] = useState(null);
  const responseInputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${TEACHER_BASE}/doubts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDoubts(data.data || []);
    } catch (err) {
      console.error('Failed to load doubts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await apiService.getClasses();
      if (res.success) setClasses(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchDoubts();
    fetchClasses();
  }, []);

  // Auto-scroll to response box when expanded
  useEffect(() => {
    if (expandedDoubt && responseInputRef.current) {
      setTimeout(() => responseInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [expandedDoubt]);

  const handleSendResponse = async (doubtId) => {
    if (!responseText.trim()) return;
    setSending(doubtId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${TEACHER_BASE}/doubts/${doubtId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: responseText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setDoubts(prev => prev.map(d => d._id === doubtId ? data.data : d));
        setResponseText('');
        setExpandedDoubt(null);
        showToast('Response sent successfully!');
      } else {
        showToast(data.message || 'Failed to send', 'error');
      }
    } catch (err) {
      showToast('Failed to send response', 'error');
    } finally {
      setSending('');
    }
  };

  const handleCreateNoteFromDoubt = async (doubt) => {
    if (!noteTitle.trim() || !noteSubject.trim() || !noteContent.trim()) {
      showToast('Title, Subject, and Content are required', 'error');
      return;
    }
    setSending(`note-${doubt._id}`);
    try {
      const token = localStorage.getItem('token');
      const classId = doubt.class?._id;
      
      const payload = {
        title: noteTitle,
        content: noteContent,
        subject: noteSubject,
        linkedClasses: classId ? [classId] : []
      };

      const res = await fetch(`${TEACHER_BASE}/teacher-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setExpandedCreateNote(null);
        setNoteTitle('');
        setNoteSubject('');
        setNoteContent('');
        showToast('Official Note published to class!');
      } else {
        showToast(data.message || 'Failed to create note', 'error');
      }
    } catch (err) {
      showToast('Failed to create note', 'error');
    } finally {
      setSending('');
    }
  };

  const handleDelete = async (doubtId) => {
    if (!window.confirm('Delete this resolved doubt? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${TEACHER_BASE}/doubts/${doubtId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDoubts(prev => prev.filter(d => d._id !== doubtId));
        showToast('Doubt deleted');
      } else {
        showToast(data.message || 'Cannot delete', 'error');
      }
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const filteredDoubts = doubts.filter(d => {
    const matchStatus = filter === 'all' || d.status === filter;
    const matchClass = selectedClass === 'all' || d.class?._id === selectedClass;
    const matchSearch = !searchTerm ||
      d.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchClass && matchSearch;
  });

  const statusColor = { pending: 'bg-amber-100 text-amber-700 border-amber-200', answered: 'bg-emerald-100 text-emerald-700 border-emerald-200', resolved: 'bg-blue-100 text-blue-700 border-blue-200', closed: 'bg-gray-100 text-gray-700 border-gray-200' };
  const priorityColor = { high: 'bg-red-100 text-red-700', urgent: 'bg-red-200 text-red-900', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
  const categoryEmoji = { concept: '💡', homework: '📚', assignment: '📝', exam: '📋', general: '❓' };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts), now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const stats = [
    { label: 'Total', value: doubts.length, icon: MessageCircle, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Pending', value: doubts.filter(d => d.status === 'pending').length, icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Answered', value: doubts.filter(d => d.status === 'answered').length, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'High Priority', value: doubts.filter(d => d.priority === 'high' || d.priority === 'urgent').length, icon: AlertTriangle, color: 'bg-red-50 text-red-700 border-red-200' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Doubt Resolution</h1>
              <p className="text-gray-500">Answer student questions and resolve their doubts</p>
            </div>
            <button onClick={fetchDoubts} className="mt-4 lg:mt-0 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 font-medium transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search by student, subject, question..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="pending">🕐 Pending</option>
              <option value="answered">✅ Answered</option>
              <option value="resolved">🎉 Resolved</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className={`rounded-xl p-4 border-2 ${s.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-80">{s.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{s.value}</p>
                  </div>
                  <s.icon className="w-6 h-6 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doubts List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filteredDoubts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No doubts found</h3>
            <p className="text-gray-500 text-sm">{searchTerm ? 'Try different search terms.' : 'No student questions yet!'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoubts.map(doubt => (
              <div key={doubt._id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 ${doubt.status === 'pending' ? 'border-amber-200' : doubt.status === 'answered' ? 'border-emerald-200' : 'border-gray-200'}`}>
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {doubt.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{doubt.student?.name || 'Student'}</span>
                          <span className="text-gray-400 text-xs">•</span>
                          <span className="text-gray-500 text-xs">{doubt.class?.name || 'Unknown Class'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-medium text-blue-600">{doubt.subject}</span>
                          {doubt.category && <span className="text-xs text-gray-400">• {categoryEmoji[doubt.category]} {doubt.category}</span>}
                          <span className="text-xs text-gray-400">• {formatTime(doubt.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColor[doubt.priority] || priorityColor.medium}`}>{doubt.priority?.toUpperCase()}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[doubt.status] || statusColor.pending}`}>
                        {doubt.status === 'pending' ? '🕐 Pending' : doubt.status === 'answered' ? '✅ Answered' : doubt.status === 'resolved' ? '🎉 Resolved' : doubt.status}
                      </span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{doubt.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{doubt.question}</p>
                  </div>

                  {/* Responses Thread */}
                  {doubt.responses?.length > 0 && (
                    <div className="space-y-3 mb-4 ml-2 pl-4 border-l-2 border-gray-100">
                      {doubt.responses.map((r, i) => (
                        <div key={r._id || i} className={`rounded-xl p-3.5 ${r.authorType === 'teacher' ? 'bg-blue-50 border border-blue-100' : 'bg-purple-50 border border-purple-100'}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.authorType === 'teacher' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                              {r.authorType === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'}
                            </span>
                            <span className="text-xs text-gray-500">{r.author}</span>
                            <span className="text-xs text-gray-400 ml-auto">{formatTime(r.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    {doubt.status !== 'resolved' && (
                      <>
                        <button
                          onClick={() => { setExpandedDoubt(expandedDoubt === doubt._id ? null : doubt._id); setResponseText(''); setExpandedCreateNote(null); }}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {expandedDoubt === doubt._id ? 'Cancel' : 'Reply'}
                        </button>
                        <button
                          onClick={() => { setExpandedCreateNote(expandedCreateNote === doubt._id ? null : doubt._id); setExpandedDoubt(null); setNoteTitle(doubt.title); setNoteSubject(doubt.subject); setNoteContent(''); }}
                          className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-200 transition-colors font-medium text-sm"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          {expandedCreateNote === doubt._id ? 'Cancel Note' : 'Create Note From Doubt'}
                        </button>
                      </>
                    )}
                    {/* Teacher can only delete resolved doubts */}
                    {doubt.status === 'resolved' && (
                      <button
                        onClick={() => handleDelete(doubt._id)}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                    <div className="ml-auto text-xs text-gray-400">{doubt.views || 0} views • {doubt.responses?.length || 0} replies</div>
                  </div>

                  {/* Reply Box */}
                  {expandedDoubt === doubt._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200" ref={responseInputRef}>
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Reply</p>
                      <textarea
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        placeholder="Type your response to the student..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-3 mt-3">
                        <button onClick={() => setExpandedDoubt(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Cancel</button>
                        <button
                          onClick={() => handleSendResponse(doubt._id)}
                          disabled={!responseText.trim() || sending === doubt._id}
                          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-semibold"
                        >
                          {sending === doubt._id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Send Response
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Create Note Box */}
                  {expandedCreateNote === doubt._id && (
                    <div className="mt-4 pt-4 border-t border-purple-200 bg-purple-50/50 p-4 rounded-xl">
                      <p className="text-sm font-bold text-purple-900 mb-4 flex items-center"><Brain className="w-4 h-4 mr-2"/> Publish an Official Note to Class</p>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={e => setNoteTitle(e.target.value)}
                          placeholder="Note Title"
                          className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <select
                          value={noteSubject}
                          onChange={e => setNoteSubject(e.target.value)}
                          className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                        >
                          <option value="">Select from your courses...</option>
                          {[...new Set(classes.map(c => c.subject || c.name))].map((subj, idx) => (
                            <option key={idx} value={subj}>{subj}</option>
                          ))}
                        </select>
                        <textarea
                          value={noteContent}
                          onChange={e => setNoteContent(e.target.value)}
                          placeholder="Type out the class note based on this doubt..."
                          rows={5}
                          className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-3 mt-3">
                        <button onClick={() => setExpandedCreateNote(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Cancel</button>
                        <button
                          onClick={() => handleCreateNoteFromDoubt(doubt)}
                          disabled={!noteTitle || !noteContent || sending === `note-${doubt._id}`}
                          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-semibold"
                        >
                          {sending === `note-${doubt._id}` ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Publish Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doubts;