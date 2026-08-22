/**
 * SaveService - Sistema Unificado de Persistência Híbrida
 * Salva simultaneamente em localStorage e no arquivo físico 'savedata.json' em %APPDATA%
 * garantindo que atualizações ou reinstalações NUNCA apaguem moedas, conquistas ou skins.
 */

export class SaveService {
  private static cachedData: Record<string, any> = {};
  private static isInitialized: boolean = false;

  public static async init(): Promise<void> {
    if (this.isInitialized) return;

    // Se estiver rodando no Electron Desktop, lê o arquivo físico do disco
    if (window.pacmanDesktop && typeof window.pacmanDesktop.loadGameData === 'function') {
      try {
        const fileData = await window.pacmanDesktop.loadGameData();
        if (fileData && typeof fileData === 'object') {
          this.cachedData = fileData;
          // Sincroniza também no localStorage para consistência
          Object.entries(fileData).forEach(([k, v]) => {
            try {
              localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
            } catch {}
          });
        }
      } catch (err) {
        console.warn('Falha ao ler savedata.json físico, usando localStorage:', err);
      }
    }

    this.isInitialized = true;
  }

  public static setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
      this.cachedData[key] = value;
      this.syncToPhysicalFile();
    } catch {}
  }

  public static getItem(key: string): string | null {
    if (this.cachedData[key] !== undefined) {
      return typeof this.cachedData[key] === 'string'
        ? this.cachedData[key]
        : JSON.stringify(this.cachedData[key]);
    }
    return localStorage.getItem(key);
  }

  private static syncToPhysicalFile() {
    if (window.pacmanDesktop && typeof window.pacmanDesktop.saveGameData === 'function') {
      try {
        const fullPayload: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('pacman_')) {
            fullPayload[k] = localStorage.getItem(k);
          }
        }
        window.pacmanDesktop.saveGameData(fullPayload);
      } catch {}
    }
  }
}
