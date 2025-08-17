const Project = require('./Project');
const Sprint = require('./Sprint');
const Task = require('./Task');
const User = require('./User');

// User associations
User.hasMany(Project, { foreignKey: 'userId', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'userId' });

// Project associations
Project.hasMany(Sprint, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Sprint.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

// Sprint associations
Sprint.hasMany(Task, { foreignKey: 'sprintId', as: 'Tasks', onDelete: 'SET NULL' });
Task.belongsTo(Sprint, { foreignKey: 'sprintId' });

// Sprint belongs to Project
Sprint.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = {
  Project,
  Sprint,
  Task,
  User
};
