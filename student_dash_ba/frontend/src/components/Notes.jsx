import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import {
  DocumentTextIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookOpenIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const Notes = () => {
  const [activeTab, setActiveTab] = useState('teacher-notes');
  const [activeSubject, setActiveSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data
  const [teacherNotes, setTeacherNotes] = useState([]);
  const [myNotes, setMyNotes] = useState([]); // Will represent user's saved notes from "collections"
  
  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', subject: '' });

  useEffect(() => {
    fetchNotesData();
  }, []);

  const fetchNotesData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Student's classes to get classIds
      const classesRes = await apiService.getStudentClasses();
      const classes = classesRes.data || [];
      
      // 2. Fetch Teacher Notes for each class
      let allTeacherNotes = [];
      for (const cls of classes) {
        try {
          // Using the new teacher backend endpoint
          const res = await apiService.getStudentNotesFromTeacher(cls._id || cls.classId);
          if (res.success && res.data) {
            allTeacherNotes = [...allTeacherNotes, ...res.data];
          }
        } catch (err) {
          console.error('Error fetching teacher notes for class', cls.name, err);
        }
      }
      
      // Remove duplicates in case a note is linked to multiple classes the student is in
      const uniqueTeacherNotes = Array.from(new Map(allTeacherNotes.map(n => [n._id, n])).values());
      setTeacherNotes(uniqueTeacherNotes);
      
      // 3. Fetch Student's Personal Collections (User Notes)
      try {
        const notesRes = await apiService.getNotes();
        if (notesRes.success && notesRes.data) {
          setMyNotes(notesRes.data);
        }
      } catch (err) {
        console.error('Error fetching personal notes', err);
      }

    } catch (err) {
      console.error('Error in fetchNotesData:', err);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast.error('Title and content are required');
      return;
    }
    
    try {
      const res = await apiService.createNote({
        title: newNote.title,
        content: newNote.content,
        subject: newNote.subject || 'General'
      });
      
      if (res.success) {
        toast.success('Note successfully saved!');
        setMyNotes([res.data, ...myNotes]);
        setShowModal(false);
        setNewNote({ title: '', content: '', subject: '' });
      }
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <div className="animate-spin text-4xl mb-4">📚</div>
      </div>
    );
  }

  const currentNotes = activeTab === 'teacher-notes' ? teacherNotes : myNotes;
  const filteredNotes = currentNotes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subjectName?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === 'my-notes' && activeSubject !== 'All') {
      const noteSubject = note.subject || note.subjectName || 'General';
      return matchesSearch && noteSubject === activeSubject;
    }
    return matchesSearch;
  });

  const uniqueSubjects = activeTab === 'my-notes' 
    ? [...new Set(myNotes.map(n => n.subject || n.subjectName || 'General'))] 
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Notes Hub</h1>
          <p className="text-gray-600">Access teacher-provided materials and your personal study notes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Write Note</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('teacher-notes')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'teacher-notes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BookOpenIcon className="h-5 w-5 text-indigo-600" />
            <span>Class Notes (From Teachers)</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold w-6 h-6 flex items-center justify-center">{teacherNotes.length}</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('my-notes'); setActiveSubject('All'); }}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'my-notes'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PencilIcon className="h-5 w-5 text-purple-600" />
            <span>My Personal Notes</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold w-6 h-6 flex items-center justify-center">{myNotes.length}</span>
          </button>
        </nav>
      </div>

      {/* Subject Sub-tabs for My Notes */}
      {activeTab === 'my-notes' && uniqueSubjects.length > 0 && (
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveSubject('All')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeSubject === 'All' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            All Subjects
          </button>
          {uniqueSubjects.map((subj, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSubject(subj)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeSubject === subj 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              {subj} Notes
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-8">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab === 'teacher-notes' ? 'teacher notes' : 'personal notes'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {activeTab === 'teacher-notes' 
              ? "Your teachers haven't published any notes to your classes yet, or none match your search." 
              : "You haven't created any personal notes yet, or none match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div key={note.id || note._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  activeTab === 'teacher-notes' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                }`}>
                  {note.subject || note.subjectName || 'General'}
                </span>
                {activeTab === 'teacher-notes' && note.teacher && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">By: {note.teacher.name}</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {note.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 h-16 relative">
                {note.content}
                <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-xs text-gray-400 font-medium">
                  <BookOpenIcon className="w-4 h-4 mr-1" />
                  Read Full Note
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.createdAt || note.dateAdded || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Personal Note</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Title</label>
                <input 
                  type="text" 
                  value={newNote.title} 
                  onChange={e => setNewNote({...newNote, title: e.target.value})} 
                  placeholder="e.g., Important Formulas for Midterm"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject/Topic</label>
                <input 
                  type="text" 
                  value={newNote.subject} 
                  onChange={e => setNewNote({...newNote, subject: e.target.value})} 
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Content</label>
                <textarea 
                  rows={6} 
                  value={newNote.content} 
                  onChange={e => setNewNote({...newNote, content: e.target.value})} 
                  placeholder="Start typing your notes here..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none" 
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNote} 
                className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
