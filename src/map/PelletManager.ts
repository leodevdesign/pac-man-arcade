import { TileType, ORIGINAL_MAZE_MAP } from './MazeData.ts';
import { TILE_SIZE, SCORES } from '../core/Constants.ts';

export class PelletManager {
  private pellets: number[][];
  private totalPellets: number = 0;
  private remainingPellets: number = 0;
  private energizerFlashTimer: number = 0;
  public showEnergizer: boolean = true;

  public dotColor: string = '#FFB8AE';
  public energizerColor: string = '#FFB8AE';

  constructor() {
    this.pellets = [];
    this.reset();
  }

  public setColors(dotColor: string, energizerColor: string) {
    this.dotColor = dotColor;
    this.energizerColor = energizerColor;
  }

  public reset(customMap?: number[][]) {
    const source = customMap || ORIGINAL_MAZE_MAP;
    this.pellets = source.map((row) => [...row]);
    this.totalPellets = 0;
    for (let r = 0; r < this.pellets.length; r++) {
      for (let c = 0; c < this.pellets[r].length; c++) {
        if (this.pellets[r][c] === TileType.DOT || this.pellets[r][c] === TileType.ENERGIZER) {
          this.totalPellets++;
        }
      }
    }
    this.remainingPellets = this.totalPellets;
  }

  public update(dt: number) {
    this.energizerFlashTimer += dt;
    if (this.energizerFlashTimer >= 200) {
      this.energizerFlashTimer = 0;
      this.showEnergizer = !this.showEnergizer;
    }
  }

  public getRemainingCount(): number {
    return this.remainingPellets;
  }

  public getEatenCount(): number {
    return this.totalPellets - this.remainingPellets;
  }

  public isPellet(col: number, row: number): boolean {
    if (row < 0 || row >= this.pellets.length || col < 0 || col >= this.pellets[0].length) {
      return false;
    }
    const tile = this.pellets[row][col];
    return tile === TileType.DOT || tile === TileType.ENERGIZER;
  }

  public eatPellet(col: number, row: number): { points: number; isEnergizer: boolean; isPellet: boolean } {
    if (row < 0 || row >= this.pellets.length || col < 0 || col >= this.pellets[0].length) {
      return { points: 0, isEnergizer: false, isPellet: false };
    }

    const tile = this.pellets[row][col];
    if (tile === TileType.DOT) {
      this.pellets[row][col] = TileType.EMPTY;
      this.remainingPellets--;
      return { points: SCORES.DOT, isEnergizer: false, isPellet: true };
    } else if (tile === TileType.ENERGIZER) {
      this.pellets[row][col] = TileType.EMPTY;
      this.remainingPellets--;
      return { points: SCORES.ENERGIZER, isEnergizer: true, isPellet: true };
    }

    return { points: 0, isEnergizer: false, isPellet: false };
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (let r = 0; r < this.pellets.length; r++) {
      for (let c = 0; c < this.pellets[r].length; c++) {
        const tile = this.pellets[r][c];
        const x = c * TILE_SIZE + TILE_SIZE / 2;
        const y = r * TILE_SIZE + TILE_SIZE / 2;

        if (tile === TileType.DOT) {
          ctx.fillStyle = this.dotColor;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        } else if (tile === TileType.ENERGIZER && this.showEnergizer) {
          ctx.fillStyle = this.energizerColor;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}
