// Admin Panel JavaScript for FinDom Elite Tracker
// Handles task management, tribute tracking, sub profiles, and analytics

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the admin panel
    initializeAdminPanel();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
});

// Global variables
let currentTasks = [];
let currentSubs = [];
let currentTributeHistory = [];
let editingTaskId = null;
let editingSubId = null;

function initializeAdminPanel() {
    // Check if extension is activated
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (!response || !response.activated) {
            showStatusMessage('Extension not activated', 'error');
            return;
        }
    });
    
    // Set default tab
    showTab('tasks');
}

function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            showTab(tabName);
        });
    });
    
    // Header buttons
    document.getElementById('syncBtn').addEventListener('click', handleSync);
    document.getElementById('backToPopup').addEventListener('click', () => {
        window.close();
    });
    
    // Add buttons
    document.getElementById('addTaskBtn').addEventListener('click', () => showTaskModal());
    document.getElementById('addSubBtn').addEventListener('click', () => showSubModal());
    
    // Task filters
    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('difficultyFilter').addEventListener('change', filterTasks);
    document.getElementById('searchTasks').addEventListener('input', filterTasks);
    
    // Modal event listeners
    setupModalListeners();
}

function setupModalListeners() {
    // Task modal
    const taskModal = document.getElementById('taskModal');
    const subModal = document.getElementById('subModal');
    
    // Close buttons
    taskModal.querySelector('.close-btn').addEventListener('click', () => hideModal(taskModal));
    subModal.querySelector('.close-btn').addEventListener('click', () => hideModal(subModal));
    
    // Cancel buttons
    taskModal.querySelector('.cancel-btn').addEventListener('click', () => hideModal(taskModal));
    subModal.querySelector('.cancel-btn').addEventListener('click', () => hideModal(subModal));
    
    // Form submissions
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    document.getElementById('subForm').addEventListener('submit', handleSubSubmit);
    
    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) hideModal(taskModal);
        if (e.target === subModal) hideModal(subModal);
    });
}

function showTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Load tab-specific data
    switch(tabName) {
        case 'tasks':
            loadTasks();
            break;
        case 'tribute':
            loadTributeHistory();
            break;
        case 'profiles':
            loadSubProfiles();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

function loadInitialData() {
    loadTasks();
    loadTributeHistory();
    loadSubProfiles();
    loadAnalytics();
}

// Task Management Functions
function loadTasks() {
    chrome.runtime.sendMessage({ action: 'getTasks' }, (response) => {
        if (response && response.tasks) {
            currentTasks = response.tasks;
            displayTasks(currentTasks);
        } else {
            showStatusMessage('Failed to load tasks', 'error');
        }
    });
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="no-data">No tasks found</div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => createTaskCard(task)).join('');
    
    // Add event listeners to action buttons
    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.dataset.taskId);
            editTask(taskId);
        });
    });
    
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.dataset.taskId);
            deleteTask(taskId);
        });
    });
}

function createTaskCard(task) {
    const deadline = new Date(task.deadline);
    const isOverdue = deadline < new Date();
    const statusClass = isOverdue ? 'overdue' : task.status.toLowerCase();
    
    return `
        <div class="task-card ${task.difficulty}">
            <div class="task-card-header">
                <div>
                    <div class="task-card-title">${task.title}</div>
                    <div class="task-status ${statusClass}">${isOverdue ? 'OVERDUE' : task.status}</div>
                </div>
            </div>
            <div class="task-card-body">
                <div class="task-description">${task.description}</div>
                <div class="task-details">
                    <div class="task-detail">
                        <span class="label">Tribute:</span>
                        <span class="value tribute">${task.tribute}</span>
                    </div>
                    <div class="task-detail">
                        <span class="label">XP:</span>
                        <span class="value xp">${task.xp}</span>
                    </div>
                    <div class="task-detail">
                        <span class="label">Difficulty:</span>
                        <span class="value">${task.difficulty}</span>
                    </div>
                    <div class="task-detail">
                        <span class="label">Deadline:</span>
                        <span class="value">${formatDate(deadline)}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-task-id="${task.id}">Edit</button>
                <button class="delete-btn" data-task-id="${task.id}">Delete</button>
            </div>
        </div>
    `;
}

