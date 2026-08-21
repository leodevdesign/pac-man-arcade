import { ThemeType, PacmanSkin } from '../core/Constants.ts';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  wallColor: string;
  doorColor: string;
  dotColor: string;
  energizerColor: string;
  bgColor: string;
  hudColor: string;
  cssThemeClass: string;
  ghostColors?: {
    blinky: string;
    pinky: string;
    inky: string;
    clyde: string;
    frightened: string;
    flashing: string;
  };
}

export const THEME_PRESETS: Record<ThemeType, ThemeConfig> = {
  [ThemeType.CLASSIC]: {
    id: ThemeType.CLASSIC,
    name: '🕹️ Arcade 1980',
    wallColor: '#2121DE',
    doorColor: '#FFB8FF',
    dotColor: '#FFB8AE',
    energizerColor: '#FFB8AE',
    bgColor: '#000000',
    hudColor: '#FFFFFF',
    cssThemeClass: 'theme-classic',
  },
  [ThemeType.SYNTHWAVE]: {
    id: ThemeType.SYNTHWAVE,
    name: '🌆 Neon Synthwave',
    wallColor: '#BD00FF',
    doorColor: '#00F0FF',
    dotColor: '#00FFFF',
    energizerColor: '#FF007F',
    bgColor: '#080018',
    hudColor: '#FF00D4',
    cssThemeClass: 'theme-synthwave',
    ghostColors: {
      blinky: '#FF1744',
      pinky: '#FF4081',
      inky: '#00E5FF',
      clyde: '#FF9100',
      frightened: '#7C4DFF',
      flashing: '#FFFFFF',
    },
  },
  [ThemeType.MATRIX]: {
    id: ThemeType.MATRIX,
    name: '🟢 Matrix Terminal',
    wallColor: '#00FF66',
    doorColor: '#008F11',
    dotColor: '#00FF66',
    energizerColor: '#CCFFCC',
    bgColor: '#020B04',
    hudColor: '#00FF66',
    cssThemeClass: 'theme-matrix',
    ghostColors: {
      blinky: '#FF3333', // Blinky clássico com fósforo
      pinky: '#FF77CC',  // Pinky
      inky: '#00E5FF',   // Inky
      clyde: '#FFAA00',  // Clyde
      frightened: '#005511', // Frightened em verde escuro
      flashing: '#66FF99',   // Flashing em verde neon
    },
  },
  [ThemeType.GAMEBOY]: {
    id: ThemeType.GAMEBOY,
    name: '🎮 Game Boy 1989',
    wallColor: '#306230',
    doorColor: '#8bac0f',
    dotColor: '#8bac0f',
    energizerColor: '#9bbc0f',
    bgColor: '#0f380f',
    hudColor: '#9bbc0f',
    cssThemeClass: 'theme-gameboy',
    ghostColors: {
      blinky: '#8bac0f',
      pinky: '#8bac0f',
      inky: '#8bac0f',
      clyde: '#8bac0f',
      frightened: '#306230',
      flashing: '#9bbc0f',
    },
  },
};

export class ThemeManager {
  private currentTheme: ThemeConfig = THEME_PRESETS[ThemeType.CLASSIC];
  private currentSkin: PacmanSkin = PacmanSkin.CLASSIC;

  constructor() {
    this.loadSavedPreferences();
  }

  public getTheme(): ThemeConfig {
    return this.currentTheme;
  }

  public getSkin(): PacmanSkin {
    return this.currentSkin;
  }

  public setTheme(themeType: ThemeType): ThemeConfig {
    this.currentTheme = THEME_PRESETS[themeType] || THEME_PRESETS[ThemeType.CLASSIC];
    this.applyCssTheme();
    this.savePreferences();
    return this.currentTheme;
  }

  public setSkin(skin: PacmanSkin): PacmanSkin {
    this.currentSkin = skin;
    this.savePreferences();
    return this.currentSkin;
  }

  private applyCssTheme() {
    document.body.classList.remove('theme-classic', 'theme-synthwave', 'theme-matrix', 'theme-gameboy');
    document.body.classList.add(this.currentTheme.cssThemeClass);
  }

  private savePreferences() {
    try {
      localStorage.setItem('pacman_theme_pref', this.currentTheme.id);
      localStorage.setItem('pacman_skin_pref', this.currentSkin);
    } catch {}
  }

  private loadSavedPreferences() {
    try {
      const savedTheme = localStorage.getItem('pacman_theme_pref') as ThemeType;
      if (savedTheme && THEME_PRESETS[savedTheme]) {
        this.currentTheme = THEME_PRESETS[savedTheme];
      }
      const savedSkin = localStorage.getItem('pacman_skin_pref') as PacmanSkin;
      if (savedSkin) {
        this.currentSkin = savedSkin;
      }
      this.applyCssTheme();
    } catch {}
  }
}
