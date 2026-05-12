const { app, BrowserWindow, ipcMain, shell, Menu, nativeTheme } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

// --- STORAGE PERSISTENCE ENGINE ---
const storagePath = path.join(app.getPath('userData'), 'storage');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

class StorageManager {
  static async save(key, data) {
    try {
      const filePath = path.join(storagePath, `${key}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error(`Storage Error (Save): ${key}`, err);
      return false;
    }
  }

  static async get(key) {
    try {
      const filePath = path.join(storagePath, `${key}.json`);
      if (!fs.existsSync(filePath)) return null;
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Storage Error (Get): ${key}`, err);
      return null;
    }
  }

  static async getAll() {
    const data = {};
    try {
      const files = await fs.promises.readdir(storagePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const key = file.replace('.json', '');
          const content = await this.get(key);
          if (content !== null) data[key] = content;
        }
      }
    } catch (err) {
      console.error('Storage Error (GetAll)', err);
    }
    return data;
  }
}

// Force dark mode for native menus/dialogs
nativeTheme.themeSource = 'dark';

// --- MULTI-INSTANCE ENABLED ---
// Single instance lock removed to allow multiple EXE launches.
// Caution: Instances share the same storage folder.


let windows = new Set();

function createWindow() {
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: '#0c0e14',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0c0e14',
      symbolColor: '#ffffff',
      height: 35
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: true // Enabled but will be controlled via shortcuts
    }
  });

  windows.add(win);

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.on('enter-full-screen', () => {
    win.webContents.send('fullscreen-state', true);
  });

  win.on('leave-full-screen', () => {
    win.webContents.send('fullscreen-state', false);
  });

  win.loadFile(path.join(__dirname, 'views/login.html'));

  // Block Developer Tools & Zoom Shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    // SECRET BACKDOOR: Ctrl + Alt + Shift + D
    if (input.control && input.alt && input.shift && input.key.toLowerCase() === 'd') {
      win.webContents.openDevTools();
      return;
    }

    // Block standard DevTools shortcuts
    if ((input.control && input.shift && input.key.toLowerCase() === 'i') ||
      (input.control && input.shift && input.key.toLowerCase() === 'j') ||
      input.key === 'F12') {
      event.preventDefault();
    }

    // Block Zoom shortcuts (Ctrl + Plus, Ctrl + Minus, Ctrl + 0)
    if (input.control && (input.key === '=' || input.key === '+' || input.key === '-' || input.key === '0')) {
      event.preventDefault();
    }
  });

  win.on('close', (e) => {
    if (windows.has(win)) {
      e.preventDefault();
      win.webContents.send('attempt-close');
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

// --- GLOBAL IPC HANDLERS (Architectural Fix) ---

// IPC for dynamic Title Bar color updates
ipcMain.on('update-titlebar', (event, { color, symbolColor }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.setTitleBarOverlay({ color, symbolColor });
    nativeTheme.themeSource = symbolColor === '#ffffff' ? 'dark' : 'light';
  }
});

// IPC for showing native menu from custom title bar
ipcMain.on('show-menu', (event, { index, x, y }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const menu = Menu.getApplicationMenu();
  if (win && menu && menu.items[index]) {
    menu.items[index].submenu.popup({ window: win, x: x, y: y });
  }
});

// Persistence Handlers
ipcMain.handle('storage:get-all', async () => {
  return await StorageManager.getAll();
});

ipcMain.on('storage:save', async (event, { key, data }) => {
  await StorageManager.save(key, data);
  // Broadcast to other windows
  windows.forEach(win => {
    if (!win.isDestroyed() && win.webContents !== event.sender) {
      win.webContents.send('aura-data-updated', { key, data });
    }
  });
});

ipcMain.on('storage:delete', async (event, key) => {
  try {
    const filePath = path.join(storagePath, `${key}.json`);
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    
    windows.forEach(win => {
      if (!win.isDestroyed() && win.webContents !== event.sender) {
        win.webContents.send('aura-data-deleted', key);
      }
    });
  } catch (err) {
    console.error(`Error deleting ${key}:`, err);
  }
});

ipcMain.on('storage:clear', async (event) => {
  try {
    const files = await fs.promises.readdir(storagePath);
    // Properly await all unlinks
    await Promise.all(files.map(async (file) => {
      if (file.endsWith('.json')) {
        return fs.promises.unlink(path.join(storagePath, file));
      }
    }));
    
    windows.forEach(win => {
      if (!win.isDestroyed() && win.webContents !== event.sender) {
        win.webContents.send('aura-data-cleared');
      }
    });
  } catch (err) {
    console.error("Error clearing storage:", err);
  }
});

ipcMain.on('reset-zoom-level', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.webContents.setZoomLevel(0);
});

// IPC handler to finalize quit after user confirms in UI
ipcMain.on('confirm-app-quit', () => {
  app.exit();
});

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
      {
        label: 'New Customer Entry',
        accelerator: 'Alt+N',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/new-customer.html'));
        }
      },
      { type: 'separator' },
      {
        label: 'Customer Directory',
        accelerator: 'Alt+C',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/customer-directory.html'));
        }
      },
      {
        label: 'Pending Payments',
        accelerator: 'Alt+B',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/pending-payments.html'));
        }
      },
      { type: 'separator' },
      {
        label: 'Print Receipt',
        accelerator: 'Alt+P',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/print-receipt.html'));
        }
      },
      { type: 'separator' },
      {
        label: 'Search Anything...',
        accelerator: 'Alt+F',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.webContents.send('trigger-omni-search');
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
      {
        label: 'Dashboard',
        accelerator: 'Alt+D',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/dashboard.html'));
        }
      },
      {
        label: 'Reports',
        accelerator: 'Alt+R',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/reports.html'));
        }
      },
      {
        label: 'Expenses',
        accelerator: 'Alt+E',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/expenses.html'));
        }
      },
      {
        label: 'Service Rate List',
        accelerator: 'Alt+M',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.loadFile(path.join(__dirname, 'views/rate-list.html'));
        }
      },
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
        label: 'About Software',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.webContents.send('show-about-modal');
        }
      },
      {
        label: 'Check for Updates...',
        click: (menuItem, browserWindow) => {
          if (browserWindow) browserWindow.webContents.send('trigger-update-check');
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

          const asset = (release.assets && release.assets.length > 0) ? release.assets.find(a => a.name.endsWith('.exe')) : null;

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

function downloadUpdate(event, url) {
  const downloadPath = path.join(app.getPath('downloads'), 'JCC_Update_Installer.exe');
  
  try {
    const file = fs.createWriteStream(downloadPath);
    
    file.on('error', (err) => {
      console.error("Stream Error:", err);
      event.reply('download-error', "File Access Denied: Could not write to Downloads folder.");
    });

    https.get(url, (response) => {
      // Handle redirect
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadUpdate(event, response.headers.location);
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
      fs.unlink(downloadPath, () => { });
      event.reply('download-error', err.message);
    });
  } catch (err) {
    event.reply('download-error', "Initialization Failed: " + err.message);
  }
}

ipcMain.on('download-update', (event, url) => {
  downloadUpdate(event, url);
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