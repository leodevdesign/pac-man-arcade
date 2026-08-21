export const TILE_SIZE = 8;
export const MAZE_COLS = 28;
export const MAZE_ROWS = 36;
export const INTERNAL_WIDTH = MAZE_COLS * TILE_SIZE; // 224
export const INTERNAL_HEIGHT = MAZE_ROWS * TILE_SIZE; // 288

export const FPS = 60;
export const FRAME_TIME = 1000 / FPS;

export const BASE_SPEED = 1.25; // Base pixels per frame at 60 FPS (~75 px/sec)

export const DIRECTION = {
  NONE: { x: 0, y: 0, name: 'NONE' },
  UP: { x: 0, y: -1, name: 'UP' },
  LEFT: { x: -1, y: 0, name: 'LEFT' },
  DOWN: { x: 0, y: 1, name: 'DOWN' },
  RIGHT: { x: 1, y: 0, name: 'RIGHT' },
} as const;

export type Direction = typeof DIRECTION[keyof typeof DIRECTION];

export const OPPOSITE_DIRECTION: Record<string, Direction> = {
  UP: DIRECTION.DOWN,
  DOWN: DIRECTION.UP,
  LEFT: DIRECTION.RIGHT,
  RIGHT: DIRECTION.LEFT,
  NONE: DIRECTION.NONE,
};

export enum GameState {
  ATTRACT = 'ATTRACT',
  READY = 'READY',
  PLAYING = 'PLAYING',
  GHOST_PAUSE = 'GHOST_PAUSE',
  PACMAN_DYING = 'PACMAN_DYING',
  LEVEL_CLEAR = 'LEVEL_CLEAR',
  GAME_OVER = 'GAME_OVER',
}

export enum GhostMode {
  SCATTER = 'SCATTER',
  CHASE = 'CHASE',
  FRIGHTENED = 'FRIGHTENED',
  EATEN = 'EATEN',
  IN_HOUSE = 'IN_HOUSE',
}

export enum GhostName {
  BLINKY = 'BLINKY',
  PINKY = 'PINKY',
  INKY = 'INKY',
  CLYDE = 'CLYDE',
}

export const GHOST_COLORS = {
  [GhostName.BLINKY]: '#FF0000', // Vermelho
  [GhostName.PINKY]: '#FFB8FF', // Rosa
  [GhostName.INKY]: '#00FFFF', // Ciano
  [GhostName.CLYDE]: '#FFB852', // Laranja
  FRIGHTENED: '#2121DE', // Azul escuro
  FLASHING: '#FFFFFF', // Branco piscando
  EYES: '#FFFFFF',
} as const;

export const SCORES = {
  DOT: 10,
  ENERGIZER: 50,
  GHOST: [200, 400, 800, 1600],
  EXTRA_LIFE_AT: 10000,
} as const;

export interface FruitConfig {
  name: string;
  points: number;
  color: string;
  icon: string;
}

export const FRUITS_BY_LEVEL: FruitConfig[] = [
  { name: 'Cherry', points: 100, color: '#FF0000', icon: '🍒' },
  { name: 'Strawberry', points: 300, color: '#FF4081', icon: '🍓' },
  { name: 'Peach', points: 500, color: '#FFA726', icon: '🍊' },
  { name: 'Peach', points: 500, color: '#FFA726', icon: '🍊' },
  { name: 'Apple', points: 700, color: '#4CAF50', icon: '🍏' },
  { name: 'Apple', points: 700, color: '#4CAF50', icon: '🍏' },
  { name: 'Melon', points: 1000, color: '#8BC34A', icon: '🍇' },
  { name: 'Melon', points: 1000, color: '#8BC34A', icon: '🍇' },
  { name: 'Galaxian', points: 2000, color: '#00E5FF', icon: '🚀' },
  { name: 'Galaxian', points: 2000, color: '#00E5FF', icon: '🚀' },
  { name: 'Bell', points: 3000, color: '#FFEB3B', icon: '🔔' },
  { name: 'Bell', points: 3000, color: '#FFEB3B', icon: '🔔' },
  { name: 'Key', points: 5000, color: '#00E676', icon: '🔑' },
];

