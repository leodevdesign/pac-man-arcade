import { PacmanSkin } from '../core/Constants.ts';
import { SaveService } from './SaveService.ts';

export interface MultiLevelUpgrades {
  extraLives: number;          // 0 a 2 (Inicia com 3, 4 ou 5 vidas)
  speedBoost: number;          // 0 a 15 (+1% por nível, até +15% de velocidade)
  coinMultiplier: number;      // 0 a 25 (+2% por nível, até +50% de moedas)
  prolongedEnergizer: number;  // 0 a 30 (+0.3s por nível, até +9.0s)
  ghostJail: number;           // 0 a 12 (+0.25s por nível, até +3.0s de retenção)
  teleportCooldown: number;    // 0 a 30 (60s base até 30s de cooldown no [Espaço])
  ghostSlowdown: number;       // 0 a 20 (+0.5% lentidão nos fantasmas, até -10%)
  fertileOrchard: number;      // 0 a 4 (Até 4 frutas bônus por labirinto)
  fruitMagnet: number;         // 0 a 3 (Raio de sucção de frutas: 3, 4, 5 tiles)
  superMagnet: number;         // 0 a 4 (Raio de 4 tiles base -> 5, 6, 7, 8 tiles)
  bombDuration: number;        // 0 a 4 (Duração de atordoamento: 1s, 2s, 3s, 4s)
  shieldCharges: number;       // 0 a 4 (Cargas de colisão absorvidas: 1, 2, 3, 4 defesas)
  freezeDuration: number;      // 0 a 5 (Tempo de congelamento: 1s, 2s, 3s, 4s, 5s)
  boostedFruits: number;       // 0 a 5 (0%, +10%, +20%, +30%, +40%, +50%)
}

export interface UpgradeDefinition {
  key: keyof MultiLevelUpgrades;
  title: string;
  desc: string;
  icon: string;
  maxLevel: number;
  basePrice: number;
  getEffectLabel: (level: number) => string;
}

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    key: 'extraLives',
    title: '❤️ Vidas Iniciais',
    desc: 'Aumenta as vidas que você inicia em cada partida (Max 5 vidas).',
    icon: '❤️',
    maxLevel: 2,
    basePrice: 5000,
    getEffectLabel: (lvl) => (lvl === 0 ? '3 Vidas Iniciais' : `${3 + lvl} Vidas Iniciais`),
  },
  {
    key: 'speedBoost',
    title: '👟 Tênis Turbo (Agilidade)',
    desc: 'Aumenta a velocidade de corrida do Pac-Man (+1% por nível, até +15%).',
    icon: '👟',
    maxLevel: 15,
    basePrice: 600,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Velocidade Padrão' : `+${lvl}% de Velocidade`),
  },
  {
    key: 'coinMultiplier',
    title: '🪙 Detector de Ouro (Bônus)',
    desc: 'Multiplicador de moedas obtidas em fases, recordes e missões (+2% por nível).',
    icon: '🪙',
    maxLevel: 25,
    basePrice: 500,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Moedas Padrão (0%)' : `+${lvl * 2}% de Moedas Bônus`),
  },
  {
    key: 'prolongedEnergizer',
    title: '⚡ Pílula Estendida',
    desc: 'Aumenta o tempo dos fantasmas vulneráveis (+0.3s por nível, até +9.0s).',
    icon: '⚡',
    maxLevel: 30,
    basePrice: 500,
    getEffectLabel: (lvl) => (lvl === 0 ? '6s Base' : `6s + ${(lvl * 0.3).toFixed(1)}s = ${(6 + lvl * 0.3).toFixed(1)}s Total`),
  },
  {
    key: 'ghostJail',
    title: '🔒 Prisão Espectral (Retenção)',
    desc: 'Tempo que fantasmas devorados ficam retidos na casinha (+0.25s por nível, até +3.0s).',
    icon: '🔒',
    maxLevel: 12,
    basePrice: 800,
    getEffectLabel: (lvl) => (lvl === 0 ? '3s Base Preso' : `3s + ${(lvl * 0.25).toFixed(2)}s = ${(3 + lvl * 0.25).toFixed(2)}s Preso`),
  },
  {
    key: 'teleportCooldown',
    title: '🌀 Teletransporte de Emergência [Espaço]',
    desc: 'Pressione [ESPAÇO] para teleportar a um local seguro. Reduz o cooldown de 60s para 30s.',
    icon: '🌀',
    maxLevel: 30,
    basePrice: 500,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Cooldown: 60s' : `Cooldown: ${60 - lvl}s`),
  },
  {
    key: 'ghostSlowdown',
    title: '👻 Névoa de Distração (Slowdown)',
    desc: 'Reduz a velocidade máxima de perseguição de todos os 4 fantasmas (+0.5% por nível).',
    icon: '👻',
    maxLevel: 20,
    basePrice: 600,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Velocidade Normal (0%)' : `-${(lvl * 0.5).toFixed(1)}% Velocidade Fantasmas`),
  },
  {
    key: 'fertileOrchard',
    title: '🍎 Pomar Fértil (Frutas Extras)',
    desc: 'Faz surgir mais frutas bônus ao longo de cada fase (até 4 frutas).',
    icon: '🍎',
    maxLevel: 4,
    basePrice: 1000,
    getEffectLabel: (lvl) => (lvl === 0 ? '2 Frutas / Fase' : `${2 + lvl} Frutas / Fase`),
  },
  {
    key: 'fruitMagnet',
    title: '🧲 Ímã de Frutas',
    desc: 'Atrai frutas bônus automaticamente quando o Pac-Man passa próximo.',
    icon: '🧲',
    maxLevel: 3,
    basePrice: 1000,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Sem Atração' : `Raio de Atração: ${2 + lvl} Tiles`),
  },
  {
    key: 'superMagnet',
    title: '🟡 Super Ímã de Pastilhas',
    desc: 'Amplia o raio de sucção e atração de pastilhas pelo mapa.',
    icon: '🟡',
    maxLevel: 4,
    basePrice: 1000,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Raio Base (4 Tiles)' : `Raio de Atração: ${4 + lvl} Tiles`),
  },
  {
    key: 'bombDuration',
    title: '💣 Bomba Flashbang',
    desc: 'Tempo de atordoamento dos fantasmas atingidos pela explosão.',
    icon: '💣',
    maxLevel: 4,
    basePrice: 1000,
    getEffectLabel: (lvl) => (lvl === 0 ? '1s de Stun' : `${lvl}s de Atordoamento em Área`),
  },
  {
    key: 'shieldCharges',
    title: '🛡️ Escudo de Energia',
    desc: 'Quantidade de colisões fatais que o escudo absorve antes de quebrar.',
    icon: '🛡️',
    maxLevel: 4,
    basePrice: 1000,
    getEffectLabel: (lvl) => (lvl === 0 ? '1 Defesa Fatal' : `${lvl} Defesas de Colisão`),
  },
  {
    key: 'freezeDuration',
    title: '⏳ Relógio de Congelamento',
    desc: 'Duração da paralisia total aplicada em todos os fantasmas.',
    icon: '⏳',
    maxLevel: 5,
    basePrice: 1000,
    getEffectLabel: (lvl) => (lvl === 0 ? '1s de Paralisia' : `${lvl}s de Congelamento Total`),
  },
  {
    key: 'boostedFruits',
    title: '🍒 Frutas Turbinadas',
    desc: 'Multiplicador de bônus de pontos ao devorar frutas.',
    icon: '🍒',
    maxLevel: 5,
    basePrice: 1000,
    getEffectLabel: (lvl) => (lvl === 0 ? 'Pontuação Padrão (0%)' : `+${lvl * 10}% de Pontos em Frutas`),
  },
];

