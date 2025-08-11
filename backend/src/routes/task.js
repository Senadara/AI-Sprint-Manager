const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');

const dummyTasks = [
  { id: 1, title: 'Setup project', status: 'todo' },
  { id: 2, title: 'Create auth system', status: 'in-progress' },
  { id: 3, title: 'Integrate AI API', status: 'done' }
];

router.get('/dummyTasks', (req, res) => {
  res.json(dummyTasks);
});

router.post('/', auth, createTask);
router.get('/:projectId', auth, getTasks);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);


module.exports = router;