export const SCATTER_CHASE_TIMINGS = [
  { mode: GhostMode.SCATTER, duration: 7000 },
  { mode: GhostMode.CHASE, duration: 20000 },
  { mode: GhostMode.SCATTER, duration: 7000 },
  { mode: GhostMode.CHASE, duration: 20000 },
  { mode: GhostMode.SCATTER, duration: 5000 },
  { mode: GhostMode.CHASE, duration: 20000 },
  { mode: GhostMode.SCATTER, duration: 5000 },
  { mode: GhostMode.CHASE, duration: Infinity },
];

export enum PowerUpType {
  BOMB = 'BOMB',
  MAGNET = 'MAGNET',
  SHIELD = 'SHIELD',
  FREEZE = 'FREEZE',
}

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  icon: string;
  color: string;
  durationMs: number;
  description: string;
}

export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  [PowerUpType.BOMB]: {
    type: PowerUpType.BOMB,
    name: 'Bomba',
    icon: '💣',
    color: '#FF3D00',
    durationMs: 0,
    description: 'Atordoa fantasmas ao redor',
  },
  [PowerUpType.MAGNET]: {
    type: PowerUpType.MAGNET,
    name: 'Ímã de Pastilhas',
    icon: '🧲',
    color: '#00E5FF',
    durationMs: 8000,
    description: 'Atrai pastilhas próximas',
  },
  [PowerUpType.SHIELD]: {
    type: PowerUpType.SHIELD,
    name: 'Escudo de Energia',
    icon: '🛡️',
    color: '#00E676',
    durationMs: Infinity,
    description: 'Absorve 1 golpe fatal',
  },
  [PowerUpType.FREEZE]: {
    type: PowerUpType.FREEZE,
    name: 'Relógio de Gelo',
    icon: '⏳',
    color: '#2979FF',
    durationMs: 5000,
    description: 'Congela todos os fantasmas',
  },
};

export enum GameMode {
  CLASSIC = 'CLASSIC',
  GHOST_HUNTER = 'GHOST_HUNTER',
  COOP_2P = 'COOP_2P',
  VERSUS_2P = 'VERSUS_2P',
  TURBO = 'TURBO',
}

export interface GameModeInfo {
  id: GameMode;
  name: string;
  badge: string;
  description: string;
}

export const GAME_MODES: GameModeInfo[] = [
  {
    id: GameMode.CLASSIC,
    name: '🟡 Clássico 1P',
    badge: '1P',
    description: 'Jogabilidade autêntica de 1980',
  },
  {
    id: GameMode.GHOST_HUNTER,
    name: '👻 Modo Invertido (Ghost Hunter)',
    badge: 'INVERTIDO',
    description: 'Você é o Fantasma caçando o Pac-Man com IA',
  },
  {
    id: GameMode.COOP_2P,
    name: '👥 2 Jogadores Co-op',
    badge: '2P CO-OP',
    description: 'Pac-Man [Setas] & Ms. Pac-Man [WASD] juntos',
  },
  {
    id: GameMode.VERSUS_2P,
    name: '⚔️ 2 Jogadores Versus',
    badge: '2P VERSUS',
    description: 'Pac-Man [Setas] vs Blinky [WASD]',
  },
  {
    id: GameMode.TURBO,
    name: '⚡ Modo Turbo / Frenesi',
    badge: '2X TURBO',
    description: 'Velocidade 2x e IAs implacáveis',
  },
];

export enum ThemeType {
  CLASSIC = 'CLASSIC',
  SYNTHWAVE = 'SYNTHWAVE',
  MATRIX = 'MATRIX',
  GAMEBOY = 'GAMEBOY',
}

export enum PacmanSkin {
  CLASSIC = 'CLASSIC',
  SUNGLASSES = 'SUNGLASSES',
  GOLDEN = 'GOLDEN',
  MS_PACMAN = 'MS_PACMAN',
  CHRISTMAS = 'CHRISTMAS',
  HALLOWEEN = 'HALLOWEEN',
  EASTER = 'EASTER',
  CYBERPUNK = 'CYBERPUNK',
}
