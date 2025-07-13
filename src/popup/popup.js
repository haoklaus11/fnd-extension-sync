// Popup script for FinDom Elite Tracker extension - Submissive Dashboard
// Handles task display, sync functionality, and navigation to admin panel

document.addEventListener('DOMContentLoaded', function() {
    // Check activation status first
    checkActivationStatus();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load tasks on startup
    loadTasks();
});

function checkActivationStatus() {
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (!response || !response.activated) {
            // Not activated, redirect to activation page
            window.location.href = 'activation.html';
        }
    });
}

function initializeEventListeners() {
    // Sync Empire button
    document.getElementById("syncEmpire").addEventListener("click", handleSyncEmpire);
    
    // Admin Throne button
    document.getElementById("adminThrone").addEventListener("click", handleAdminThrone);
}

function handleSyncEmpire() {
    const syncBtn = document.getElementById("syncEmpire");
    const statusText = document.getElementById("statusText");
    
    // Show loading state
    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing...";
    statusText.textContent = "Syncing with divine empire...";
    
    chrome.runtime.sendMessage({ action: "syncTasks" }, (response) => {
        // Reset button state
        syncBtn.disabled = false;
        syncBtn.textContent = "Sync Empire";
        
        if (response && response.success) {
            statusText.textContent = "Empire synced successfully";
            showNotification("Empire synced.", "success");
            
            // Reload tasks after sync
            setTimeout(() => {
                loadTasks();
            }, 1000);
        } else {
            statusText.textContent = "Sync failed - try again";
            showNotification("Sync failed.", "error");
        }
        
        // Reset status text after 3 seconds
        setTimeout(() => {
            statusText.textContent = "Ready to serve";
        }, 3000);
    });
}

function handleAdminThrone() {
    chrome.tabs.create({ url: chrome.runtime.getURL("admin/index.html") });
}

function loadTasks() {
    const container = document.getElementById("taskList");
    
    // Show loading state
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
            
            // Add event listeners to completion buttons
            addTaskCompletionListeners();
        }
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
    // Disable button and show loading
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
            
            // Update task appearance
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
        } else {
            // Reset button on failure
            button.disabled = false;
            button.textContent = 'Mark Complete';
            showNotification('Failed to complete task. Try again.', 'error');
        }
    });
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

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Handle any errors that might occur
window.addEventListener('error', function(e) {
    console.error('Popup error:', e.error);
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = 'An error occurred';
    }
});