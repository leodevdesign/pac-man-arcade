import { PacmanSkin } from '../core/Constants.ts';

export interface MultiLevelUpgrades {
  extraLives: number;          // 0 a 2 (Inicia com 3, 4 ou 5 vidas)
  boostedFruits: number;       // 0 a 5 (0%, +10%, +20%, +30%, +40%, +50%)
  prolongedEnergizer: number;  // 0 a 20 (+0.25s por nível, até +5.0s)
  superMagnet: number;         // 0 a 4 (Raio de 4 tiles base -> 5, 6, 7, 8 tiles)
  bombDuration: number;        // 0 a 4 (Duração de atordoamento: 1s, 2s, 3s, 4s)
  shieldCharges: number;       // 0 a 4 (Cargas de colisão absorvidas: 1, 2, 3, 4 defesas)
  freezeDuration: number;      // 0 a 5 (Tempo de congelamento: 1s, 2s, 3s, 4s, 5s)
}

export interface UpgradeDefinition {
  key: keyof MultiLevelUpgrades;
  title: string;
  desc: string;
  icon: string;
  maxLevel: number;
  basePrice: number;
  priceStep: number;
  getEffectLabel: (level: number) => string;
}

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    key: 'extraLives',
    title: '❤️ Vidas Iniciais',
    desc: 'Aumenta as vidas que você inicia em cada partida (Max 5 vidas).',
    icon: '❤️',
    maxLevel: 2,
    basePrice: 400,
    priceStep: 400,
    getEffectLabel: (lvl) => (lvl === 0 ? '3 Vidas Iniciais' : `${3 + lvl} Vidas Iniciais`),
  },
  {
    key: 'boostedFruits',
    title: '🍒 Frutas Turbinadas',
    desc: 'Multiplicador de bônus de pontos ao devorar frutas.',
    icon: '🍒',
    maxLevel: 5,
    basePrice: 150,
    priceStep: 150,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Pontuação Padrão (0%)' : `+${lvl * 10}% de Pontos em Frutas`),
  },
  {
    key: 'prolongedEnergizer',
    title: '⚡ Pílula Estendida',
    desc: 'Aumenta o tempo em que os fantasmas ficam azuis e vulneráveis (+0.25s/nível).',
    icon: '⚡',
    maxLevel: 20,
    basePrice: 60,
    priceStep: 25,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Duração Padrão' : `+${(lvl * 0.25).toFixed(2)}s de Tempo Azul`),
  },
  {
    key: 'superMagnet',
    title: '🧲 Super Ímã de Pastilhas',
    desc: 'Amplia o raio de sucção e atração de pastilhas pelo mapa.',
    icon: '🧲',
    maxLevel: 4,
    basePrice: 200,
    priceStep: 180,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Raio Base (4 Tiles)' : `Raio de Atração: ${4 + lvl} Tiles`),
  },
  {
    key: 'bombDuration',
    title: '💣 Bomba Flashbang',
    desc: 'Tempo de atordoamento dos fantasmas atingidos pela explosão.',
    icon: '💣',
    maxLevel: 4,
    basePrice: 150,
    priceStep: 150,
    getEffectLabel: (lvl) => (lvl === 0 ? '1s de Stun' : `${lvl}s de Atordoamento em Área`),
  },
  {
    key: 'shieldCharges',
    title: '🛡️ Escudo de Energia',
    desc: 'Quantidade de colisões fatais que o escudo absorve antes de quebrar.',
    icon: '🛡️',
    maxLevel: 4,
    basePrice: 200,
    priceStep: 200,
    getEffectLabel: (lvl) => (lvl === 0 ? '1 Defesa Fatal' : `${lvl} Defesas de Colisão`),
  },
  {
    key: 'freezeDuration',
    title: '⏳ Relógio de Congelamento',
    desc: 'Duração da paralisia total aplicada em todos os fantasmas.',
    icon: '⏳',
    maxLevel: 5,
    basePrice: 150,
    priceStep: 180,
    getEffectLabel: (lvl) => (lvl === 0 ? '1s de Paralisia' : `${lvl}s de Congelamento Total`),
  },
];

export interface SkinDefinition {
  skin: PacmanSkin;
  name: string;
  desc: string;
  price: number;
  icon: string;
}

export const SKIN_DEFINITIONS: SkinDefinition[] = [
  {
    skin: PacmanSkin.CLASSIC,
    name: '🟡 Pac Clássico',
    desc: 'O visual lendário dos Arcades de 1980.',
    price: 0,
    icon: '🟡',
  },
  {
    skin: PacmanSkin.SUNGLASSES,
    name: '🕶️ Óculos Escuros (Thug Life)',
    desc: 'Pixel-art estilosa com lentes pretas e reflexo.',
    price: 300,
    icon: '🕶️',
  },
  {
    skin: PacmanSkin.GOLDEN,
    name: '👑 Pac Dourado',
    desc: 'Corpo em ouro reluzente com estrelas em órbita.',
    price: 800,
    icon: '👑',
  },
  {
    skin: PacmanSkin.MS_PACMAN,
    name: '🎀 Ms. Pac-Man',
    desc: 'Com laço vermelho volumoso, batom e cílios.',
    price: 200,
    icon: '🎀',
  },
  {
    skin: PacmanSkin.CHRISTMAS,
    name: '🎄 Pac de Natal',
    desc: 'Gorro natalino vermelho com pompom fofo.',
    price: 350,
    icon: '🎄',
  },
  {
    skin: PacmanSkin.HALLOWEEN,
    name: '🎃 Pac de Halloween',
    desc: 'Chapéu de bruxa roxo com fivela laranja neon.',
    price: 350,
    icon: '🎃',
  },
  {
    skin: PacmanSkin.EASTER,
    name: '🐰 Pac de Páscoa',
    desc: 'Orelhinhas de coelho brancas e cor-de-rosa.',
    price: 300,
    icon: '🐰',
  },
  {
    skin: PacmanSkin.CYBERPUNK,
    name: '🤖 Cyber Mecha Pac',
    desc: 'Visor laser holográfico ciano e antena cyber.',
    price: 500,
    icon: '🤖',
  },
];

