// =====================================
// DONEDROP - TEAM WORKSPACE APPLICATION
// =====================================

const $ = id => document.getElementById(id);

const members = [
  { id: "jash", name: "Jashwanth", role: "Frontend", initials: "DJ", color: "purple" },
  { id: "priya", name: "Priya", role: "Backend", initials: "P", color: "blue" },
  { id: "uday", name: "Uday", role: "Design", initials: "EU", color: "orange" },
  { id: "kavya", name: "Kavya", role: "Documentation", initials: "KS", color: "pink" },
  { id: "arjun", name: "Arjun", role: "Frontend", initials: "A", color: "green" }
];

const seedTasks = [
  { id: 1, title: "Design Landing Wireframe", description: "Create the initial wireframe and page layout.", assignee: "uday", priority: "High", status: "done", due: "2026-11-19", hours: 4, role: "Design" },
  { id: 2, title: "Build Dashboard UI", description: "Create the main dashboard with responsive layout.", assignee: "jash", priority: "High", status: "doing", due: "2026-11-23", hours: 6, role: "Frontend" },
  { id: 3, title: "Set Up Project Structure", description: "Prepare project folders and starter files.", assignee: "jash", priority: "Medium", status: "done", due: "2026-11-18", hours: 2, role: "Frontend" },
  { id: 4, title: "Create API Architecture", description: "Plan the API structure and endpoints.", assignee: "priya", priority: "Urgent", status: "doing", due: "2026-11-22", hours: 5, role: "Backend" },
  { id: 5, title: "Prepare Project Documentation", description: "Write project overview and documentation.", assignee: "kavya", priority: "Medium", status: "todo", due: "2026-11-25", hours: 3, role: "Documentation" },
  { id: 6, title: "Design Mobile Layout", description: "Make the dashboard work on mobile screens.", assignee: "uday", priority: "Low", status: "todo", due: "2026-11-26", hours: 3, role: "Design" },
  { id: 7, title: "Test Task Creation Flow", description: "Test adding, editing and deleting tasks.", assignee: "arjun", priority: "High", status: "todo", due: "2026-11-24", hours: 4, role: "Frontend" },
  { id: 8, title: "Review UI Components", description: "Review buttons, forms and reusable components.", assignee: "jash", priority: "Low", status: "done", due: "2026-11-20", hours: 2, role: "Frontend" },
  { id: 9, title: "Create Team Profiles", description: "Add member details and roles.", assignee: "kavya", priority: "Medium", status: "doing", due: "2026-11-27", hours: 3, role: "Documentation" },
  { id: 10, title: "Set Up Database Plan", description: "Plan how task information will be stored.", assignee: "priya", priority: "Urgent", status: "todo", due: "2026-11-22", hours: 5, role: "Backend" },
  { id: 11, title: "Build Priority Filters", description: "Add filtering by priority and status.", assignee: "arjun", priority: "High", status: "done", due: "2026-11-20", hours: 3, role: "Frontend" },
  { id: 12, title: "Prepare Presentation Slides", description: "Prepare the final project presentation.", assignee: "kavya", priority: "Medium", status: "todo", due: "2026-11-28", hours: 4, role: "Documentation" },
  { id: 13, title: "Create Brand Identity", description: "Finalize colors, typography and logo direction.", assignee: "uday", priority: "Low", status: "done", due: "2026-11-19", hours: 2, role: "Design" },
  { id: 14, title: "Integrate Stripe Webhooks", description: "Prepare the payment webhook integration task.", assignee: "priya", priority: "Urgent", status: "todo", due: "2026-11-22", hours: 5, role: "Backend" },
  { id: 15, title: "Fix Responsive Issues", description: "Check and fix layout issues on smaller screens.", assignee: "arjun", priority: "High", status: "doing", due: "2026-11-23", hours: 3, role: "Frontend" },
  { id: 16, title: "Final Project Review", description: "Review the project before the final demo.", assignee: "jash", priority: "Medium", status: "todo", due: "2026-11-29", hours: 2, role: "Frontend" }
];

// STORAGE

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

let tasks = readStorage("donedropTasks", seedTasks);
let activities = readStorage("donedropActivities", []);
let currentTaskId = null;
let currentView = "overview";

function saveTasks() {
  localStorage.setItem("donedropTasks", JSON.stringify(tasks));
}

function saveActivities() {
  localStorage.setItem("donedropActivities", JSON.stringify(activities));
}

function getLoggedInUser() {
  return readStorage("donedropUser", null);
}

// HELPERS

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function getMember(id) {
  return members.find(m => m.id === id) || members[0];
}

