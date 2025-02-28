const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", async () => {
    const versionElement = document.getElementById("latest-version") as HTMLSpanElement | null;
    const statusElement = document.getElementById("status") as HTMLParagraphElement | null;
    const installButton = document.getElementById("install-btn") as HTMLButtonElement | null;

    if (!versionElement || !statusElement || !installButton) {
        console.error("❌ Missing UI elements in HTML!");
        return;
    }

    const checkUpdate = await ipcRenderer.invoke("check-update");
    versionElement.textContent = checkUpdate.latestVersion;

    if (checkUpdate.updateAvailable) {
        installButton.textContent = "Update Available! Install Now";
    } else {
        installButton.textContent = "Already Up to Date";
        installButton.disabled = true;
    }

    installButton.addEventListener("click", async () => {
        statusElement.textContent = "🔄 Installing...";
        const result = await ipcRenderer.invoke("install-update");
        statusElement.textContent = result;
        installButton.disabled = true;
    });
});