export interface SkinDefinition {
  skin: PacmanSkin;
  name: string;
  desc: string;
  price: number;
  icon: string;
  category: 'standard' | 'intermediate' | 'collector' | 'seasonal' | 'legendary';
  categoryLabel: string;
}

export const SKIN_DEFINITIONS: SkinDefinition[] = [
  {
    skin: PacmanSkin.CLASSIC,
    name: '🟡 Pac Clássico',
    desc: 'O visual lendário dos Arcades de 1980.',
    price: 0,
    icon: '🟡',
    category: 'standard',
    categoryLabel: '🟡 Padrão',
  },
  {
    skin: PacmanSkin.SUNGLASSES,
    name: '🕶️ Óculos Escuros',
    desc: 'Pixel-art estilosa com lentes pretas e reflexo.',
    price: 300,
    icon: '🕶️',
    category: 'standard',
    categoryLabel: '🕶️ Inicial',
  },
  {
    skin: PacmanSkin.GOLDEN,
    name: '👑 Pac Dourado',
    desc: 'Corpo em ouro reluzente com estrelas em órbita.',
    price: 800,
    icon: '👑',
    category: 'intermediate',
    categoryLabel: '👑 Intermediário',
  },
  {
    skin: PacmanSkin.MS_PACMAN,
    name: '🎀 Ms. Pac-Man',
    desc: 'Com laço vermelho volumoso, batom e cílios.',
    price: 2000,
    icon: '🎀',
    category: 'collector',
    categoryLabel: '🎀 Colecionador',
  },
  {
    skin: PacmanSkin.EASTER,
    name: '🐰 Pac de Páscoa',
    desc: 'Orelhinhas de coelho brancas e cor-de-rosa.',
    price: 3000,
    icon: '🐰',
    category: 'seasonal',
    categoryLabel: '🎉 Sazonal',
  },
  {
    skin: PacmanSkin.CHRISTMAS,
    name: '🎄 Pac de Natal',
    desc: 'Gorro natalino vermelho com pompom fofo.',
    price: 3500,
    icon: '🎄',
    category: 'seasonal',
    categoryLabel: '🎉 Sazonal',
  },
  {
    skin: PacmanSkin.HALLOWEEN,
    name: '🎃 Pac de Halloween',
    desc: 'Chapéu de bruxa roxo com fivela laranja neon.',
    price: 3500,
    icon: '🎃',
    category: 'seasonal',
    categoryLabel: '🎉 Sazonal',
  },
  {
    skin: PacmanSkin.CYBERPUNK,
    name: '🤖 Cyber Mecha Pac',
    desc: 'Visor laser holográfico ciano e antena cyber.',
    price: 5000,
    icon: '🤖',
    category: 'legendary',
    categoryLabel: '💎 Lendário',
  },
];

