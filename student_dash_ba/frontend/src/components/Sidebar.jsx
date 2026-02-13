import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserCircleIcon,
  FolderIcon,
  XMarkIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };
  const menuItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/' },
    { icon: BookOpenIcon, label: 'My Courses', path: '/courses' },
    { icon: QuestionMarkCircleIcon, label: 'Doubt Resolution', path: '/doubts' },
    { icon: ClipboardDocumentListIcon, label: 'Assignments', path: '/assignments' },
    { icon: ChartBarIcon, label: 'Progress', path: '/progress' },
    { icon: FolderIcon, label: 'My Collection', path: '/collection' },
    { icon: AcademicCapIcon, label: 'Quiz', path: '/quiz' },
    { icon: UserCircleIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
      <div className="h-full flex flex-col">
        {/* Logo Section */}
        <div className="px-4 py-6 border-b border-gray-200">
          {location.pathname !== '/' && (
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-indigo-600">EduPlatform</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-4 space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src="https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff&size=32"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Student</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;