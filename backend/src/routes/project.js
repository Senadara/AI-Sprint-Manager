const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');

router.post('/', auth, createProject);
router.get('/', auth, getProjects);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;
