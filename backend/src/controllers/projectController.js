const { Project } = require('../models');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({ name, description, userId: req.user.id });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { userId: req.user.id } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ where: { id, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ where: { id, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.update(req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Project.destroy({ where: { id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Project not found' });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
