document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('options-form');
    const tributeInput = document.getElementById('tribute-amount');
    const xpInput = document.getElementById('xp-amount');
    const saveButton = document.getElementById('save-button');

    // Load saved options
    chrome.storage.sync.get(['tributeAmount', 'xpAmount'], function(data) {
        tributeInput.value = data.tributeAmount || '';
        xpInput.value = data.xpAmount || '';
    });

    // Save options
    saveButton.addEventListener('click', function() {
        const tributeAmount = tributeInput.value;
        const xpAmount = xpInput.value;

        chrome.storage.sync.set({
            tributeAmount: tributeAmount,
            xpAmount: xpAmount
        }, function() {
            alert('Options saved!');
        });
    });
});