const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'views/login.html'));
  
  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- UPDATE SYSTEM IPC HANDLERS ---

const REPO = 'aryanjoshi458-rgb/joshi-choice-center';

ipcMain.handle('check-for-update', async () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/latest`,
      headers: { 'User-Agent': 'Electron-App' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          if (release.message === "Not Found") {
            resolve({ error: "No releases found on GitHub." });
            return;
          }
          
          // Get the .exe asset
          const asset = release.assets.find(a => a.name.endsWith('.exe'));
          
          resolve({
            version: release.tag_name.replace('v', ''),
            changelog: release.body,
            size: asset ? (asset.size / (1024 * 1024)).toFixed(2) : '0',
            downloadUrl: asset ? asset.browser_download_url : null
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => reject(e));
  });
});

ipcMain.on('download-update', (event, url) => {
  // Use a temporary path or downloads folder
  const downloadPath = path.join(app.getPath('downloads'), 'JoshiChoiceCenter_Update.exe');
  const file = fs.createWriteStream(downloadPath);
  
  https.get(url, (response) => {
    // Handle redirect
    if (response.statusCode === 302 || response.statusCode === 301) {
      ipcMain.emit('download-update', event, response.headers.location);
      return;
    }

    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;

    response.on('data', (chunk) => {
      downloadedSize += chunk.length;
      file.write(chunk);
      
      const progress = Math.floor((downloadedSize / totalSize) * 100);
      event.reply('download-progress', progress);
    });

    response.on('end', () => {
      file.end();
      event.reply('download-complete', downloadPath);
    });
  }).on('error', (err) => {
    fs.unlink(downloadPath, () => {});
    event.reply('download-error', err.message);
  });
});

ipcMain.on('restart-app', () => {
  app.relaunch();
  app.exit();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
