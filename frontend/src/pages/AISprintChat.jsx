import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const AISprintChat = () => {
  const [project, setProject] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sprintResult, setSprintResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [customFields, setCustomFields] = useState({
    deskripsiProject: '',
    deadlineProject: '',
    stackProject: ''
  });
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/projects/${projectId}`);
      setProject(response.data);
      // Pre-fill custom fields with project data
      setCustomFields({
        deskripsiProject: response.data.description || '',
        deadlineProject: response.data.deadline || '',
        stackProject: response.data.stack || ''
      });
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !project) return;

    setIsLoading(true);
    
    try {
      const requestData = {
        judulProject: project.name,
        deskripsiProject: customFields.deskripsiProject,
        deadlineProject: customFields.deadlineProject,
        stackProject: customFields.stackProject.split(',').map(s => s.trim()).filter(s => s)
      };

      const response = await axios.post('/ai/generate-sprint', requestData);
      setSprintResult(response.data);
      
      // Add to chat history
      setChatHistory(prev => [{
        id: Date.now(),
        prompt,
        result: JSON.stringify(response.data, null, 2),
        timestamp: new Date().toLocaleString()
      }, ...prev]);
    } catch (err) {
      console.error('Error generating sprint:', err);
      alert('Failed to generate sprint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSprint = async () => {
    if (!sprintResult || !projectId) return;

    try {
      setIsLoading(true);
      const response = await axios.post('/ai/save-sprint', {
        projectId: parseInt(projectId),
        sprints: sprintResult.sprints
      });

      alert('Sprint saved successfully!');
      navigate(`/sprint-management/${projectId}`);
    } catch (err) {
      console.error('Error saving sprint:', err);
      alert('Failed to save sprint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel - Chat Form */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/sprint-management/${projectId}`} className="text-blue-600 hover:text-blue-700">
              ← Back to Sprint Management
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Sprint Planning Assistant</h2>
          {project && (
            <p className="text-gray-600 mb-4">
              Generating sprint for: <span className="font-semibold">{project.name}</span>
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-shrink-0">
          {/* Project Information Display */}
          {project && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Project Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700">Name:</span>
                  <span className="text-blue-900 font-medium ml-2">{project.name}</span>
                </div>
                <div>
                  <span className="text-blue-700">Description:</span>
                  <span className="text-blue-900 font-medium ml-2">{project.description}</span>
                </div>
              </div>
            </div>
          )}

          {/* Custom Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description (Customizable)
              </label>
              <textarea
                value={customFields.deskripsiProject}
                onChange={(e) => setCustomFields(prev => ({ ...prev, deskripsiProject: e.target.value }))}
                placeholder="Describe your project in detail..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={customFields.deadlineProject}
                  onChange={(e) => setCustomFields(prev => ({ ...prev, deadlineProject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={customFields.stackProject}
                  onChange={(e) => setCustomFields(prev => ({ ...prev, stackProject: e.target.value }))}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Requirements (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Add any specific requirements, constraints, or additional context for the sprint planning..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !project}
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
              onClick={handleSaveSprint}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isLoading ? 'Saving...' : 'Save to Project'}
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
              {/* Project Overview */}
              {sprintResult.project && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{sprintResult.project.judul}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <span className="text-gray-600">Description:</span>
                      <span className="text-gray-900 font-medium ml-2">{sprintResult.project.deskripsi}</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="text-gray-900 font-medium ml-2">{formatDate(sprintResult.project.deadline)}</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <span className="text-gray-600">Tech Stack:</span>
                      <span className="text-gray-900 font-medium ml-2">{sprintResult.project.stack.join(', ')}</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <span className="text-gray-600">Total Sprints:</span>
                      <span className="text-gray-900 font-medium ml-2">{sprintResult.sprints.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sprints List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprints Breakdown</h3>
                <div className="space-y-6">
                  {sprintResult.sprints.map((sprint, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{sprint.name}</h4>
                          <p className="text-gray-600 text-sm mb-3">{sprint.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Start: <span className="text-gray-900 font-medium">{formatDate(sprint.start_date)}</span>
                            </span>
                            <span>
                              End: <span className="text-gray-900 font-medium">{formatDate(sprint.end_date)}</span>
                            </span>
                            <span>
                              Tasks: <span className="text-gray-900 font-medium">{sprint.tasks.length}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Tasks:</h5>
                        {sprint.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <h6 className="font-medium text-gray-900">{task.title}</h6>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">
                                Estimated: <span className="text-gray-900 font-medium">{task.estimated_days} days</span>
                              </span>
                              <span className="text-gray-500">
                                Reference: <span className="text-gray-900 font-medium">{task.sprintReference}</span>
                              </span>
                            </div>
                          </div>
                        ))}
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
              <p className="text-gray-600">Start by configuring your project details and generating a sprint plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISprintChat; 