const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { createSprint, getSprints, getAllSprints, updateSprint, deleteSprint } = require('../controllers/sprintController');

router.post('/', auth, createSprint);
router.get('/all', auth, getAllSprints);
router.get('/project/:projectId', auth, getSprints);
router.get('/:projectId', auth, getSprints);
router.put('/:id', auth, updateSprint);
router.delete('/:id', auth, deleteSprint);

module.exports = router;