export class EconomyService {
  private coins: number = 0;
  private totalCoinsEarned: number = 0;
  private unlockedSkins: Set<PacmanSkin> = new Set([PacmanSkin.CLASSIC]);
  private upgrades: MultiLevelUpgrades = {
    extraLives: 0,
    boostedFruits: 0,
    prolongedEnergizer: 0,
    superMagnet: 0,
    bombDuration: 0,
    shieldCharges: 0,
    freezeDuration: 0,
  };

  private onCoinsChangedCallbacks: ((coins: number) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public onCoinsChanged(cb: (coins: number) => void) {
    this.onCoinsChangedCallbacks.push(cb);
  }

  private notifyCoinsChanged() {
    this.onCoinsChangedCallbacks.forEach((cb) => cb(this.coins));
  }

  public getCoins(): number {
    return this.coins;
  }

  public getTotalCoinsEarned(): number {
    return this.totalCoinsEarned;
  }

  public addCoins(amount: number) {
    this.coins += amount;
    this.totalCoinsEarned += amount;
    this.saveToStorage();
    this.notifyCoinsChanged();
  }

  public spendCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      this.saveToStorage();
      this.notifyCoinsChanged();
      return true;
    }
    return false;
  }

  public isSkinUnlocked(skin: PacmanSkin): boolean {
    return this.unlockedSkins.has(skin);
  }

  public unlockSkin(skin: PacmanSkin, price: number): boolean {
    if (this.isSkinUnlocked(skin)) return true;
    if (this.spendCoins(price)) {
      this.unlockedSkins.add(skin);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public getUpgradeLevel(key: keyof MultiLevelUpgrades): number {
    return this.upgrades[key] || 0;
  }

  public getUpgradePrice(key: keyof MultiLevelUpgrades): number {
    const def = UPGRADE_DEFINITIONS.find((d) => d.key === key);
    if (!def) return 999999;
    const currentLevel = this.getUpgradeLevel(key);
    if (currentLevel >= def.maxLevel) return 0; // Já no máximo
    return def.basePrice + currentLevel * def.priceStep;
  }

  public upgrade(key: keyof MultiLevelUpgrades): boolean {
    const def = UPGRADE_DEFINITIONS.find((d) => d.key === key);
    if (!def) return false;
    const currentLevel = this.getUpgradeLevel(key);
    if (currentLevel >= def.maxLevel) return false;

    const price = this.getUpgradePrice(key);
    if (this.spendCoins(price)) {
      this.upgrades[key] = currentLevel + 1;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Getters diretos para as mecânicas de gameplay
  public getStartingLives(): number {
    return 3 + this.upgrades.extraLives;
  }

  public getFruitBonusMultiplier(): number {
    return 1.0 + this.upgrades.boostedFruits * 0.1;
  }

  public getEnergizerExtraSeconds(): number {
    return this.upgrades.prolongedEnergizer * 0.25;
  }

  public getMagnetRadius(): number {
    return this.upgrades.superMagnet === 0 ? 4 : 4 + this.upgrades.superMagnet;
  }

  public getBombStunSeconds(): number {
    return this.upgrades.bombDuration === 0 ? 1 : this.upgrades.bombDuration;
  }

  public getShieldMaxCharges(): number {
    return this.upgrades.shieldCharges === 0 ? 1 : this.upgrades.shieldCharges;
  }

  public getFreezeSeconds(): number {
    return this.upgrades.freezeDuration === 0 ? 1 : this.upgrades.freezeDuration;
  }

  public getUpgrades(): MultiLevelUpgrades {
    return { ...this.upgrades };
  }

  private saveToStorage() {
    localStorage.setItem('pacman_coins', this.coins.toString());
    localStorage.setItem('pacman_total_coins', this.totalCoinsEarned.toString());
    localStorage.setItem('pacman_unlocked_skins', JSON.stringify(Array.from(this.unlockedSkins)));
    localStorage.setItem('pacman_multilevel_upgrades', JSON.stringify(this.upgrades));
  }

  private loadFromStorage() {
    const savedCoins = localStorage.getItem('pacman_coins');
    if (savedCoins) this.coins = parseInt(savedCoins, 10) || 0;

    const savedTotal = localStorage.getItem('pacman_total_coins');
    if (savedTotal) this.totalCoinsEarned = parseInt(savedTotal, 10) || 0;

    const savedSkins = localStorage.getItem('pacman_unlocked_skins');
    if (savedSkins) {
      try {
        const arr = JSON.parse(savedSkins);
        this.unlockedSkins = new Set(arr);
        this.unlockedSkins.add(PacmanSkin.CLASSIC);
      } catch {}
    }

    const savedUpgrades = localStorage.getItem('pacman_multilevel_upgrades');
    if (savedUpgrades) {
      try {
        this.upgrades = { ...this.upgrades, ...JSON.parse(savedUpgrades) };
      } catch {}
    }
  }
}
