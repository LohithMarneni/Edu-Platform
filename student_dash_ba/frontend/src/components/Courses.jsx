import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import {
  PlayCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  ClockIcon,
  KeyIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import CourseMaterials from './CourseMaterials';

// This will be replaced with data from API

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Map API response to course cards
  const mapClassEntriesToCourses = (classEntries) => {
    return (classEntries || []).map((entry, index) => {
      const cls = entry.class || entry;
      const subject = cls.subject || 'Class';
      const grade = cls.grade ? ` • Grade ${cls.grade}` : '';
      const subjectColors = {
        Mathematics: { color: 'bg-indigo-50', borderColor: 'border-indigo-100', iconColor: 'text-indigo-600' },
        Science:     { color: 'bg-emerald-50', borderColor: 'border-emerald-100', iconColor: 'text-emerald-600' },
        Physics:     { color: 'bg-violet-50', borderColor: 'border-violet-100', iconColor: 'text-violet-600' },
        Chemistry:   { color: 'bg-cyan-50', borderColor: 'border-cyan-100', iconColor: 'text-cyan-600' },
        English:     { color: 'bg-amber-50', borderColor: 'border-amber-100', iconColor: 'text-amber-600' },
      };
      const colors = subjectColors[subject] || { color: 'bg-sky-50', borderColor: 'border-sky-100', iconColor: 'text-sky-600' };
      return {
        _id: cls._id || entry._id || `class_${index}`,
        classId: cls._id,
        name: cls.name || 'Class',
        description: `${subject}${grade}`,
        subject,
        totalLessons: 0,
        progress: { overallProgress: 0, completedLessons: 0 },
        icon: '📘',
        color: colors.color,
        borderColor: colors.borderColor,
        iconColor: colors.iconColor,
      };
    });
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStudentClasses();
      if (response.success) {
        const classEntries = response.data || [];
        setCourses(mapClassEntriesToCourses(classEntries));
      } else {
        setError(response.message || 'Failed to fetch classes');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Error loading classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleBackClick = () => {
    setSelectedCourse(null);
  };

  const navigateToResource = (topicId, type) => {
    navigate(`/courses/topic/${topicId}/${type}`);
  };

  // Function to join class by code
  const joinClassByCode = async () => {
    const code = (classCode || '').trim().toUpperCase().replace(/\s/g, '');
    if (!code) {
      toast.error('Please enter a class code');
      return;
    }

    try {
      const response = await apiService.joinClassByCode(code);
      
      if (response.success) {
        toast.success('Successfully joined the class! 🎉');
        setJoinSuccess(true);
        setTimeout(() => {
          setShowJoinModal(false);
          setJoinSuccess(false);
          setClassCode('');
          fetchCourses();
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to join class');
      }
    } catch (error) {
      console.error('Error joining class:', error);
      // Show detailed error message
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        const errorMessages = error.errors.map(err => 
          typeof err === 'string' ? err : err.message || err.msg
        ).join(', ');
        toast.error(errorMessages || error.message || 'Error joining class');
      } else {
        toast.error(error.message || 'Error joining class. Please check the code and try again.');
      }
    }
  };

  // Grid View
  const CourseGrid = () => {
    console.log('🎨 CourseGrid rendering with:', { loading, error, coursesCount: courses.length });
    
    if (loading) {
      console.log('⏳ Showing loading state');
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (error) {
      console.log('❌ Showing error state:', error);
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (courses.length === 0) {
      console.log('📭 Showing empty state - no courses');
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No courses found. Join a class to get started!</p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Join Class by Code
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const progress = course.progress?.overallProgress || 0;
          const completedLessons = course.progress?.completedLessons || 0;
          const totalLessons = course.totalLessons || 0;
          
          return (
            <div
              key={course._id}
              onClick={() => handleCourseClick(course)}
              className={`${course.color} border ${course.borderColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{course.icon}</span>
                <div className={`${course.iconColor} bg-white rounded-full p-2`}>
                  <BookOpenIcon className="h-6 w-6" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              
              {/* Progress removed as per user request */}
            </div>
          );
        })}
      </div>
    );
  };

  // Course Detail View
  const CourseDetail = ({ course }) => {
    const progress = course.progress?.overallProgress || 0;
    const completedLessons = course.progress?.completedLessons || 0;
    const totalLessons = course.totalLessons || 0;
    const [materialsCount, setMaterialsCount] = useState(0);

    useEffect(() => {
      setMaterialsCount(0);
    }, [course?._id]);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{course.name}</h2>
            <p className="text-gray-600">{course.description}</p>
          </div>
        </div>

        {/* Progress stats removed as per user request */}

        {/* Unified Course Content View */}
        <CourseMaterials
          course={course}
          onCountChange={setMaterialsCount}
          navigateToResource={navigateToResource}
        />
      </div>
    );
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <KeyIcon className="h-5 w-5" />
          <span>Join Class by Code</span>
        </button>
      </div>

      {selectedCourse ? (
        <CourseDetail course={selectedCourse} />
      ) : (
        <CourseGrid />
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            {!joinSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Class</h3>
                  <p className="text-gray-600">Enter the class code provided by your teacher</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Code</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                      placeholder="Enter class code"
                      maxLength={6}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={joinClassByCode}
                      disabled={classCode.length !== 6}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Join Class
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">You have successfully joined the class</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;