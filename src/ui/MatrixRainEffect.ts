import { INTERNAL_HEIGHT } from '../core/Constants.ts';

export class MatrixRainEffect {
  private drops: { x: number; y: number; speed: number; char: string }[] = [];
  private chars: string = '0123456789ABCDEF01';

  constructor() {
    const colCount = 28;
    for (let i = 0; i < colCount; i++) {
      this.drops.push({
        x: i * 8 + 4,
        y: Math.random() * INTERNAL_HEIGHT,
        speed: 0.8 + Math.random() * 1.5,
        char: this.chars[Math.floor(Math.random() * this.chars.length)],
      });
    }
  }

  public update(dt: number) {
    this.drops.forEach((drop) => {
      drop.y += drop.speed * (dt / 16.6);
      if (Math.random() < 0.05) {
        drop.char = this.chars[Math.floor(Math.random() * this.chars.length)];
      }
      if (drop.y > INTERNAL_HEIGHT) {
        drop.y = -8;
        drop.speed = 0.8 + Math.random() * 1.5;
      }
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';

    this.drops.forEach((drop) => {
      // Caractere brilhante
      ctx.fillStyle = '#00FF66';
      ctx.fillText(drop.char, drop.x, drop.y);

      // Rastro sutil
      ctx.fillStyle = 'rgba(0, 143, 17, 0.4)';
      ctx.fillText(this.chars[(drop.char.charCodeAt(0) + 1) % this.chars.length], drop.x, drop.y - 8);
    });

    ctx.restore();
  }
}
