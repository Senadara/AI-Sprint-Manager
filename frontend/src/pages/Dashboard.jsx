import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { name: 'Total Tasks', value: '0', change: '+0%', changeType: 'increase', icon: '📋' },
    { name: 'In Progress', value: '0', change: '+0%', changeType: 'increase', icon: '🔄' },
    { name: 'Completed', value: '0', change: '+0%', changeType: 'increase', icon: '✅' },
    { name: 'Overdue', value: '0', change: '+0%', changeType: 'decrease', icon: '⏰' }
  ]);
  
  const [projects, setProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsResponse = await axios.get('/projects');
      const projectsData = projectsResponse.data;
      setProjects(projectsData);

      // Fetch tasks for each project to calculate stats
      let totalTasks = 0;
      let inProgressTasks = 0;
      let completedTasks = 0;
      let overdueTasks = 0;

      for (const project of projectsData) {
        try {
          // Fixed endpoint URL
          const tasksResponse = await axios.get(`/tasks/${project.id}`);
          const tasks = tasksResponse.data;
          
          totalTasks += tasks.length;
          tasks.forEach(task => {
            if (task.status === 'in_progress' || task.status === 'in-progress') inProgressTasks++;
            else if (task.status === 'completed' || task.status === 'done') completedTasks++;
            // Add logic for overdue tasks if you have deadline field
          });
        } catch (error) {
          console.error(`Error fetching tasks for project ${project.id}:`, error);
          // Don't set error for individual project failures
        }
      }

      // Update stats
      setStats([
        { name: 'Total Tasks', value: totalTasks.toString(), change: '+0%', changeType: 'increase', icon: '📋' },
        { name: 'In Progress', value: inProgressTasks.toString(), change: '+0%', changeType: 'increase', icon: '🔄' },
        { name: 'Completed', value: completedTasks.toString(), change: '+0%', changeType: 'increase', icon: '✅' },
        { name: 'Overdue', value: overdueTasks.toString(), change: '+0%', changeType: 'decrease', icon: '⏰' }
      ]);

      // Generate recent activities based on projects
      const activities = projectsData.slice(0, 3).map((project, index) => ({
        id: index + 1,
        type: 'project_created',
        message: `Project "${project.name}" created`,
        time: `${index + 1} day${index > 0 ? 's' : ''} ago`,
        avatar: 'AI',
        color: 'bg-blue-100 text-blue-800'
      }));
      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create New Sprint',
      description: 'Use AI to generate sprint planning',
      icon: '🎯',
      path: '/ai/sprint',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'View Board',
      description: 'Manage tasks in Kanban board',
      icon: '📋',
      path: '/board',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'AI Code Assistant',
      description: 'Get help with coding tasks',
      icon: '💻',
      path: '/ai/code',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: '🚀',
      path: '/project/create',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading dashboard...</p>
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
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-blue-100 text-lg">Here's what's happening with your projects today.</p>
          </div>
          <div className="text-6xl">🎉</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{stat.change}</span>
                  <span className="ml-1">from last month</span>
                </div>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group block"
            >
              <div className={`bg-gradient-to-r ${action.color} rounded-xl p-6 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg`}>
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities & Sprint Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${activity.color}`}>
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Sprint Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Sprint Progress</h2>
          <div className="space-y-6">
            {projects.length > 0 ? (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{projects[0].name}</span>
                  <span className="text-gray-900 font-medium">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">12 days remaining</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No active projects</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats[1].value}</div>
                <div className="text-sm text-blue-600">Tasks Remaining</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats[2].value}</div>
                <div className="text-sm text-green-600">Tasks Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">{projects.length}</div>
            <div className="text-blue-600 font-medium">Active Projects</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">5</div>
            <div className="text-green-600 font-medium">Team Members</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
            <div className="text-purple-600 font-medium">Project Health</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 