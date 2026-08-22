import { FRUITS_BY_LEVEL, FruitConfig, TILE_SIZE } from '../core/Constants.ts';

export class FruitManager {
  private activeFruit: FruitConfig | null = null;
  private fruitTimer: number = 0;
  private scoreText: string = '';
  private scoreTimer: number = 0;
  private spawnsTriggered: boolean[] = [false, false, false, false, false];

  private spawnTile: { x: number; y: number } = { x: 13.5, y: 20 };
  public currFruitX: number = 13.5 * TILE_SIZE;
  public currFruitY: number = 20 * TILE_SIZE + TILE_SIZE / 2;

  public resetForLevel(customSpawn?: { x: number; y: number }) {
    this.activeFruit = null;
    this.fruitTimer = 0;
    this.scoreText = '';
    this.scoreTimer = 0;
    this.spawnsTriggered = [false, false, false, false, false];
    this.spawnTile = customSpawn || { x: 13.5, y: 20 };
    this.currFruitX = this.spawnTile.x * TILE_SIZE;
    this.currFruitY = this.spawnTile.y * TILE_SIZE + TILE_SIZE / 2;
  }

  public isFruitActive(): boolean {
    return this.activeFruit !== null;
  }

  public getFruitPixelPos(): { x: number; y: number } | null {
    if (!this.activeFruit) return null;
    return { x: this.currFruitX, y: this.currFruitY };
  }

  public pullFruitTowards(targetX: number, targetY: number, speed: number = 1.2) {
    if (!this.activeFruit) return;
    const dx = targetX - this.currFruitX;
    const dy = targetY - this.currFruitY;
    const dist = Math.hypot(dx, dy);
    if (dist > 2) {
      this.currFruitX += (dx / dist) * speed;
      this.currFruitY += (dy / dist) * speed;
    }
  }

  public checkPelletSpawns(dotsEaten: number, currentLevel: number, maxSpawns: number = 2) {
    const fruitConfig = this.getFruitForLevel(currentLevel);
    const thresholds = [50, 110, 160, 200, 230];

    for (let i = 0; i < maxSpawns && i < thresholds.length; i++) {
      if (dotsEaten >= thresholds[i] && !this.spawnsTriggered[i]) {
        this.spawnsTriggered[i] = true;
        this.spawnFruit(fruitConfig);
        break;
      }
    }
  }

  private spawnFruit(fruit: FruitConfig) {
    this.activeFruit = fruit;
    this.fruitTimer = 10000; // 10 segundos
    this.currFruitX = this.spawnTile.x * TILE_SIZE;
    this.currFruitY = this.spawnTile.y * TILE_SIZE + TILE_SIZE / 2;
  }

  public getFruitForLevel(level: number): FruitConfig {
    const index = Math.min(level - 1, FRUITS_BY_LEVEL.length - 1);
    return FRUITS_BY_LEVEL[index];
  }

  public update(dt: number) {
    if (this.activeFruit) {
      this.fruitTimer -= dt;
      if (this.fruitTimer <= 0) {
        this.activeFruit = null;
      }
    }

    if (this.scoreText) {
      this.scoreTimer -= dt;
      if (this.scoreTimer <= 0) {
        this.scoreText = '';
      }
    }
  }

  /**
   * Checa se o Pac-Man comeu a fruta
   */
  public checkPacmanCollision(pacmanX: number, pacmanY: number): number {
    if (!this.activeFruit) return 0;

    const dist = Math.hypot(pacmanX - this.currFruitX, pacmanY - this.currFruitY);
    if (dist < 10) {
      const points = this.activeFruit.points;
      this.scoreText = `${points}`;
      this.scoreTimer = 1500;
      this.activeFruit = null;
      return points;
    }
    return 0;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.activeFruit) {
      ctx.save();
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.activeFruit.icon, this.currFruitX, this.currFruitY);
      ctx.restore();
    }

    if (this.scoreText) {
      ctx.save();
      ctx.fillStyle = '#FFB8FF';
      ctx.font = 'bold 8px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.scoreText, this.currFruitX, this.currFruitY);
      ctx.restore();
    }
  }
}
