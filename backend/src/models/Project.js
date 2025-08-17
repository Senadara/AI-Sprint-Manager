const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  deadline: {
    type: DataTypes.DATE
  },
  stack: {
    type: DataTypes.JSON
  }
});

// Relasi akan didefinisikan di file associations.js

module.exports = Project;
