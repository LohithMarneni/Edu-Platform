import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import {
  PencilIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const VideoPlayer = () => {
  const { topicId } = useParams();
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);
  const [showSavedNotes, setShowSavedNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved notes when component mounts
  useEffect(() => {
    loadSavedNotes();
  }, [topicId]);

  const loadSavedNotes = async () => {
    try {
      const response = await fetch(`/api/videos/${topicId}/notes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.data.notes || []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTakeNote = () => {
    setShowNoteInput(true);
    setPlaying(false);
  };

  const handleSaveNote = async () => {
    if (noteText.trim()) {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/videos/${topicId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            topicId,
            timestamp: currentTime,
            content: noteText,
            formattedTime: formatTime(currentTime)
          })
        });

        if (response.ok) {
          const data = await response.json();
          setNotes([...notes, data.data.note]);
          setNoteText('');
          setShowNoteInput(false);
          toast.success('Note saved successfully!');
        } else {
          throw new Error('Failed to save note');
        }
      } catch (error) {
        console.error('Error saving note:', error);
        toast.error('Failed to save note. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(`/api/videos/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotes(notes.filter(note => note._id !== noteId));
        toast.success('Note deleted successfully!');
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note. Please try again.');
    }
  };

  const handleJumpToTimestamp = (timestamp) => {
    playerRef.current.seekTo(timestamp);
    setPlaying(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-8">
        {/* Video Player Section */}
        <div className="col-span-2">
          <div className="bg-black rounded-xl overflow-hidden">
            <ReactPlayer
              ref={playerRef}
              url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              width="100%"
              height="500px"
              playing={playing}
              controls={true}
              onProgress={handleProgress}
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleTakeNote}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <PencilIcon className="h-5 w-5" />
              <span>Take Notes</span>
            </button>
            <button
              onClick={() => setShowSavedNotes(!showSavedNotes)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <ClockIcon className="h-5 w-5" />
              <span>Saved Notes</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <QuestionMarkCircleIcon className="h-5 w-5" />
              <span>Ask Doubt</span>
            </button>
          </div>
        </div>

        {/* Notes Section */}
        <div className="col-span-1">
          {showNoteInput && (
            <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Take Note</h3>
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Timestamp: {formatTime(currentTime)}
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Type your note here..."
                ></textarea>
              </div>
              <button
                onClick={handleSaveNote}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          )}

          {showSavedNotes && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Saved Notes</h3>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => handleJumpToTimestamp(note.timestamp)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 mb-2"
                    >
                      {note.formattedTime}
                    </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-gray-500 text-center">No notes saved yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;