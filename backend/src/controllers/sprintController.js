const { Sprint, Project, Task } = require('../models');

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
    
    // Pastikan project milik user
    const project = await Project.findOne({ where: { id: projectId, userId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const sprints = await Sprint.findAll({ 
      where: { projectId },
      include: [
        {
          model: Task,
          as: 'Tasks'
        }
      ]
    });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSprints = async (req, res) => {
  try {
    const { projectId, startDate, endDate, assignee } = req.query;
    
    let whereClause = {};
    let taskWhereClause = {};
    
    // Filter by project
    if (projectId) {
      whereClause.projectId = projectId;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      whereClause.startDate = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // Filter by assignee
    if (assignee) {
      taskWhereClause.assignee = {
        [require('sequelize').Op.like]: `%${assignee}%`
      };
    }
    
    const sprints = await Sprint.findAll({ 
      where: whereClause,
      include: [
        {
          model: Task,
          as: 'Tasks',
          where: Object.keys(taskWhereClause).length > 0 ? taskWhereClause : undefined,
          required: Object.keys(taskWhereClause).length > 0
        },
        {
          model: Project,
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['startDate', 'ASC']]
    });
    
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
