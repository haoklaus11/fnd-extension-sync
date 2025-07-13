// Background script for FinDom Elite Tracker extension
// Handles activation validation, GitHub task/user sync, and communication between popup/admin

chrome.runtime.onInstalled.addListener(() => {
    console.log("FinDom Elite Tracker extension installed.");
    
    // Initialize storage with default values
    chrome.storage.local.set({
        activated: false,
        userProfile: null,
        tasks: [],
        lastSync: null,
        githubToken: null,
        syncEnabled: false
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'validateCode':
            handleActivationValidation(request, sendResponse);
            break;
        
        case 'getTasks':
            handleGetTasks(request, sendResponse);
            break;
        
        case 'syncTasks':
            handleSyncTasks(request, sendResponse);
            break;
        
        case 'getStatus':
            handleGetStatus(request, sendResponse);
            break;
        
        case 'updateTaskStatus':
            handleUpdateTaskStatus(request, sendResponse);
            break;
        
        case 'getUserProfile':
            handleGetUserProfile(request, sendResponse);
            break;
        
        case 'updateTasks':
            handleUpdateTasks(request, sendResponse);
            break;
        
        case 'addTask':
            handleAddTask(request, sendResponse);
            break;
        
        case 'deleteTask':
            handleDeleteTask(request, sendResponse);
            break;
        
        case 'updateUserProfile':
            handleUpdateUserProfile(request, sendResponse);
            break;
        
        case 'setGitHubToken':
            handleSetGitHubToken(request, sendResponse);
            break;
        
        case 'pushToGitHub':
            handlePushToGitHub(request, sendResponse);
            break;
        
        case 'syncFromGitHub':
            handleSyncTasks(request, sendResponse);
            break;
        
        default:
            sendResponse({ error: 'Unknown action' });
    }
    
    return true; // Keep the message channel open for async responses
});

// Handle activation validation
function handleActivationValidation(request, sendResponse) {
    try {
        // Dummy validation (replace with actual server call or GitHub)
        const valid = request.code === "GODDESS-KU00WKU";
        
        chrome.storage.local.set({ activated: valid }, () => {
            if (valid) {
                console.log("Extension activated successfully");
                // Initialize user profile on successful activation
                initializeUserProfile();
            }
            sendResponse({ success: valid });
        });
    } catch (error) {
        console.error("Activation validation error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle getting tasks
function handleGetTasks(request, sendResponse) {
    try {
        chrome.storage.local.get(['activated', 'tasks', 'githubToken'], (result) => {
            if (!result.activated) {
                sendResponse({ error: 'Extension not activated' });
                return;
            }
            
            // If we have cached tasks, return them
            if (result.tasks && result.tasks.length > 0) {
                sendResponse({ tasks: result.tasks });
            } else {
                // Try to fetch from GitHub first, then fallback to dummy data
                if (result.githubToken) {
                    syncWithGitHub()
                        .then(data => {
                            const tasks = data.tasks || [];
                            chrome.storage.local.set({ tasks });
                            sendResponse({ tasks });
                        })
                        .catch(error => {
                            console.error('GitHub fetch error, using dummy data:', error);
                            const dummyTasks = createDummyTasks();
                            chrome.storage.local.set({ tasks: dummyTasks });
                            sendResponse({ tasks: dummyTasks });
                        });
                } else {
                    // No GitHub token, use dummy data
                    const dummyTasks = createDummyTasks();
                    chrome.storage.local.set({ tasks: dummyTasks });
                    sendResponse({ tasks: dummyTasks });
                }
            }
        });
    } catch (error) {
        console.error("Get tasks error:", error);
        sendResponse({ error: error.message });
    }
}

// Create dummy tasks for offline/fallback use
function createDummyTasks() {
    return [
        { 
            id: 1, 
            title: "Morning Tribute", 
            tribute: "$50", 
            xp: 20, 
            difficulty: "easy", 
            status: "ACTIVE",
            description: "Start your day by showing proper respect",
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        { 
            id: 2, 
            title: "Weekly Worship", 
            tribute: "$200", 
            xp: 100, 
            difficulty: "hard", 
            status: "ACTIVE",
            description: "Demonstrate your devotion with a substantial offering",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        { 
            id: 3, 
            title: "Special Assignment", 
            tribute: "$100", 
            xp: 50, 
            difficulty: "medium", 
            status: "ACTIVE",
            description: "A unique task for dedicated servants",
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
}

// Handle syncing tasks with GitHub
function handleSyncTasks(request, sendResponse) {
    try {
        chrome.storage.local.get(['activated', 'githubToken'], (result) => {
            if (!result.activated) {
                sendResponse({ success: false, error: 'Extension not activated' });
                return;
            }
            
            // Use GitHub API to sync tasks
            syncWithGitHub()
                .then(data => {
                    const syncTimestamp = new Date().toISOString();
                    chrome.storage.local.set({ 
                        lastSync: syncTimestamp,
                        tasks: data.tasks || []
                    }, () => {
                        console.log("Tasks synced with GitHub at:", syncTimestamp);
                        sendResponse({ success: true, lastSync: syncTimestamp, tasks: data.tasks });
                    });
                })
                .catch(error => {
                    console.error("GitHub sync error:", error);
                    // Fallback to local simulation
                    const syncTimestamp = new Date().toISOString();
                    chrome.storage.local.set({ lastSync: syncTimestamp }, () => {
                        console.log("Local sync fallback at:", syncTimestamp);
                        sendResponse({ success: true, lastSync: syncTimestamp });
                    });
                });
        });
    } catch (error) {
        console.error("Sync tasks error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle getting extension status
function handleGetStatus(request, sendResponse) {
    chrome.storage.local.get(['activated', 'lastSync'], (result) => {
        sendResponse({
            activated: result.activated || false,
            lastSync: result.lastSync,
            status: result.activated ? 'active' : 'inactive'
        });
    });
}

// Handle updating task status
function handleUpdateTaskStatus(request, sendResponse) {
    try {
        const { taskId, status } = request;
        
        chrome.storage.local.get(['tasks'], (result) => {
            const tasks = result.tasks || [];
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].status = status;
                chrome.storage.local.set({ tasks }, () => {
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: false, error: 'Task not found' });
            }
        });
    } catch (error) {
        console.error("Update task status error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle getting user profile
function handleGetUserProfile(request, sendResponse) {
    chrome.storage.local.get(['userProfile'], (result) => {
        sendResponse({ userProfile: result.userProfile });
    });
}

// Initialize user profile on activation
function initializeUserProfile() {
    const defaultProfile = {
        level: 1,
        xp: 0,
        totalTribute: 0,
        rank: "Novice",
        joinDate: new Date().toISOString(),
        completedTasks: 0
    };
    
    chrome.storage.local.set({ userProfile: defaultProfile });
}

// Handle updating tasks from admin panel
function handleUpdateTasks(request, sendResponse) {
    try {
        const tasks = request.tasks || [];
        
        chrome.storage.local.set({ tasks }, () => {
            console.log("Tasks updated from admin panel");
            sendResponse({ success: true });
        });
    } catch (error) {
        console.error("Update tasks error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle adding a new task
function handleAddTask(request, sendResponse) {
    try {
        const newTask = request.task;
        
        chrome.storage.local.get(['tasks'], (result) => {
            const tasks = result.tasks || [];
            tasks.push(newTask);
            
            chrome.storage.local.set({ tasks }, () => {
                console.log("New task added:", newTask.title);
                sendResponse({ success: true, task: newTask });
            });
        });
    } catch (error) {
        console.error("Add task error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle deleting a task
function handleDeleteTask(request, sendResponse) {
    try {
        const taskId = request.taskId;
        
        chrome.storage.local.get(['tasks'], (result) => {
            const tasks = result.tasks || [];
            const filteredTasks = tasks.filter(task => task.id !== taskId);
            
            chrome.storage.local.set({ tasks: filteredTasks }, () => {
                console.log("Task deleted:", taskId);
                sendResponse({ success: true });
            });
        });
    } catch (error) {
        console.error("Delete task error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle updating user profile data
function handleUpdateUserProfile(request, sendResponse) {
    try {
        const profileData = request.profile;
        
        chrome.storage.local.get(['userProfile'], (result) => {
            const currentProfile = result.userProfile || {};
            const updatedProfile = { ...currentProfile, ...profileData };
            
            chrome.storage.local.set({ userProfile: updatedProfile }, () => {
                console.log("User profile updated");
                sendResponse({ success: true, profile: updatedProfile });
            });
        });
    } catch (error) {
        console.error("Update user profile error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// GitHub API Configuration
const GITHUB_CONFIG = {
    owner: 'haoklaus11',
    repo: 'fnd-extension-sync',
    baseUrl: 'https://api.github.com/repos/haoklaus11/fnd-extension-sync',
    dataFiles: {
        tasks: 'data/tasks.json',
        users: 'data/users.json',
        tribute: 'data/tribute-history.json',
        config: 'data/config.json'
    }
};

// GitHub API Functions
async function syncWithGitHub() {
    try {
        // Get GitHub token from storage
        const { githubToken } = await chrome.storage.local.get(['githubToken']);
        
        if (!githubToken) {
            throw new Error('GitHub token not configured');
        }
        
        // Fetch tasks from GitHub
        const tasksData = await fetchGitHubFile(GITHUB_CONFIG.dataFiles.tasks, githubToken);
        const usersData = await fetchGitHubFile(GITHUB_CONFIG.dataFiles.users, githubToken);
        const tributeData = await fetchGitHubFile(GITHUB_CONFIG.dataFiles.tribute, githubToken);
        
        return {
            tasks: tasksData.tasks || [],
            users: usersData.users || [],
            tribute: tributeData.transactions || []
        };
    } catch (error) {
        console.error('GitHub sync error:', error);
        throw error;
    }
}

async function fetchGitHubFile(filePath, token) {
    const url = `${GITHUB_CONFIG.baseUrl}/contents/${filePath}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'FinDom-Elite-Tracker-Extension'
        }
    });
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = atob(data.content);
    return JSON.parse(content);
}

async function updateGitHubFile(filePath, newContent, token, commitMessage = 'Update from extension') {
    const url = `${GITHUB_CONFIG.baseUrl}/contents/${filePath}`;
    
    // First, get the current file to get its SHA
    const currentFile = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'FinDom-Elite-Tracker-Extension'
        }
    });
    
    const currentData = await currentFile.json();
    const sha = currentData.sha;
    
    // Update the file
    const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'FinDom-Elite-Tracker-Extension'
        },
        body: JSON.stringify({
            message: commitMessage,
            content: btoa(JSON.stringify(newContent, null, 2)),
            sha: sha
        })
    });
    
    if (!updateResponse.ok) {
        throw new Error(`GitHub update error: ${updateResponse.status} ${updateResponse.statusText}`);
    }
    
    return await updateResponse.json();
}

// Handle GitHub token configuration
function handleSetGitHubToken(request, sendResponse) {
    try {
        const { token } = request;
        
        if (!token) {
            sendResponse({ success: false, error: 'Token is required' });
            return;
        }
        
        // Validate token by making a test API call
        fetch(`${GITHUB_CONFIG.baseUrl}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'FinDom-Elite-Tracker-Extension'
            }
        })
        .then(response => {
            if (response.ok) {
                chrome.storage.local.set({ githubToken: token }, () => {
                    console.log('GitHub token configured successfully');
                    sendResponse({ success: true });
                });
            } else {
                sendResponse({ success: false, error: 'Invalid GitHub token' });
            }
        })
        .catch(error => {
            console.error('Token validation error:', error);
            sendResponse({ success: false, error: 'Token validation failed' });
        });
    } catch (error) {
        console.error('Set GitHub token error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle pushing local changes to GitHub
async function handlePushToGitHub(request, sendResponse) {
    try {
        const { githubToken } = await chrome.storage.local.get(['githubToken']);
        
        if (!githubToken) {
            sendResponse({ success: false, error: 'GitHub token not configured' });
            return;
        }
        
        // Get current local data
        const localData = await chrome.storage.local.get(['tasks', 'userProfile']);
        
        // Prepare data for GitHub
        const tasksData = {
            tasks: localData.tasks || [],
            metadata: {
                totalTasks: localData.tasks?.length || 0,
                activeTasks: localData.tasks?.filter(t => t.status === 'ACTIVE').length || 0,
                completedTasks: localData.tasks?.filter(t => t.status === 'COMPLETED').length || 0,
                lastSync: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        
        // Update GitHub repository
        await updateGitHubFile(
            GITHUB_CONFIG.dataFiles.tasks,
            tasksData,
            githubToken,
            'Update tasks from extension'
        );
        
        console.log('Successfully pushed to GitHub');
        sendResponse({ success: true });
        
    } catch (error) {
        console.error('Push to GitHub error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Background task management
function handleBackgroundTasks() {
    chrome.storage.local.get(['activated', 'lastSync'], (result) => {
        if (!result.activated) return;
        
        const now = new Date();
        const lastSync = result.lastSync ? new Date(result.lastSync) : null;
        
        // Auto-sync every 30 minutes
        if (!lastSync || (now - lastSync) > 30 * 60 * 1000) {
            console.log("Auto-syncing tasks...");
            handleSyncTasks({}, () => {});
        }
    });
}

// Periodically check for updates or tasks
setInterval(handleBackgroundTasks, 60000); // Check every minute