import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Board = () => {
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    projectId: '',
    startDate: '',
    endDate: '',
    assignee: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchSprints();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    }
  };

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.assignee) params.append('assignee', filters.assignee);

      const response = await axios.get(`/sprints/all?${params.toString()}`);
      setSprints(response.data);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      setError('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTaskUpdate = async (taskId, newStatus) => {
    try {
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      // Refresh sprints after update
      fetchSprints();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupTasksByStatus = (tasks) => {
    return {
      todo: tasks.filter(task => task.status === 'todo'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      done: tasks.filter(task => task.status === 'done')
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sprint board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Board</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchSprints}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sprint Master Board</h1>
          <p className="text-gray-600 mt-1">View and manage all sprints across projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
            <input
              type="text"
              placeholder="Search by assignee..."
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sprints */}
      {sprints.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-blue-800 mb-2">No Sprints Found</h3>
            <p className="text-blue-700 mb-4">No sprints match your current filters.</p>
            <button
              onClick={() => setFilters({ projectId: '', startDate: '', endDate: '', assignee: '' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {sprints.map((sprint) => {
            const groupedTasks = groupTasksByStatus(sprint.Tasks || []);
            
            return (
              <div key={sprint.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Sprint Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{sprint.name}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sprint.Project?.name || 'Unknown Project'}
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
                  </div>
                </div>

                {/* Kanban Board for this Sprint */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Todo Column */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">To Do</h4>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {groupedTasks.todo.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {groupedTasks.todo.map((task) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onStatusChange={handleTaskUpdate}
                            getStatusColor={getStatusColor}
                            getPriorityColor={getPriorityColor}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">In Progress</h4>
                        <span className="bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                          {groupedTasks['in-progress'].length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {groupedTasks['in-progress'].map((task) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onStatusChange={handleTaskUpdate}
                            getStatusColor={getStatusColor}
                            getPriorityColor={getPriorityColor}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Done</h4>
                        <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {groupedTasks.done.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {groupedTasks.done.map((task) => (
                          <TaskCard 
                            key={task.id} 
                            task={task} 
                            onStatusChange={handleTaskUpdate}
                            getStatusColor={getStatusColor}
                            getPriorityColor={getPriorityColor}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onStatusChange, getStatusColor, getPriorityColor, formatDate }) => {
  const handleStatusChange = (newStatus) => {
    onStatusChange(task.id, newStatus);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      
      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
      
      <div className="space-y-2">
        {/* Priority */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>{task.assignee}</span>
          </div>
        )}
        
        {/* Deadline */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>{formatDate(task.deadline)}</span>
        </div>
        
        {/* Estimated Days */}
        {task.estimatedDays && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{task.estimatedDays} days</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board; 