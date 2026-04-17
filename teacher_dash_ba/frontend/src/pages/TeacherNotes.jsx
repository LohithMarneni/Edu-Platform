import React, { useState, useEffect } from 'react';
import { FileText, Plus, ExternalLink, Link as LinkIcon, Trash2, Edit } from 'lucide-react';
import apiService from '../services/api';

const TeacherNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', content: '' });
  const [activeSubject, setActiveSubject] = useState('All');
  const [classes, setClasses] = useState([]);
  const [linkModal, setLinkModal] = useState({ show: false, noteId: null, selectedClasses: [] });

  useEffect(() => {
    fetchNotes();
    fetchClasses();
  }, [activeSubject]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const url = activeSubject !== 'All' ? `/teacher-notes?subject=${activeSubject}` : '/teacher-notes';
      const res = await apiService.get(url);
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await apiService.getClasses();
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const subjects = ['All', ...new Set(notes.map(n => n.subject).filter(Boolean))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await apiService.put(`/teacher-notes/${formData.id}`, formData);
      } else {
        await apiService.post('/teacher-notes', formData);
      }
      setShowModal(false);
      setFormData({ title: '', subject: '', content: '' });
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert('Error saving note');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await apiService.delete(`/teacher-notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkNote = async () => {
    try {
      await apiService.put(`/teacher-notes/${linkModal.noteId}`, {
        linkedClasses: linkModal.selectedClasses
      });
      setLinkModal({ show: false, noteId: null, selectedClasses: [] });
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert('Error linking to classes');
    }
  };

  const toggleClassLink = (classId) => {
    setLinkModal(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes Library</h1>
          <p className="text-gray-500">Manage your standalone notes and publish them to courses.</p>
        </div>
        <button
          onClick={() => { setFormData({ title: '', subject: '', content: '' }); setShowModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="flex gap-2 pb-4 overflow-x-auto">
        {subjects.map(subj => (
          <button
            key={subj}
            onClick={() => setActiveSubject(subj)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
              activeSubject === subj 
                ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            } border`}
          >
            {subj}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No notes yet</h3>
          <p className="text-gray-500">Create your first standalone note to share with classes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{note.subject}</span>
                <div className="flex space-x-2">
                  <button onClick={() => {
                    setLinkModal({ show: true, noteId: note._id, selectedClasses: note.linkedClasses.map(c => c._id || c) });
                  }} className="text-gray-400 hover:text-indigo-600" title="Link to Course">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => {
                    setFormData({ id: note._id, title: note.title, subject: note.subject, content: note.content });
                    setShowModal(true);
                  }} className="text-gray-400 hover:text-green-600" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(note._id)} className="text-gray-400 hover:text-red-600" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{note.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">{note.content}</p>
              
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Linked Classes:</p>
                {note.linkedClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {note.linkedClasses.map(c => (
                      <span key={c._id} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-orange-500 italic">Not linked to any class</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{formData.id ? 'Edit Note' : 'Create Note'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Course</label>
                  <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="">Select from your courses...</option>
                    {[...new Set(classes.map(c => c.subject || c.name))].map((subj, idx) => (
                      <option key={idx} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea required rows={8} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link to Class Modal */}
      {linkModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Note to Classes</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {classes.length === 0 ? <p className="text-sm text-gray-500">No classes found.</p> : classes.map(c => (
                <label key={c._id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={linkModal.selectedClasses.includes(c._id)}
                    onChange={() => toggleClassLink(c._id)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.subject} • {c.grade}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setLinkModal({ show: false, noteId: null, selectedClasses: [] })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleLinkNote} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Links</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherNotes;
