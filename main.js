// main.js — Electron main process
const { app, BrowserWindow, session, dialog } = require('electron');
const path = require('path');

const PARTITION_NAME = 'persist:ephemeral-' + Date.now(); // unique per run

let mainWindow;
let ses;

function createWindow() {
  // Create a unique, ephemeral-like partition for isolation.
  // Note: using 'persist:...' keeps it persistent — for fully ephemeral use a non-persist prefix:
  // const partition = 'ephemeral-' + Date.now();
  // BUT to simplify clearing later we use a named partition and clear data on exit.
  ses = session.fromPartition(PARTITION_NAME, { cache: false });

  // Example privacy settings
  ses.setUserAgent('PrivateBrowser/1.0'); // minimal, not for deception
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    // Deny all permission requests by default (camera/mic/geolocation/notifications)
    return callback(false);
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      partition: PARTITION_NAME
    }
  });

  // Load local UI
  mainWindow.loadFile('index.html');

  // Clear cache/storage on close
  mainWindow.on('close', async (e) => {
    try {
      await ses.clearStorageData();
      await ses.clearCache();
    } catch (err) {
      console.error('Error clearing session data:', err);
    }
  });

  // Optional: open devtools for development
  // mainWindow.webContents.openDevTools({ mode: 'undocked' });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Quit on all platforms for simplicity
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
