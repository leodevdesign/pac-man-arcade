import { MAZE_COLS, MAZE_ROWS } from '../core/Constants.ts';
import { TileType } from './MazeData.ts';
import { MapConfig } from './MapRegistry.ts';

export class ProceduralGenerator {
  private static NEON_PALETTES = [
    { wall: '#FF0055', door: '#00FFFF' }, // Neon Ruby & Cyan
    { wall: '#9D00FF', door: '#FF00EA' }, // Cyberpunk Purple & Pink
    { wall: '#00FF66', door: '#FFFF00' }, // Matrix Toxic Green
    { wall: '#00D9FF', door: '#FF6600' }, // Electric Cyan & Orange
    { wall: '#FF9900', door: '#00FFCC' }, // Sunset Orange & Turquoise
  ];

  public static generate(seed?: number): MapConfig {
    const random = seed ? seededRandom(seed) : Math.random;
    const grid: number[][] = Array.from({ length: MAZE_ROWS }, () =>
      Array(MAZE_COLS).fill(TileType.DOT)
    );

    // 1. Linhas de HUD
    for (let c = 0; c < MAZE_COLS; c++) {
      grid[0][c] = TileType.VOID;
      grid[1][c] = TileType.VOID;
      grid[2][c] = TileType.VOID;
      grid[34][c] = TileType.VOID;
      grid[35][c] = TileType.VOID;
      grid[3][c] = TileType.WALL;
      grid[33][c] = TileType.WALL;
    }

    for (let r = 3; r <= 33; r++) {
      grid[r][0] = TileType.WALL;
      grid[r][MAZE_COLS - 1] = TileType.WALL;
    }

    // 2. Casa dos Fantasmas Fixa no Centro
    for (let r = 15; r <= 18; r++) {
      for (let c = 10; c <= 17; c++) {
        if (r === 15 && (c === 13 || c === 14)) {
          grid[r][c] = TileType.GHOST_DOOR;
        } else if (r === 15 || r === 18 || c === 10 || c === 17) {
          grid[r][c] = TileType.WALL;
        } else {
          grid[r][c] = TileType.GHOST_HOUSE;
        }
      }
    }

    // Corredores limpos ao redor da casa
    for (let c = 9; c <= 18; c++) {
      grid[14][c] = TileType.EMPTY;
      grid[19][c] = TileType.EMPTY;
    }
    grid[15][9] = TileType.EMPTY;
    grid[16][9] = TileType.EMPTY;
    grid[17][9] = TileType.EMPTY;
    grid[18][9] = TileType.EMPTY;
    grid[15][18] = TileType.EMPTY;
    grid[16][18] = TileType.EMPTY;
    grid[17][18] = TileType.EMPTY;
    grid[18][18] = TileType.EMPTY;

    // 3. Túneis Warp na Linha 17
    for (let c = 0; c <= 5; c++) grid[17][c] = TileType.WARP_TUNNEL;
    for (let c = 22; c <= 27; c++) grid[17][c] = TileType.WARP_TUNNEL;

    // Voids laterais
    for (let r of [13, 14, 15, 19, 20, 21]) {
      for (let c = 0; c <= 4; c++) {
        grid[r][c] = TileType.VOID;
        grid[r][MAZE_COLS - 1 - c] = TileType.VOID;
      }
      grid[r][5] = TileType.WALL;
      grid[r][MAZE_COLS - 1 - 5] = TileType.WALL;
    }

    // 4. Geração de Blocos Internos com Simetria
    // Divide em blocos de 2x2 a 4x3 na metade esquerda e espelha
    const blockRegions = [
      { r1: 5, r2: 7, c1: 2, c2: 5 },
      { r1: 5, r2: 7, c1: 7, c2: 11 },
      { r1: 9, r2: 11, c1: 2, c2: 5 },
      { r1: 9, r2: 12, c1: 7, c2: 8 },
      { r1: 23, r2: 25, c1: 2, c2: 5 },
      { r1: 23, r2: 25, c1: 7, c2: 11 },
      { r1: 27, r2: 29, c1: 4, c2: 5 },
      { r1: 27, r2: 29, c1: 7, c2: 8 },
      { r1: 30, r2: 32, c1: 2, c2: 11 },
    ];

    blockRegions.forEach((b) => {
      const isWall = random() > 0.15;
      if (isWall) {
        for (let r = b.r1; r <= b.r2; r++) {
          for (let c = b.c1; c <= b.c2; c++) {
            grid[r][c] = TileType.WALL;
            // Espelha para a direita
            grid[r][MAZE_COLS - 1 - c] = TileType.WALL;
          }
        }
      }
    });

    // 5. Posiciona Energizers nos 4 cantos
    grid[6][1] = TileType.ENERGIZER;
    grid[6][26] = TileType.ENERGIZER;
    grid[26][1] = TileType.ENERGIZER;
    grid[26][26] = TileType.ENERGIZER;

    // Spawn do Pacman limpo
    grid[26][13] = TileType.EMPTY;
    grid[26][14] = TileType.EMPTY;

    // 6. Escolhe uma paleta Neon aleatória
    const palette = this.NEON_PALETTES[Math.floor(random() * this.NEON_PALETTES.length)];

    return {
      id: `proc_${Date.now()}`,
      name: `🎲 Procedural #${Math.floor(random() * 9000 + 1000)}`,
      category: 'procedural',
      wallColor: palette.wall,
      doorColor: palette.door,
      tunnelRows: [17],
      map: grid,
      pacmanSpawn: { x: 13.5, y: 26 },
      ghostHouseExit: { x: 13.5, y: 14 },
    };
  }
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
