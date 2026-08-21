import { FRUITS_BY_LEVEL, FruitConfig, TILE_SIZE } from '../core/Constants.ts';

export class FruitManager {
  private activeFruit: FruitConfig | null = null;
  private fruitTimer: number = 0;
  private scoreText: string = '';
  private scoreTimer: number = 0;
  private spawn1Triggered: boolean = false;
  private spawn2Triggered: boolean = false;

  public readonly fruitX: number = 13.5 * TILE_SIZE;
  public readonly fruitY: number = 20 * TILE_SIZE + TILE_SIZE / 2;

  public resetForLevel() {
    this.activeFruit = null;
    this.fruitTimer = 0;
    this.scoreText = '';
    this.scoreTimer = 0;
    this.spawn1Triggered = false;
    this.spawn2Triggered = false;
  }

  public checkPelletSpawns(dotsEaten: number, currentLevel: number) {
    const fruitConfig = this.getFruitForLevel(currentLevel);

    if (dotsEaten >= 70 && !this.spawn1Triggered) {
      this.spawn1Triggered = true;
      this.spawnFruit(fruitConfig);
    } else if (dotsEaten >= 170 && !this.spawn2Triggered) {
      this.spawn2Triggered = true;
      this.spawnFruit(fruitConfig);
    }
  }

  private spawnFruit(fruit: FruitConfig) {
    this.activeFruit = fruit;
    this.fruitTimer = 9500; // 9.5 segundos
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

    const dist = Math.hypot(pacmanX - this.fruitX, pacmanY - this.fruitY);
    if (dist < 8) {
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
      ctx.fillText(this.activeFruit.icon, this.fruitX, this.fruitY);
      ctx.restore();
    }

    if (this.scoreText) {
      ctx.save();
      ctx.fillStyle = '#FFB8FF';
      ctx.font = 'bold 8px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.scoreText, this.fruitX, this.fruitY);
      ctx.restore();
    }
  }
}
