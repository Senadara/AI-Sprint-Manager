import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const SprintManagement = () => {
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (projectId) {
      fetchProjectAndSprints();
    }
  }, [projectId]);

  const fetchProjectAndSprints = async () => {
    try {
      setLoading(true);
      // Fetch project details
      const projectResponse = await axios.get(`/projects/${projectId}`);
      setProject(projectResponse.data);

      // Fetch sprints for this project
      const sprintsResponse = await axios.get(`/sprints/project/${projectId}`);
      setSprints(sprintsResponse.data);
    } catch (err) {
      setError('Failed to fetch project and sprints');
      console.error('Error fetching project and sprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (window.confirm('Are you sure you want to delete this sprint? This will also delete all related tasks.')) {
      try {
        await axios.delete(`/sprints/${sprintId}`);
        setSprints(sprints.filter(s => s.id !== sprintId));
      } catch (err) {
        setError('Failed to delete sprint');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/projects" className="text-blue-600 hover:text-blue-700">
              ← Back to Projects
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sprint Management</h1>
          {project && (
            <p className="text-gray-600 mt-2">
              Managing sprints for: <span className="font-semibold">{project.name}</span>
            </p>
          )}
        </div>
        <Link
          to={`/ai-sprint-chat/${projectId}`}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generate New Sprint
        </Link>
      </div>

      {/* Project Info */}
      {project && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="text-gray-900 font-medium ml-2">{project.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Description:</span>
              <span className="text-gray-900 font-medium ml-2">{project.description}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sprints List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Sprints ({sprints.length})</h2>
        </div>
        
        <div className="p-6">
          {sprints.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl font-medium text-gray-900 mb-2">No sprints yet</p>
              <p className="text-gray-600 mb-6">Create your first sprint using AI assistance</p>
              <Link
                to={`/ai-sprint-chat/${projectId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Generate Sprint
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sprints.map((sprint) => (
                <div key={sprint.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sprint.status || 'pending')}`}>
                          {sprint.status || 'pending'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{sprint.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>
                          Start: <span className="text-gray-900 font-medium">{formatDate(sprint.startDate)}</span>
                        </span>
                        <span>
                          End: <span className="text-gray-900 font-medium">{formatDate(sprint.endDate)}</span>
                        </span>
                        <span>
                          Tasks: <span className="text-gray-900 font-medium">{sprint.Tasks?.length || 0}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/board/${projectId}/${sprint.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        View Board
                      </Link>
                      <button
                        onClick={() => handleDeleteSprint(sprint.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Tasks Preview */}
                  {sprint.Tasks && sprint.Tasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Tasks Preview</h4>
                      <div className="space-y-2">
                        {sprint.Tasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{task.title}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                        {sprint.Tasks.length > 3 && (
                          <p className="text-xs text-gray-500 mt-2">
                            +{sprint.Tasks.length - 3} more tasks
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SprintManagement;
