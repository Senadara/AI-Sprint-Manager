const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('code', 'message', 'mixed'),
    defaultValue: 'message'
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isUserMessage: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = ChatMessage;