function filterTasks() {
    const statusFilter = document.getElementById('statusFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
    
    let filteredTasks = currentTasks.filter(task => {
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesDifficulty = difficultyFilter === 'all' || task.difficulty === difficultyFilter;
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || 
                            task.description.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesDifficulty && matchesSearch;
    });
    
    displayTasks(filteredTasks);
}

function showTaskModal(task = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const title = document.getElementById('modalTitle');
    
    if (task) {
        // Editing existing task
        title.textContent = 'Edit Task';
        editingTaskId = task.id;
        populateTaskForm(task);
    } else {
        // Adding new task
        title.textContent = 'Add New Task';
        editingTaskId = null;
        form.reset();
        
        // Set default deadline to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('taskDeadline').value = tomorrow.toISOString().slice(0, 16);
    }
    
    modal.classList.add('active');
}

function populateTaskForm(task) {
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskTribute').value = task.tribute;
    document.getElementById('taskXP').value = task.xp;
    document.getElementById('taskDifficulty').value = task.difficulty;
    document.getElementById('taskDeadline').value = new Date(task.deadline).toISOString().slice(0, 16);
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskData = {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        tribute: document.getElementById('taskTribute').value.trim(),
        xp: parseInt(document.getElementById('taskXP').value),
        difficulty: document.getElementById('taskDifficulty').value,
        deadline: new Date(document.getElementById('taskDeadline').value).toISOString(),
        status: 'ACTIVE'
    };
    
    if (editingTaskId) {
        // Update existing task
        taskData.id = editingTaskId;
        updateTask(taskData);
    } else {
        // Add new task
        taskData.id = Date.now(); // Simple ID generation
        addTask(taskData);
    }
}

function addTask(taskData) {
    currentTasks.push(taskData);
    saveTasksToStorage();
    displayTasks(currentTasks);
    hideModal(document.getElementById('taskModal'));
    showStatusMessage('Task added successfully', 'success');
}

function updateTask(taskData) {
    const index = currentTasks.findIndex(task => task.id === taskData.id);
    if (index !== -1) {
        currentTasks[index] = taskData;
        saveTasksToStorage();
        displayTasks(currentTasks);
        hideModal(document.getElementById('taskModal'));
        showStatusMessage('Task updated successfully', 'success');
    }
}

function editTask(taskId) {
    const task = currentTasks.find(t => t.id === taskId);
    if (task) {
        showTaskModal(task);
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        currentTasks = currentTasks.filter(task => task.id !== taskId);
        saveTasksToStorage();
        displayTasks(currentTasks);
        showStatusMessage('Task deleted successfully', 'success');
    }
}

function saveTasksToStorage() {
    chrome.runtime.sendMessage({ 
        action: 'updateTasks', 
        tasks: currentTasks 
    }, (response) => {
        if (!response || !response.success) {
            showStatusMessage('Failed to save tasks', 'error');
        }
    });
}

// Tribute History Functions
function loadTributeHistory() {
    // Generate dummy tribute history
    currentTributeHistory = generateDummyTributeHistory();
    displayTributeHistory();
    updateTributeSummary();
}

function generateDummyTributeHistory() {
    const history = [];
    const subs = ['Pet Alpha', 'Sub Beta', 'Worm Gamma', 'Slave Delta'];
    const tasks = ['Morning Tribute', 'Weekly Worship', 'Special Assignment', 'Punishment Task'];
    
    for (let i = 0; i < 20; i++) {
        const amount = Math.floor(Math.random() * 500) + 25;
        const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        history.push({
            id: i + 1,
            sub: subs[Math.floor(Math.random() * subs.length)],
            task: tasks[Math.floor(Math.random() * tasks.length)],
            amount: amount,
            date: date.toISOString()
        });
    }
    
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function displayTributeHistory() {
    const container = document.getElementById('tributeHistory');
    
    if (currentTributeHistory.length === 0) {
        container.innerHTML = '<div class="no-data">No tribute history found</div>';
        return;
    }
    
    container.innerHTML = currentTributeHistory.map(item => `
        <div class="tribute-item">
            <div class="tribute-info">
                <div class="tribute-title">${item.task}</div>
                <div class="tribute-sub">from ${item.sub} • ${formatDate(new Date(item.date))}</div>
            </div>
            <div class="tribute-amount-item">$${item.amount}</div>
        </div>
    `).join('');
}

function updateTributeSummary() {
    const total = currentTributeHistory.reduce((sum, item) => sum + item.amount, 0);
    const thisMonth = currentTributeHistory
        .filter(item => {
            const itemDate = new Date(item.date);
            const now = new Date();
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, item) => sum + item.amount, 0);
    
    const activeSubs = [...new Set(currentTributeHistory.map(item => item.sub))].length;
    
    document.getElementById('totalTribute').textContent = `$${total}`;
    document.getElementById('monthlyTribute').textContent = `$${thisMonth}`;
    document.getElementById('activeSubs').textContent = activeSubs;
}

// Sub Profile Functions
function loadSubProfiles() {
    // Generate dummy sub profiles
    currentSubs = generateDummySubProfiles();
    displaySubProfiles();
}

function generateDummySubProfiles() {
    return [
        {
            id: 1,
            name: 'Pet Alpha',
            email: 'alpha@example.com',
            level: 5,
            xp: 250,
            totalTribute: 1250,
            rank: 'Devoted',
            joinDate: new Date('2024-01-15').toISOString(),
            completedTasks: 15
        },
        {
            id: 2,
            name: 'Sub Beta',
            email: 'beta@example.com',
            level: 3,
            xp: 150,
            totalTribute: 750,
            rank: 'Apprentice',
            joinDate: new Date('2024-03-10').toISOString(),
            completedTasks: 8
        },
        {
            id: 3,
            name: 'Worm Gamma',
            email: 'gamma@example.com',
            level: 7,
            xp: 420,
            totalTribute: 2100,
            rank: 'Elite',
            joinDate: new Date('2023-11-20').toISOString(),
            completedTasks: 25
        }
    ];
}

function displaySubProfiles() {
    const container = document.getElementById('subProfiles');
    
    if (currentSubs.length === 0) {
        container.innerHTML = '<div class="no-data">No sub profiles found</div>';
        return;
    }
    
    container.innerHTML = currentSubs.map(sub => `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-name">${sub.name}</div>
                <div class="profile-rank">${sub.rank}</div>
            </div>
            <div class="profile-stats">
                <div class="profile-stat">
                    <span class="label">Level:</span>
                    <span class="value">${sub.level}</span>
                </div>
                <div class="profile-stat">
                    <span class="label">XP:</span>
                    <span class="value">${sub.xp}</span>
                </div>
                <div class="profile-stat">
                    <span class="label">Total Tribute:</span>
                    <span class="value">$${sub.totalTribute}</span>
                </div>
                <div class="profile-stat">
                    <span class="label">Completed:</span>
                    <span class="value">${sub.completedTasks}</span>
                </div>
            </div>
            <div class="profile-actions">
                <button class="edit-btn" onclick="editSub(${sub.id})">Edit</button>
                <button class="delete-btn" onclick="deleteSub(${sub.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function showSubModal(sub = null) {
    const modal = document.getElementById('subModal');
    const form = document.getElementById('subForm');
    const title = document.getElementById('subModalTitle');
    
    if (sub) {
        title.textContent = 'Edit Sub Profile';
        editingSubId = sub.id;
        populateSubForm(sub);
    } else {
        title.textContent = 'Add New Sub';
        editingSubId = null;
        form.reset();
    }
    
    modal.classList.add('active');
}

function populateSubForm(sub) {
    document.getElementById('subName').value = sub.name;
    document.getElementById('subEmail').value = sub.email;
    document.getElementById('subLevel').value = sub.level;
    document.getElementById('subRank').value = sub.rank;
}

function handleSubSubmit(e) {
    e.preventDefault();
    
    const subData = {
        name: document.getElementById('subName').value.trim(),
        email: document.getElementById('subEmail').value.trim(),
        level: parseInt(document.getElementById('subLevel').value),
        rank: document.getElementById('subRank').value,
        xp: parseInt(document.getElementById('subLevel').value) * 50, // Calculate XP based on level
        totalTribute: 0,
        joinDate: new Date().toISOString(),
        completedTasks: 0
    };
    
    if (editingSubId) {
        // Update existing sub
        subData.id = editingSubId;
        const existingSub = currentSubs.find(s => s.id === editingSubId);
        if (existingSub) {
            subData.totalTribute = existingSub.totalTribute;
            subData.joinDate = existingSub.joinDate;
            subData.completedTasks = existingSub.completedTasks;
        }
        updateSub(subData);
    } else {
        // Add new sub
        subData.id = Date.now();
        addSub(subData);
    }
}

function addSub(subData) {
    currentSubs.push(subData);
    displaySubProfiles();
    hideModal(document.getElementById('subModal'));
    showStatusMessage('Sub profile added successfully', 'success');
}

function updateSub(subData) {
    const index = currentSubs.findIndex(sub => sub.id === subData.id);
    if (index !== -1) {
        currentSubs[index] = subData;
        displaySubProfiles();
        hideModal(document.getElementById('subModal'));
        showStatusMessage('Sub profile updated successfully', 'success');
    }
}

function editSub(subId) {
    const sub = currentSubs.find(s => s.id === subId);
    if (sub) {
        showSubModal(sub);
    }
}

function deleteSub(subId) {
    if (confirm('Are you sure you want to delete this sub profile?')) {
        currentSubs = currentSubs.filter(sub => sub.id !== subId);
        displaySubProfiles();
        showStatusMessage('Sub profile deleted successfully', 'success');
    }
}

// Analytics Functions
function loadAnalytics() {
    const completedTasks = currentTasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = currentTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const avgTribute = currentTributeHistory.length > 0 ? 
        Math.round(currentTributeHistory.reduce((sum, item) => sum + item.amount, 0) / currentTributeHistory.length) : 0;
    
    const activeTasks = currentTasks.filter(task => task.status === 'ACTIVE').length;
    
    // Update analytics display
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    document.getElementById('completionProgress').style.width = `${completionRate}%`;
    document.getElementById('avgTribute').textContent = `$${avgTribute}`;
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('empireGrowth').textContent = '15%'; // Dummy growth rate
}

// Utility Functions
function handleSync() {
    const syncBtn = document.getElementById('syncBtn');
    const originalText = syncBtn.innerHTML;
    
    syncBtn.innerHTML = '<span class="loading"></span> Syncing...';
    syncBtn.disabled = true;
    
    chrome.runtime.sendMessage({ action: 'syncTasks' }, (response) => {
        syncBtn.innerHTML = originalText;
        syncBtn.disabled = false;
        
        if (response && response.success) {
            showStatusMessage('Empire synced successfully', 'success');
            loadTasks(); // Reload tasks after sync
        } else {
            showStatusMessage('Sync failed', 'error');
        }
    });
}

function hideModal(modal) {
    modal.classList.remove('active');
}

function showStatusMessage(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 3000);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Add support for updating tasks in background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateTasks') {
        chrome.storage.local.set({ tasks: request.tasks }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});
