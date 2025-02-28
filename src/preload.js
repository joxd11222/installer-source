import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    fetchVersion: () => ipcRenderer.invoke('fetch-version'),
    downloadDll: () => ipcRenderer.invoke('download-dll'),
});
