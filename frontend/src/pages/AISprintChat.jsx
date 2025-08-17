import React, { useState } from 'react';

const AISprintChat = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sprintResult, setSprintResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      prompt: 'Create a 2-week sprint for user authentication features',
      result: 'Sprint: User Authentication (2 weeks)\n- Task 1: Login Form (3 days)\n- Task 2: Registration (3 days)\n- Task 3: Password Reset (2 days)',
      timestamp: '2024-01-15 10:30'
    }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const mockResult = {
        sprint: {
          name: 'Sprint: ' + prompt.substring(0, 30) + '...',
          duration: '2 weeks',
          totalTasks: 5,
          estimatedHours: 80
        },
        tasks: [
          {
            id: 1,
            name: 'Task 1: Initial Setup',
            description: 'Set up project structure and dependencies',
            assignee: 'John Doe',
            priority: 'High',
            estimatedDays: 2,
            type: 'task'
          },
          {
            id: 2,
            name: 'Task 2: Core Development',
            description: 'Implement main functionality',
            assignee: 'Jane Smith',
            priority: 'High',
            estimatedDays: 5,
            type: 'story'
          },
          {
            id: 3,
            name: 'Task 3: Testing',
            description: 'Unit tests and integration tests',
            assignee: 'Mike Johnson',
            priority: 'Medium',
            estimatedDays: 3,
            type: 'task'
          }
        ]
      };
      
      setSprintResult(mockResult);
      setChatHistory(prev => [{
        id: Date.now(),
        prompt,
        result: JSON.stringify(mockResult, null, 2),
        timestamp: new Date().toLocaleString()
      }, ...prev]);
      setIsLoading(false);
    }, 2000);
  };

  const addToBoard = () => {
    if (sprintResult) {
      console.log('Adding to board:', sprintResult);
      alert('Tasks added to board successfully!');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'story': return '📖';
      case 'task': return '📋';
      case 'bug': return '🐛';
      case 'epic': return '🎯';
      default: return '📝';
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel - Chat Form */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Sprint Planning Assistant</h2>
          <p className="text-gray-600">Describe your sprint requirements and let AI generate a detailed plan</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-shrink-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your sprint requirements
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a 2-week sprint for user authentication features including login, registration, and password reset..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Sprint...
              </div>
            ) : (
              'Generate Sprint Plan'
            )}
          </button>
        </form>

        {/* Chat History */}
        <div className="mt-8 flex-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat History</h3>
          <div className="space-y-3 h-full overflow-y-auto">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Use Again
                  </button>
                </div>
                <p className="text-sm text-gray-900 mb-2 font-medium">
                  <span className="text-gray-600">Prompt:</span> {chat.prompt}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="text-gray-600">Result:</span> {chat.result.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Sprint Result */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Sprint Breakdown</h2>
          {sprintResult && (
            <button
              onClick={addToBoard}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add to Board
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Generating your sprint plan...</p>
                <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
              </div>
            </div>
          ) : sprintResult ? (
            <div className="space-y-6">
              {/* Sprint Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{sprintResult.sprint.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-600">Duration:</span>
                    <span className="text-gray-900 font-medium ml-2">{sprintResult.sprint.duration}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-600">Total Tasks:</span>
                    <span className="text-gray-900 font-medium ml-2">{sprintResult.sprint.totalTasks}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-600">Est. Hours:</span>
                    <span className="text-gray-900 font-medium ml-2">{sprintResult.sprint.estimatedHours}h</span>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-blue-600 font-medium ml-2">Ready</span>
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks Breakdown</h3>
                <div className="space-y-4">
                  {sprintResult.tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTypeIcon(task.type)}</span>
                          <h4 className="font-semibold text-gray-900">{task.name}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">
                            Assignee: <span className="text-gray-900 font-medium">{task.assignee}</span>
                          </span>
                          <span className="text-gray-500">
                            Est: <span className="text-gray-900 font-medium">{task.estimatedDays} days</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-16">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-xl font-medium text-gray-900 mb-2">Your sprint breakdown will appear here</p>
              <p className="text-gray-600">Start by describing your sprint requirements on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISprintChat; 