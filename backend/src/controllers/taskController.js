const Task = require("../models/Task");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");

exports.createTask = async (req, res) => {
  try {
    const { projectId, sprintId, title, description, status } = req.body;

    // Pastikan project milik user
    const project = await Project.findOne({
      where: { id: projectId, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Sprint opsional
    let sprint = null;
    if (sprintId) {
      sprint = await Sprint.findByPk(sprintId);
      if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    }

    const task = await Task.create({
      projectId,
      sprintId,
      title,
      description,
      status,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.findAll({ where: { projectId } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // update status
    await task.update({ status });

    // ambil semua task milik project supaya broadcast state penuh (grouped)
    const allTasks = await Task.findAll({
      where: { projectId: task.projectId },
    });

    const grouped = {
      todo: allTasks.filter((t) => t.status === "todo"),
      "in-progress": allTasks.filter((t) => t.status === "in-progress"),
      done: allTasks.filter((t) => t.status === "done"),
    };

    // broadcast via socket (server-side emit)
    const io = req.app.get("io");
    if (io) {
      io.emit("taskUpdated", grouped);
    }

    return res.json({ message: "Task updated", task });
  } catch (err) {
    console.error("updateTask error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
