import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PaperClipIcon, CloudArrowUpIcon, CheckCircleIcon, ClockIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftFiles, setDraftFiles] = useState([]);
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFile, setNewFile] = useState(null);

  // Fetch assignment data from API
  useEffect(() => {
    if (!assignmentId) return;
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching assignment details for ID:', assignmentId);
        const response = await apiService.getAssessment(assignmentId);
        console.log('📡 Assignment API Response:', response);
        
        if (response.success) {
          console.log('✅ Assignment fetched successfully:', response.data.title);
          
          // Transform the data to match component expectations
          const transformedAssignment = {
            ...response.data,
            // Format due date
            dueDate: new Date(response.data.dueDate).toLocaleDateString(),
            // Ensure instructor is properly formatted
            instructor: response.data.instructor?.name || response.data.instructor || 'Unknown Instructor',
            // Add created/edited dates if not present
            createdAt: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString() : 'Unknown',
            editedAt: response.data.updatedAt ? new Date(response.data.updatedAt).toLocaleDateString() : 'Unknown'
          };
          
          setAssignment(transformedAssignment);
          setSubmission(response.data.studentSubmission);
          
          // Handle files from both local and teacher backend submissions
          let files = [];
          if (response.data.studentSubmission) {
            // Check if it's from teacher backend (attachments structure)
            if (response.data.studentSubmission.attachments && response.data.studentSubmission.attachments.length > 0) {
              // Transform teacher backend attachments to student frontend format
              files = response.data.studentSubmission.attachments.map((att, idx) => ({
                id: idx,
                name: att.originalName || att.filename || `Attachment ${idx + 1}`,
                type: att.mimetype || 'FILE',
                url: att.path || att.url || '',
                uploadedAt: att.uploadedAt || new Date().toLocaleString()
              }));
            } else if (response.data.studentSubmission.files && response.data.studentSubmission.files.length > 0) {
              // Local assessment files
              files = response.data.studentSubmission.files.map((f, idx) => ({
                id: f.id || idx,
                name: f.name || f.fileName || `File ${idx + 1}`,
                type: f.type || f.fileType || 'FILE',
                url: f.url || f.fileUrl || '',
                uploadedAt: f.uploadedAt || new Date().toLocaleString()
              }));
            }
          }
          setSubmittedFiles(files);
        } else {
          console.error('❌ API returned error:', response.message);
          throw new Error(response.message || 'Failed to fetch assignment');
        }
      } catch (error) {
        console.error('❌ Error fetching assignment:', error);
        // Show error state instead of falling back to mock data
        setAssignment(null);
        setSubmission(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewFile(file);
      setShowUploadModal(true);
    }
  };

  const handleSubmitFile = async () => {
    if (newFile) {
      try {
        const fileData = {
          fileName: newFile.name,
          fileUrl: URL.createObjectURL(newFile),
          fileType: newFile.type.split('/')[1].toUpperCase()
        };

        await apiService.uploadAssessmentFile(assignmentId, fileData);

        const fileInfo = {
          id: Date.now(),
          name: newFile.name,
          type: newFile.type.split('/')[1].toUpperCase(),
          url: URL.createObjectURL(newFile),
          uploadedAt: new Date().toLocaleString()
        };

        if (submission?.status === 'submitted') {
          setDraftFiles(prev => [...prev, fileInfo]);
        } else {
          setSubmittedFiles(prev => [...prev, fileInfo]);
        }

        setNewFile(null);
        setShowUploadModal(false);
      } catch (error) {
        console.error('Error uploading file:', error);
        // Still add to local state for demo
        const fileInfo = {
          id: Date.now(),
          name: newFile.name,
          type: newFile.type.split('/')[1].toUpperCase(),
          url: URL.createObjectURL(newFile),
          uploadedAt: new Date().toLocaleString()
        };

        if (submission?.status === 'submitted') {
          setDraftFiles(prev => [...prev, fileInfo]);
        } else {
          setSubmittedFiles(prev => [...prev, fileInfo]);
        }

        setNewFile(null);
        setShowUploadModal(false);
      }
    }
  };

  const handleTurnIn = async () => {
    try {
      setIsSubmitting(true);
      console.log('📤 Submitting assignment with files:', submittedFiles);
      
      const response = await apiService.submitAssessment(assignmentId, {
        files: submittedFiles,
        status: 'submitted'
      });

      console.log('✅ Submission response:', response);

      // Show success message
      alert('Assignment submitted successfully!');

      // Refresh assignment data to get updated submission from backend
      const refreshedResponse = await apiService.getAssessment(assignmentId);
      if (refreshedResponse.success) {
        const refreshedAssignment = refreshedResponse.data;
        setSubmission(refreshedAssignment.studentSubmission);
        
        // Update files from refreshed submission
        let files = [];
        if (refreshedAssignment.studentSubmission) {
          if (refreshedAssignment.studentSubmission.attachments && refreshedAssignment.studentSubmission.attachments.length > 0) {
            files = refreshedAssignment.studentSubmission.attachments.map((att, idx) => ({
              id: idx,
              name: att.originalName || att.filename || `Attachment ${idx + 1}`,
              type: att.mimetype || 'FILE',
              url: att.path || att.url || '',
              uploadedAt: att.uploadedAt || new Date().toLocaleString()
            }));
          } else if (refreshedAssignment.studentSubmission.files && refreshedAssignment.studentSubmission.files.length > 0) {
            files = refreshedAssignment.studentSubmission.files.map((f, idx) => ({
              id: f.id || idx,
              name: f.name || f.fileName || `File ${idx + 1}`,
              type: f.type || f.fileType || 'FILE',
              url: f.url || f.fileUrl || '',
              uploadedAt: f.uploadedAt || new Date().toLocaleString()
            }));
          }
        }
        setSubmittedFiles(files);
      } else {
        // Fallback: update local state
        setSubmission(prev => ({
          ...prev,
          status: 'submitted',
          submittedAt: new Date().toLocaleString()
        }));
      }
    } catch (error) {
      console.error('❌ Error submitting assignment:', error);
      // Show error message but don't logout
      alert(`Failed to submit assignment: ${error.message}`);
      // Don't update state on error - let user try again
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await apiService.deleteAssessmentFile(assignmentId, fileId);
      setSubmittedFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      // Still remove from local state for demo
      setSubmittedFiles(prev => prev.filter(file => file.id !== fileId));
    }
  };

  const handleUnsubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('📤 Unsubmitting assignment...');
      
      const response = await apiService.submitAssessment(assignmentId, {
        files: submittedFiles,
        status: 'draft'
      });

      console.log('✅ Unsubmit response:', response);

      // Show success message
      alert('Assignment unsubmitted successfully! You can now make changes.');

      // Refresh assignment data to get updated submission from backend
      const refreshedResponse = await apiService.getAssessment(assignmentId);
      if (refreshedResponse.success) {
        const refreshedAssignment = refreshedResponse.data;
        setSubmission(refreshedAssignment.studentSubmission);
        
        // Update files from refreshed submission
        let files = [];
        if (refreshedAssignment.studentSubmission) {
          if (refreshedAssignment.studentSubmission.attachments && refreshedAssignment.studentSubmission.attachments.length > 0) {
            files = refreshedAssignment.studentSubmission.attachments.map((att, idx) => ({
              id: idx,
              name: att.originalName || att.filename || `Attachment ${idx + 1}`,
              type: att.mimetype || 'FILE',
              url: att.path || att.url || '',
              uploadedAt: att.uploadedAt || new Date().toLocaleString()
            }));
          } else if (refreshedAssignment.studentSubmission.files && refreshedAssignment.studentSubmission.files.length > 0) {
            files = refreshedAssignment.studentSubmission.files.map((f, idx) => ({
              id: f.id || idx,
              name: f.name || f.fileName || `File ${idx + 1}`,
              type: f.type || f.fileType || 'FILE',
              url: f.url || f.fileUrl || '',
              uploadedAt: f.uploadedAt || new Date().toLocaleString()
            }));
          }
        }
        setSubmittedFiles(files);
      } else {
        // Fallback: update local state
        setSubmission(prev => ({
          ...prev,
          status: 'draft',
          submittedAt: null
        }));
      }
    } catch (error) {
      console.error('❌ Error unsubmitting assignment:', error);
      alert(`Failed to unsubmit assignment: ${error.message}`);
      // Still update local state to allow user to continue
      setSubmission(prev => ({ ...prev, status: 'draft' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h2>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/assignments')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/assignments')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Assignments
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Assignment Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {assignment.title}
                    </h1>
                    <p className="text-gray-600">
                      {typeof assignment.instructor === 'string' ? assignment.instructor : assignment.instructor?.name} • {assignment.createdAt}
                      {assignment.editedAt !== assignment.createdAt && (
                        <span className="text-gray-500"> (Edited {assignment.editedAt})</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {assignment.points} points
                  </div>
                  <div className="text-sm text-gray-600">
                    Due {assignment.dueDate}
                  </div>
                </div>
              </div>

              <hr className="mb-6" />

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 leading-relaxed">
                  {assignment.instructions}
                </p>
              </div>

              <hr className="mb-6" />

              {/* Class Comments */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Class comments</h3>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Add a class comment
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Work Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your work</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  submission?.status === 'submitted' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {submission?.status === 'submitted' ? 'Turned in' : 'Not turned in'}
                </span>
              </div>

              {/* Files */}
              <div className="space-y-3 mb-4">
                {submittedFiles.length > 0 ? (
                  submittedFiles.map((file, idx) => {
                    // Construct proper file URL - handle both url and path fields
                    let fileUrl = '';
                    const urlOrPath = file.url || file.path || '';
                    
                    if (urlOrPath) {
                      if (urlOrPath.startsWith('http')) {
                        fileUrl = urlOrPath;
                      } else if (urlOrPath.startsWith('/uploads')) {
                        fileUrl = `http://localhost:5001${urlOrPath}`;
                      } else if (urlOrPath.startsWith('uploads')) {
                        fileUrl = `http://localhost:5001/${urlOrPath}`;
                      } else if (urlOrPath.startsWith('/')) {
                        fileUrl = `http://localhost:5001${urlOrPath}`;
                      } else {
                        fileUrl = `http://localhost:5001/uploads/${urlOrPath}`;
                      }
                    }
                    
                    return (
                      <div key={file.id || idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => {
                              if (fileUrl) {
                                window.open(fileUrl, '_blank');
                              } else {
                                alert('File URL not available');
                              }
                            }}
                            className="text-left w-full"
                          >
                            <p className="text-sm font-medium text-gray-900 truncate hover:text-indigo-600 transition-colors">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{file.type}</p>
                          </button>
                        </div>
                        {submission?.status !== 'submitted' && (
                          <button
                            onClick={() => handleDeleteFile(file.id || idx)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                        {fileUrl && (
                          <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Open
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No files uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="mb-4">
                {submission?.status !== 'submitted' && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    <div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                      <div className="text-center">
                        <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {submission?.status === 'submitted' ? (
                  <button
                    onClick={handleUnsubmit}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? 'Unsubmitting...' : 'Unsubmit'}
                  </button>
                ) : (
                  <button
                    onClick={handleTurnIn}
                    disabled={submittedFiles.length === 0 || isSubmitting}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? 'Turning in...' : 'Turn in'}
                  </button>
                )}
              </div>

              {submission?.status === 'submitted' && (
                <div className="mt-3 text-sm">
                  {submission?.score !== undefined && (
                    <div className="text-green-700 font-medium">Score: {submission.score}</div>
                  )}
                  {submission?.feedback && (
                    <div className="text-gray-700">Feedback: {submission.feedback}</div>
                  )}
                </div>
              )}
            </div>

            {/* Private Comments Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">👤</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Private comments</h3>
              </div>
              <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                Add comment to {typeof assignment.instructor === 'string' ? assignment.instructor : assignment.instructor?.name}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload File</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">File: {newFile?.name}</p>
              <p className="text-xs text-gray-500">Size: {(newFile?.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setNewFile(null);
                  setShowUploadModal(false);
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFile}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;
