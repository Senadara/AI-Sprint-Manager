const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sprint = sequelize.define('Sprint', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

// Relasi akan didefinisikan di file associations.js

module.exports = Sprint;
