const Project = require('./Project');
const Sprint = require('./Sprint');
const Task = require('./Task');
const User = require('./User');
const ChatHistory = require('./ChatHistory');
const ChatMessage = require('./ChatMessage');

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

// User associations for ChatHistory
User.hasMany(ChatHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });
ChatHistory.belongsTo(User, { foreignKey: 'userId' });

// ChatHistory associations for ChatMessage
ChatHistory.hasMany(ChatMessage, { foreignKey: 'chatHistoryId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(ChatHistory, { foreignKey: 'chatHistoryId' });

module.exports = {
  Project,
  Sprint,
  Task,
  User,
  ChatHistory,
  ChatMessage
};
