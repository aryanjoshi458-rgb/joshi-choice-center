const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

let windows = new Set();

function createWindow() {
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: '#0c0e14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false // Hard disable devtools
    }
  });

  windows.add(win);

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.loadFile(path.join(__dirname, 'views/login.html'));

  // Block Developer Tools Shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control && input.shift && input.key.toLowerCase() === 'i') || 
        (input.control && input.shift && input.key.toLowerCase() === 'j') ||
        input.key === 'F12') {
      event.preventDefault();
    }
  });

  win.on('closed', () => {
    windows.delete(win);
  });
  
  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return win;
}

// Custom Professional Menu Template
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          createWindow();
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: 'Alt+F4',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://github.com/aryanjoshi458-rgb/joshi-choice-center');
        }
      },
      {
        label: 'Contact Support',
        click: async () => {
          await shell.openExternal('mailto:support@joshichoice.com');
        }
      }
    ]
  }
];

app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createWindow();
});

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
