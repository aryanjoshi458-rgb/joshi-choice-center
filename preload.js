const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
    downloadUpdate: (url) => ipcRenderer.send('download-update', url),
    restartApp: (path) => ipcRenderer.send('restart-app', path),

    // Listeners
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, value) => callback(value)),
    onDownloadComplete: (callback) => ipcRenderer.on('download-complete', (event, path) => callback(path)),
    onDownloadError: (callback) => ipcRenderer.on('download-error', (event, error) => callback(error)),

    // Close Handling
    onAttemptClose: (callback) => ipcRenderer.on('attempt-close', () => callback()),
    confirmQuit: () => ipcRenderer.send('confirm-app-quit'),

    // Theme Styling
    updateTitleBar: (colors) => ipcRenderer.send('update-titlebar', colors),
    showMenu: (data) => ipcRenderer.send('show-menu', data),
    onFullScreenState: (callback) => ipcRenderer.on('fullscreen-state', (event, state) => callback(state)),
    onTriggerOmniSearch: (callback) => ipcRenderer.on('trigger-omni-search', () => callback()),
    onShowAboutModal: (callback) => ipcRenderer.on('show-about-modal', () => callback()),
    onTriggerUpdateCheck: (callback) => ipcRenderer.on('trigger-update-check', () => callback()),

    // Zoom Control
    resetZoom: () => ipcRenderer.send('reset-zoom-level'),

    // Persistence Bridge
    getAllData: () => ipcRenderer.invoke('storage:get-all'),
    saveToDisk: (key, data) => ipcRenderer.send('storage:save', { key, data }),
    deleteFromDisk: (key) => ipcRenderer.send('storage:delete', key),
    clearDisk: () => ipcRenderer.send('storage:clear')
});
