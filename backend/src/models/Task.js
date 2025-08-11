const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('./Project');
const Sprint = require('./Sprint');

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'done'),
    defaultValue: 'todo'
  },
  description: {
    type: DataTypes.TEXT
  }
});

// Relasi: Task milik Project & Sprint (opsional)
Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Sprint.hasMany(Task, { foreignKey: 'sprintId', onDelete: 'SET NULL' });
Task.belongsTo(Sprint, { foreignKey: 'sprintId' });

module.exports = Task;