export class EconomyService {
  private coins: number = 0;
  private totalCoinsEarned: number = 0;
  private unlockedSkins: Set<PacmanSkin> = new Set([PacmanSkin.CLASSIC]);
  private upgrades: MultiLevelUpgrades = {
    extraLives: 0,
    speedBoost: 0,
    coinMultiplier: 0,
    prolongedEnergizer: 0,
    ghostJail: 0,
    teleportCooldown: 0,
    ghostSlowdown: 0,
    fertileOrchard: 0,
    fruitMagnet: 0,
    superMagnet: 0,
    bombDuration: 0,
    shieldCharges: 0,
    freezeDuration: 0,
    boostedFruits: 0,
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
    const bonusMult = 1 + (this.getUpgradeLevel('coinMultiplier') * 0.02);
    const finalAmount = Math.max(1, Math.round(amount * bonusMult));
    this.coins += finalAmount;
    this.totalCoinsEarned += finalAmount;
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
    return this.upgrades[key] ?? 0;
  }

  /**
   * Calcula o preço do próximo nível usando a fórmula em 2 fases:
   * - Fase 1 (1 até a metade): +30% por nível
   * - Fase 2 (metade até o máximo): +40% por nível
   */
  public getUpgradePrice(key: keyof MultiLevelUpgrades): number {
    const currentLevel = this.getUpgradeLevel(key);
    const def = UPGRADE_DEFINITIONS.find((d) => d.key === key);
    if (!def || currentLevel >= def.maxLevel) return 0;

    // Vidas iniciais tem custo fixo explícito
    if (key === 'extraLives') {
      return currentLevel === 0 ? 5000 : 10000;
    }

    // Power-ups menores de 4 a 5 níveis
    if (def.maxLevel <= 5) {
      const fixedSteps = [1000, 1500, 2500, 4500, 8000];
      return fixedSteps[currentLevel] || fixedSteps[fixedSteps.length - 1];
    }

    // Upgrades longos (12 a 30 níveis) com escala 30% / 40%
    const halfLevel = Math.ceil(def.maxLevel / 2);
    let price = def.basePrice;

    for (let i = 0; i < currentLevel; i++) {
      const mult = i < halfLevel ? 1.30 : 1.40;
      price = Math.round(price * mult);
    }

    return price;
  }

  public buyUpgrade(key: keyof MultiLevelUpgrades): boolean {
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

  public getSpeedMultiplier(): number {
    return 1.0 + (this.getUpgradeLevel('speedBoost') * 0.01);
  }

  public getFruitBonusMultiplier(): number {
    return 1.0 + this.upgrades.boostedFruits * 0.1;
  }

  public getEnergizerExtraSeconds(): number {
    return this.upgrades.prolongedEnergizer * 0.3;
  }

  public getGhostJailDurationMs(): number {
    return 3000 + (this.upgrades.ghostJail * 250);
  }

  public getTeleportCooldownSeconds(): number {
    return Math.max(30, 60 - this.upgrades.teleportCooldown);
  }

  public getGhostSlowdownMultiplier(): number {
    return 1.0 - (this.upgrades.ghostSlowdown * 0.005); // até -10%
  }

  public getFertileOrchardCount(): number {
    return 2 + this.upgrades.fertileOrchard; // 2 base, até 4 ou 5
  }

  public getFruitMagnetRadius(): number {
    return this.upgrades.fruitMagnet === 0 ? 0 : 2 + this.upgrades.fruitMagnet;
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
    SaveService.setItem('pacman_coins', this.coins.toString());
    SaveService.setItem('pacman_total_coins', this.totalCoinsEarned.toString());
    SaveService.setItem('pacman_unlocked_skins', JSON.stringify(Array.from(this.unlockedSkins)));
    SaveService.setItem('pacman_multilevel_upgrades', JSON.stringify(this.upgrades));
  }

  private loadFromStorage() {
    const savedCoins = SaveService.getItem('pacman_coins');
    if (savedCoins) this.coins = parseInt(savedCoins, 10) || 0;

    const savedTotal = SaveService.getItem('pacman_total_coins');
    if (savedTotal) this.totalCoinsEarned = parseInt(savedTotal, 10) || 0;

    const savedSkins = SaveService.getItem('pacman_unlocked_skins');
    if (savedSkins) {
      try {
        const arr = JSON.parse(savedSkins);
        this.unlockedSkins = new Set(arr);
        this.unlockedSkins.add(PacmanSkin.CLASSIC);
      } catch {}
    }

    const savedUpgrades = SaveService.getItem('pacman_multilevel_upgrades');
    if (savedUpgrades) {
      try {
        this.upgrades = { ...this.upgrades, ...JSON.parse(savedUpgrades) };
      } catch {}
    }
  }
}