function statusLabel(status) {
  return {
    todo: "To do",
    doing: "In progress",
    done: "Completed"
  }[status] || status;
}

function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateLabel(value) {
  if (!value) return "No due date";

  return new Date(value + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function isOverdue(task) {
  if (!task.due || task.status === "done") return false;
  return new Date(task.due + "T00:00:00") < getToday();
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function logActivity(message) {
  activities.unshift({
    message,
    time: new Date().toISOString()
  });

  activities = activities.slice(0, 50);
  saveActivities();
}

// LOGIN SYSTEM

function showDashboard(user) {
  $("loginScreen").hidden = true;
  $("mainApp").hidden = false;

  const nameParts = user.name.trim().split(/\s+/);
  const firstName = nameParts[0];

  const initials = nameParts
    .map(part => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  $("heading").innerHTML =
    `Welcome back, ${escapeHTML(firstName)} <span>✦</span>`;

  $("sidebarName").textContent = user.name;
  $("sidebarEmail").textContent = user.email;
  $("sidebarAvatar").textContent = initials;

  renderAll();
  switchView("overview");
}

function showLogin() {
  $("mainApp").hidden = true;
  $("loginScreen").hidden = false;
}

$("loginForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("loginName").value.trim();
  const email = $("loginEmail").value.trim();

  if (!name || !email) {
    showToast("Please enter your name and email.");
    return;
  }

  const user = { name, email };

  localStorage.setItem("donedropUser", JSON.stringify(user));

  showDashboard(user);
  $("loginForm").reset();
  showToast("Welcome to DoneDrop, " + name + "!");
});

$("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("donedropUser");
  showLogin();
  showToast("You have logged out.");
});

// DATE AND MEMBERS

function setupDate() {
  $("todayLabel").textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function setupMemberOptions() {
  $("taskAssignee").innerHTML = members.map(m =>
    `<option value="${m.id}">${escapeHTML(m.name)} — ${escapeHTML(m.role)}</option>`
  ).join("");

  $("assigneeFilter").innerHTML =
    `<option value="all">All members</option>` +
    members.map(m =>
      `<option value="${m.id}">${escapeHTML(m.name)}</option>`
    ).join("");
}

// STATISTICS

function renderStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const doing = tasks.filter(t => t.status === "doing").length;
  const todo = tasks.filter(t => t.status === "todo").length;
  const overdue = tasks.filter(isOverdue).length;

  const percent = total ? Math.round(done / total * 100) : 0;

  $("totalStat").textContent = total;
  $("activeStat").textContent = doing;
  $("completedStat").textContent = done;
  $("overdueStat").textContent = overdue;
  $("navTaskCount").textContent = total;

  $("progressPercent").textContent = percent + "%";
  $("progressRing").style.setProperty("--progress", percent + "%");

  $("legendDone").textContent = done;
  $("legendDoing").textContent = doing;
  $("legendTodo").textContent = todo;
}

// WORKLOAD

function renderWorkload() {
  const counts = members.map(m => ({
    ...m,
    count: tasks.filter(t =>
      t.assignee === m.id && t.status !== "done"
    ).length
  }));

  const max = Math.max(1, ...counts.map(m => m.count));

  $("workloadList").innerHTML = counts.map(m => `
    <div class="workload-row">
      <div class="avatar ${m.color}">${escapeHTML(m.initials)}</div>
      <div>
        <div class="workload-name">
          <strong>${escapeHTML(m.name)}</strong>
          <small>${escapeHTML(m.role)}</small>
        </div>
        <div class="bar">
          <span style="width:${m.count / max * 100}%"></span>
        </div>
      </div>
      <div class="workload-count">${m.count}</div>
    </div>
  `).join("");
}

// TASK FILTERING

function getFilteredTasks() {
  const search = $("searchInput").value.toLowerCase().trim();
  const status = $("statusFilter").value;
  const priority = $("priorityFilter").value;
  const assignee = $("assigneeFilter").value;

  const priorityOrder = {
    Urgent: 0,
    High: 1,
    Medium: 2,
    Low: 3
  };

  return tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      (task.description || "").toLowerCase().includes(search);

    return matchesSearch &&
      (status === "all" || task.status === status) &&
      (priority === "all" || task.priority === priority) &&
      (assignee === "all" || task.assignee === assignee);
  }).sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

// TASK TABLE

function renderTasks() {
  const filtered = getFilteredTasks();

  const displayTasks = currentView === "overview"
    ? filtered.slice(0, 7)
    : filtered;

  $("taskTable").innerHTML = displayTasks.map(task => {
    const m = getMember(task.assignee);

    return `
      <tr>
        <td>
          <span class="task-name" data-detail="${task.id}">
            ${escapeHTML(task.title)}
          </span>
          <span class="task-sub">
            ${escapeHTML(task.description || "No description")}
          </span>
        </td>

        <td>
          <div class="assignee">
            <span class="avatar ${m.color}">
              ${escapeHTML(m.initials)}
            </span>
            ${escapeHTML(m.name)}
          </div>
        </td>

        <td>
          <span class="pill priority-${task.priority}">
            ${escapeHTML(task.priority)}
          </span>
        </td>

        <td class="${isOverdue(task) ? "due-overdue" : ""}">
          ${dateLabel(task.due)}
        </td>

        <td>
          <span class="pill status-${task.status}">
            ${statusLabel(task.status)}
          </span>
        </td>

        <td>
          <div class="row-actions">
            <button title="Edit task" data-edit="${task.id}">✎</button>
            <button title="View details" data-detail="${task.id}">⋯</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  $("emptyState").hidden = displayTasks.length > 0;
}

// TEAM PAGE

function renderTeam() {
  $("teamGrid").innerHTML = members.map(m => {
    const assigned = tasks.filter(t => t.assignee === m.id);
    const completed = assigned.filter(t => t.status === "done").length;

    return `
      <article class="member-card">
        <div class="avatar ${m.color}">
          ${escapeHTML(m.initials)}
        </div>
        <h3>${escapeHTML(m.name)}</h3>
        <p>${escapeHTML(m.role)}</p>
        <strong>${assigned.length} tasks assigned</strong>
        <p>${completed} completed · ${assigned.length - completed} remaining</p>
      </article>
    `;
  }).join("");
}

// ACTIVITY PAGE

function renderActivity() {
  if (!activities.length) {
    $("activityList").innerHTML =
      `<p class="muted">No activity yet. Task updates will appear here.</p>`;
    return;
  }

  $("activityList").innerHTML = activities.map(item => `
    <div class="activity-item">
      <strong>${escapeHTML(item.message)}</strong>
      <small>${new Date(item.time).toLocaleString()}</small>
    </div>
  `).join("");
}

// RENDER ALL

function renderAll() {
  renderStats();
  renderWorkload();
  renderTasks();
  renderTeam();
  renderActivity();
}

// NAVIGATION

function switchView(view) {
  currentView = view;

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  $("teamPage").hidden = view !== "team";
  $("activityPage").hidden = view !== "activity";

  $("taskSectionTitle").textContent =
    view === "tasks" ? "All tasks" : "Recent tasks";

  const headings = {
    overview: "Overview",
    tasks: "All tasks",
    team: "Team members",
    activity: "Activity log"
  };

  const subtitles = {
    overview: "Here's what's happening with your team today.",
    tasks: "Manage, filter and update every task.",
    team: "See your team members and assigned work.",
    activity: "A timeline of changes in your workspace."
  };

  $("pageName").textContent = headings[view];

  const user = getLoggedInUser();
  const firstName = user ? user.name.trim().split(/\s+/)[0] : "Member";

  if (view === "overview") {
    $("heading").innerHTML =
      `Welcome back, ${escapeHTML(firstName)} <span>✦</span>`;
  } else {
    $("heading").textContent = headings[view];
  }

  $("subheading").textContent = subtitles[view];

  document.querySelector(".stats-grid").style.display =
    view === "overview" ? "grid" : "none";

  document.querySelector(".content-grid").style.display =
    view === "overview" ? "grid" : "none";

  $("taskSectionTitle").parentElement.parentElement.style.display =
    view === "team" || view === "activity" ? "none" : "flex";

  document.querySelector(".tasks-panel").style.display =
    view === "team" || view === "activity" ? "none" : "block";

  renderTasks();
}

// TASK MODAL

function openTaskModal(task = null) {
  $("taskForm").reset();

  $("taskId").value = task ? task.id : "";
  $("modalTitle").textContent = task ? "Edit task" : "Create a task";
  $("saveTaskBtn").textContent = task ? "Save changes" : "Create task";

  if (task) {
    $("taskTitle").value = task.title;
    $("taskDescription").value = task.description || "";
    $("taskAssignee").value = task.assignee;
    $("taskRole").value = task.role;
    $("taskPriority").value = task.priority;
    $("taskStatus").value = task.status;
    $("taskDue").value = task.due || "";
    $("taskHours").value = task.hours || 1;
  } else {
    $("taskAssignee").value = members[0].id;
    $("taskRole").value = members[0].role;
    $("taskPriority").value = "Medium";
    $("taskStatus").value = "todo";
    $("taskHours").value = 2;
  }

  $("taskModal").classList.add("show");
  $("taskTitle").focus();
}

function closeModal(id) {
  $(id).classList.remove("show");
}

// SAVE TASK

function saveTask(event) {
  event.preventDefault();

  const id = $("taskId").value;
  const taskData = {
    title: $("taskTitle").value.trim(),
    description: $("taskDescription").value.trim(),
    assignee: $("taskAssignee").value,
    role: $("taskRole").value,
    priority: $("taskPriority").value,
    status: $("taskStatus").value,
    due: $("taskDue").value,
    hours: Number($("taskHours").value) || 0
  };

  if (!taskData.title) return;

  if (id) {
    const index = tasks.findIndex(t => t.id === Number(id));

    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...taskData };
      logActivity("Updated task: " + taskData.title);
      showToast("Task updated successfully");
    }
  } else {
    tasks.unshift({
      id: Date.now(),
      ...taskData
    });

    logActivity("Created task: " + taskData.title);
    showToast("New task created");
  }

  saveTasks();
  closeModal("taskModal");
  renderAll();
}

// TASK DETAILS

function openDetails(id) {
  const task = tasks.find(t => t.id === Number(id));
  if (!task) return;

  currentTaskId = task.id;

  const m = getMember(task.assignee);

  $("detailTitle").textContent = task.title;
  $("detailDescription").textContent =
    task.description || "No description added.";

  $("detailInfo").innerHTML = `
    <div class="detail-cell">
      <small>ASSIGNEE</small>
      <strong>${escapeHTML(m.name)}</strong>
    </div>
    <div class="detail-cell">
      <small>ROLE</small>
      <strong>${escapeHTML(task.role)}</strong>
    </div>
    <div class="detail-cell">
      <small>PRIORITY</small>
      <strong>${escapeHTML(task.priority)}</strong>
    </div>
    <div class="detail-cell">
      <small>STATUS</small>
      <strong>${statusLabel(task.status)}</strong>
    </div>
    <div class="detail-cell">
      <small>DUE DATE</small>
      <strong>${dateLabel(task.due)}</strong>
    </div>
    <div class="detail-cell">
      <small>ESTIMATED HOURS</small>
      <strong>${task.hours} hours</strong>
    </div>
  `;

  $("detailModal").classList.add("show");
}

function editCurrentTask() {
  const task = tasks.find(t => t.id === currentTaskId);
  if (!task) return;

  closeModal("detailModal");
  openTaskModal(task);
}

function deleteCurrentTask() {
  const task = tasks.find(t => t.id === currentTaskId);
  if (!task) return;

  if (!confirm(`Delete "${task.title}"?`)) return;

  tasks = tasks.filter(t => t.id !== currentTaskId);

  logActivity("Deleted task: " + task.title);
  saveTasks();

  closeModal("detailModal");
  renderAll();
  showToast("Task deleted");
}

// EVENT LISTENERS

$("addTaskBtn").addEventListener("click", () => openTaskModal());

$("viewAllBtn").addEventListener("click", () => switchView("tasks"));

$("taskForm").addEventListener("submit", saveTask);

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    switchView(button.dataset.view);
  });
});

document.querySelectorAll("[data-view]").forEach(button => {
  if (!button.classList.contains("nav-item")) {
    button.addEventListener("click", () => {
      switchView(button.dataset.view);
    });
  }
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) {
      closeModal(backdrop.id);
    }
  });
});

$("taskTable").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit]");
  const detailButton = event.target.closest("[data-detail]");

  if (editButton) {
    const task = tasks.find(t => t.id === Number(editButton.dataset.edit));
    if (task) openTaskModal(task);
  }

  if (detailButton) {
    openDetails(detailButton.dataset.detail);
  }
});

$("editTaskBtn").addEventListener("click", editCurrentTask);
$("deleteTaskBtn").addEventListener("click", deleteCurrentTask);

["searchInput", "statusFilter", "priorityFilter", "assigneeFilter"].forEach(id => {
  $(id).addEventListener("input", renderTasks);
  $(id).addEventListener("change", renderTasks);
});

$("taskAssignee").addEventListener("change", () => {
  $("taskRole").value = getMember($("taskAssignee").value).role;
});

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "donedropTheme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.show").forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// INITIALIZATION

setupDate();
setupMemberOptions();

if (localStorage.getItem("donedropTheme") === "dark") {
  document.body.classList.add("dark");
}

const savedUser = getLoggedInUser();

if (savedUser && savedUser.name && savedUser.email) {
  showDashboard(savedUser);
} else {
  $("loginScreen").hidden = false;
  $("mainApp").hidden = true;
}