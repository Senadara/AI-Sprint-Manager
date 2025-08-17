const KEY = (projectId, suffix) => `pm_${projectId}_${suffix}`;

export const projectStore = {
  saveDraft(projectId, data) {
    localStorage.setItem(KEY(projectId, "draft"), JSON.stringify(data));
  },
  loadDraft(projectId) {
    const raw = localStorage.getItem(KEY(projectId, "draft"));
    return raw ? JSON.parse(raw) : null;
  },
  saveBoard(projectId, tasks) {
    localStorage.setItem(KEY(projectId, "board"), JSON.stringify(tasks));
  },
  loadBoard(projectId) {
    const raw = localStorage.getItem(KEY(projectId, "board"));
    return raw ? JSON.parse(raw) : null;
  },
  pushHistory(projectId, kind, item) {
    const k = KEY(projectId, `${kind}_history`);
    const arr = JSON.parse(localStorage.getItem(k) || "[]");
    arr.unshift({ ...item, ts: Date.now() });
    localStorage.setItem(k, JSON.stringify(arr.slice(0, 30)));
  },
  getHistory(projectId, kind) {
    const k = KEY(projectId, `${kind}_history`);
    return JSON.parse(localStorage.getItem(k) || "[]");
  },
  saveAiPlan(projectId, plan) {
    localStorage.setItem(KEY(projectId, "ai_plan"), JSON.stringify(plan));
  },
  loadAiPlan(projectId) {
    const raw = localStorage.getItem(KEY(projectId, "ai_plan"));
    return raw ? JSON.parse(raw) : null;
  }
};
