const { v4: uuidv4 } = require("uuid");
const replicate = require("../config/replicateClient.js");
const { Project, Sprint, Task, User, ChatHistory, ChatMessage } = require("../models");
const { jsonrepair } = require("jsonrepair");

// Helper function to detect response type and language
const detectResponseType = (response) => {
  const codePatterns = [
    /```[\w]*\n[\s\S]*?\n```/g, // Code blocks
    /function\s+\w+\s*\(/g, // Function declarations
    /const\s+\w+\s*=/g, // Const declarations
    /let\s+\w+\s*=/g, // Let declarations
    /var\s+\w+\s*=/g, // Var declarations
    /import\s+.*from/g, // Import statements
    /export\s+/g, // Export statements
    /class\s+\w+/g, // Class declarations
    /if\s*\(/g, // If statements
    /for\s*\(/g, // For loops
    /while\s*\(/g, // While loops
    /switch\s*\(/g, // Switch statements
    /try\s*{/g, // Try blocks
    /catch\s*\(/g, // Catch blocks
    /console\./g, // Console statements
    /return\s+/g, // Return statements
  ];

  const hasCode = codePatterns.some(pattern => pattern.test(response));
  
  // Check if response contains both code and text
  const hasText = /[a-zA-Z]{3,}/.test(response.replace(/```[\w]*\n[\s\S]*?\n```/g, ''));
  
  if (hasCode && hasText) {
    return { type: 'mixed', language: detectLanguage(response) };
  } else if (hasCode) {
    return { type: 'code', language: detectLanguage(response) };
  } else {
    return { type: 'message', language: null };
  }
};

// Helper function to detect programming language
const detectLanguage = (response) => {
  const languagePatterns = {
    javascript: /```javascript|```js|function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|import\s+.*from|export\s+/gi,
    python: /```python|```py|def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|class\s+\w+/gi,
    java: /```java|public\s+class|public\s+static\s+void|private\s+\w+|protected\s+\w+/gi,
    cpp: /```cpp|```c\+\+|#include|using\s+namespace|std::|int\s+main/gi,
    csharp: /```csharp|```cs|using\s+System|namespace\s+\w+|public\s+class/gi,
    php: /```php|<\?php|function\s+\w+\s*\(|echo\s+|print\s+/gi,
    ruby: /```ruby|def\s+\w+|class\s+\w+|require\s+|module\s+/gi,
    go: /```go|package\s+\w+|func\s+\w+|import\s+\(/gi,
    rust: /```rust|fn\s+\w+|let\s+\w+|use\s+\w+|mod\s+\w+/gi,
    sql: /```sql|SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP/gi,
    html: /```html|<!DOCTYPE|<html|<\/html>|<head|<\/head>|<body|<\/body>/gi,
    css: /```css|\.\w+\s*{|#\w+\s*{|@media|@keyframes/gi,
    typescript: /```typescript|```ts|interface\s+\w+|type\s+\w+=|enum\s+\w+/gi,
    react: /```jsx|```tsx|import\s+React|export\s+default|function\s+\w+\s*\(|const\s+\w+\s*=\s*\(/gi,
    vue: /```vue|<template>|export\s+default|data\s*\(\)|methods\s*:/gi
  };

  for (const [language, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(response)) {
      return language;
    }
  }
  
  return 'text';
};

// Helper function to generate title from prompt
const generateTitle = (prompt) => {
  const words = prompt.split(' ').slice(0, 5);
  return words.join(' ') + (prompt.split(' ').length > 5 ? '...' : '');
};

exports.chat = async (req, res) => {
  try {
    const { prompt, options, chatHistoryId } = req.body;
    if (!prompt) return res.status(400).json({ message: "prompt required" });

    const input = {
      prompt,
      max_tokens: options?.max_tokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
      top_p: options?.top_p ?? 0.9,
      top_k: options?.top_k ?? 50,
    };

    const output = await replicate.run("ibm-granite/granite-3.3-8b-instruct", {
      input,
    });

    const response = Array.isArray(output) ? output.join("") : String(output);
    
    // Detect response type and language
    const { type, language } = detectResponseType(response);
    
    let chatHistory;
    let isNewChat = false;

    if (chatHistoryId) {
      // Continue existing chat
      chatHistory = await ChatHistory.findOne({
        where: { id: chatHistoryId, userId: req.user.id }
      });
      if (!chatHistory) {
        return res.status(404).json({ error: "Chat not found" });
      }
      // Not a new chat since we're continuing existing one
      isNewChat = false;
    } else {
      // Create new chat
      const title = generateTitle(prompt);
      chatHistory = await ChatHistory.create({
        title,
        userId: req.user.id
      });
      isNewChat = true;
    }

    // Save user message
    await ChatMessage.create({
      prompt,
      response: prompt, // For user message, response is the same as prompt
      type: 'message',
      language: null,
      isUserMessage: true,
      chatHistoryId: chatHistory.id
    });

    // Save AI response
    const aiMessage = await ChatMessage.create({
      prompt,
      response,
      type,
      language,
      isUserMessage: false,
      chatHistoryId: chatHistory.id
    });

    return res.json({ 
      result: response,
      type,
      language,
      title: chatHistory.title,
      chatHistoryId: chatHistory.id,
      messageId: aiMessage.id,
      timestamp: aiMessage.createdAt,
      isNewChat
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return res.status(500).json({ error: err.message || "AI error" });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 50,
      include: [
        {
          model: ChatMessage,
          order: [['createdAt', 'ASC']],
          limit: 1 // Get only the first message for preview
        }
      ]
    });
    
    res.json(chatHistory);
  } catch (err) {
    console.error("Get chat history error:", err);
    return res.status(500).json({ error: err.message || "Failed to get chat history" });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await ChatHistory.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: ChatMessage,
          order: [['createdAt', 'ASC']]
        }
      ]
    });
    
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    res.json(chat);
  } catch (err) {
    console.error("Get chat by id error:", err);
    return res.status(500).json({ error: err.message || "Failed to get chat" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await ChatHistory.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    // Soft delete by setting isActive to false
    await chat.update({ isActive: false });
    
    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Delete chat error:", err);
    return res.status(500).json({ error: err.message || "Failed to delete chat" });
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
