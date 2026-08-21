import { Direction, DIRECTION, TILE_SIZE, INTERNAL_WIDTH } from '../core/Constants.ts';
import { Maze } from '../map/Maze.ts';

export abstract class Entity {
  public x: number = 0;
  public y: number = 0;
  public direction: Direction = DIRECTION.NONE;
  public speed: number = 1.0;
  protected maze: Maze;

  constructor(maze: Maze, startX: number, startY: number) {
    this.maze = maze;
    this.x = startX;
    this.y = startY;
  }

  public get tileX(): number {
    return Math.floor(this.x / TILE_SIZE);
  }

  public get tileY(): number {
    return Math.floor(this.y / TILE_SIZE);
  }

  public get tileCenterX(): number {
    return this.tileX * TILE_SIZE + TILE_SIZE / 2;
  }

  public get tileCenterY(): number {
    return this.tileY * TILE_SIZE + TILE_SIZE / 2;
  }

  public isNearTileCenter(threshold: number = 1.5): boolean {
    return (
      Math.abs(this.x - this.tileCenterX) <= threshold &&
      Math.abs(this.y - this.tileCenterY) <= threshold
    );
  }

  public snapToTileCenter() {
    this.x = this.tileCenterX;
    this.y = this.tileCenterY;
  }

  /**
   * Trata o teletransporte dos túneis laterais (compatível com múltiplos túneis da Ms. Pac-Man)
   */
  protected handleWarpTunnel() {
    if (this.maze.isTunnelRow(this.tileY)) {
      if (this.x < -TILE_SIZE / 2) {
        this.x = INTERNAL_WIDTH + TILE_SIZE / 2 - 1;
      } else if (this.x > INTERNAL_WIDTH + TILE_SIZE / 2) {
        this.x = -TILE_SIZE / 2 + 1;
      }
    }
  }

  public abstract update(dt: number): void;
  public abstract render(ctx: CanvasRenderingContext2D): void;
}
