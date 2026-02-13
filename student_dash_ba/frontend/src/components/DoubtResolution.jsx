import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';
import MDEditor from '@uiw/react-md-editor';
import apiService from '../services/api';
import {
  ChatBubbleLeftIcon,
  PaperClipIcon,
  MicrophoneIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BellIcon,
  BookmarkIcon,
  CheckCircleIcon,
  PencilIcon,
  VideoCameraIcon,
  HandThumbUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/24/outline';

const DoubtResolution = () => {
  // Basic state
  const [selectedTab, setSelectedTab] = useState('ask');
  const [selectedMyDoubtsTab, setSelectedMyDoubtsTab] = useState('pending'); // New state for my doubts sub-tabs
  const [isRecording, setIsRecording] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false); // New state for answer modal
  const [selectedAnswer, setSelectedAnswer] = useState(null); // New state for selected answer
  
  // Doubt form state
  const [doubt, setDoubt] = useState('');
  const [doubtTitle, setDoubtTitle] = useState('');
  const [doubtSubject, setDoubtSubject] = useState('mathematics');
  const [doubtTopic, setDoubtTopic] = useState('');
  const [doubtDifficulty, setDoubtDifficulty] = useState('medium');
  
  // Data state
  const [doubts, setDoubts] = useState([]);
  const [pendingDoubts, setPendingDoubts] = useState([]);
  const [completedDoubts, setCompletedDoubts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Notes modal state
  const [showNotes, setShowNotes] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [currentDoubtForNote, setCurrentDoubtForNote] = useState(null);
  
  // Simple mode state
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  // Faculty assignment state
  const [teachers, setTeachers] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    onDrop: (acceptedFiles) => {
      toast.success(`Added ${acceptedFiles.length} file(s)`);
    },
  });

  // Fetch data on component mount and tab change
  useEffect(() => {
    if (selectedTab === 'ask') {
      fetchAllDoubts();
    } else if (selectedTab === 'my doubts') {
      fetchMyDoubts();
    } else if (selectedTab === 'saved notes') {
      fetchNotes();
    }
  }, [selectedTab, searchQuery]);

  // Fetch teachers when on Ask tab
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await apiService.getTeachers();
        if (res.success) {
          const list = res.data?.teachers || res.data || [];
          setTeachers(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error('Error loading teachers', e);
      }
    };
    if (selectedTab === 'ask') {
      fetchTeachers();
      // also load enrolled courses for course dropdown
      (async () => {
        try {
          const res = await apiService.getEnrolledCourses();
          if (res.success) {
            setEnrolledCourses(res.data || []);
          }
        } catch (e) {
          console.error('Error loading courses', e);
        }
      })();
    }
  }, [selectedTab]);

  const fetchAllDoubts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { isPublic: 'true' };
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      console.log('🔄 Fetching all doubts with params:', params);
      const response = await apiService.getDoubts(params);
      console.log('📡 All Doubts API Response:', response);
      
      if (response.success) {
        const doubtsData = response.data.doubts || response.data;
        const doubtsArray = Array.isArray(doubtsData) ? doubtsData : [];
        console.log('✅ Setting all doubts data:', doubtsArray.length, 'doubts');
        setDoubts(doubtsArray);
      } else {
        console.error('❌ API returned error:', response.message);
        setError(response.message || 'Failed to fetch doubts');
        setDoubts([]);
      }
    } catch (err) {
      console.error('❌ Error fetching all doubts:', err);
      setError('Error loading doubts');
      setDoubts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDoubts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { my: 'true' };
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      console.log('🔄 Fetching my doubts with params:', params);
      const response = await apiService.getDoubts(params);
      console.log('📡 My Doubts API Response:', response);
      
      if (response.success) {
        const doubtsData = response.data.doubts || response.data;
        const doubtsArray = Array.isArray(doubtsData) ? doubtsData : [];
        
        // Separate pending and completed doubts
        const pending = doubtsArray.filter(doubt => 
          doubt.status === 'open' || doubt.status === 'answered'
        );
        const completed = doubtsArray.filter(doubt => 
          doubt.status === 'resolved' || doubt.status === 'closed'
        );
        
        console.log('✅ Setting my doubts data:', {
          total: doubtsArray.length,
          pending: pending.length,
          completed: completed.length
        });
        
        setPendingDoubts(pending);
        setCompletedDoubts(completed);
      } else {
        console.error('❌ API returned error:', response.message);
        setError(response.message || 'Failed to fetch doubts');
        setPendingDoubts([]);
        setCompletedDoubts([]);
      }
    } catch (err) {
      console.error('❌ Error fetching my doubts:', err);
      setError('Error loading doubts');
      setPendingDoubts([]);
      setCompletedDoubts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      console.log('🔄 Fetching notes with params:', params);
      const response = await apiService.getNotes(params);
      console.log('📡 Notes API Response:', response);
      
      if (response.success) {
        const notesData = response.data;
        const notesArray = Array.isArray(notesData) ? notesData : [];
        console.log('✅ Setting notes data:', notesArray.length, 'notes');
        setNotes(notesArray);
      } else {
        console.error('❌ API returned error:', response.message);
        setError(response.message || 'Failed to fetch notes');
        setNotes([]);
      }
    } catch (err) {
      console.error('❌ Error fetching notes:', err);
      setError('Error loading notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleAskDoubt('AI');
    }
  };

  const handleAskDoubt = async (type = 'AI') => {
    if (!doubt.trim() || !doubtTitle.trim()) {
      toast.error('Please enter both title and description for your doubt');
      return;
    }

    if (type === 'Faculty' && !selectedFacultyId) {
      toast.error('Please select a faculty to assign your doubt');
      return;
    }

    setIsLoading(true);

    try {
      const doubtData = {
        title: doubtTitle,
        description: doubt,
        subject: doubtSubject,
        topic: doubtTopic,
        difficulty: doubtDifficulty,
        tags: [doubtTopic, doubtSubject].filter(Boolean)
      };

      if (selectedCourseId) {
        doubtData.courseId = selectedCourseId;
      }

      if (type === 'Faculty' && selectedFacultyId) {
        doubtData.assignedTo = selectedFacultyId;
        doubtData.assignmentType = 'faculty';
      }

      const response = await apiService.createDoubt(doubtData);

      if (response.success) {
        // Refresh doubts list based on current tab
        if (selectedTab === 'ask') {
          await fetchAllDoubts();
        } else if (selectedTab === 'my doubts') {
          await fetchMyDoubts();
        }
        
        setDoubt('');
        setDoubtTitle('');
        setDoubtTopic('');
        addNotification(`Your doubt has been submitted successfully!`);
        toast.success(`Your doubt has been submitted!`);
      } else {
        toast.error(response.message || 'Failed to submit doubt');
      }
    } catch (error) {
      console.error('Error submitting doubt:', error);
      toast.error('Failed to submit doubt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim() || !currentDoubtForNote) {
      toast.error('Please fill in all note fields');
      return;
    }

    try {
      const noteData = {
        title: noteTitle,
        content: noteContent,
        doubtId: currentDoubtForNote._id,
        tags: [currentDoubtForNote.subject, currentDoubtForNote.topic].filter(Boolean)
      };

      const response = await apiService.createNote(noteData);

      if (response.success) {
        toast.success('Note saved successfully!');
        setShowNotes(false);
        setNoteTitle('');
        setNoteContent('');
        setCurrentDoubtForNote(null);
        
        // Refresh notes if we're on the saved notes tab
        if (selectedTab === 'saved notes') {
          await fetchNotes();
        }
      } else {
        toast.error(response.message || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note. Please try again.');
    }
  };

  const openNotesModal = (doubt) => {
    setCurrentDoubtForNote(doubt);
    setNoteTitle(`Notes for: ${doubt.title}`);
    setNoteContent('');
    setShowNotes(true);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success('Voice recording started');
    } else {
      toast.success('Voice recording stopped');
    }
  };

  const handleVideoGeneration = (doubt) => {
    setSelectedDoubt(doubt);
    setShowVideo(true);
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markDoubtAsSolved = async (doubtId) => {
    try {
      const response = await apiService.updateDoubtStatus(doubtId, 'resolved');
      
      if (response.success) {
        // Refresh doubts list
        await fetchMyDoubts();
        toast.success('Doubt marked as solved!');
      } else {
        toast.error('Failed to update doubt status');
      }
    } catch (error) {
      console.error('Error updating doubt status:', error);
      toast.error('Failed to update doubt status');
    }
  };

  const handleReaction = async (doubtId, answerId, reactionType) => {
    try {
      const response = await apiService.voteAnswer(doubtId, answerId, reactionType);
      
      if (response.success) {
        // Refresh doubts list
        await fetchAllDoubts();
        toast.success('Reaction recorded!');
      } else {
        toast.error('Failed to record reaction');
      }
    } catch (error) {
      console.error('Error recording reaction:', error);
      toast.error('Failed to record reaction');
    }
  };

  const handleViewAnswer = (doubt, answer) => {
    setSelectedDoubt(doubt);
    setSelectedAnswer(answer);
    setShowAnswerModal(true);
  };

  const handleMarkAsSolved = async (doubtId) => {
    try {
      const response = await apiService.updateDoubtStatus(doubtId, 'resolved');
      
      if (response.success) {
        // Refresh doubts list
        if (selectedTab === 'ask') {
          await fetchAllDoubts();
        } else if (selectedTab === 'my doubts') {
          await fetchMyDoubts();
        }
        toast.success('Doubt marked as solved!');
      } else {
        toast.error('Failed to update doubt status');
      }
    } catch (error) {
      console.error('Error updating doubt status:', error);
      toast.error('Failed to update doubt status');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-80 bg-white rounded-xl shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <div key={notification.id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                <p className="text-sm text-gray-800">{notification.message}</p>
                <span className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 ml-64"> {/* Added ml-64 for sidebar offset */}
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doubt Resolution</h1>
            <p className="text-gray-600">Get instant help with your questions</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <BellIcon className="h-6 w-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['ask', 'my doubts', 'saved notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`${
                    selectedTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Sub-tabs for My Doubts */}
          {selectedTab === 'my doubts' && (
            <div className="mt-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                  {['pending', 'solved'].map((subTab) => (
                    <button
                      key={subTab}
                      onClick={() => setSelectedMyDoubtsTab(subTab)}
                      className={`${
                        selectedMyDoubtsTab === subTab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                    >
                      {subTab.charAt(0).toUpperCase() + subTab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>

        {selectedTab === 'ask' && (
          <div className="space-y-6 mb-24">
            {/* Current Doubt Form Preview */}
            {(doubtTitle || doubt) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Doubt Preview</h3>
                <div className="space-y-3">
                  {doubtTitle && (
                    <div>
                      <span className="font-medium text-blue-800">Title:</span>
                      <p className="text-blue-700">{doubtTitle}</p>
                    </div>
                  )}
                  {doubt && (
                    <div>
                      <span className="font-medium text-blue-800">Description:</span>
                      <p className="text-blue-700">{doubt}</p>
                    </div>
                  )}
                  <div className="flex space-x-4 text-sm text-blue-600">
                    <span>Subject: {doubtSubject}</span>
                    {doubtTopic && <span>Topic: {doubtTopic}</span>}
                    <span>Difficulty: {doubtDifficulty}</span>
                  </div>
                </div>
              </div>
            )}

            {/* All Doubts List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchAllDoubts}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : !Array.isArray(doubts) || doubts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No doubts found. Ask your first question below!</p>
              </div>
            ) : (
              doubts.filter(doubt => doubt.status === 'open' || doubt.status === 'answered').map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm p-6">
                  {/* Question */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {item.askedBy?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-700 mb-2">{item.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{item.subject}</span>
                        <span>•</span>
                        <span>{item.difficulty}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Answers */}
                  {item.answers && item.answers.length > 0 && (
                    <div className="ml-14 space-y-4">
                      {item.answers.map((answer, index) => (
                        <div key={answer._id || index} className="flex items-start space-x-4">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {answer.answeredBy?.fullName?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-600">
                                {answer.answeredBy?.fullName || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {answer.answerType}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(answer.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <MDEditor.Markdown source={answer.content} />
                            
                            {/* Action Buttons */}
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                onClick={() => handleViewAnswer(item, answer)}
                                className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span>View Full Answer</span>
                              </button>
                              
                              <button
                                onClick={() => handleReaction(item._id, answer._id, 'upvote')}
                                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                              >
                                <HandThumbUpIcon className="h-4 w-4" />
                                <span>Helpful ({answer.votes?.upvotes?.length || 0})</span>
                              </button>
                              
                              <button
                                onClick={() => handleVideoGeneration(item)}
                                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                              >
                                <VideoCameraIcon className="h-4 w-4" />
                                <span>Generate Video</span>
                              </button>

                              <button
                                onClick={() => openNotesModal(item)}
                                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span>Take Notes</span>
                              </button>

                              <button
                                onClick={() => handleMarkAsSolved(item._id)}
                                className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                                <span>Mark as Solved</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'my doubts' && (
          <div className="space-y-8 mb-24">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchMyDoubts}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Pending Doubts Section */}
                {selectedMyDoubtsTab === 'pending' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-orange-600">
                      Pending Doubts ({pendingDoubts.length})
                    </h2>
                    {pendingDoubts.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No pending doubts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingDoubts.map((item) => (
                          <div key={item._id} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-400">
                            <div className="flex items-start space-x-4">
                              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-orange-600 font-medium">
                                  {item.askedBy?.fullName?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-700 mb-3">{item.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                  <span>{item.subject}</span>
                                  <span>•</span>
                                  <span>{item.difficulty}</span>
                                  <span>•</span>
                                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    item.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                
                                {/* Show answers if any */}
                                {item.answers && item.answers.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Answers:</h4>
                                    {item.answers.map((answer, index) => (
                                      <div key={answer._id || index} className="mb-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-600">
                                            {answer.answeredBy?.fullName || 'Anonymous'} • {answer.answerType}
                                          </span>
                                          <button
                                            onClick={() => handleViewAnswer(item, answer)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                          >
                                            View Full Answer
                                          </button>
                                        </div>
                                        <p className="text-sm text-gray-700 line-clamp-2">{answer.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => openNotesModal(item)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    <span>Take Notes</span>
                                  </button>
                                  <button
                                    onClick={() => handleMarkAsSolved(item._id)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    <span>Mark as Solved</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Solved Doubts Section */}
                {selectedMyDoubtsTab === 'solved' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-green-600">
                      Solved Doubts ({completedDoubts.length})
                    </h2>
                    {completedDoubts.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No solved doubts</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completedDoubts.map((item) => (
                          <div key={item._id} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
                            <div className="flex items-start space-x-4">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium">
                                  {item.askedBy?.fullName?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-700 mb-3">{item.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                  <span>{item.subject}</span>
                                  <span>•</span>
                                  <span>{item.difficulty}</span>
                                  <span>•</span>
                                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    {item.status}
                                  </span>
                                </div>
                                
                                {/* Show answers for solved doubts */}
                                {item.answers && item.answers.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Answers:</h4>
                                    {item.answers.map((answer, index) => (
                                      <div key={answer._id || index} className="mb-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-600">
                                            {answer.answeredBy?.fullName || 'Anonymous'} • {answer.answerType}
                                          </span>
                                          <button
                                            onClick={() => handleViewAnswer(item, answer)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                          >
                                            View Full Answer
                                          </button>
                                        </div>
                                        <p className="text-sm text-gray-700 line-clamp-2">{answer.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() => openNotesModal(item)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    <span>View Notes</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {selectedTab === 'saved notes' && (
          <div className="space-y-6 mb-24">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchNotes}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : !Array.isArray(notes) || notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <PencilIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Saved Notes Yet</h3>
                  <p className="text-gray-500 mb-4">Take notes on doubts to see them here!</p>
                  <button
                    onClick={() => setSelectedTab('ask')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Browse Doubts
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {notes.map((note) => (
                  <div key={note._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <PencilIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{note.title}</h3>
                        
                        {/* Original Question Reference */}
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1 font-medium">Original Question:</p>
                          <p className="text-gray-800 font-medium text-sm line-clamp-1">{note.doubtTitle}</p>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">{note.doubtDescription}</p>
                        </div>
                        
                        {/* Note Content Preview */}
                        <div className="mb-3">
                          <div className="prose prose-sm max-w-none">
                            <div className="line-clamp-3 text-gray-700">
                              {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </div>
                          </div>
                        </div>
                        
                        {/* Tags and Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{note.subject}</span>
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setCurrentDoubtForNote({
                                  _id: note.doubtId,
                                  title: note.doubtTitle,
                                  description: note.doubtDescription
                                });
                                setNoteTitle(note.title);
                                setNoteContent(note.content);
                                setShowNotes(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this note?')) {
                                  try {
                                    const response = await apiService.deleteNote(note._id);
                                    if (response.success) {
                                      toast.success('Note deleted successfully!');
                                      await fetchNotes(); // Refresh the notes list
                                    } else {
                                      toast.error('Failed to delete note');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting note:', error);
                                    toast.error('Failed to delete note');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {note.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Search Bar at Bottom */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="p-4">
            {/* Doubt Title Input */}
            <div className="mb-3">
              <input
                type="text"
                value={doubtTitle}
                onChange={(e) => setDoubtTitle(e.target.value)}
                placeholder="Doubt title (e.g., Newton's 3rd Law Problem)"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Doubt Description Input */}
            <div className="relative flex items-center mb-3">
              <div className="absolute left-4 flex items-center space-x-2">
                <PaperClipIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
              <input
                type="text"
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your doubt clearly (e.g., I don't understand how to apply Newton's 3rd law in this problem...)"
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleVoiceInput}
                className={`absolute right-4 p-2 rounded-full ${
                  isRecording ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <select
                value={doubtSubject}
                onChange={(e) => setDoubtSubject(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="english">English</option>
                <option value="history">History</option>
                <option value="computer-science">Computer Science</option>
              </select>
              
              <input
                type="text"
                value={doubtTopic}
                onChange={(e) => setDoubtTopic(e.target.value)}
                placeholder="Topic (e.g., Calculus, Mechanics)"
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              <select
                value={doubtDifficulty}
                onChange={(e) => setDoubtDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {/* Course selector (enrolled courses) */}
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-3"
              >
                <option value="">Select course (optional)</option>
                {enrolledCourses.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {/* Faculty selector (optional) */}
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-3"
              >
                <option value="">Select faculty (for Ask Faculty)</option>
                {teachers.map(t => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.fullName || t.name || t.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={() => handleAskDoubt('AI')}
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Submitting...' : 'Ask AI'}
                </button>
                <button
                  onClick={() => handleAskDoubt('Faculty')}
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Submitting...' : 'Ask Faculty'}
                </button>
                <button
                  onClick={() => handleAskDoubt('Community')}
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Submitting...' : 'Ask Community'}
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isSimpleMode}
                    onChange={() => setIsSimpleMode(!isSimpleMode)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Simple Explanation Mode</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && selectedDoubt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Video Explanation</h3>
              <button
                onClick={() => setShowVideo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=example"
                  width="100%"
                  height="100%"
                  controls
                  playing
                />
              </div>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <PencilIcon className="h-5 w-5" />
                  <span>Take Notes</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <BookmarkIcon className="h-5 w-5" />
                  <span>Save to Library</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotes && currentDoubtForNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Take Notes</h3>
                <p className="text-sm text-gray-600">For: {currentDoubtForNote.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowNotes(false);
                  setCurrentDoubtForNote(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              {/* Original Question Reference */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Original Question:</p>
                <p className="text-gray-800 font-medium">{currentDoubtForNote.title}</p>
                <p className="text-gray-600 text-sm mt-1">{currentDoubtForNote.description}</p>
              </div>
              
              {/* Note Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter a title for your notes..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* Note Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Notes
                </label>
                <MDEditor
                  value={noteContent}
                  onChange={setNoteContent}
                  preview="edit"
                  height={300}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNotes(false);
                    setCurrentDoubtForNote(null);
                    setNoteTitle('');
                    setNoteContent('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Answer Modal */}
      {showAnswerModal && selectedDoubt && selectedAnswer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-semibold">Detailed Answer</h3>
                <p className="text-sm text-gray-600">Question: {selectedDoubt.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowAnswerModal(false);
                  setSelectedDoubt(null);
                  setSelectedAnswer(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Original Question */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Original Question</h4>
                <p className="text-blue-800 font-medium mb-2">{selectedDoubt.title}</p>
                <p className="text-blue-700 mb-3">{selectedDoubt.description}</p>
                <div className="flex items-center space-x-4 text-sm text-blue-600">
                  <span>Subject: {selectedDoubt.subject}</span>
                  <span>•</span>
                  <span>Difficulty: {selectedDoubt.difficulty}</span>
                  <span>•</span>
                  <span>Asked: {new Date(selectedDoubt.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Answer Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {selectedAnswer.answeredBy?.fullName?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedAnswer.answeredBy?.fullName || 'Anonymous'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedAnswer.answerType} • {new Date(selectedAnswer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {selectedAnswer.votes?.upvotes?.length || 0} helpful votes
                    </span>
                    <button
                      onClick={() => handleReaction(selectedDoubt._id, selectedAnswer._id, 'upvote')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span>Helpful</span>
                    </button>
                  </div>
                </div>

                {/* Answer Content */}
                <div className="prose max-w-none">
                  <MDEditor.Markdown source={selectedAnswer.content} />
                </div>

                {/* Answer Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => openNotesModal(selectedDoubt)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Take Notes</span>
                  </button>
                  
                  <button
                    onClick={() => handleVideoGeneration(selectedDoubt)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <VideoCameraIcon className="h-4 w-4" />
                    <span>Generate Video</span>
                  </button>
                  
                  <button
                    onClick={() => handleMarkAsSolved(selectedDoubt._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Mark as Solved</span>
                  </button>
                </div>
              </div>

              {/* Other Answers */}
              {selectedDoubt.answers && selectedDoubt.answers.length > 1 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-4">Other Answers</h4>
                  <div className="space-y-4">
                    {selectedDoubt.answers
                      .filter(answer => answer._id !== selectedAnswer._id)
                      .map((answer, index) => (
                        <div key={answer._id || index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">
                                {answer.answeredBy?.fullName || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{answer.answerType}</span>
                            </div>
                            <button
                              onClick={() => setSelectedAnswer(answer)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View This Answer
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">{answer.content}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtResolution;