import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ErrorPopup = ({ isOpen, onClose, title, message, errors = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title || 'Error'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <p className="text-gray-700 mb-4">{message}</p>
          )}
          
          {errors && errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Validation Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => {
                  const errorMessage = typeof error === 'string' 
                    ? error 
                    : error.msg || error.message || `${error.field || 'Field'}: ${error.msg || error.message || 'Invalid value'}`;
                  return (
                    <li key={index} className="text-sm text-red-600">
                      {errorMessage}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;
