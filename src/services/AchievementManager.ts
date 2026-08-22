import { SoundSynthesizer } from '../audio/SoundSynthesizer.ts';
import { SaveService } from './SaveService.ts';

export interface AchievementTier {
  tier: 1 | 2 | 3;
  target: number;
  name: string;
  rewardCoins: number;
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
  tiers: [AchievementTier, AchievementTier, AchievementTier];
}

export class AchievementManager {
  private sound: SoundSynthesizer | null = null;
  private onUnlockCallbacks: ((ach: ProgressiveAchievement, tier: AchievementTier) => void)[] = [];
  private onCoinsRewardedCallbacks: ((amount: number) => void)[] = [];

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

  private initAchievements() {
    this.achievements = {
      // =========================================================================
      // GRUPO 1: PASTILHAS & LABIRINTO (1-10)
      // =========================================================================
      dots_eaten: {
        id: 'dots_eaten',
        title: 'Comilão de Pastilhas',
        description: 'Devore pastilhas amarelas pelo labirinto',
        icon: '🟡',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'pastilhas',
        tiers: [
          { tier: 1, target: 100, name: 'Bronze ⭐', rewardCoins: 30, unlocked: false },
          { tier: 2, target: 1000, name: 'Prata ⭐⭐', rewardCoins: 100, unlocked: false },
          { tier: 3, target: 5000, name: 'Ouro ⭐⭐⭐', rewardCoins: 300, unlocked: false },
        ],
      },
      energizers_eaten: {
        id: 'energizers_eaten',
        title: 'Pílula do Poder',
        description: 'Consuma pílulas Energizer para assustar fantasmas',
        icon: '⚪',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'energizers',
        tiers: [
          { tier: 1, target: 10, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 50, name: 'Prata ⭐⭐', rewardCoins: 120, unlocked: false },
          { tier: 3, target: 200, name: 'Ouro ⭐⭐⭐', rewardCoins: 350, unlocked: false },
        ],
      },
      level_clears: {
        id: 'level_clears',
        title: 'Desbravador de Fases',
        description: 'Conclua fases completas no jogo',
        icon: '🚩',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'fases',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 10, name: 'Prata ⭐⭐', rewardCoins: 200, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      single_run_dots: {
        id: 'single_run_dots',
        title: 'Limpeza Impecável',
        description: 'Coma pastilhas acumuladas numa única partida',
        icon: '🧹',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'pastilhas',
        tiers: [
          { tier: 1, target: 244, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 1000, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 2500, name: 'Ouro ⭐⭐⭐', rewardCoins: 400, unlocked: false },
        ],
      },
      waka_master: {
        id: 'waka_master',
        title: 'Ritmo Waka-Waka',
        description: 'Emita sons de mastigada waka-waka',
        icon: '🗣️',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'mordidas',
        tiers: [
          { tier: 1, target: 500, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 2500, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 10000, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      speed_clear: {
        id: 'speed_clear',
        title: 'Limpeza Relâmpago',
        description: 'Conclua fases em ritmo super acelerado',
        icon: '⏱️',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'fases rápidas',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze (<60s) ⭐', rewardCoins: 60, unlocked: false },
          { tier: 2, target: 5, name: 'Prata (<45s) ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 15, name: 'Ouro (<30s) ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      no_energizer_clear: {
        id: 'no_energizer_clear',
        title: 'Desafio Puro',
        description: 'Conclua fases sem comer nenhum Energizer',
        icon: '🥋',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'fases puras',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 80, unlocked: false },
          { tier: 2, target: 3, name: 'Prata ⭐⭐', rewardCoins: 250, unlocked: false },
          { tier: 3, target: 10, name: 'Ouro ⭐⭐⭐', rewardCoins: 700, unlocked: false },
        ],
      },
      corners_taken: {
        id: 'corners_taken',
        title: 'Mestre das Curvas (Cornering)',
        description: 'Execute curvas perfeitas nas esquinas',
        icon: '🔄',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'curvas',
        tiers: [
          { tier: 1, target: 50, name: 'Bronze ⭐', rewardCoins: 30, unlocked: false },
          { tier: 2, target: 250, name: 'Prata ⭐⭐', rewardCoins: 100, unlocked: false },
          { tier: 3, target: 1000, name: 'Ouro ⭐⭐⭐', rewardCoins: 300, unlocked: false },
        ],
      },
      tunnel_warps: {
        id: 'tunnel_warps',
        title: 'Viajante dos Túneis',
        description: 'Atravesse os túneis laterais de teletransporte',
        icon: '🌀',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'travessias',
        tiers: [
          { tier: 1, target: 10, name: 'Bronze ⭐', rewardCoins: 30, unlocked: false },
          { tier: 2, target: 50, name: 'Prata ⭐⭐', rewardCoins: 100, unlocked: false },
          { tier: 3, target: 200, name: 'Ouro ⭐⭐⭐', rewardCoins: 300, unlocked: false },
        ],
      },
      flawless_board: {
        id: 'flawless_board',
        title: 'Varredura Perfeita',
        description: 'Limpe labirintos sem colidir com paredes',
        icon: '✨',
        category: 'pastilhas',
        currentValue: 0,
        unit: 'fases perfeitas',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 100, unlocked: false },
          { tier: 2, target: 3, name: 'Prata ⭐⭐', rewardCoins: 300, unlocked: false },
          { tier: 3, target: 10, name: 'Ouro ⭐⭐⭐', rewardCoins: 800, unlocked: false },
        ],
      },

      // =========================================================================
      // GRUPO 2: CAÇA AOS FANTASMAS (11-20)
      // =========================================================================
      ghosts_eaten_total: {
        id: 'ghosts_eaten_total',
        title: 'Devorador de Espectros',
        description: 'Devore fantasmas azuis assustados',
        icon: '👻',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'fantasmas',
        tiers: [
          { tier: 1, target: 10, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 50, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 250, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      quad_combos: {
        id: 'quad_combos',
        title: 'Caçador Supremo (4-Combo)',
        description: 'Coma os 4 fantasmas numa única pílula de poder',
        icon: '⚡',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'combos 4x',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 100, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 300, unlocked: false },
          { tier: 3, target: 20, name: 'Ouro ⭐⭐⭐', rewardCoins: 800, unlocked: false },
        ],
      },
      blinky_slayer: {
        id: 'blinky_slayer',
        title: 'Pesadelo do Blinky',
        description: 'Devore o fantasma vermelho Blinky',
        icon: '🔴',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'Blinkys',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 25, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 100, name: 'Ouro ⭐⭐⭐', rewardCoins: 450, unlocked: false },
        ],
      },
      pinky_slayer: {
        id: 'pinky_slayer',
        title: 'Emboscada Invertida',
        description: 'Devore a fantasma rosa Pinky',
        icon: '🌸',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'Pinkys',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 25, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 100, name: 'Ouro ⭐⭐⭐', rewardCoins: 450, unlocked: false },
        ],
      },
      inky_slayer: {
        id: 'inky_slayer',
        title: 'Quebra de Pinça',
        description: 'Devore o fantasma ciano Inky',
        icon: '🔷',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'Inkys',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 25, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 100, name: 'Ouro ⭐⭐⭐', rewardCoins: 450, unlocked: false },
        ],
      },
      clyde_slayer: {
        id: 'clyde_slayer',
        title: 'Sem Covardia',
        description: 'Devore o fantasma laranja Clyde',
        icon: '🍊',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'Clydes',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 25, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 100, name: 'Ouro ⭐⭐⭐', rewardCoins: 450, unlocked: false },
        ],
      },
      elroy_hunter: {
        id: 'elroy_hunter',
        title: 'Domador de Cruise Elroy',
        description: 'Coma o Blinky enquanto ele está acelerado em modo Elroy',
        icon: '🔥',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'Elroys',
        tiers: [
          { tier: 1, target: 2, name: 'Bronze ⭐', rewardCoins: 60, unlocked: false },
          { tier: 2, target: 10, name: 'Prata ⭐⭐', rewardCoins: 200, unlocked: false },
          { tier: 3, target: 30, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      chain_ghost_eater: {
        id: 'chain_ghost_eater',
        title: 'Frenesi em Cadeia',
        description: 'Devore múltiplos fantasmas num intervalo de 3 segundos',
        icon: '⛓️',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'sequências',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 15, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      close_call_dodge: {
        id: 'close_call_dodge',
        title: 'Por um Triz',
        description: 'Passe raspando a menos de 1 tile de um fantasma perigoso',
        icon: '😱',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'desvios',
        tiers: [
          { tier: 1, target: 10, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 50, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 200, name: 'Ouro ⭐⭐⭐', rewardCoins: 450, unlocked: false },
        ],
      },
      ghost_eyes_eaten: {
        id: 'ghost_eyes_eaten',
        title: 'Vigilância Máxima',
        description: 'Veja os olhos dos fantasmas retornarem à casinha',
        icon: '👀',
        category: 'fantasmas',
        currentValue: 0,
        unit: 'retornos',
        tiers: [
          { tier: 1, target: 10, name: 'Bronze ⭐', rewardCoins: 30, unlocked: false },
          { tier: 2, target: 50, name: 'Prata ⭐⭐', rewardCoins: 100, unlocked: false },
          { tier: 3, target: 200, name: 'Ouro ⭐⭐⭐', rewardCoins: 300, unlocked: false },
        ],
      },

      // =========================================================================
      // GRUPO 3: FRUTAS & ITENS BÔNUS (21-25)
      // =========================================================================
      fruits_eaten_total: {
        id: 'fruits_eaten_total',
        title: 'Banquete Frutífero',
        description: 'Coma frutas e itens bônus que surgem no centro',
        icon: '🍒',
        category: 'frutas',
        currentValue: 0,
        unit: 'frutas',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 25, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 100, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      cherry_lover: {
        id: 'cherry_lover',
        title: 'Sabor Cereja',
        description: 'Coma cerejas clássicas de 100 pontos',
        icon: '🍒',
        category: 'frutas',
        currentValue: 0,
        unit: 'cerejas',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 30, unlocked: false },
          { tier: 2, target: 15, name: 'Prata ⭐⭐', rewardCoins: 100, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 300, unlocked: false },
        ],
      },
      strawberry_lover: {
        id: 'strawberry_lover',
        title: 'Doce Morango',
        description: 'Coma morangos suculentos de 300 pontos',
        icon: '🍓',
        category: 'frutas',
        currentValue: 0,
        unit: 'morangos',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 15, name: 'Prata ⭐⭐', rewardCoins: 120, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 350, unlocked: false },
        ],
      },
      orange_lover: {
        id: 'orange_lover',
        title: 'Vitamina C',
        description: 'Coma laranjas tropicais de 500 pontos',
        icon: '🍊',
        category: 'frutas',
        currentValue: 0,
        unit: 'laranjas',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 15, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 400, unlocked: false },
        ],
      },
      key_master: {
        id: 'key_master',
        title: 'Chave Mestra',
        description: 'Coma a Chave Bônus de 5.000 pontos em níveis avançados',
        icon: '🗝️',
        category: 'frutas',
        currentValue: 0,
        unit: 'chaves',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 150, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 400, unlocked: false },
          { tier: 3, target: 15, name: 'Ouro ⭐⭐⭐', rewardCoins: 1000, unlocked: false },
        ],
      },

      // =========================================================================
      // GRUPO 4: SOBREVIVÊNCIA & VIDAS (26-30)
      // =========================================================================
      untouchable_streak: {
        id: 'untouchable_streak',
        title: 'Intocável',
        description: 'Passe de fase consecutivas sem perder nenhuma vida',
        icon: '🛡️',
        category: 'sobrevivencia',
        currentValue: 0,
        unit: 'fases sem morrer',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 200, unlocked: false },
          { tier: 3, target: 15, name: 'Ouro ⭐⭐⭐', rewardCoins: 700, unlocked: false },
        ],
      },
      extra_lives_earned: {
        id: 'extra_lives_earned',
        title: 'Vida Extra',
        description: 'Conquiste vidas adicionais por atingir recordes de pontuação',
        icon: '❤️',
        category: 'sobrevivencia',
        currentValue: 0,
        unit: 'vidas extras',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 20, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      last_life_clutch: {
        id: 'last_life_clutch',
        title: 'Sobrevivente Nato',
        description: 'Conclua a fase com apenas 1 vida restante no limite',
        icon: '🩸',
        category: 'sobrevivencia',
        currentValue: 0,
        unit: 'clutches',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 60, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 200, unlocked: false },
          { tier: 3, target: 15, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      tunnel_escapes: {
        id: 'tunnel_escapes',
        title: 'Fuga Cinematográfica',
        description: 'Escape por um túnel lateral com um fantasma na sua cola',
        icon: '🏃',
        category: 'sobrevivencia',
        currentValue: 0,
        unit: 'fugas',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 15, name: 'Prata ⭐⭐', rewardCoins: 140, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 450, unlocked: false },
        ],
      },
      time_survived: {
        id: 'time_survived',
        title: 'Resistência de Ferro',
        description: 'Sobreviva tempo acumulado em jogo ativo',
        icon: '⏳',
        category: 'sobrevivencia',
        currentValue: 0,
        unit: 'minutos',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 20, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 60, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },

      // =========================================================================
      // GRUPO 5: PONTUAÇÃO & RECORDES (31-35)
      // =========================================================================
      high_score_tier: {
        id: 'high_score_tier',
        title: 'Pontuador de Elite',
        description: 'Atinja pontuações expressivas em partidas individuais',
        icon: '🏅',
        category: 'pontos',
        currentValue: 0,
        unit: 'pontos máx',
        tiers: [
          { tier: 1, target: 10000, name: 'Bronze (10k) ⭐', rewardCoins: 60, unlocked: false },
          { tier: 2, target: 50000, name: 'Prata (50k) ⭐⭐', rewardCoins: 250, unlocked: false },
          { tier: 3, target: 150000, name: 'Ouro (150k) ⭐⭐⭐', rewardCoins: 800, unlocked: false },
        ],
      },
      ghost_combos_1600: {
        id: 'ghost_combos_1600',
        title: 'Combo de Ouro 1.600 PTS',
        description: 'Atinja a pontuação máxima de 1.600 num 4º fantasma consecutivo',
        icon: '💎',
        category: 'pontos',
        currentValue: 0,
        unit: '1.600 PTS',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 80, unlocked: false },
          { tier: 2, target: 10, name: 'Prata ⭐⭐', rewardCoins: 300, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 900, unlocked: false },
        ],
      },
      leaderboard_rank: {
        id: 'leaderboard_rank',
        title: 'Lenda do Ranking Arcade',
        description: 'Conquiste posições no Top 10 de recordes do jogo',
        icon: '🥇',
        category: 'pontos',
        currentValue: 0,
        unit: 'ranking top',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze (Top 5) ⭐', rewardCoins: 80, unlocked: false },
          { tier: 2, target: 3, name: 'Prata (Top 3) ⭐⭐', rewardCoins: 250, unlocked: false },
          { tier: 3, target: 10, name: 'Ouro (Rank #1) ⭐⭐⭐', rewardCoins: 800, unlocked: false },
        ],
      },
      total_points_accumulated: {
        id: 'total_points_accumulated',
        title: 'Acumulador de Pontos',
        description: 'Some pontuações ao longo de todas as suas partidas',
        icon: '📊',
        category: 'pontos',
        currentValue: 0,
        unit: 'pontos totais',
        tiers: [
          { tier: 1, target: 50000, name: 'Bronze (50k) ⭐', rewardCoins: 60, unlocked: false },
          { tier: 2, target: 250000, name: 'Prata (250k) ⭐⭐', rewardCoins: 200, unlocked: false },
          { tier: 3, target: 1000000, name: 'Ouro (1M) ⭐⭐⭐', rewardCoins: 700, unlocked: false },
        ],
      },
      level_progression: {
        id: 'level_progression',
        title: 'Mestre dos Níveis',
        description: 'Avance para níveis elevados na mesma partida',
        icon: '👑',
        category: 'pontos',
        currentValue: 0,
        unit: 'nível máx',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze (Nv 5) ⭐', rewardCoins: 70, unlocked: false },
          { tier: 2, target: 10, name: 'Prata (Nv 10) ⭐⭐', rewardCoins: 250, unlocked: false },
          { tier: 3, target: 20, name: 'Ouro (Nv 20) ⭐⭐⭐', rewardCoins: 800, unlocked: false },
        ],
      },

      // =========================================================================
      // GRUPO 6: ECONOMIA & LOJINHA (36-40)
      // =========================================================================
      coins_earned_total: {
        id: 'coins_earned_total',
        title: 'Magnata do Arcade',
        description: 'Acumule moedas coletando itens e vencendo fases',
        icon: '🪙',
        category: 'economia',
        currentValue: 0,
        unit: 'moedas',
        tiers: [
          { tier: 1, target: 500, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 2500, name: 'Prata ⭐⭐', rewardCoins: 200, unlocked: false },
          { tier: 3, target: 10000, name: 'Ouro ⭐⭐⭐', rewardCoins: 800, unlocked: false },
        ],
      },
      coins_spent_total: {
        id: 'coins_spent_total',
        title: 'Consumidor VIP',
        description: 'Gaste moedas na Lojinha de Upgrades e Skins',
        icon: '🛍️',
        category: 'economia',
        currentValue: 0,
        unit: 'moedas gastas',
        tiers: [
          { tier: 1, target: 300, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 1500, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 5000, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      upgrades_purchased: {
        id: 'upgrades_purchased',
        title: 'Arsenal Turbinado',
        description: 'Compre melhorias permanentes na Lojinha',
        icon: '🔧',
        category: 'economia',
        currentValue: 0,
        unit: 'upgrades',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 2, name: 'Prata ⭐⭐', rewardCoins: 120, unlocked: false },
          { tier: 3, target: 4, name: 'Ouro ⭐⭐⭐', rewardCoins: 400, unlocked: false },
        ],
      },
      skins_unlocked_total: {
        id: 'skins_unlocked_total',
        title: 'Guarda-Roupa Fashion',
        description: 'Desbloqueie skins exclusivas na Lojinha',
        icon: '🕶️',
        category: 'economia',
        currentValue: 0,
        unit: 'skins',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 60, unlocked: false },
          { tier: 2, target: 2, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 3, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      piggy_bank_saved: {
        id: 'piggy_bank_saved',
        title: 'Cofre Blindado',
        description: 'Mantenha saldo simultâneo de moedas na carteira',
        icon: '🏦',
        category: 'economia',
        currentValue: 0,
        unit: 'moedas no saldo',
        tiers: [
          { tier: 1, target: 1000, name: 'Bronze ⭐', rewardCoins: 80, unlocked: false },
          { tier: 2, target: 3000, name: 'Prata ⭐⭐', rewardCoins: 250, unlocked: false },
          { tier: 3, target: 7000, name: 'Ouro ⭐⭐⭐', rewardCoins: 800, unlocked: false },
        ],
      },

      // =========================================================================
      // GRUPO 7: POWER-UPS ESPECIAIS (41-45)
      // =========================================================================
      bomb_stuns: {
        id: 'bomb_stuns',
        title: 'Mestre dos Explosivos',
        description: 'Atordoe fantasmas com o choque da Bomba Flashbang',
        icon: '💣',
        category: 'powerups',
        currentValue: 0,
        unit: 'atordoamentos',
        tiers: [
          { tier: 1, target: 10, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 50, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 200, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      magnet_pulls: {
        id: 'magnet_pulls',
        title: 'Atração Magnética',
        description: 'Puxe pastilhas à distância usando o Ímã Especial',
        icon: '🧲',
        category: 'powerups',
        currentValue: 0,
        unit: 'pastilhas atraídas',
        tiers: [
          { tier: 1, target: 50, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 300, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 1500, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      shield_deflections: {
        id: 'shield_deflections',
        title: 'Guarda Inabalável',
        description: 'Absorva colisões mortais usando o Escudo de Energia',
        icon: '🛡️',
        category: 'powerups',
        currentValue: 0,
        unit: 'defesas',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 15, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 50, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      freeze_kills: {
        id: 'freeze_kills',
        title: 'Era do Gelo',
        description: 'Devore fantasmas paralisados pelo Relógio de Congelamento',
        icon: '🧊',
        category: 'powerups',
        currentValue: 0,
        unit: 'fantasmas gelados',
        tiers: [
          { tier: 1, target: 5, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 25, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 100, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
      powerups_collected_total: {
        id: 'powerups_collected_total',
        title: 'Colecionador de Poder',
        description: 'Colete power-ups especiais flutuantes pelo mapa',
        icon: '⭐',
        category: 'powerups',
        currentValue: 0,
        unit: 'power-ups',
        tiers: [
          { tier: 1, target: 10, name: 'Bronze ⭐', rewardCoins: 40, unlocked: false },
          { tier: 2, target: 50, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 200, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },

      // =========================================================================
      // GRUPO 8: MODOS DE JOGO & LABIRINTOS (46-50)
      // =========================================================================
      ghost_hunter_wins: {
        id: 'ghost_hunter_wins',
        title: 'Caçador de Pac-Mans',
        description: 'Capture o Pac-Man IA no Modo Invertido (Ghost Hunter)',
        icon: '⚔️',
        category: 'modos',
        currentValue: 0,
        unit: 'capturas',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 20, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      coop_levels_cleared: {
        id: 'coop_levels_cleared',
        title: 'Dupla Imbatível',
        description: 'Conclua fases no Modo 2 Jogadores Co-op (Pac & Ms. Pac)',
        icon: '👥',
        category: 'modos',
        currentValue: 0,
        unit: 'fases co-op',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 15, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      versus_victories: {
        id: 'versus_victories',
        title: 'Duelo de Titãs',
        description: 'Vença partidas no Modo 2 Jogadores Versus',
        icon: '🤺',
        category: 'modos',
        currentValue: 0,
        unit: 'vitórias versus',
        tiers: [
          { tier: 1, target: 1, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 180, unlocked: false },
          { tier: 3, target: 15, name: 'Ouro ⭐⭐⭐', rewardCoins: 600, unlocked: false },
        ],
      },
      turbo_stages_survived: {
        id: 'turbo_stages_survived',
        title: 'Maníaco do Turbo',
        description: 'Sobreviva e passe fases no veloz Modo Turbo 2x',
        icon: '⚡',
        category: 'modos',
        currentValue: 0,
        unit: 'fases turbo',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 60, unlocked: false },
          { tier: 2, target: 7, name: 'Prata ⭐⭐', rewardCoins: 200, unlocked: false },
          { tier: 3, target: 15, name: 'Ouro ⭐⭐⭐', rewardCoins: 700, unlocked: false },
        ],
      },
      mazes_explored_count: {
        id: 'mazes_explored_count',
        title: 'Viajante de Labirintos',
        description: 'Jogue em labirintos diferentes (Ms. Pac, Google, Tipografia)',
        icon: '🗺️',
        category: 'modos',
        currentValue: 0,
        unit: 'mapas jogados',
        tiers: [
          { tier: 1, target: 3, name: 'Bronze ⭐', rewardCoins: 50, unlocked: false },
          { tier: 2, target: 5, name: 'Prata ⭐⭐', rewardCoins: 150, unlocked: false },
          { tier: 3, target: 7, name: 'Ouro ⭐⭐⭐', rewardCoins: 500, unlocked: false },
        ],
      },
    };
  }

  public getAchievements(): ProgressiveAchievement[] {
    return Object.values(this.achievements);
  }

  public getTotalStars(): { unlocked: number; total: number } {
    let unlocked = 0;
    const all = Object.values(this.achievements);
    all.forEach((ach) => {
      ach.tiers.forEach((t) => {
        if (t.unlocked) unlocked++;
      });
    });
    return { unlocked, total: all.length * 3 };
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
        <div class="achievement-desc">+${tier.rewardCoins} 🪙 Moedas Recebidas!</div>
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
      SaveService.setItem('pacman_progressive_achievements_v2', JSON.stringify(state));
    } catch {}
  }

  private loadFromStorage() {
    try {
      const saved = SaveService.getItem('pacman_progressive_achievements_v2');
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
