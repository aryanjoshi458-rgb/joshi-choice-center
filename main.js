const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Prevent white flash
    backgroundColor: '#0c0e14', // Match app theme
    autoHideMenuBar: false, // Cleaner UI
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Smoothly show window when content is ready
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
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
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/latest`,
      headers: { 'User-Agent': 'Electron-App' }
    };

    https.get(options, (res) => {
      if (res.statusCode === 403) {
        resolve({ error: "GitHub rate limit exceeded. Try again later." });
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          if (!release || release.message === "Not Found" || !release.tag_name) {
            resolve({ error: "No releases found on GitHub." });
            return;
          }
          
          const asset = release.assets ? release.assets.find(a => a.name.endsWith('.exe')) : null;
          
          resolve({
            version: release.tag_name.replace('v', ''),
            changelog: release.body || "Mini bugs fixed & performance improvements.",
            size: asset ? (asset.size / (1024 * 1024)).toFixed(2) : '0',
            downloadUrl: asset ? asset.browser_download_url : null
          });
        } catch (e) {
          resolve({ error: "Failed to read release data." });
        }
      });
    }).on('error', () => {
      resolve({ error: "Network Error: Check your connection." });
    });
  });
});

ipcMain.on('download-update', (event, url) => {
  const downloadPath = path.join(app.getPath('downloads'), 'JCC_Update_Installer.exe');
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
    });

    file.on('finish', () => {
      event.reply('download-complete', downloadPath);
    });
  }).on('error', (err) => {
    fs.unlink(downloadPath, () => {});
    event.reply('download-error', err.message);
  });
});

ipcMain.on('restart-app', (event, downloadPath) => {
  if (downloadPath && fs.existsSync(downloadPath)) {
    exec(`"${downloadPath}"`, (err) => {
      if (err) console.error("Execution Error:", err);
    });
    
    setTimeout(() => {
      app.quit();
    }, 800);
  } else {
    app.relaunch();
    app.exit();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
