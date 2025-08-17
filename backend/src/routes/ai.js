// src/routes/ai.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const aiController = require('../controllers/aiController');

router.post('/chat', auth, aiController.chat);
router.get('/chat-history', auth, aiController.getChatHistory);
router.get('/chat/:id', auth, aiController.getChatById);
router.delete('/chat/:id', auth, aiController.deleteChat);
router.post('/generate-sprint', auth, aiController.generateSprint);
router.post('/save-sprint', auth, aiController.saveSprint);

module.exports = router;
