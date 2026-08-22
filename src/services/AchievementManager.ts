import { SoundSynthesizer } from '../audio/SoundSynthesizer.ts';
import { SaveService } from './SaveService.ts';

export interface AchievementTier {
  tier: 1 | 2 | 3 | 4 | 5;
  target: number;
  name: string;
  rewardCoins: number;
  rewardXp: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ProgressiveAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'pastilhas' | 'fantasmas' | 'frutas' | 'sobrevivencia' | 'pontos' | 'economia' | 'powerups' | 'modos';
  currentValue: number;
  unit: string;
  tiers: AchievementTier[];
}

interface RawAchDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: ProgressiveAchievement['category'];
  unit: string;
  targets: [number, number, number, number, number];
  coins: [number, number, number, number, number];
  xp: [number, number, number, number, number];
}

const TIER_NAMES = ['Bronze ⭐', 'Prata ⭐⭐', 'Ouro ⭐⭐⭐', 'Platina 💎', 'Mítico 👑'];

const RAW_ACHIEVEMENTS: RawAchDef[] = [
  // 1. PASTILHAS & LABIRINTO (1-10)
  { id: 'dots_eaten', title: 'Comilão de Pastilhas', description: 'Devore pastilhas amarelas pelo labirinto', icon: '🟡', category: 'pastilhas', unit: 'pastilhas', targets: [500, 5000, 25000, 100000, 500000], coins: [50, 250, 1000, 5000, 25000], xp: [100, 300, 1000, 3000, 10000] },
  { id: 'energizers_eaten', title: 'Pílula do Poder', description: 'Consuma pílulas Energizer para assustar fantasmas', icon: '⚪', category: 'pastilhas', unit: 'energizers', targets: [10, 100, 500, 2500, 10000], coins: [40, 200, 800, 4000, 20000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'level_clears', title: 'Desbravador de Fases', description: 'Conclua fases completas no jogo', icon: '🚩', category: 'pastilhas', unit: 'fases', targets: [1, 10, 50, 200, 1000], coins: [50, 300, 1200, 6000, 30000], xp: [150, 400, 1500, 5000, 15000] },
  { id: 'single_run_dots', title: 'Limpeza Impecável', description: 'Coma pastilhas acumuladas numa única partida', icon: '🧹', category: 'pastilhas', unit: 'pastilhas', targets: [244, 1000, 5000, 15000, 50000], coins: [50, 200, 800, 3500, 15000], xp: [100, 300, 1000, 3000, 10000] },
  { id: 'waka_master', title: 'Ritmo Waka-Waka', description: 'Emita sons de mastigada waka-waka', icon: '🗣️', category: 'pastilhas', unit: 'mordidas', targets: [500, 5000, 25000, 100000, 500000], coins: [40, 200, 800, 4000, 20000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'speed_clear', title: 'Limpeza Relâmpago', description: 'Conclua fases em ritmo super acelerado', icon: '⏱️', category: 'pastilhas', unit: 'fases rápidas', targets: [1, 5, 25, 100, 500], coins: [60, 250, 1000, 5000, 25000], xp: [150, 350, 1200, 4000, 12000] },
  { id: 'no_energizer_clear', title: 'Desafio Puro', description: 'Conclua fases sem comer nenhum Energizer', icon: '🥋', category: 'pastilhas', unit: 'fases puras', targets: [1, 5, 20, 80, 300], coins: [80, 400, 1500, 7000, 35000], xp: [200, 500, 2000, 6000, 20000] },
  { id: 'corners_taken', title: 'Mestre das Curvas', description: 'Execute curvas perfeitas nas esquinas', icon: '🔄', category: 'pastilhas', unit: 'curvas', targets: [50, 500, 2500, 10000, 50000], coins: [30, 150, 600, 3000, 15000], xp: [100, 200, 600, 2000, 6000] },
  { id: 'tunnel_warps', title: 'Viajante dos Túneis', description: 'Atravesse os túneis laterais de teletransporte', icon: '🌀', category: 'pastilhas', unit: 'travessias', targets: [10, 100, 500, 2000, 10000], coins: [30, 150, 600, 3000, 15000], xp: [100, 200, 600, 2000, 6000] },
  { id: 'flawless_board', title: 'Varredura Perfeita', description: 'Limpe labirintos sem colidir com paredes', icon: '✨', category: 'pastilhas', unit: 'fases perfeitas', targets: [1, 5, 25, 100, 500], coins: [100, 500, 2000, 8000, 40000], xp: [250, 600, 2500, 8000, 25000] },

  // 2. FANTASMAS (11-20)
  { id: 'ghosts_eaten_total', title: 'Devorador de Espectros', description: 'Devore fantasmas azuis assustados', icon: '👻', category: 'fantasmas', unit: 'fantasmas', targets: [10, 100, 500, 2500, 10000], coins: [50, 250, 1000, 5000, 25000], xp: [100, 300, 1200, 4000, 12000] },
  { id: 'quad_combos', title: 'Caçador Supremo (4-Combo)', description: 'Coma os 4 fantasmas numa única pílula', icon: '⚡', category: 'fantasmas', unit: 'combos 4x', targets: [1, 10, 50, 250, 1000], coins: [100, 500, 2000, 8000, 40000], xp: [250, 600, 2500, 8000, 25000] },
  { id: 'blinky_slayer', title: 'Pesadelo do Blinky', description: 'Devore o fantasma vermelho Blinky', icon: '🔴', category: 'fantasmas', unit: 'Blinkys', targets: [5, 50, 250, 1000, 5000], coins: [40, 200, 800, 4000, 20000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'pinky_slayer', title: 'Emboscada Invertida', description: 'Devore a fantasma rosa Pinky', icon: '🌸', category: 'fantasmas', unit: 'Pinkys', targets: [5, 50, 250, 1000, 5000], coins: [40, 200, 800, 4000, 20000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'inky_slayer', title: 'Falso Reflexo', description: 'Devore o fantasma ciano Inky', icon: '🔷', category: 'fantasmas', unit: 'Inkys', targets: [5, 50, 250, 1000, 5000], coins: [40, 200, 800, 4000, 20000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'clyde_slayer', title: 'Covardia Paga', description: 'Devore o fantasma laranja Clyde', icon: '🍊', category: 'fantasmas', unit: 'Clydes', targets: [5, 50, 250, 1000, 5000], coins: [40, 200, 800, 4000, 20000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'double_combos', title: 'Combo Duplo (2-Combo)', description: 'Devore 2 fantasmas na mesma pílula', icon: '✌️', category: 'fantasmas', unit: 'combos 2x', targets: [10, 100, 500, 2000, 10000], coins: [40, 200, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'triple_combos', title: 'Combo Triplo (3-Combo)', description: 'Devore 3 fantasmas na mesma pílula', icon: '🎯', category: 'fantasmas', unit: 'combos 3x', targets: [5, 50, 250, 1000, 5000], coins: [60, 300, 1200, 5000, 25000], xp: [150, 350, 1200, 4000, 12000] },
  { id: 'last_second_eats', title: 'No Fio da Navalha', description: 'Devore fantasmas nos últimos segundos azuis', icon: '⏳', category: 'fantasmas', unit: 'comidas arriscadas', targets: [3, 25, 100, 500, 2000], coins: [50, 250, 1000, 5000, 25000], xp: [100, 300, 1200, 4000, 12000] },
  { id: 'cruise_elroy_survived', title: 'Fúria do Elroy', description: 'Sobreviva ao modo Cruise Elroy acelerado', icon: '🔥', category: 'fantasmas', unit: 'sobrevivências', targets: [1, 5, 25, 100, 500], coins: [50, 250, 1000, 4500, 22000], xp: [100, 300, 1000, 3500, 10000] },

  // 3. FRUTAS & GULOSEIMAS (21-30)
  { id: 'fruits_eaten_total', title: 'Banquete de Frutas', description: 'Colete itens bônus frutados no mapa', icon: '🍒', category: 'frutas', unit: 'frutas', targets: [5, 50, 250, 1000, 5000], coins: [50, 250, 1000, 5000, 25000], xp: [100, 300, 1200, 4000, 12000] },
  { id: 'cherry_lover', title: 'Cereja Clássica', description: 'Devore pares de cerejas suculentas', icon: '🍒', category: 'frutas', unit: 'cerejas', targets: [5, 25, 100, 500, 2000], coins: [40, 200, 700, 3000, 15000], xp: [100, 200, 700, 2000, 7000] },
  { id: 'strawberry_lover', title: 'Morangos Doces', description: 'Devore morangos frescos nas fases', icon: '🍓', category: 'frutas', unit: 'morangos', targets: [5, 25, 100, 500, 2000], coins: [40, 200, 700, 3000, 15000], xp: [100, 200, 700, 2000, 7000] },
  { id: 'orange_lover', title: 'Laranja Cítrica', description: 'Devore laranjas saborosas', icon: '🍊', category: 'frutas', unit: 'laranjas', targets: [5, 25, 100, 500, 2000], coins: [50, 250, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'apple_lover', title: 'Maçã Crocante', description: 'Devore maçãs vermelhas', icon: '🍎', category: 'frutas', unit: 'maçãs', targets: [5, 25, 100, 500, 2000], coins: [50, 250, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'melon_lover', title: 'Melão Refrescante', description: 'Devore melões saborosos', icon: '🍈', category: 'frutas', unit: 'melões', targets: [5, 25, 100, 500, 2000], coins: [60, 300, 1000, 4500, 22000], xp: [120, 300, 1000, 3000, 10000] },
  { id: 'galaxian_boss', title: 'Nave Galaxian', description: 'Colete a lendária insígnia da Galaxian', icon: '🚀', category: 'frutas', unit: 'Galaxians', targets: [3, 15, 60, 250, 1000], coins: [80, 400, 1500, 6000, 30000], xp: [150, 400, 1500, 4500, 15000] },
  { id: 'bell_collector', title: 'Sino de Ouro', description: 'Toque e devore o sino dourado', icon: '🔔', category: 'frutas', unit: 'sinos', targets: [3, 15, 60, 250, 1000], coins: [100, 500, 2000, 8000, 40000], xp: [200, 500, 2000, 6000, 20000] },
  { id: 'key_master', title: 'Chave Lendária (5.000 pts)', description: 'Colete o item máximo: a Chave Sagrada', icon: '🔑', category: 'frutas', unit: 'chaves', targets: [1, 5, 25, 100, 500], coins: [150, 750, 3000, 12000, 60000], xp: [300, 800, 3000, 10000, 30000] },
  { id: 'all_fruits_run', title: 'Pomar Completo', description: 'Colete todas as frutas de uma única partida', icon: '🧺', category: 'frutas', unit: 'partidas perfeitas', targets: [1, 5, 20, 80, 300], coins: [100, 500, 2000, 8000, 40000], xp: [200, 500, 2000, 6000, 20000] },

  // 4. PONTUAÇÃO & RECORDES (31-40)
  { id: 'total_points_accumulated', title: 'Pontuador Nato', description: 'Pontos acumulados em toda carreira', icon: '💯', category: 'pontos', unit: 'pontos', targets: [50000, 500000, 2500000, 10000000, 50000000], coins: [50, 250, 1000, 5000, 25000], xp: [100, 300, 1200, 4000, 12000] },
  { id: 'high_score_tier', title: 'Recordista de Elite', description: 'Atinja pontuações altas numa partida', icon: '🏆', category: 'pontos', unit: 'recorde', targets: [10000, 50000, 150000, 500000, 1500000], coins: [100, 500, 2000, 8000, 40000], xp: [250, 600, 2500, 8000, 25000] },
  { id: 'coins_earned_total', title: 'Magnata do Fliperama', description: 'Acumule moedas totais no jogo', icon: '🪙', category: 'economia', unit: 'moedas', targets: [5000, 25000, 100000, 500000, 2500000], coins: [100, 500, 2000, 10000, 50000], xp: [200, 500, 2000, 8000, 25000] },
  { id: 'piggy_bank_saved', title: 'Cofre Lotado', description: 'Mantenha moedas guardadas na carteira', icon: '🏦', category: 'economia', unit: 'saldo', targets: [5000, 20000, 80000, 300000, 1000000], coins: [80, 400, 1600, 7000, 35000], xp: [150, 400, 1600, 6000, 20000] },
  { id: 'upgrades_purchased', title: 'Mestre dos Aprimoramentos', description: 'Compre níveis de upgrades na Loja', icon: '🛠️', category: 'economia', unit: 'upgrades', targets: [5, 25, 75, 150, 250], coins: [100, 500, 2000, 8000, 40000], xp: [200, 500, 2000, 7000, 25000] },
  { id: 'skins_unlocked', title: 'Guarda-Roupa Arcade', description: 'Desbloqueie skins estilosas do Pac-Man', icon: '🎭', category: 'economia', unit: 'skins', targets: [1, 3, 5, 7, 8], coins: [100, 400, 1500, 5000, 20000], xp: [200, 500, 1500, 5000, 15000] },
  { id: 'consecutive_survivals', title: 'Invencibilidade', description: 'Passe fases consecutivas sem morrer', icon: '🛡️', category: 'sobrevivencia', unit: 'fases sem morrer', targets: [2, 5, 12, 30, 100], coins: [80, 400, 1800, 7500, 35000], xp: [200, 500, 2000, 7000, 25000] },
  { id: 'near_death_escapes', title: 'Escape Milagroso', description: 'Desvie de fantasmas a 1 tile de distância', icon: '💨', category: 'sobrevivencia', unit: 'escapes', targets: [5, 25, 100, 500, 2000], coins: [40, 200, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'turbo_clears', title: 'Piloto Supersônico', description: 'Conclua fases no veloz Modo Turbo 2x', icon: '⚡', category: 'modos', unit: 'fases turbo', targets: [1, 5, 25, 100, 500], coins: [60, 300, 1200, 5000, 25000], xp: [150, 350, 1200, 4000, 15000] },
  { id: 'hunter_wins', title: 'Terror dos Fantasmas', description: 'Vença no Modo Invertido Ghost Hunter', icon: '😈', category: 'modos', unit: 'vitórias', targets: [1, 5, 25, 100, 500], coins: [60, 300, 1200, 5000, 25000], xp: [150, 350, 1200, 4000, 15000] },

  // 5. POWER-UPS & MULTIPLAYER (41-50)
  { id: 'shield_blocks', title: 'Armadura Reluzente', description: 'Absorva colisões com o Escudo de Energia', icon: '🛡️', category: 'powerups', unit: 'defesas', targets: [3, 20, 80, 300, 1000], coins: [40, 200, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'freeze_uses', title: 'Era do Gelo', description: 'Congele fantasmas com o Relógio Mágico', icon: '❄️', category: 'powerups', unit: 'congelamentos', targets: [3, 20, 80, 300, 1000], coins: [40, 200, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'bomb_blasts', title: 'Detonador em Área', description: 'Atordoe fantasmas com Bombas Flashbang', icon: '💣', category: 'powerups', unit: 'detonações', targets: [3, 20, 80, 300, 1000], coins: [40, 200, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'magnet_pulled_dots', title: 'Vórtice Dourado', description: 'Atraia pastilhas usando o Super Ímã', icon: '🧲', category: 'powerups', unit: 'pastilhas sugadas', targets: [100, 1000, 5000, 25000, 100000], coins: [40, 200, 800, 3500, 18000], xp: [100, 250, 800, 2500, 8000] },
  { id: 'teleport_escapes', title: 'Mestre do Espaço-Tempo', description: 'Teleporte com [Espaço] para escapar de cercos', icon: '🌀', category: 'powerups', unit: 'teleportes', targets: [5, 25, 100, 500, 2000], coins: [50, 250, 1000, 4500, 22000], xp: [100, 300, 1000, 3500, 10000] },
  { id: 'coop_shared_score', title: 'Dupla Dinâmica', description: 'Pontos acumulados no Modo 2P Co-op', icon: '👥', category: 'modos', unit: 'pontos co-op', targets: [20000, 100000, 500000, 2000000, 10000000], coins: [60, 300, 1200, 5000, 25000], xp: [150, 350, 1200, 4000, 15000] },
  { id: 'versus_wins_pac', title: 'Vitória Amarela', description: 'Vença como Pac-Man no Modo Versus 2P', icon: '⚔️', category: 'modos', unit: 'vitórias', targets: [1, 5, 20, 80, 300], coins: [50, 250, 1000, 4500, 22000], xp: [100, 300, 1000, 3500, 10000] },
  { id: 'versus_wins_ghost', title: 'Triunfo Carmesim', description: 'Vença como Blinky no Modo Versus 2P', icon: '👹', category: 'modos', unit: 'vitórias', targets: [1, 5, 20, 80, 300], coins: [50, 250, 1000, 4500, 22000], xp: [100, 300, 1000, 3500, 10000] },
  { id: 'editor_maps_created', title: 'Arquiteto de Mapas', description: 'Crie e salve labirintos personalizados no Editor', icon: '🎨', category: 'modos', unit: 'mapas criados', targets: [1, 3, 7, 15, 30], coins: [100, 400, 1500, 5000, 25000], xp: [200, 500, 1500, 5000, 15000] },
  { id: 'procedural_runs_cleared', title: 'Explorador do Infinito', description: 'Conclua labirintos gerados proceduralmente', icon: '🎲', category: 'modos', unit: 'mapas procedurais', targets: [1, 5, 25, 100, 500], coins: [60, 300, 1200, 5000, 25000], xp: [150, 350, 1200, 4000, 15000] },
];

export class AchievementManager {
  private sound: SoundSynthesizer | null = null;
  private onUnlockCallbacks: ((ach: ProgressiveAchievement, tier: AchievementTier) => void)[] = [];
  private onCoinsRewardedCallbacks: ((amount: number) => void)[] = [];
  private onXpRewardedCallbacks: ((amount: number) => void)[] = [];

  private achievements: Record<string, ProgressiveAchievement> = {};

  constructor() {
    this.initAchievements();
    this.loadFromStorage();
  }

  public setSound(sound: SoundSynthesizer) {
    this.sound = sound;
  }

  public onUnlock(cb: (ach: ProgressiveAchievement, tier: AchievementTier) => void) {
    this.onUnlockCallbacks.push(cb);
  }

  public onCoinsRewarded(cb: (amount: number) => void) {
    this.onCoinsRewardedCallbacks.push(cb);
  }

  public onXpRewarded(cb: (amount: number) => void) {
    this.onXpRewardedCallbacks.push(cb);
  }

  private initAchievements() {
    this.achievements = {};
    RAW_ACHIEVEMENTS.forEach((raw) => {
      const tiers: AchievementTier[] = raw.targets.map((target, idx) => ({
        tier: (idx + 1) as 1 | 2 | 3 | 4 | 5,
        target,
        name: TIER_NAMES[idx],
        rewardCoins: raw.coins[idx],
        rewardXp: raw.xp[idx],
        unlocked: false,
      }));

      this.achievements[raw.id] = {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        icon: raw.icon,
        category: raw.category,
        currentValue: 0,
        unit: raw.unit,
        tiers,
      };
    });
  }

  public getAchievements(): ProgressiveAchievement[] {
    return Object.values(this.achievements);
  }

  public getByCategory(category: ProgressiveAchievement['category']): ProgressiveAchievement[] {
    return Object.values(this.achievements).filter((a) => a.category === category);
  }

  public getUnlockedTiersCount(): number {
    let count = 0;
    Object.values(this.achievements).forEach((a) => {
      a.tiers.forEach((t) => {
        if (t.unlocked) count++;
      });
    });
    return count;
  }

  public getTotalTiersCount(): number {
    return Object.values(this.achievements).length * 5; // 50 trilhas * 5 tiers = 250 níveis!
  }

  public increment(id: string, amount: number = 1) {
    const ach = this.achievements[id];
    if (!ach) return;
    ach.currentValue += amount;
    this.checkTiers(ach);
  }

  public recordMax(id: string, value: number) {
    const ach = this.achievements[id];
    if (!ach) return;
    if (value > ach.currentValue) {
      ach.currentValue = value;
      this.checkTiers(ach);
    }
  }

  public setValue(id: string, value: number) {
    const ach = this.achievements[id];
    if (!ach) return;
    ach.currentValue = value;
    this.checkTiers(ach);
  }

  private checkTiers(ach: ProgressiveAchievement) {
    let unlockedAny = false;
    ach.tiers.forEach((t) => {
      if (!t.unlocked && ach.currentValue >= t.target) {
        t.unlocked = true;
        t.unlockedAt = new Date().toLocaleDateString();
        unlockedAny = true;
        this.showToast(ach, t);
        this.sound?.playExtraLife();
        this.onUnlockCallbacks.forEach((cb) => cb(ach, t));
        this.onCoinsRewardedCallbacks.forEach((cb) => cb(t.rewardCoins));
        this.onXpRewardedCallbacks.forEach((cb) => cb(t.rewardXp));
      }
    });

    if (unlockedAny) {
      this.saveToStorage();
    }
  }

  private showToast(ach: ProgressiveAchievement, tier: AchievementTier) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-text">
        <div class="achievement-header">🏆 CONQUISTA DESBLOQUEADA!</div>
        <div class="achievement-name">${ach.title} (${tier.name})</div>
        <div class="achievement-desc">+${tier.rewardCoins} 🪙 Moedas & +${tier.rewardXp} ⭐ XP!</div>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('visible');
    }, 50);

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 500);
    }, 4500);
  }

  private saveToStorage() {
    try {
      const state: Record<string, { currentValue: number; tiers: boolean[] }> = {};
      Object.entries(this.achievements).forEach(([id, ach]) => {
        state[id] = {
          currentValue: ach.currentValue,
          tiers: ach.tiers.map((t) => t.unlocked),
        };
      });
      SaveService.setItem('pacman_progressive_achievements_v3', JSON.stringify(state));
    } catch {}
  }

  private loadFromStorage() {
    try {
      const saved = SaveService.getItem('pacman_progressive_achievements_v3');
      if (saved) {
        const state = JSON.parse(saved);
        Object.entries(state).forEach(([id, data]: [string, any]) => {
          if (this.achievements[id]) {
            this.achievements[id].currentValue = data.currentValue || 0;
            if (Array.isArray(data.tiers)) {
              data.tiers.forEach((unlocked: boolean, idx: number) => {
                if (this.achievements[id].tiers[idx]) {
                  this.achievements[id].tiers[idx].unlocked = unlocked;
                }
              });
            }
          }
        });
      }
    } catch {}
  }
}
