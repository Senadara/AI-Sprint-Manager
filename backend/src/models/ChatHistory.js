const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatHistory = sequelize.define('ChatHistory', {
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = ChatHistory;
