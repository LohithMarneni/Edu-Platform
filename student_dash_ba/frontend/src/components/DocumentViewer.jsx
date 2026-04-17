import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PencilIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const DocumentViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse params from search query since we used window.location.href
  const searchParams = new URLSearchParams(location.search);
  const fileUrl = searchParams.get('fileUrl');
  const title = searchParams.get('title');
  const subject = searchParams.get('subject');

  // Compute cleanUrl once per fileUrl so it doesn't change on keystrokes
  const cleanUrl = useMemo(() => {
    if (!fileUrl) return '';
    return fileUrl.includes('?') ? fileUrl : `${fileUrl}?cb=${Date.now()}`;
  }, [fileUrl]);

  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [htmlContent, setHtmlContent] = useState(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  
  const contentContainerRef = useRef(null);

  useEffect(() => {
    if (!fileUrl) return;
    
    const extension = fileUrl.split('.').pop().toLowerCase().split('?')[0];
    
    if (extension === 'docx') {
      setIsLoadingDoc(true);
      // Load mammoth dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      script.onload = () => {
        fetch(fileUrl)
          .then(res => res.arrayBuffer())
          .then(arrayBuffer => window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer }))
          .then(result => {
            setHtmlContent(result.value);
            setIsLoadingDoc(false);
          })
          .catch(err => {
            console.error('Error rendering docx', err);
            setIsLoadingDoc(false);
          });
      };
      document.body.appendChild(script);
      
      return () => { document.body.removeChild(script); };
    } else if (extension === 'xlsx' || extension === 'csv') {
      setIsLoadingDoc(true);
      // Load SheetJS dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
      script.onload = () => {
        fetch(fileUrl)
          .then(res => res.arrayBuffer())
          .then(arrayBuffer => {
            const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const htmlString = window.XLSX.utils.sheet_to_html(worksheet);
            // Wrap in a div to apply some basic table styling
            setHtmlContent(`<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; } tr:nth-child(even){background-color: #f2f2f2;}</style>${htmlString}`);
            setIsLoadingDoc(false);
          })
          .catch(err => {
            console.error('Error rendering xlsx', err);
            setIsLoadingDoc(false);
          });
      };
      document.body.appendChild(script);
      
      return () => { document.body.removeChild(script); };
    }
  }, [fileUrl]);

  // If no file URL is provided, show an error or go back
  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold mb-4">No Document Found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline flex items-center">
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to courses
        </button>
      </div>
    );
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
       toast.error('Please write something before saving.');
       return;
    }
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Format current date for the title
      const now = new Date();
      const dateString = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}-${now.getMinutes().toString().padStart(2,'0')}`;
      const noteTitle = `${subject || 'Material'}_${dateString}`;
      
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noteTitle,
          content: noteText,
          subject: subject || 'Study Material'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Note successfully saved to your Notes tab!');
        setNoteText('');
      } else {
        throw new Error(data.message || 'Failed to save note');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-indigo-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{title || 'Document Viewer'}</h1>
            <p className="text-sm text-gray-500 font-medium">{subject || 'Study Material'}</p>
          </div>
        </div>
        
        {/* Download Button */}
        <a
          href={fileUrl}
          download={title || 'document'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Document/Media Viewer (70% width) */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group">
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md pointer-events-none z-10">
            Inline Viewer
          </div>
          
          <div className="w-full h-full flex items-center justify-center bg-gray-50 overflow-auto" ref={contentContainerRef}>
            {(() => {
              const extension = fileUrl.split('.').pop().toLowerCase().split('?')[0];
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension);
              const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(extension);
              const isAudio = ['mp3', 'wav', 'ogg'].includes(extension);
              const isPdf = ['pdf'].includes(extension);
              const isText = ['txt', 'json', 'md', 'xml', 'js', 'html', 'css'].includes(extension);
              const isDocx = extension === 'docx';
              const isExcel = extension === 'xlsx' || extension === 'csv';
              const isPpt = extension === 'pptx' || extension === 'ppt';
              
              if (isLoadingDoc) {
                return (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Parsing document...</p>
                  </div>
                );
              }
              
              if ((isDocx || isExcel) && htmlContent) {
                return (
                  <div 
                    className="w-full h-full bg-white p-8 overflow-y-auto prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                  />
                );
              } else if (isImage) {
                return <img src={cleanUrl} alt={title || 'Document'} className="max-w-full max-h-full object-contain p-4" />;
              } else if (isVideo) {
                return <video src={cleanUrl} controls className="max-w-full max-h-full" />;
              } else if (isAudio) {
                return <audio src={cleanUrl} controls className="w-full max-w-md px-8" />;
              } else if (isPdf) {
                return <object data={cleanUrl} type="application/pdf" className="w-full h-full border-0 bg-white" title={title || "Document Viewer"}><p>Your browser does not support PDFs. <a href={cleanUrl}>Download the PDF</a>.</p></object>;
              } else if (isText) {
                return <iframe src={cleanUrl} className="w-full h-full border-0 bg-white" title={title || "Document Viewer"} />;
              } else if (isPpt) {
                // PPTX requires online viewer or complex conversion
                return (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">PowerPoint Document</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">This is a PowerPoint presentation. Please download it to view the slides natively on your device.</p>
                    <a
                      href={fileUrl}
                      download={title || 'document'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <span>Download Presentation</span>
                    </a>
                  </div>
                );
              } else {
                return (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h3>
                    <p className="text-gray-500 mb-6">This file type cannot be previewed inline.</p>
                    <a
                      href={fileUrl}
                      download={title || 'document'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <span>Download File</span>
                    </a>
                  </div>
                );
              }
            })()}
          </div>
        </div>

        {/* Note Taking Side Panel (30% width) */}
        <div className="w-full md:w-96 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 flex items-center justify-between shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center">
              <PencilIcon className="h-5 w-5 mr-2 text-purple-600" />
              My Notes
            </h3>
          </div>
          
          <div className="flex-1 p-4 bg-gray-50/50 flex flex-col">
            <textarea
              className="flex-1 w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 leading-relaxed shadow-inner"
              placeholder="Start taking notes on this document...&#10;&#10;These will be saved under the Subject category in your Notes tab."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            
            <button
              onClick={handleSaveNote}
              disabled={isSaving}
              className="mt-4 w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-70 flex items-center justify-center transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Note Locally'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
