import React, { useState } from 'react';
import { Upload, FileText, Video, Link as LinkIcon, Search, Filter, Download, Eye } from 'lucide-react';

const Content = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const content = [
    {
      id: 1,
      title: 'Chapter 5: Quadratic Equations',
      type: 'pdf',
      class: '8th Grade A',
      size: '2.4 MB',
      uploadDate: '2024-03-01',
      downloads: 28,
      views: 45,
      description: 'Complete notes on quadratic equations with examples',
    },
    {
      id: 2,
      title: 'Geometry Basics Video',
      type: 'video',
      class: '8th Grade B',
      size: '45.2 MB',
      uploadDate: '2024-02-28',
      downloads: 0,
      views: 32,
      description: 'Introduction to basic geometric concepts',
      duration: '15:30',
    },
    {
      id: 3,
      title: 'Khan Academy - Algebra',
      type: 'link',
      class: 'Multiple Classes',
      size: '-',
      uploadDate: '2024-02-25',
      downloads: 0,
      views: 18,
      description: 'External resource for additional practice',
      url: 'https://khanacademy.org/algebra',
    },
    {
      id: 4,
      title: 'Trigonometry Notes',
      type: 'pdf',
      class: '9th Grade C',
      size: '3.1 MB',
      uploadDate: '2024-02-20',
      downloads: 32,
      views: 48,
      description: 'Comprehensive trigonometry reference',
    },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'link':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContent = content.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.class.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-600 mt-1">Manage all your teaching materials in one place</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Content</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="pdf">Documents</option>
            <option value="video">Videos</option>
            <option value="link">Links</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{content.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {content.filter(c => c.type === 'pdf').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {content.filter(c => c.type === 'video').length}
              </p>
            </div>
            <Video className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {content.reduce((sum, c) => sum + c.views, 0)}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getTypeIcon(item.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.class}</p>
                </div>
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                {item.type.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{item.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Size:</span>
                <span>{item.size}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploaded:</span>
                <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
              </div>
              {item.duration && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Duration:</span>
                  <span>{item.duration}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{item.views} views</span>
                </span>
                {item.downloads > 0 && (
                  <span className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{item.downloads} downloads</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View
                </button>
                <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                  Share
                </button>
              </div>
              <button className="text-gray-600 hover:text-gray-700 text-sm">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms.'
              : 'Upload your first content to get started.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Content;