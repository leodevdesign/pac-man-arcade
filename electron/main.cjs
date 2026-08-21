const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const https = require('https');

// Versão atual do app (lida do package.json)
const APP_VERSION = require('../package.json').version;
const GITHUB_OWNER = 'leodevdesign';
const GITHUB_REPO = 'pac-man-arcade';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 680,
    title: 'Pac-Man Arcade',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    backgroundColor: '#080412',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Remove o menu bar completamente
  mainWindow.setMenuBarVisibility(false);

  // Carrega o build do Vite (dist/index.html)
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(indexPath);

  // Mostra a janela quando estiver pronta (evita flash branco)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Abre links externos no navegador padrão do sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Checa atualizações após 3 segundos
  setTimeout(checkForUpdates, 3000);
}

/**
 * Verifica no GitHub Releases se existe uma versão mais recente.
 * Se houver, exibe um dialog perguntando se o jogador quer baixar.
 */
function checkForUpdates() {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
    method: 'GET',
    headers: {
      'User-Agent': `PacManArcade/${APP_VERSION}`,
      Accept: 'application/vnd.github.v3+json',
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      try {
        if (res.statusCode !== 200) return;
        const release = JSON.parse(data);
        const latestVersion = (release.tag_name || '').replace(/^v/, '');

        if (latestVersion && isNewerVersion(latestVersion, APP_VERSION)) {
          dialog
            .showMessageBox(mainWindow, {
              type: 'info',
              title: '🎮 Nova Versão Disponível!',
              message: `Pac-Man Arcade v${latestVersion} está disponível!\n\nVocê está usando a v${APP_VERSION}.\n\nDeseja abrir a página de download?`,
              buttons: ['Baixar Agora', 'Depois'],
              defaultId: 0,
              cancelId: 1,
            })
            .then((result) => {
              if (result.response === 0) {
                shell.openExternal(release.html_url);
              }
            });
        }
      } catch (_err) {
        // Silencioso — não interrompe o jogo por falha de update check
      }
    });
  });

  req.on('error', () => {
    // Sem internet? Sem problema, o jogo funciona offline
  });

  req.end();
}

/**
 * Compara duas versões semânticas (ex: "1.2.0" > "1.1.0")
 */
function isNewerVersion(latest, current) {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

// Electron lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
