const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  isElectron: true,
  reopenDisplayWindow: () => ipcRenderer.invoke('reopen-display-window'),
});
