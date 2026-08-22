/**
 * Sistema de Atualização Integrado Dentro do Jogo (In-Game Auto-Updater)
 * Exibe notificações neon elegantes de nova versão, barra de download 0-100%
 * em segundo plano e botão de reiniciar sem sair do jogo.
 */

declare global {
  interface Window {
    pacmanDesktop?: {
      isDesktop: boolean;
      version: string;
      platform: string;
      saveGameData: (data: any) => Promise<{ success: boolean }>;
      loadGameData: () => Promise<any>;
      checkForUpdates: () => Promise<{
        hasUpdate: boolean;
        currentVersion?: string;
        latestVersion?: string;
        releaseName?: string;
        releaseNotes?: string;
        downloadUrl?: string;
      }>;
      startUpdateDownload: (downloadUrl: string) => Promise<{ success: boolean; installerPath?: string }>;
      applyUpdate: (installerPath?: string) => Promise<{ success: boolean }>;
      onUpdateProgress: (callback: (progress: { percent: number; downloadedBytes: number; totalBytes: number }) => void) => void;
    };
  }
}

export class UpdaterUI {
  private containerEl: HTMLElement | null = null;
  private isDownloading: boolean = false;
  private currentInstallerPath: string | null = null;

  constructor() {
    this.createBannerElement();
    // Inicia verificação silenciosa inicial após 2.5 segundos
    setTimeout(() => this.checkUpdates(), 2500);
    // Checagem contínua em tempo real a cada 45 segundos (em segundo plano)
    setInterval(() => {
      if (!this.isDownloading) {
        this.checkUpdates();
      }
    }, 45000);
  }

  private createBannerElement() {
    let el = document.getElementById('inGameUpdateBanner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'inGameUpdateBanner';
      el.className = 'ingame-update-banner hidden';
      document.body.appendChild(el);
    }
    this.containerEl = el;
  }

  public async checkUpdates() {
    try {
      if (window.pacmanDesktop) {
        // Modo Desktop (Electron)
        const updateInfo = await window.pacmanDesktop.checkForUpdates();
        if (updateInfo && updateInfo.hasUpdate && updateInfo.downloadUrl) {
          this.showDesktopUpdatePrompt(updateInfo.latestVersion || '2.0.0', updateInfo.downloadUrl);
        }
      } else {
        // Modo Web (Navegador)
        this.checkWebUpdates();
      }
    } catch (_err) {
      // Falha silenciosa se offline
    }
  }

  private showDesktopUpdatePrompt(latestVersion: string, downloadUrl: string) {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="update-banner-content">
        <div class="update-info-group">
          <span class="update-badge pulse-dot"></span>
          <span class="update-title">🚀 <strong>NOVA ATUALIZAÇÃO DISPONÍVEL (v${latestVersion})</strong></span>
          <span class="update-sub">Atualize em 1 clique sem perder moedas ou progresso!</span>
        </div>

        <div class="update-action-group">
          <button class="btn-update-action" id="btnStartInGameUpdate">
            ⚡ ATUALIZAR AGORA (SEGUNDO PLANO)
          </button>
          <button class="btn-update-close" id="btnCloseUpdateBanner" title="Fechar">&times;</button>
        </div>
      </div>
    `;

    this.containerEl.classList.remove('hidden');

    document.getElementById('btnCloseUpdateBanner')?.addEventListener('click', () => {
      this.containerEl?.classList.add('hidden');
    });

    document.getElementById('btnStartInGameUpdate')?.addEventListener('click', () => {
      this.startDesktopDownload(downloadUrl);
    });
  }

  private async startDesktopDownload(downloadUrl: string) {
    if (this.isDownloading || !window.pacmanDesktop || !this.containerEl) return;
    this.isDownloading = true;

    this.containerEl.innerHTML = `
      <div class="update-banner-content download-mode">
        <div class="update-progress-info">
          <span class="update-title">📥 <strong>BAIXANDO ATUALIZAÇÃO...</strong> <span id="updatePercentText">0%</span></span>
          <span class="update-sub" id="updateBytesText">Você pode continuar jogando normalmente enquanto baixa!</span>
        </div>

        <div class="update-progress-bar-track">
          <div class="update-progress-bar-fill" id="updateProgressFill" style="width: 0%;"></div>
        </div>
      </div>
    `;

    // Escuta progresso do download do Electron
    window.pacmanDesktop.onUpdateProgress((progress) => {
      const fillEl = document.getElementById('updateProgressFill');
      const percentEl = document.getElementById('updatePercentText');
      const bytesEl = document.getElementById('updateBytesText');

      if (fillEl) fillEl.style.width = `${progress.percent}%`;
      if (percentEl) percentEl.innerText = `${progress.percent}%`;
      if (bytesEl && progress.totalBytes > 0) {
        const mbDone = (progress.downloadedBytes / (1024 * 1024)).toFixed(1);
        const mbTotal = (progress.totalBytes / (1024 * 1024)).toFixed(1);
        bytesEl.innerText = `Baixando em segundo plano: ${mbDone} MB / ${mbTotal} MB`;
      }
    });

    try {
      const result = await window.pacmanDesktop.startUpdateDownload(downloadUrl);
      if (result && result.success) {
        this.currentInstallerPath = result.installerPath || null;
        this.showRestartPrompt();
      }
    } catch (_err) {
      this.containerEl.innerHTML = `
        <div class="update-banner-content">
          <span>❌ Falha no download. O jogo continuará funcionando normalmente.</span>
          <button class="btn-update-close" id="btnCloseUpdateFail">&times;</button>
        </div>
      `;
      document.getElementById('btnCloseUpdateFail')?.addEventListener('click', () => {
        this.containerEl?.classList.add('hidden');
      });
    }
  }

  private showRestartPrompt() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="update-banner-content success-mode">
        <div class="update-info-group">
          <span class="update-title">🎉 <strong>DOWNLOAD CONCLUÍDO COM SUCESSO!</strong></span>
          <span class="update-sub">Clique no botão para reiniciar e entrar na nova versão agora mesmo.</span>
        </div>

        <div class="update-action-group">
          <button class="btn-update-restart btn-shimmer" id="btnApplyUpdateRestart">
            🔄 REINICIAR E APLICAR
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnApplyUpdateRestart')?.addEventListener('click', () => {
      if (window.pacmanDesktop) {
        window.pacmanDesktop.applyUpdate(this.currentInstallerPath || undefined);
      }
    });
  }

  private async checkWebUpdates() {
    try {
      const res = await fetch('https://api.github.com/repos/leodevdesign/pac-man-arcade/releases/latest');
      if (!res.ok) return;
      const release = await res.json();
      const latest = (release.tag_name || '').replace(/^v/, '');
      const current = '1.0.0';

      if (latest && latest !== current) {
        if (!this.containerEl) return;
        this.containerEl.innerHTML = `
          <div class="update-banner-content">
            <div class="update-info-group">
              <span class="update-badge pulse-dot"></span>
              <span class="update-title">✨ <strong>NOVA VERSÃO ONLINE (v${latest})</strong></span>
              <span class="update-sub">Novos labirintos e upgrades foram adicionados!</span>
            </div>
            <div class="update-action-group">
              <button class="btn-update-action" onclick="window.location.reload(true)">
                🔄 RECARREGAR PÁGINA
              </button>
              <button class="btn-update-close" id="btnCloseWebUpdate">&times;</button>
            </div>
          </div>
        `;
        this.containerEl.classList.remove('hidden');
        document.getElementById('btnCloseWebUpdate')?.addEventListener('click', () => {
          this.containerEl?.classList.add('hidden');
        });
      }
    } catch {}
  }
}
