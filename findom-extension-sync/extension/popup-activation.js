// Activation script for FinDom Elite Tracker
// Handles the activation process and validation

document.addEventListener('DOMContentLoaded', function() {
    initializeActivationPage();
});

function initializeActivationPage() {
    const activationInput = document.getElementById('activationCode');
    const activateBtn = document.getElementById('activateBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    // Add event listeners
    activateBtn.addEventListener('click', handleActivation);
    activationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleActivation();
        }
    });
    
    // Focus on input
    activationInput.focus();
    
    // Show initial message
    showStatus('Enter your activation code to access the elite system', 'info');
}

function handleActivation() {
    const activationInput = document.getElementById('activationCode');
    const activateBtn = document.getElementById('activateBtn');
    const code = activationInput.value.trim();
    
    if (!code) {
        showStatus('Please enter an activation code', 'error');
        return;
    }
    
    // Disable button and show loading
    activateBtn.disabled = true;
    activateBtn.innerHTML = '<span class="loading"></span> Validating...';
    
    // Send validation request to background script
    chrome.runtime.sendMessage({ action: 'validateCode', code: code }, function(response) {
        if (chrome.runtime.lastError) {
            showStatus('Connection error. Please try again.', 'error');
            resetButton();
            return;
        }
        
        if (response && response.valid) {
            showStatus('Activation successful! Redirecting...', 'success');
            
            // Wait a moment then redirect to main popup
            setTimeout(function() {
                window.location.href = 'popup.html';
            }, 1500);
        } else {
            const errorMessage = response?.message || 'Invalid activation code. Please try again.';
            showStatus(errorMessage, 'error');
            resetButton();
            
            // Clear input and focus
            activationInput.value = '';
            activationInput.focus();
            
            // Add shake animation
            activationInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                activationInput.style.animation = '';
            }, 500);
        }
    });
}

function showStatus(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    
    // Add pulse animation for important messages
    if (type === 'success' || type === 'error') {
        statusMessage.classList.add('pulse');
        setTimeout(() => {
            statusMessage.classList.remove('pulse');
        }, 2000);
    }
}

function resetButton() {
    const activateBtn = document.getElementById('activateBtn');
    activateBtn.disabled = false;
    activateBtn.innerHTML = 'Activate Access';
}

// Add shake animation for invalid inputs
const shakeAnimation = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;

// Inject shake animation
const style = document.createElement('style');
style.textContent = shakeAnimation;
document.head.appendChild(style);

// Handle any errors
window.addEventListener('error', function(e) {
    console.error('Activation error:', e.error);
    showStatus('An unexpected error occurred. Please try again.', 'error');
    resetButton();
});

// Check if already activated (shouldn't happen but just in case)
chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
    if (response && response.activated) {
        window.location.href = 'popup.html';
    }
});
