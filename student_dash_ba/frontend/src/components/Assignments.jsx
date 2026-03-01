import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUpIcon, ChevronDownIcon, ClockIcon, DocumentTextIcon, CalendarIcon, ArrowRightIcon, XMarkIcon, PaperClipIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

const Assignments = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState({});
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [statistics, setStatistics] = useState({
    averageScore: 0,
    completed: 0,
    pending: 0
  });

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        // Get student email from localStorage
        let studentEmail = '';
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          studentEmail = user.email || '';
        } catch {}

        // Fetch from both backends in parallel
        const [studentRes, teacherRes] = await Promise.allSettled([
          apiService.getAssessments(),
          studentEmail ? apiService.getStudentAssignmentsFromTeacher(studentEmail) : Promise.resolve({ success: false, data: {} })
        ]);

        let mergedSubjects = {};

        // Merge student backend assessments
        if (studentRes.status === 'fulfilled' && studentRes.value?.success) {
          mergedSubjects = { ...studentRes.value.data };
        }

        // Merge Q&A assignments from teacher backend
        if (teacherRes.status === 'fulfilled' && teacherRes.value?.success) {
          const teacherData = teacherRes.value.data || {};
          Object.entries(teacherData).forEach(([subject, assList]) => {
            if (!mergedSubjects[subject]) mergedSubjects[subject] = [];
            // Only add teacher assignments not already present
            assList.forEach(ta => {
              const exists = mergedSubjects[subject].some(sa => sa._id === ta._id);
              if (!exists) mergedSubjects[subject].push({ ...ta, fromTeacher: true });
            });
          });
        }

        setSubjects(mergedSubjects);

        // Calculate statistics
        const allAssignments = Object.values(mergedSubjects).flat();
        const completedCount = allAssignments.filter(a => a.studentStatus === 'submitted' || a.studentStatus === 'graded').length;
        const pendingCount = allAssignments.filter(a => a.studentStatus === 'pending').length;
        const gradedAssignments = allAssignments.filter(a => a.studentSubmission?.score !== undefined);
        const avgScore = gradedAssignments.length > 0
          ? Math.round(gradedAssignments.reduce((sum, a) => sum + (Number(a.studentSubmission.score) / Number(a.totalMarks) * 100), 0) / gradedAssignments.length)
          : 0;

        setStatistics({ averageScore: avgScore || 0, completed: completedCount, pending: pendingCount });
      } catch (error) {
        console.error('❌ Error fetching assignments:', error);
        setSubjects({});
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const toggleSubject = (subjectName) => {
    setExpandedSubject(expandedSubject === subjectName ? null : subjectName);
  };

  const openDetail = (subject, assignment) => {
    setSelectedAssignment({ ...assignment, subject });
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedAssignment(null);
  };

  const addDraft = () => {
    if (!selectedAssignment) return;
    setDrafts(prev => [{ id: Date.now(), assignmentId: selectedAssignment.id, name: `Draft_${Date.now()}.md`, time: new Date().toLocaleString() }, ...prev]);
  };

  const addUpload = () => {
    if (!selectedAssignment) return;
    setUploads(prev => [{ id: Date.now(), assignmentId: selectedAssignment.id, name: `Submission_${Date.now()}.pdf`, time: new Date().toLocaleString() }, ...prev]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">Track your progress across different subjects</p>
      </div>

      {/* Subject Cards */}
      <div className="space-y-4 mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : Object.keys(subjects).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No assignments found. Check back later!</p>
          </div>
        ) : (
          Object.entries(subjects).map(([subjectName, subjectAssignments]) => (
            <div key={subjectName} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Subject Header */}
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSubject(subjectName)}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{subjectName}</h2>
                    <p className="text-sm text-gray-600">
                      {subjectAssignments.filter(a => a.studentStatus === 'submitted').length} of {subjectAssignments.length} assignments completed
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  {expandedSubject === subjectName ? (
                    <ChevronUpIcon className="h-6 w-6" />
                  ) : (
                    <ChevronDownIcon className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Assignment List */}
              {expandedSubject === subjectName && (
                <div className="border-t border-gray-200">
                  {subjectAssignments.map((assignment) => (
                    <div
                      key={assignment._id || assignment.id}
                      className="p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        const id = assignment._id || assignment.id;
                        if (!id) return;
                        navigate(`/assignment/${id}`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              assignment.studentStatus === 'graded'
                                ? 'bg-emerald-100 text-emerald-800'
                                : assignment.studentStatus === 'submitted' || assignment.studentStatus === 'graded'
                                ? 'bg-green-100 text-green-800' 
                                : assignment.studentStatus === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.studentStatus === 'graded' ? '⭐ Graded' :
                               assignment.studentStatus === 'submitted' ? 'Submitted' : 
                               assignment.studentStatus === 'draft' ? 'Draft' : 'Pending'}
                            </span>
                            {(assignment.assignmentType === 'qa' || (assignment.questions && assignment.questions.length > 0)) && (() => {
                              const typeEmoji = { Quiz: '🧠', Homework: '📘', Project: '🔬', Exam: '📝', Assignment: '📄' };
                              const typeBadge = { Quiz: 'bg-violet-100 text-violet-700', Homework: 'bg-blue-100 text-blue-700', Project: 'bg-emerald-100 text-emerald-700', Exam: 'bg-red-100 text-red-700', Assignment: 'bg-indigo-100 text-indigo-700' };
                              const t = assignment.type || 'Assignment';
                              return <span className={`px-2 py-0.5 ${typeBadge[t] || typeBadge.Assignment} text-xs font-semibold rounded-full`}>{typeEmoji[t] || '📄'} {t}</span>;
                            })()}
                            {assignment.studentSubmission?.score !== undefined && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                ⭐ {assignment.studentSubmission.score}/{assignment.totalMarks}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DocumentTextIcon className="h-4 w-4" />
                              <span>{assignment.points} points</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{assignment.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {assignment.studentStatus === 'submitted' ? (
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200" onClick={(e) => { e.stopPropagation(); navigate(`/assignment/${assignment._id}`); }}>
                              Review
                            </button>
                          ) : (
                            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); navigate(`/assignment/${assignment._id}`); }}>
                              Start
                            </button>
                          )}
                          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
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

      {/* Statistics Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Assignment Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {statistics.averageScore}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {statistics.completed}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {statistics.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>

      {/* Detail Drawer / Modal */}
      {showDetail && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-600">{selectedAssignment.subject} • Due {new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
              </div>
              <button onClick={closeDetail} className="p-2 rounded-lg hover:bg-gray-100">
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-auto">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-2">Description</h4>
                <p className="text-indigo-900/90">{selectedAssignment.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center"><DocumentTextIcon className="h-5 w-5 mr-2" /> Instructions</h5>
                  <p className="text-sm text-gray-700">{selectedAssignment.instructions}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center"><CalendarIcon className="h-5 w-5 mr-2" /> Timeline</h5>
                  <p className="text-sm text-gray-700">Due by <strong>{new Date(selectedAssignment.dueDate).toLocaleDateString()}</strong>. Worth <strong>{selectedAssignment.points} points</strong>.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Your Work</h5>
                <div className="flex flex-wrap gap-3 mb-4">
                  <button onClick={addDraft} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <PaperClipIcon className="h-5 w-5" />
                    <span>Add to Draft</span>
                  </button>
                  <button onClick={addUpload} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <CloudArrowUpIcon className="h-5 w-5" />
                    <span>Upload</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {drafts.filter(d => d.assignmentId === selectedAssignment.id).length === 0 && uploads.filter(u => u.assignmentId === selectedAssignment.id).length === 0 ? (
                    <p className="text-sm text-gray-500">No files yet. Add a draft or upload your submission.</p>
                  ) : (
                    <>
                      {drafts.filter(d => d.assignmentId === selectedAssignment.id).length > 0 && (
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-1">Drafts</h6>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {drafts.filter(d => d.assignmentId === selectedAssignment.id).map(d => (
                              <li key={d.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                <span className="truncate">{d.name}</span>
                                <span className="text-xs text-gray-500">{d.time}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {uploads.filter(u => u.assignmentId === selectedAssignment.id).length > 0 && (
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-1">Uploads</h6>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {uploads.filter(u => u.assignmentId === selectedAssignment.id).map(u => (
                              <li key={u.id} className="flex items-center justify-between bg-green-50 rounded p-2">
                                <span className="truncate">{u.name}</span>
                                <span className="text-xs text-gray-600">{u.time}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex items-center justify-between">
              <button onClick={() => navigate('/courses')} className="text-indigo-600 hover:text-indigo-800 flex items-center">
                Go to Course <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
              <div className="space-x-2">
                <button onClick={addDraft} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Save Draft</button>
                <button onClick={addUpload} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Turn In</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
