const { contextBridge } = require('electron');
const packageJson = require('../package.json');

/**
 * Preload script — expõe uma API segura para o renderer (jogo).
 * O jogo pode checar se está rodando no desktop e qual a versão.
 */
contextBridge.exposeInMainWorld('pacmanDesktop', {
  isDesktop: true,
  version: packageJson.version,
  platform: process.platform,
});
