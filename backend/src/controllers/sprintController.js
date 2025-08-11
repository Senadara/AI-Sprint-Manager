const Sprint = require('../models/Sprint');
const Project = require('../models/Project');

exports.createSprint = async (req, res) => {
  try {
    const { projectId, name, startDate, endDate } = req.body;

    // Pastikan project milik user
    const project = await Project.findOne({ where: { id: projectId, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const sprint = await Sprint.create({ name, startDate, endDate, projectId });
    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSprints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const sprints = await Sprint.findAll({ where: { projectId } });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const sprint = await Sprint.findByPk(id);
    if (!sprint) return res.status(404).json({ message: 'Sprint not found' });

    await sprint.update(req.body);
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Sprint.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Sprint not found' });

    res.json({ message: 'Sprint deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
