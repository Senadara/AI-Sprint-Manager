import React, { useState, useEffect } from 'react';
import Kanban from '../components/Kanban';
import axios from '../api/axios';

const Board = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    review: [],
    done: []
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/projects');
      setProjects(response.data);
      
      // Auto-select first project if available
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      // Fixed endpoint URL
      const response = await axios.get(`/tasks/${projectId}`);
      const projectTasks = response.data;
      
      // Organize tasks by status sesuai dengan API documentation
      const organizedTasks = {
        todo: projectTasks.filter(task => task.status === 'todo' || task.status === 'pending'),
        inProgress: projectTasks.filter(task => task.status === 'in_progress' || task.status === 'in-progress'),
        review: projectTasks.filter(task => task.status === 'review' || task.status === 'testing'),
        done: projectTasks.filter(task => task.status === 'completed' || task.status === 'done')
      };
      
      setTasks(organizedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Jika tidak ada tasks, set empty arrays
      setTasks({
        todo: [],
        inProgress: [],
        review: [],
        done: []
      });
    }
  };

  const handleTaskUpdate = async (updatedTasks) => {
    setTasks(updatedTasks);
    
    // Update task status in backend
    try {
      // Flatten all tasks and update their status
      const allTasks = [
        ...updatedTasks.todo.map(task => ({ ...task, status: 'todo' })),
        ...updatedTasks.inProgress.map(task => ({ ...task, status: 'in_progress' })),
        ...updatedTasks.review.map(task => ({ ...task, status: 'review' })),
        ...updatedTasks.done.map(task => ({ ...task, status: 'completed' }))
      ];

      // Update each task in backend
      for (const task of allTasks) {
        if (task.id) {
          await axios.put(`/tasks/${task.id}`, {
            title: task.title,
            status: task.status
            // projectId tidak diperlukan untuk update task
          });
        }
      }
    } catch (error) {
      console.error('Error updating tasks:', error);
      setError('Failed to update task status');
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await axios.post('/tasks', {
        title: newTask.title,
        description: newTask.description,
        status: 'todo',
        projectId: selectedProject
      });

      const task = response.data;
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, task]
      }));
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading board...</p>
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
            onClick={fetchProjects}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <svg className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium text-blue-800 mb-2">No Projects Found</h3>
          <p className="text-blue-700 mb-4">You need to create a project first to view the board.</p>
          <a
            href="/project/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprint Board</h1>
          <p className="text-gray-600 mt-1">Manage your project tasks and track progress</p>
        </div>
        
        {/* Project Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Project:</label>
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <Kanban 
        tasks={tasks} 
        setTasks={handleTaskUpdate}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default Board; 