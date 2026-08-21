import { TileType, FORBIDDEN_UP_TILES } from './MazeData.ts';
import { TILE_SIZE, MAZE_COLS, MAZE_ROWS } from '../core/Constants.ts';
import { MapConfig, MAP_PRESETS } from './MapRegistry.ts';

export class Maze {
  private map: number[][];
  public isFlashing: boolean = false;
  public wallColor: string = '#2121DE';
  public doorColor: string = '#FFB8FF';
  public bgColor: string = '#000000';
  public tunnelRows: number[] = [17];
  public currentMapId: string = 'classic_1980';

  constructor(initialConfig?: MapConfig) {
    const config = initialConfig || MAP_PRESETS[0];
    this.map = config.map.map((row) => [...row]);
    this.applyConfig(config);
  }

  public loadConfig(config: MapConfig) {
    this.map = config.map.map((row) => [...row]);
    this.applyConfig(config);
  }

  public applyColors(wallColor: string, doorColor: string, bgColor: string = '#000000') {
    this.wallColor = wallColor;
    this.doorColor = doorColor;
    this.bgColor = bgColor;
  }

  private applyConfig(config: MapConfig) {
    this.currentMapId = config.id;
    this.wallColor = config.wallColor;
    this.doorColor = config.doorColor;
    this.tunnelRows = config.tunnelRows || [17];
  }

  public getRawMap(): number[][] {
    return this.map;
  }

  public isTunnelRow(row: number): boolean {
    return this.tunnelRows.includes(row);
  }

  public getTile(col: number, row: number): number {
    if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) {
      if (this.isTunnelRow(row) && (col < 0 || col >= MAZE_COLS)) {
        return TileType.WARP_TUNNEL;
      }
      return TileType.VOID;
    }
    return this.map[row][col];
  }

  public isWalkableForPacman(col: number, row: number): boolean {
    if (row < 3 || row > 33) return false;
    if (col < 0 || col >= MAZE_COLS) {
      return this.isTunnelRow(row);
    }

    const tile = this.getTile(col, row);
    return (
      tile !== TileType.WALL &&
      tile !== TileType.VOID &&
      tile !== TileType.GHOST_DOOR &&
      tile !== TileType.GHOST_HOUSE
    );
  }

  public isWalkableForGhost(col: number, row: number, isEaten: boolean = false): boolean {
    if (row < 3 || row > 33) return false;

    if (col < 0 || col >= MAZE_COLS) {
      return this.isTunnelRow(row);
    }

    const tile = this.getTile(col, row);
    if (tile === TileType.WALL || tile === TileType.VOID) return false;

    if (tile === TileType.GHOST_DOOR || tile === TileType.GHOST_HOUSE) {
      return isEaten;
    }

    return true;
  }

  public isForbiddenUpTile(col: number, row: number): boolean {
    return FORBIDDEN_UP_TILES.some((t) => t.x === col && t.y === row);
  }

  public render(ctx: CanvasRenderingContext2D) {
    const activeWallColor = this.isFlashing ? '#FFFFFF' : this.wallColor;

    ctx.save();
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, MAZE_COLS * TILE_SIZE, MAZE_ROWS * TILE_SIZE);

    ctx.fillStyle = activeWallColor;

    for (let r = 3; r <= 33; r++) {
      for (let c = 0; c < MAZE_COLS; c++) {
        const tile = this.map[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === TileType.WALL) {
          const top = r > 3 && this.map[r - 1][c] === TileType.WALL;
          const bottom = r < 33 && this.map[r + 1][c] === TileType.WALL;
          const left = c > 0 && this.map[r][c - 1] === TileType.WALL;
          const right = c < MAZE_COLS - 1 && this.map[r][c + 1] === TileType.WALL;

          ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          if (top) ctx.fillRect(x + 1, y, TILE_SIZE - 2, 2);
          if (bottom) ctx.fillRect(x + 1, y + TILE_SIZE - 2, TILE_SIZE - 2, 2);
          if (left) ctx.fillRect(x, y + 1, 2, TILE_SIZE - 2);
          if (right) ctx.fillRect(x + TILE_SIZE - 2, y + 1, 2, TILE_SIZE - 2);
        } else if (tile === TileType.GHOST_DOOR) {
          ctx.fillStyle = this.doorColor;
          ctx.fillRect(x, y + 3, TILE_SIZE, 2);
          ctx.fillStyle = activeWallColor;
        }
      }
    }
    ctx.restore();
  }
}
