document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔍 Checking window.electronAPI...");
    console.log("window.electronAPI:", window.electronAPI);

    if (!window.electronAPI || !window.electronAPI.fetchVersion || !window.electronAPI.downloadDll) {
        console.error("❌ ERROR: window.electronAPI is undefined! Preload script may not be loading.");
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = 'Error: Preload script not loaded!';
        }
        return;
    }

    const versionSpan = document.getElementById('version');
    const statusText = document.getElementById('status');
    const installButton = document.getElementById('install-btn');

    if (!versionSpan || !statusText || !installButton) {
        console.error("❌ ERROR: Missing DOM elements!");
        return;
    }

    console.log("Fetching version...");

    try {
        const version = await window.electronAPI.fetchVersion();
        versionSpan.textContent = version || 'Unknown';
        console.log("Version fetched:", version);
    } catch (error) {
        versionSpan.textContent = 'Failed to load';
        console.error('Error fetching version:', error);
    }

    installButton.addEventListener('click', async () => {
        statusText.textContent = 'Installing...';
        console.log("Download started...");

        try {
            const result = await window.electronAPI.downloadDll();
            statusText.textContent = result;
            console.log("Download success:", result);
        } catch (error) {
            statusText.textContent = 'Failed to install';
            console.error('Error downloading DLL:', error);
        }
    });
});
