// GitHub Configuration Panel for Admin
// Add this to your admin panel to configure GitHub integration

function createGitHubConfigPanel() {
    const configHTML = `
        <div class="github-config-panel">
            <h3>GitHub Integration Setup</h3>
            
            <div class="config-section">
                <h4>Step 1: Generate GitHub Token</h4>
                <p>Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token</p>
                <p>Required permissions: <code>repo</code>, <code>contents:read</code>, <code>contents:write</code></p>
                <a href="https://github.com/settings/tokens/new" target="_blank" class="github-link">Generate Token</a>
            </div>
            
            <div class="config-section">
                <h4>Step 2: Configure Token</h4>
                <div class="token-input-group">
                    <input type="password" id="githubToken" placeholder="Paste your GitHub token here" />
                    <button id="saveToken" class="save-token-btn">Save Token</button>
                </div>
                <div id="tokenStatus" class="token-status"></div>
            </div>
            
            <div class="config-section">
                <h4>Step 3: Repository Information</h4>
                <div class="repo-info">
                    <p><strong>Repository:</strong> haoklaus11/fnd-extension-sync</p>
                    <p><strong>Data Files:</strong></p>
                    <ul>
                        <li>data/tasks.json - Task definitions</li>
                        <li>data/users.json - User profiles</li>
                        <li>data/tribute-history.json - Tribute transactions</li>
                        <li>data/config.json - Extension configuration</li>
                    </ul>
                </div>
            </div>
            
            <div class="config-section">
                <h4>Step 4: Sync Controls</h4>
                <div class="sync-controls">
                    <button id="testConnection" class="test-btn">Test Connection</button>
                    <button id="syncNow" class="sync-btn">Sync Now</button>
                    <button id="pushToGitHub" class="push-btn">Push to GitHub</button>
                </div>
                <div id="syncStatus" class="sync-status"></div>
            </div>
            
            <div class="config-section">
                <h4>Auto-Sync Settings</h4>
                <div class="auto-sync-settings">
                    <label>
                        <input type="checkbox" id="autoSync"> Enable Auto-Sync
                    </label>
                    <select id="syncInterval">
                        <option value="300000">5 minutes</option>
                        <option value="900000">15 minutes</option>
                        <option value="1800000" selected>30 minutes</option>
                        <option value="3600000">1 hour</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    return configHTML;
}

function initializeGitHubConfig() {
    // Add event listeners for GitHub configuration
    document.getElementById('saveToken').addEventListener('click', saveGitHubToken);
    document.getElementById('testConnection').addEventListener('click', testGitHubConnection);
    document.getElementById('syncNow').addEventListener('click', syncWithGitHub);
    document.getElementById('pushToGitHub').addEventListener('click', pushToGitHub);
    
    // Load existing configuration
    loadGitHubConfig();
}

function saveGitHubToken() {
    const token = document.getElementById('githubToken').value.trim();
    const statusEl = document.getElementById('tokenStatus');
    
    if (!token) {
        showStatus(statusEl, 'Please enter a GitHub token', 'error');
        return;
    }
    
    // Send to background script
    chrome.runtime.sendMessage({
        action: 'setGitHubToken',
        token: token
    }, (response) => {
        if (response.success) {
            showStatus(statusEl, 'Token saved successfully', 'success');
            document.getElementById('githubToken').value = '';
        } else {
            showStatus(statusEl, 'Failed to save token: ' + response.error, 'error');
        }
    });
}

function testGitHubConnection() {
    const statusEl = document.getElementById('syncStatus');
    showStatus(statusEl, 'Testing connection...', 'info');
    
    chrome.runtime.sendMessage({
        action: 'syncFromGitHub'
    }, (response) => {
        if (response.success) {
            showStatus(statusEl, 'Connection successful!', 'success');
        } else {
            showStatus(statusEl, 'Connection failed: ' + response.error, 'error');
        }
    });
}

function syncWithGitHub() {
    const statusEl = document.getElementById('syncStatus');
    showStatus(statusEl, 'Syncing with GitHub...', 'info');
    
    chrome.runtime.sendMessage({
        action: 'syncFromGitHub'
    }, (response) => {
        if (response.success) {
            showStatus(statusEl, 'Sync completed successfully!', 'success');
            // Refresh the admin panel data
            loadTasks();
        } else {
            showStatus(statusEl, 'Sync failed: ' + response.error, 'error');
        }
    });
}

function pushToGitHub() {
    const statusEl = document.getElementById('syncStatus');
    showStatus(statusEl, 'Pushing to GitHub...', 'info');
    
    chrome.runtime.sendMessage({
        action: 'pushToGitHub'
    }, (response) => {
        if (response.success) {
            showStatus(statusEl, 'Push completed successfully!', 'success');
        } else {
            showStatus(statusEl, 'Push failed: ' + response.error, 'error');
        }
    });
}

function loadGitHubConfig() {
    chrome.storage.local.get(['githubToken', 'syncEnabled'], (result) => {
        const autoSyncCheckbox = document.getElementById('autoSync');
        if (autoSyncCheckbox) {
            autoSyncCheckbox.checked = result.syncEnabled || false;
        }
        
        const tokenStatus = document.getElementById('tokenStatus');
        if (result.githubToken) {
            showStatus(tokenStatus, 'Token configured', 'success');
        } else {
            showStatus(tokenStatus, 'No token configured', 'warning');
        }
    });
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type}`;
    element.style.display = 'block';
    
    if (type !== 'error') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// CSS for GitHub config panel
const githubConfigCSS = `
.github-config-panel {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
}

.config-section {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #333;
}

.config-section:last-child {
    border-bottom: none;
}

.config-section h4 {
    color: #ffd700;
    margin-bottom: 10px;
}

.token-input-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.token-input-group input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #444;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.save-token-btn, .test-btn, .sync-btn, .push-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
}

.save-token-btn {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
}

.test-btn {
    background: linear-gradient(45deg, #2196F3, #1976D2);
    color: white;
}

.sync-btn {
    background: linear-gradient(45deg, #ff9800, #f57c00);
    color: white;
}

.push-btn {
    background: linear-gradient(45deg, #9c27b0, #7b1fa2);
    color: white;
}

.github-link {
    color: #ffd700;
    text-decoration: none;
    font-weight: bold;
}

.github-link:hover {
    text-decoration: underline;
}

.repo-info ul {
    margin: 10px 0;
    padding-left: 20px;
}

.repo-info li {
    margin: 5px 0;
    color: #ccc;
}

.sync-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.auto-sync-settings {
    display: flex;
    gap: 15px;
    align-items: center;
}

.auto-sync-settings label {
    display: flex;
    align-items: center;
    gap: 5px;
}

.auto-sync-settings select {
    padding: 4px 8px;
    border: 1px solid #444;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.status-message {
    padding: 8px 12px;
    border-radius: 4px;
    margin-top: 10px;
    font-size: 14px;
}

.status-message.success {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid #4CAF50;
    color: #4CAF50;
}

.status-message.error {
    background: rgba(244, 67, 54, 0.2);
    border: 1px solid #f44336;
    color: #f44336;
}

.status-message.warning {
    background: rgba(255, 152, 0, 0.2);
    border: 1px solid #ff9800;
    color: #ff9800;
}

.status-message.info {
    background: rgba(33, 150, 243, 0.2);
    border: 1px solid #2196F3;
    color: #2196F3;
}
`;

// Add CSS to the document
const style = document.createElement('style');
style.textContent = githubConfigCSS;
document.head.appendChild(style);
