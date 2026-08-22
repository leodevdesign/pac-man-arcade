const { app, BrowserWindow, dialog, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

// Versão atual do app (lida do package.json)
const APP_VERSION = require('../package.json').version;
const GITHUB_OWNER = 'leodevdesign';
const GITHUB_REPO = 'pac-man-arcade';

let mainWindow = null;

// Garante que o nome do app para pasta userData seja consistente
app.setName('pac-man-arcade');

function getSaveFilePath() {
  const userDataDir = app.getPath('userData');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  return path.join(userDataDir, 'savedata.json');
}

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

  // Carrega o build do jogo (dist/play.html)
  const indexPath = path.join(__dirname, '..', 'dist', 'play.html');
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
}

// =============================================================================
// 💾 PERSISTÊNCIA NATIVA DE SAVES (IMUNE A REINSTALAÇÕES E ATUALIZAÇÕES)
// =============================================================================
ipcMain.handle('save-game-data', async (_event, data) => {
  try {
    const savePath = getSaveFilePath();
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Erro ao salvar dados localmente:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-game-data', async () => {
  try {
    const savePath = getSaveFilePath();
    if (fs.existsSync(savePath)) {
      const raw = fs.readFileSync(savePath, 'utf-8');
      return JSON.parse(raw);
    }
    return null;
  } catch (err) {
    console.error('Erro ao carregar dados locais:', err);
    return null;
  }
});

// =============================================================================
// 🚀 SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA INTEGRADO (IN-GAME AUTO-UPDATER)
// =============================================================================
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

ipcMain.handle('check-for-updates', async () => {
  return new Promise((resolve) => {
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
          if (res.statusCode !== 200) {
            return resolve({ hasUpdate: false });
          }
          const release = JSON.parse(data);
          const latestVersion = (release.tag_name || '').replace(/^v/, '');
          const hasUpdate = Boolean(latestVersion && isNewerVersion(latestVersion, APP_VERSION));

          let downloadUrl = '';
          if (Array.isArray(release.assets)) {
            const exeAsset = release.assets.find(
              (a) => a.name.endsWith('.exe') && !a.name.includes('blockmap')
            );
            if (exeAsset) downloadUrl = exeAsset.browser_download_url;
          }

          resolve({
            hasUpdate,
            currentVersion: APP_VERSION,
            latestVersion,
            releaseName: release.name || `Pac-Man Arcade v${latestVersion}`,
            releaseNotes: release.body || '',
            downloadUrl: downloadUrl || release.html_url,
          });
        } catch (_err) {
          resolve({ hasUpdate: false });
        }
      });
    });

    req.on('error', () => {
      resolve({ hasUpdate: false });
    });

    req.end();
  });
});

/**
 * Função auxiliar para seguir redirecionamentos (GitHub Release Assets redirecionam para S3)
 */
function downloadFileWithRedirects(url, destPath, onProgress, resolve, reject) {
  const client = url.startsWith('https') ? https : http;

  const req = client.get(url, { headers: { 'User-Agent': `PacManArcade/${APP_VERSION}` } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      // Redirecionamento
      return downloadFileWithRedirects(res.headers.location, destPath, onProgress, resolve, reject);
    }

    if (res.statusCode !== 200) {
      return reject(new Error(`Falha no download: HTTP ${res.statusCode}`));
    }

    const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
    let downloadedBytes = 0;
    const fileStream = fs.createWriteStream(destPath);

    res.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes > 0) {
        const percent = Math.round((downloadedBytes / totalBytes) * 100);
        onProgress({ percent, downloadedBytes, totalBytes });
      }
    });

    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close(() => resolve(destPath));
    });

    fileStream.on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });

  req.on('error', (err) => reject(err));
}

let downloadedInstallerPath = null;

ipcMain.handle('start-update-download', async (_event, downloadUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const tempDir = app.getPath('temp');
      const destPath = path.join(tempDir, 'Pac-Man.Arcade.Update.exe');

      downloadFileWithRedirects(
        downloadUrl,
        destPath,
        (progress) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-download-progress', progress);
          }
        },
        (savedPath) => {
          downloadedInstallerPath = savedPath;
          resolve({ success: true, installerPath: savedPath });
        },
        (err) => {
          console.error('Erro no download do update:', err);
          reject(err);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
});

ipcMain.handle('apply-update', async (_event, customPath) => {
  const targetPath = customPath || downloadedInstallerPath;
  if (!targetPath || !fs.existsSync(targetPath)) {
    return { success: false, error: 'Arquivo do instalador não encontrado.' };
  }

  try {
    // Executa o instalador em modo silencioso ou interativo e fecha o app atual
    spawn(targetPath, ['/S'], {
      detached: true,
      stdio: 'ignore',
    }).unref();

    setTimeout(() => {
      app.quit();
    }, 500);

    return { success: true };
  } catch (err) {
    // Se o silent falhar, executa normal
    spawn(targetPath, [], { detached: true, stdio: 'ignore' }).unref();
    setTimeout(() => app.quit(), 500);
    return { success: true };
  }
});

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
