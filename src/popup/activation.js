// Activation script for FinDom Elite Tracker extension
// Handles activation code validation and UI interactions

document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.getElementById('codeInput');
    const activateBtn = document.getElementById('activateBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Focus on input when page loads
    codeInput.focus();

    // Handle Enter key press in input field
    codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleActivation();
        }
    });

    // Handle activation button click
    activateBtn.addEventListener('click', handleActivation);

    // Input validation and formatting
    codeInput.addEventListener('input', function() {
        const code = this.value.trim();
        
        // Enable/disable button based on input
        activateBtn.disabled = code.length === 0;
        
        // Clear any previous status messages
        hideStatusMessage();
    });

    function handleActivation() {
        const code = codeInput.value.trim();
        
        if (!code) {
            showStatusMessage('Please enter an activation code', 'error');
            return;
        }

        // Disable button and show loading state
        setLoadingState(true);
        
        // Send activation request to background script
        chrome.runtime.sendMessage({ 
            action: 'validateCode', 
            code: code 
        }, (response) => {
            setLoadingState(false);
            
            if (chrome.runtime.lastError) {
                showStatusMessage('Communication error. Please try again.', 'error');
                return;
            }

            if (response && response.success) {
                showStatusMessage('Activation successful! Redirecting...', 'success');
                
                // Redirect to main popup after brief delay
                setTimeout(() => {
                    window.location.href = 'popup.html';
                }, 1500);
            } else {
                showStatusMessage('Invalid code, worm.', 'error');
                
                // Clear input and refocus
                codeInput.value = '';
                codeInput.focus();
                
                // Add shake animation to input
                codeInput.classList.add('shake');
                setTimeout(() => {
                    codeInput.classList.remove('shake');
                }, 500);
            }
        });
    }

    function setLoadingState(isLoading) {
        activateBtn.disabled = isLoading;
        activateBtn.textContent = isLoading ? 'Validating...' : 'Activate';
        codeInput.disabled = isLoading;
        
        if (isLoading) {
            activateBtn.classList.add('loading');
        } else {
            activateBtn.classList.remove('loading');
        }
    }

    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `activation-status ${type}`;
        statusMessage.style.display = 'block';
        
        // Auto-hide error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                hideStatusMessage();
            }, 5000);
        }
    }

    function hideStatusMessage() {
        statusMessage.style.display = 'none';
        statusMessage.className = 'activation-status';
    }

    // Check if already activated on page load
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (response && response.activated) {
            // Already activated, redirect to main popup
            window.location.href = 'popup.html';
        }
    });
});

// Additional utility functions for enhanced UX
function addInputAnimation() {
    const codeInput = document.getElementById('codeInput');
    
    codeInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    codeInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
}

// Initialize additional animations when DOM is ready
document.addEventListener('DOMContentLoaded', addInputAnimation);
