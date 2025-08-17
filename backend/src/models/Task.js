const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  assignee: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedDays: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

// Relasi akan didefinisikan di file terpisah untuk menghindari circular dependency

module.exports = Task;
