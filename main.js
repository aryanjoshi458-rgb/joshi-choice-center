const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.ico')
    : path.join(__dirname, 'build', 'icon.ico');

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath
  });

  win.loadFile(path.join(__dirname, 'views/login.html'));
}

app.whenReady().then(createWindow);

const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});