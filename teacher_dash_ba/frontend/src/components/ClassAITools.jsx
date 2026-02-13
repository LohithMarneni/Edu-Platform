import React from 'react';
import { Brain, Wand2, FileText, BarChart3, Mic, Zap } from 'lucide-react';

const ClassAITools = ({ classId }) => {
  const aiTools = [
    {
      id: 1,
      name: 'Generate Quiz',
      description: 'Create quizzes automatically from your uploaded notes and content',
      icon: FileText,
      color: 'bg-blue-500',
      action: 'Generate',
      features: ['Multiple choice questions', 'Auto-grading', 'Difficulty levels'],
    },
    {
      id: 2,
      name: 'Summarize Notes',
      description: 'Get AI-powered summaries of your lecture notes for quick sharing',
      icon: Wand2,
      color: 'bg-purple-500',
      action: 'Summarize',
      features: ['Key points extraction', 'Student-friendly language', 'Multiple formats'],
    },
    {
      id: 3,
      name: 'Performance Analysis',
      description: 'Analyze student performance and get insights on learning patterns',
      icon: BarChart3,
      color: 'bg-green-500',
      action: 'Analyze',
      features: ['Learning gaps identification', 'Performance trends', 'Recommendations'],
    },
    {
      id: 4,
      name: 'Voice Assignments',
      description: 'Create audio-based assignments and evaluate spoken responses',
      icon: Mic,
      color: 'bg-red-500',
      action: 'Create',
      features: ['Audio questions', 'Speech-to-text', 'Pronunciation feedback'],
    },
    {
      id: 5,
      name: 'Auto-Grading',
      description: 'Automatically grade assignments with AI-powered evaluation',
      icon: Zap,
      color: 'bg-yellow-500',
      action: 'Enable',
      features: ['Text analysis', 'Rubric-based grading', 'Feedback generation'],
    },
    {
      id: 6,
      name: 'Study Guide Generator',
      description: 'Create comprehensive study guides from course materials',
      icon: Brain,
      color: 'bg-indigo-500',
      action: 'Generate',
      features: ['Chapter summaries', 'Practice questions', 'Visual aids'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-8 h-8 text-purple-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Tools</h2>
          <p className="text-gray-600">Enhance your teaching with AI-powered tools</p>
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`${tool.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{tool.description}</p>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full ${tool.color} text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity`}>
                {tool.action}
              </button>
            </div>
          );
        })}
      </div>

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start space-x-3">
          <Brain className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Usage Tips</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• <strong>Start with content:</strong> Upload your notes and materials first for better AI-generated quizzes.</p>
              <p>• <strong>Review AI output:</strong> Always review and customize AI-generated content before sharing with students.</p>
              <p>• <strong>Combine tools:</strong> Use multiple AI tools together for a comprehensive teaching experience.</p>
              <p>• <strong>Student feedback:</strong> Use AI analysis to understand where students need more help.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent AI Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Generated quiz for Chapter 5</p>
              <p className="text-xs text-gray-500">2 hours ago • 10 questions created</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Analyzed student performance</p>
              <p className="text-xs text-gray-500">1 day ago • 5 insights generated</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Summarized geometry notes</p>
              <p className="text-xs text-gray-500">3 days ago • 1 page summary created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAITools;