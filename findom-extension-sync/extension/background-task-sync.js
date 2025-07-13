// Background script for FinDom Elite Tracker
// Handles activation validation, task management, and GitHub sync

// Global variables
let isActivated = false;
let githubToken = null;
let githubRepo = 'haoklaus11/fnd-extension-sync';

// Initialize the extension
chrome.runtime.onInstalled.addListener(function() {
    console.log('FinDom Elite Tracker installed');
    initializeStorage();
});

// Initialize storage with default values
function initializeStorage() {
    chrome.storage.local.get(['activated', 'githubToken', 'userProfile'], function(result) {
        isActivated = result.activated || false;
        githubToken = result.githubToken || null;
        
        if (!result.userProfile) {
            const defaultProfile = {
                username: 'Anonymous Slave',
                xp: 0,
                completedTasks: 0,
                joinedDate: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };
            chrome.storage.local.set({ userProfile: defaultProfile });
        }
    });
}

// Message handler for popup and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
        case 'validateCode':
            validateActivationCode(request.code, sendResponse);
            return true;
            
        case 'getStatus':
            getActivationStatus(sendResponse);
            return true;
            
        case 'getTasks':
            getTasks(sendResponse);
            return true;
            
        case 'syncTasks':
            syncTasks(sendResponse);
            return true;
            
        case 'updateTaskStatus':
            updateTaskStatus(request.taskId, request.status, sendResponse);
            return true;
            
        case 'setGitHubToken':
            setGitHubToken(request.token, sendResponse);
            return true;
            
        case 'getGitHubToken':
            getGitHubToken(sendResponse);
            return true;
            
        case 'updateUserProfile':
            updateUserProfile(request.profile, sendResponse);
            return true;
            
        case 'getUserProfile':
            getUserProfile(sendResponse);
            return true;
            
        case 'addTask':
            addTask(request.task, sendResponse);
            return true;
            
        case 'deleteTask':
            deleteTask(request.taskId, sendResponse);
            return true;
            
        case 'updateTask':
            updateTask(request.taskId, request.task, sendResponse);
            return true;
            
        case 'getUsers':
            getUsers(sendResponse);
            return true;
            
        case 'getTributeHistory':
            getTributeHistory(sendResponse);
            return true;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Activation code validation
function validateActivationCode(code, sendResponse) {
    const validCodes = [
        'FINDOM2024',
        'ELITE-SLAVE-001',
        'SUBMIT-NOW',
        'GODDESS-APPROVED',
        'TRIBUTE-READY'
    ];
    
    const isValid = validCodes.includes(code.toUpperCase());
    
    if (isValid) {
        isActivated = true;
        chrome.storage.local.set({ activated: true, activationDate: new Date().toISOString() });
        sendResponse({ valid: true });
    } else {
        sendResponse({ valid: false, message: 'Invalid activation code' });
    }
}

// Get activation status
function getActivationStatus(sendResponse) {
    chrome.storage.local.get(['activated', 'activationDate', 'lastSync'], function(result) {
        sendResponse({
            activated: result.activated || false,
            activationDate: result.activationDate,
            lastSync: result.lastSync
        });
    });
}

// Get tasks from storage or GitHub
function getTasks(sendResponse) {
    chrome.storage.local.get(['tasks', 'githubToken'], function(result) {
        const tasks = result.tasks || getDummyTasks();
        sendResponse({ tasks: tasks });
    });
}

// Sync tasks with GitHub
function syncTasks(sendResponse) {
    if (!githubToken) {
        sendResponse({ success: false, error: 'No GitHub token configured' });
        return;
    }
    
    syncWithGitHub()
        .then(data => {
            chrome.storage.local.set({ 
                tasks: data.tasks,
                lastSync: new Date().toISOString()
            });
            sendResponse({ success: true, tasks: data.tasks });
        })
        .catch(error => {
            console.error('Sync failed:', error);
            sendResponse({ success: false, error: error.message });
        });
}

// GitHub sync function
async function syncWithGitHub() {
    try {
        const tasksData = await fetchGitHubFile('github/tasks.json');
        const configData = await fetchGitHubFile('github/config.json');
        
        return {
            tasks: tasksData.tasks || [],
            config: configData
        };
    } catch (error) {
        console.error('GitHub sync error:', error);
        throw error;
    }
}

// Fetch file from GitHub
async function fetchGitHubFile(filePath) {
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = JSON.parse(atob(data.content));
    return content;
}

// Update file on GitHub
async function updateGitHubFile(filePath, content, commitMessage) {
    // First, get the current file to get its SHA
    const currentFile = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    let sha = null;
    if (currentFile.ok) {
        const currentData = await currentFile.json();
        sha = currentData.sha;
    }
    
    // Update the file
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: commitMessage,
            content: btoa(JSON.stringify(content, null, 2)),
            sha: sha
        })
    });
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
}

// Update task status
function updateTaskStatus(taskId, status, sendResponse) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || getDummyTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].status = status;
            tasks[taskIndex].updatedAt = new Date().toISOString();
            
            chrome.storage.local.set({ tasks: tasks });
            
            // Try to sync with GitHub if token is available
            if (githubToken) {
                updateGitHubFile('github/tasks.json', { tasks: tasks }, `Update task ${taskId} status to ${status}`)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch(error => {
                        console.error('GitHub update failed:', error);
                        sendResponse({ success: true, warning: 'Local update successful, GitHub sync failed' });
                    });
            } else {
                sendResponse({ success: true });
            }
        } else {
            sendResponse({ success: false, error: 'Task not found' });
        }
    });
}

// GitHub token management
function setGitHubToken(token, sendResponse) {
    githubToken = token;
    chrome.storage.local.set({ githubToken: token });
    sendResponse({ success: true });
}

function getGitHubToken(sendResponse) {
    chrome.storage.local.get(['githubToken'], function(result) {
        sendResponse({ token: result.githubToken || null });
    });
}

// User profile management
function updateUserProfile(profileUpdate, sendResponse) {
    chrome.storage.local.get(['userProfile'], function(result) {
        const currentProfile = result.userProfile || {};
        const updatedProfile = {
            ...currentProfile,
            ...profileUpdate,
            lastActivity: new Date().toISOString()
        };
        
        // Handle XP and completed tasks increments
        if (profileUpdate.xp) {
            updatedProfile.xp = (currentProfile.xp || 0) + profileUpdate.xp;
        }
        if (profileUpdate.completedTasks) {
            updatedProfile.completedTasks = (currentProfile.completedTasks || 0) + profileUpdate.completedTasks;
        }
        
        chrome.storage.local.set({ userProfile: updatedProfile });
        sendResponse({ success: true, profile: updatedProfile });
    });
}

function getUserProfile(sendResponse) {
    chrome.storage.local.get(['userProfile'], function(result) {
        sendResponse({ profile: result.userProfile || {} });
    });
}

// Task management functions
function addTask(task, sendResponse) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        const newTask = {
            id: Date.now(),
            ...task,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        chrome.storage.local.set({ tasks: tasks });
        
        // Try to sync with GitHub
        if (githubToken) {
            updateGitHubFile('github/tasks.json', { tasks: tasks }, `Add new task: ${task.title}`)
                .then(() => {
                    sendResponse({ success: true, task: newTask });
                })
                .catch(error => {
                    console.error('GitHub update failed:', error);
                    sendResponse({ success: true, task: newTask, warning: 'Local update successful, GitHub sync failed' });
                });
        } else {
            sendResponse({ success: true, task: newTask });
        }
    });
}

function deleteTask(taskId, sendResponse) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        
        chrome.storage.local.set({ tasks: filteredTasks });
        
        // Try to sync with GitHub
        if (githubToken) {
            updateGitHubFile('github/tasks.json', { tasks: filteredTasks }, `Delete task ${taskId}`)
                .then(() => {
                    sendResponse({ success: true });
                })
                .catch(error => {
                    console.error('GitHub update failed:', error);
                    sendResponse({ success: true, warning: 'Local update successful, GitHub sync failed' });
                });
        } else {
            sendResponse({ success: true });
        }
    });
}

function updateTask(taskId, taskUpdate, sendResponse) {
    chrome.storage.local.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...taskUpdate,
                updatedAt: new Date().toISOString()
            };
            
            chrome.storage.local.set({ tasks: tasks });
            
            // Try to sync with GitHub
            if (githubToken) {
                updateGitHubFile('github/tasks.json', { tasks: tasks }, `Update task ${taskId}`)
                    .then(() => {
                        sendResponse({ success: true, task: tasks[taskIndex] });
                    })
                    .catch(error => {
                        console.error('GitHub update failed:', error);
                        sendResponse({ success: true, task: tasks[taskIndex], warning: 'Local update successful, GitHub sync failed' });
                    });
            } else {
                sendResponse({ success: true, task: tasks[taskIndex] });
            }
        } else {
            sendResponse({ success: false, error: 'Task not found' });
        }
    });
}

// Mock data functions for offline use
function getDummyTasks() {
    return [
        {
            id: 1,
            title: "Morning Tribute",
            description: "Send your morning tribute to prove your devotion.",
            tribute: "$50",
            xp: 100,
            difficulty: "easy",
            status: "PENDING",
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            title: "Worship Session",
            description: "Complete a 30-minute worship session and document it.",
            tribute: "$100",
            xp: 200,
            difficulty: "medium",
            status: "PENDING",
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 3,
            title: "Weekend Servitude",
            description: "Complete all weekend tasks and submit proof of completion.",
            tribute: "$250",
            xp: 500,
            difficulty: "hard",
            status: "PENDING",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
}

// Mock users function
function getUsers(sendResponse) {
    const mockUsers = [
        {
            id: 1,
            username: "submissive_slave_1",
            xp: 2500,
            completedTasks: 15,
            joinedDate: "2024-01-15T10:00:00Z",
            lastActivity: "2024-01-20T14:30:00Z",
            status: "active"
        },
        {
            id: 2,
            username: "devoted_servant_2",
            xp: 1800,
            completedTasks: 12,
            joinedDate: "2024-01-18T16:45:00Z",
            lastActivity: "2024-01-20T09:15:00Z",
            status: "active"
        }
    ];
    
    sendResponse({ users: mockUsers });
}

// Mock tribute history function
function getTributeHistory(sendResponse) {
    const mockHistory = [
        {
            id: 1,
            userId: 1,
            amount: 50,
            taskId: 1,
            date: "2024-01-20T08:00:00Z",
            status: "completed"
        },
        {
            id: 2,
            userId: 2,
            amount: 100,
            taskId: 2,
            date: "2024-01-19T20:30:00Z",
            status: "completed"
        }
    ];
    
    sendResponse({ history: mockHistory });
}

// Load GitHub token on startup
chrome.storage.local.get(['githubToken'], function(result) {
    githubToken = result.githubToken || null;
});
