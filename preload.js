const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
    downloadUpdate: (url) => ipcRenderer.send('download-update', url),
    restartApp: (path) => ipcRenderer.send('restart-app', path),
    
    // Listeners
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, value) => callback(value)),
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', (event, path) => callback(path)),
    onDownloadError: (callback) => ipcRenderer.on('download-error', (event, error) => callback(error))
});
