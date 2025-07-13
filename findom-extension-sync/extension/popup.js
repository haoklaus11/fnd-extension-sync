// Main popup script for FinDom Elite Tracker
// Handles the submissive dashboard interface

document.addEventListener('DOMContentLoaded', function() {
    checkActivationStatus();
    initializeEventListeners();
    loadTasks();
    updateStats();
});

function checkActivationStatus() {
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (!response || !response.activated) {
            window.location.href = 'popup-activation.html';
        }
    });
}

function initializeEventListeners() {
    document.getElementById("syncEmpire").addEventListener("click", handleSyncEmpire);
    document.getElementById("adminThrone").addEventListener("click", handleAdminThrone);
}

function handleSyncEmpire() {
    const syncBtn = document.getElementById("syncEmpire");
    const statusText = document.getElementById("statusText");
    
    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing...";
    statusText.textContent = "Syncing with divine empire...";
    
    chrome.runtime.sendMessage({ action: "syncTasks" }, (response) => {
        syncBtn.disabled = false;
        syncBtn.textContent = "Sync Empire";
        
        if (response && response.success) {
            statusText.textContent = "Empire synced successfully";
            showNotification("Empire synced.", "success");
            setTimeout(() => {
                loadTasks();
                updateStats();
            }, 1000);
        } else {
            statusText.textContent = "Sync failed - try again";
            showNotification("Sync failed.", "error");
        }
        
        setTimeout(() => {
            statusText.textContent = "Ready to serve";
        }, 3000);
    });
}

function handleAdminThrone() {
    chrome.tabs.create({ 
        url: chrome.runtime.getURL("admin/index.html") 
    });
}

function loadTasks() {
    const container = document.getElementById("taskList");
    container.innerHTML = '<div class="loading">Loading divine tasks...</div>';
    
    chrome.runtime.sendMessage({ action: "getTasks" }, (response) => {
        if (chrome.runtime.lastError) {
            container.innerHTML = '<div class="error">Failed to load tasks. Please try again.</div>';
            return;
        }
        
        if (!response || response.error) {
            container.innerHTML = '<div class="error">Error loading tasks: ' + (response?.error || 'Unknown error') + '</div>';
            return;
        }
        
        const tasks = response.tasks || [];
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="no-tasks">No tasks, you lucky dog.</div>';
        } else {
            container.innerHTML = tasks.map(task => createTaskHTML(task)).join("");
            addTaskCompletionListeners();
        }
        
        updateTaskCount(tasks.length);
    });
}

function createTaskHTML(task) {
    const deadlineDate = new Date(task.deadline);
    const isOverdue = deadlineDate < new Date();
    const deadlineText = isOverdue ? 'OVERDUE' : formatDeadline(deadlineDate);
    
    return `
        <div class="task ${task.difficulty}" data-task-id="${task.id}">
            <div class="task-header">
                <h4 class="task-title">${task.title}</h4>
                <span class="task-status ${task.status.toLowerCase()}">${task.status}</span>
            </div>
            
            <div class="task-body">
                <p class="task-description">${task.description}</p>
                
                <div class="task-details">
                    <div class="detail-item">
                        <span class="label">Tribute:</span>
                        <span class="value tribute">${task.tribute}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">XP:</span>
                        <span class="value xp">${task.xp}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Difficulty:</span>
                        <span class="value difficulty-${task.difficulty}">${task.difficulty}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Deadline:</span>
                        <span class="value deadline ${isOverdue ? 'overdue' : ''}">${deadlineText}</span>
                    </div>
                </div>
            </div>
            
            <div class="task-actions">
                <button class="complete-btn" data-task-id="${task.id}" ${task.status === 'COMPLETED' ? 'disabled' : ''}>
                    ${task.status === 'COMPLETED' ? 'Completed' : 'Mark Complete'}
                </button>
            </div>
        </div>
    `;
}

function addTaskCompletionListeners() {
    const completeButtons = document.querySelectorAll('.complete-btn');
    
    completeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskId = parseInt(this.dataset.taskId);
            handleTaskCompletion(taskId, this);
        });
    });
}

function handleTaskCompletion(taskId, button) {
    button.disabled = true;
    button.textContent = 'Completing...';
    
    chrome.runtime.sendMessage({ 
        action: 'updateTaskStatus', 
        taskId: taskId, 
        status: 'COMPLETED' 
    }, (response) => {
        if (response && response.success) {
            button.textContent = 'Completed';
            button.classList.add('completed');
            
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('completed');
                const statusSpan = taskElement.querySelector('.task-status');
                if (statusSpan) {
                    statusSpan.textContent = 'COMPLETED';
                    statusSpan.className = 'task-status completed';
                }
            }
            
            showNotification('Task completed! Well done.', 'success');
            
            // Update user profile XP
            updateUserXP(taskId);
        } else {
            button.disabled = false;
            button.textContent = 'Mark Complete';
            showNotification('Failed to complete task. Try again.', 'error');
        }
    });
}

function updateUserXP(taskId) {
    chrome.runtime.sendMessage({ action: 'getTasks' }, (response) => {
        if (response && response.tasks) {
            const task = response.tasks.find(t => t.id === taskId);
            if (task) {
                chrome.runtime.sendMessage({
                    action: 'updateUserProfile',
                    profile: {
                        xp: task.xp,
                        completedTasks: 1
                    }
                });
            }
        }
    });
}

function updateStats() {
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (response) {
            const syncStatus = document.getElementById('syncStatus');
            if (response.lastSync) {
                const lastSyncDate = new Date(response.lastSync);
                syncStatus.textContent = `Last sync: ${formatDate(lastSyncDate)}`;
            } else {
                syncStatus.textContent = 'Last sync: Never';
            }
        }
    });
}

function updateTaskCount(count) {
    const taskCountEl = document.getElementById('taskCount');
    taskCountEl.textContent = `${count} task${count !== 1 ? 's' : ''}`;
}

function formatDeadline(date) {
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Tomorrow';
    } else if (diffDays > 1) {
        return `${diffDays} days`;
    } else {
        return 'OVERDUE';
    }
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle any errors
window.addEventListener('error', function(e) {
    console.error('Popup error:', e.error);
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = 'An error occurred';
    }
});
