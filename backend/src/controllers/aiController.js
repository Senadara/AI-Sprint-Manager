const { v4: uuidv4 } = require("uuid");
const replicate = require("../config/replicateClient.js");
const { Project, Sprint, Task, User } = require("../models");
const { jsonrepair } = require("jsonrepair");

exports.chat = async (req, res) => {
  try {
    const { prompt, options } = req.body;
    if (!prompt) return res.status(400).json({ message: "prompt required" });

    const input = {
      prompt,
      max_tokens: options?.max_tokens ?? 256,
      temperature: options?.temperature ?? 0.6,
      top_p: options?.top_p ?? 0.9,
      top_k: options?.top_k ?? 50,
    };

    const output = await replicate.run("ibm-granite/granite-3.3-8b-instruct", {
      input,
    });

    const text = Array.isArray(output) ? output.join("") : String(output);

    return res.json({ result: text });
  } catch (err) {
    console.error("AI chat error:", err);
    return res.status(500).json({ error: err.message || "AI error" });
  }
};

exports.generateSprint = async (req, res) => {
  try {
    const { judulProject, deskripsiProject, deadlineProject, stackProject } =
      req.body;

    if (!judulProject || !deskripsiProject || !deadlineProject || !stackProject) {
      return res.status(400).json({ error: "Semua field input wajib diisi." });
    }

    const prompt = `
Anda adalah AI Project Manager. 
Output HARUS berupa JSON valid, tanpa teks, penjelasan, atau komentar apapun.
Gunakan hanya properti berikut sesuai format:
- sprints[]: id (null), name (string), description (string), start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), tasks[]
- tasks[]: id (null), title (string), description (string), estimated_days (number), status ("todo"), sprintReference ("SPRINT_REF_X"), priority ("low"/"medium"/"high"/"critical"), assignee (string), deadline (YYYY-MM-DD)

Contoh:
{
  "sprints": [
    {
      "id": null,
      "name": "Sprint 1",
      "description": "Deskripsi sprint",
      "start_date": "2025-01-01",
      "end_date": "2025-01-10",
      "tasks": [
        {
          "id": null,
          "title": "Task 1",
          "description": "Deskripsi task",
          "estimated_days": 3,
          "status": "todo",
          "sprintReference": "SPRINT_REF_1",
          "priority": "high",
          "assignee": "John Doe",
          "deadline": "2025-01-05"
        }
      ]
    }
  ]
}

Berdasarkan informasi berikut:
Judul Project: ${judulProject}
Deskripsi Project: ${deskripsiProject}
Deadline Project: ${deadlineProject}
Stack Project: ${stackProject}

Hanya kirimkan JSON, tanpa kalimat lain.
    `;

    const aiResponse = await replicate.run(
      "ibm-granite/granite-3.3-8b-instruct",
      { input: { prompt } }
    );

    let cleanedOutput = aiResponse.join("").trim();

    const firstBrace = cleanedOutput.indexOf("{");
    const lastBrace = cleanedOutput.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({
        error: "Tidak ditemukan objek JSON dalam output AI.",
        raw: cleanedOutput,
      });
    }

    let jsonString = cleanedOutput.substring(firstBrace, lastBrace + 1);

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (err) {
      try {
        jsonString = jsonrepair(jsonString);
        parsedData = JSON.parse(jsonString);
      } catch (repairErr) {
        return res.status(500).json({
          error: "Gagal parsing data dari AI setelah perbaikan.",
          raw: jsonString,
        });
      }
    }

    if (!parsedData.sprints || !Array.isArray(parsedData.sprints)) {
      return res.status(500).json({
        error: "Struktur JSON tidak sesuai (sprints tidak ditemukan atau bukan array).",
        raw: parsedData,
      });
    }

    res.json({
      project: {
        judul: judulProject,
        deskripsi: deskripsiProject,
        deadline: deadlineProject,
        stack: stackProject,
      },
      sprints: parsedData.sprints,
    });
  } catch (error) {
    console.error("generateSprint error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.saveSprint = async (req, res) => {
  try {
    const { projectId, sprints } = req.body;
    if (!projectId || !sprints) {
      return res
        .status(400)
        .json({ message: "projectId dan sprints wajib diisi" });
    }

    const createdSprints = [];
    const sprintRefMap = {};

    for (let i = 0; i < sprints.length; i++) {
      const sprint = sprints[i];
      const createdSprint = await Sprint.create({
        name: sprint.name,
        description: sprint.description,
        startDate: sprint.start_date || new Date(),
        endDate: sprint.end_date || null,
        projectId,
      });

      sprintRefMap[`SPRINT_REF_${i + 1}`] = createdSprint.id;
      createdSprints.push(createdSprint);
    }

    const createdTasks = [];
    for (const sprint of sprints) {
      for (const task of sprint.tasks) {
        const createdTask = await Task.create({
          title: task.title,
          description: task.description,
          status: task.status || "todo",
          priority: task.priority || "medium",
          assignee: task.assignee || null,
          deadline: task.deadline ? new Date(task.deadline) : null,
          estimatedDays: task.estimated_days || null,
          projectId,
          sprintId: sprintRefMap[task.sprintReference] || null,
        });
        createdTasks.push(createdTask);
      }
    }

    return res.json({
      sprints: createdSprints,
      tasks: createdTasks,
    });
  } catch (err) {
    console.error("saveSprint error:", err);
    return res.status(500).json({ error: err.message || "DB error" });
  }
};
