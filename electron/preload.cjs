const { contextBridge, ipcRenderer } = require('electron');
const packageJson = require('../package.json');

/**
 * Preload script — expõe API nativa segura para o jogo Pac-Man.
 */
contextBridge.exposeInMainWorld('pacmanDesktop', {
  isDesktop: true,
  version: packageJson.version,
  platform: process.platform,

  // 💾 Persistência Nativa em Arquivo Físico JSON
  saveGameData: (data) => ipcRenderer.invoke('save-game-data', data),
  loadGameData: () => ipcRenderer.invoke('load-game-data'),

  // 🚀 Auto-Updater Integrado
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  startUpdateDownload: (downloadUrl) => ipcRenderer.invoke('start-update-download', downloadUrl),
  applyUpdate: (installerPath) => ipcRenderer.invoke('apply-update', installerPath),
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress));
  },
});
