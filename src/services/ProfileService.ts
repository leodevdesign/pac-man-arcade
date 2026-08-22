import { SaveService } from './SaveService.ts';
import { SoundSynthesizer } from '../audio/SoundSynthesizer.ts';

export interface ProfileData {
  xp: number;
  level: number;
  unclaimedChests: number;
  totalXpEarned: number;
}

export interface PlayerTitle {
  minLevel: number;
  title: string;
  badgeClass: string;
  borderClass: string;
}

export const PLAYER_TITLES: PlayerTitle[] = [
  { minLevel: 1, title: '🥉 Novato do Fliperama', badgeClass: 'badge-bronze', borderClass: 'border-bronze' },
  { minLevel: 10, title: '🥈 Caçador de Fantasmas', badgeClass: 'badge-silver', borderClass: 'border-silver' },
  { minLevel: 25, title: '🥇 Mestre do Labirinto', badgeClass: 'badge-gold', borderClass: 'border-gold' },
  { minLevel: 50, title: '💎 Lenda dos Anos 80', badgeClass: 'badge-platinum', borderClass: 'border-platinum' },
  { minLevel: 75, title: '🌌 Campeão Cósmico', badgeClass: 'badge-cosmic', borderClass: 'border-cosmic' },
  { minLevel: 100, title: '👑 DEUS DO PAC-MAN', badgeClass: 'badge-god', borderClass: 'border-god' },
];

export class ProfileService {
  private static STORAGE_KEY = 'pacman_player_profile_v1';
  private xp: number = 0;
  private level: number = 1;
  private unclaimedChests: number = 0;
  private totalXpEarned: number = 0;
  private sound: SoundSynthesizer | null = null;

  private onProfileChangedCallbacks: ((data: ProfileData) => void)[] = [];
  private onLevelUpCallbacks: ((newLevel: number, rewardCoins: number) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public setSound(sound: SoundSynthesizer) {
    this.sound = sound;
  }

  public onProfileChanged(cb: (data: ProfileData) => void) {
    this.onProfileChangedCallbacks.push(cb);
  }

  public onLevelUp(cb: (newLevel: number, rewardCoins: number) => void) {
    this.onLevelUpCallbacks.push(cb);
  }

  private notifyProfileChanged() {
    const data = this.getProfileData();
    this.onProfileChangedCallbacks.forEach((cb) => cb(data));
  }

  public getProfileData(): ProfileData {
    return {
      xp: this.xp,
      level: this.level,
      unclaimedChests: this.unclaimedChests,
      totalXpEarned: this.totalXpEarned,
    };
  }

  public getLevel(): number {
    return this.level;
  }

  public getXp(): number {
    return this.xp;
  }

  public getUnclaimedChests(): number {
    return this.unclaimedChests;
  }

  /**
   * Retorna o XP necessário para alcançar o próximo nível a partir do nível atual.
   * Curva progressiva: Níveis 1 a 15 acessíveis; Níveis 16 a 100 exigem dedicação.
   */
  public getXpForNextLevel(lvl: number = this.level): number {
    if (lvl <= 15) {
      // 100, 160, 240, 340... até ~3.200 XP no Nv 15
      return Math.round(100 + Math.pow(lvl, 1.45) * 50);
    }
    // Níveis 16 a 100+ escalam exponencialmente
    return Math.round(3200 + Math.pow(lvl - 15, 1.85) * 220);
  }

  /**
   * Bônus de Maestria: a cada 10 níveis, +1% em toda pontuação do jogo.
   */
  public getMasteryScoreMultiplier(): number {
    const bonusPercent = Math.floor(this.level / 10);
    return 1.0 + bonusPercent * 0.01;
  }

  public getTitleInfo(): PlayerTitle {
    for (let i = PLAYER_TITLES.length - 1; i >= 0; i--) {
      if (this.level >= PLAYER_TITLES[i].minLevel) {
        return PLAYER_TITLES[i];
      }
    }
    return PLAYER_TITLES[0];
  }

  /**
   * Adiciona XP ao jogador. Processa eventuais subidas de nível sucessivas.
   */
  public addXp(amount: number) {
    if (amount <= 0) return;
    this.xp += amount;
    this.totalXpEarned += amount;

    let leveledUp = false;
    let xpReq = this.getXpForNextLevel(this.level);

    while (this.xp >= xpReq) {
      this.xp -= xpReq;
      this.level++;
      this.unclaimedChests++;
      leveledUp = true;

      // Recompensa de moedas por subida de nível: Nv * 200 (mínimo 500)
      const rewardCoins = Math.max(500, this.level * 200);
      this.onLevelUpCallbacks.forEach((cb) => cb(this.level, rewardCoins));

      xpReq = this.getXpForNextLevel(this.level);
    }

    if (leveledUp) {
      this.sound?.playExtraLife();
    }

    this.saveToStorage();
    this.notifyProfileChanged();
  }

  public claimChest(): { coins: number; newThemeUnlocked?: string } {
    if (this.unclaimedChests <= 0) return { coins: 0 };
    this.unclaimedChests--;

    const coins = Math.max(500, this.level * 200);
    let newThemeUnlocked: string | undefined;

    if (this.level === 15) newThemeUnlocked = 'Synthwave Sunset (Tema Visual)';
    else if (this.level === 30) newThemeUnlocked = 'Matrix Terminal (Tema Visual)';
    else if (this.level === 50) newThemeUnlocked = 'Labirinto dos Campeões (Mapa)';

    this.saveToStorage();
    this.notifyProfileChanged();
    return { coins, newThemeUnlocked };
  }

  public claimAllChests(): { totalCoins: number; count: number; unlockedThemes: string[] } {
    if (this.unclaimedChests <= 0) return { totalCoins: 0, count: 0, unlockedThemes: [] };
    const count = this.unclaimedChests;
    let totalCoins = 0;
    const unlockedThemes: string[] = [];

    while (this.unclaimedChests > 0) {
      const res = this.claimChest();
      totalCoins += res.coins;
      if (res.newThemeUnlocked) {
        unlockedThemes.push(res.newThemeUnlocked);
      }
    }

    return { totalCoins, count, unlockedThemes };
  }

  private saveToStorage() {
    const payload = {
      xp: this.xp,
      level: this.level,
      unclaimedChests: this.unclaimedChests,
      totalXpEarned: this.totalXpEarned,
    };
    SaveService.setItem(ProfileService.STORAGE_KEY, JSON.stringify(payload));
  }

  private loadFromStorage() {
    const saved = SaveService.getItem(ProfileService.STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.xp = data.xp || 0;
        this.level = data.level || 1;
        this.unclaimedChests = data.unclaimedChests || 0;
        this.totalXpEarned = data.totalXpEarned || 0;
      } catch {}
    }
  }
}
