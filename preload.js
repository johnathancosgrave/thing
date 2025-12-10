// preload.js — safely expose a minimal API to renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pb', {
  navigate: (url) => {
    // basic validation to avoid file:// or dangerous schemes
    try {
      const u = new URL(url);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        ipcRenderer.send('navigate-to', url);
      } else {
        console.warn('Blocked non-HTTP(S) navigation:', url);
      }
    } catch (e) {
      console.warn('Invalid URL:', url);
    }
  },
  clearSession: () => ipcRenderer.invoke('clear-session')
});
