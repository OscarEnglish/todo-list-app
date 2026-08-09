// ---- Task class ----
class Task {
  constructor(text) {
    this.id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    this.text = text;
    this.completed = false;
  }
}

// ---- App state ----
const STORAGE_KEY = "todoAppTasks";
let tasks = [];
let currentFilter = "all";
let editingTaskId = null;

// ---- DOM references ----
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const errorMsg = document.getElementById("errorMsg");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const filterBtns = document.querySelectorAll(".filter-btn");

const editModal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const editErrorMsg = document.getElementById("editErrorMsg");
const saveEditBtn = document.getElementById("saveEdit");
const cancelEditBtn = document.getElementById("cancelEdit");

// ---- Local Storage helpers ----
function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      tasks = JSON.parse(stored);
    } catch (e) {
      tasks = [];
    }
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---- Rendering ----
function render() {
  taskList.innerHTML = "";

  let visibleTasks = tasks;
  if (currentFilter === "active") {
    visibleTasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    visibleTasks = tasks.filter((t) => t.completed);
  }

  emptyState.style.display = visibleTasks.length === 0 ? "block" : "none";

  visibleTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
      <span class="task-text"></span>
      <div class="task-actions">
        <button class="icon-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-btn delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    // Set text safely to avoid any HTML injection from task text
    li.querySelector(".task-text").textContent = task.text;

    taskList.appendChild(li);
  });

  taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;
}

// ---- Validation ----
function validateInput(value) {
  return value.trim().length > 0;
}

// ---- Add task ----
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = taskInput.value;

  if (!validateInput(value)) {
    errorMsg.textContent = "Task cannot be empty.";
    return;
  }

  errorMsg.textContent = "";
  const newTask = new Task(value.trim());
  tasks.push(newTask);
  saveTasks();
  render();

  taskInput.value = "";
  taskInput.focus();
});

// Clear error as soon as user starts typing again
taskInput.addEventListener("input", () => {
  if (errorMsg.textContent) errorMsg.textContent = "";
});

// ---- Task list interactions (event delegation) ----
taskList.addEventListener("click", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("task-checkbox")) {
    toggleComplete(id);
  } else if (e.target.classList.contains("delete-btn")) {
    deleteTask(id);
  } else if (e.target.classList.contains("edit-btn")) {
    openEditModal(id);
  }
});

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

// ---- Edit modal ----
function openEditModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editingTaskId = id;
  editInput.value = task.text;
  editErrorMsg.textContent = "";
  editModal.classList.remove("hidden");
  editInput.focus();
}

function closeEditModal() {
  editModal.classList.add("hidden");
  editingTaskId = null;
}

saveEditBtn.addEventListener("click", () => {
  const value = editInput.value;
  if (!validateInput(value)) {
    editErrorMsg.textContent = "Task cannot be empty.";
    return;
  }
  const task = tasks.find((t) => t.id === editingTaskId);
  if (task) {
    task.text = value.trim();
    saveTasks();
    render();
  }
  closeEditModal();
});

cancelEditBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

editInput.addEventListener("input", () => {
  if (editErrorMsg.textContent) editErrorMsg.textContent = "";
});

// ---- Filters ----
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ---- Init ----
loadTasks();
render();
