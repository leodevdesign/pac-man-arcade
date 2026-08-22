import { TILE_SIZE, SCORES, GameMode } from '../core/Constants.ts';
import { FruitManager } from '../items/FruitManager.ts';
import { ActivePowerUpState } from '../items/PowerUpManager.ts';

export class HUD {
  public score: number = 0;
  public scoreP2: number = 0;
  public highScore: number = 0;
  private extraLifeAwarded: boolean = false;
  private ghostEatScore: { text: string; x: number; y: number; timer: number } | null = null;

  constructor() {
    this.loadHighScore();
  }

  public resetScore() {
    this.score = 0;
    this.scoreP2 = 0;
    this.extraLifeAwarded = false;
    this.ghostEatScore = null;
  }

  public getScore(): number {
    return this.score;
  }

  private loadHighScore() {
    const saved = localStorage.getItem('pacman_high_score');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
    }
  }

  public saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('pacman_high_score', this.highScore.toString());
    }
  }

  public addScore(points: number, isP2: boolean = false): boolean {
    if (isP2) {
      this.scoreP2 += points;
    } else {
      this.score += points;
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    if (!this.extraLifeAwarded && this.score >= SCORES.EXTRA_LIFE_AT) {
      this.extraLifeAwarded = true;
      return true;
    }
    return false;
  }

  public showGhostScore(points: number, x: number, y: number) {
    this.ghostEatScore = {
      text: `${points}`,
      x,
      y,
      timer: 1000,
    };
  }

  public update(dt: number) {
    if (this.ghostEatScore) {
      this.ghostEatScore.timer -= dt;
      if (this.ghostEatScore.timer <= 0) {
        this.ghostEatScore = null;
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    lives: number,
    level: number,
    fruitManager: FruitManager,
    powerUpState?: ActivePowerUpState,
    gameMode: GameMode = GameMode.CLASSIC,
    pelletsRemaining?: number,
    teleportCooldown?: number
  ) {
    ctx.save();
    ctx.font = 'bold 8.5px "Chakra Petch", "Segoe UI", Arial, sans-serif';
    ctx.textBaseline = 'top';

    // 1. Placar Superior (Linhas 0-2)
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';

    if (gameMode === GameMode.GHOST_HUNTER) {
      ctx.fillStyle = '#FF4D4D';
      ctx.fillText('👻 HUNTER', 8, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('HIGH SCORE', 120, 4);

      ctx.textAlign = 'right';
      const scoreStr = this.score === 0 ? '00' : `${this.score}`;
      ctx.fillText(scoreStr, 56, 14);

      const highScoreStr = this.highScore === 0 ? '00' : `${this.highScore}`;
      ctx.fillText(highScoreStr, 176, 14);

      // Pellets restantes para o Pac-Man
      if (pelletsRemaining !== undefined) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 7.5px "Chakra Petch", "Segoe UI", sans-serif';
        ctx.fillText(`DOTS: ${pelletsRemaining}`, 112, 14);
      }
    } else if (gameMode === GameMode.COOP_2P || gameMode === GameMode.VERSUS_2P) {
      ctx.fillText('1P', 16, 4);
      ctx.fillText('2P', 80, 4);
      ctx.fillText('HIGH', 150, 4);

      ctx.textAlign = 'right';
      ctx.fillText(this.score === 0 ? '00' : `${this.score}`, 46, 14);
      ctx.fillText(this.scoreP2 === 0 ? '00' : `${this.scoreP2}`, 110, 14);
      ctx.fillText(this.highScore === 0 ? '00' : `${this.highScore}`, 180, 14);
    } else {
      // Clássico / Turbo
      ctx.fillText('1UP', 24, 4);
      ctx.fillText('HIGH SCORE', 120, 4);

      ctx.textAlign = 'right';
      const scoreStr = this.score === 0 ? '00' : `${this.score}`;
      ctx.fillText(scoreStr, 56, 14);

      const highScoreStr = this.highScore === 0 ? '00' : `${this.highScore}`;
      ctx.fillText(highScoreStr, 176, 14);

      if (gameMode === GameMode.TURBO) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF3D00';
        ctx.font = 'bold 7.5px "Chakra Petch", "Segoe UI", sans-serif';
        ctx.fillText('⚡2X TURBO', 112, 4);
      }
    }

    // 2. Badges de Power-ups Ativos no Topo Central (Linha 2)
    if (powerUpState && gameMode !== GameMode.GHOST_HUNTER) {
      let badgeX = 66;
      if (powerUpState.hasShield) {
        ctx.fillStyle = '#00E676';
        ctx.textAlign = 'left';
        ctx.font = '7px sans-serif';
        ctx.fillText('🛡️', badgeX, 13);
        badgeX += 14;
      }

      if (powerUpState.magnetTimer > 0) {
        const secs = (powerUpState.magnetTimer / 1000).toFixed(1);
        ctx.fillStyle = '#00E5FF';
        ctx.textAlign = 'left';
        ctx.font = 'bold 7px "Chakra Petch", "Segoe UI", sans-serif';
        ctx.fillText(`🧲${secs}s`, badgeX, 13);
        badgeX += 34;
      }

      if (powerUpState.freezeTimer > 0) {
        const secs = (powerUpState.freezeTimer / 1000).toFixed(1);
        ctx.fillStyle = '#2979FF';
        ctx.textAlign = 'left';
        ctx.font = 'bold 7px "Chakra Petch", "Segoe UI", sans-serif';
        ctx.fillText(`⏳${secs}s`, badgeX, 13);
      }
    }

    // 3. Pontuação de Fantasma comido (Freeze Frame)
    if (this.ghostEatScore) {
      ctx.fillStyle = '#00FFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 8.5px "Chakra Petch", "Segoe UI", sans-serif';
      ctx.fillText(this.ghostEatScore.text, this.ghostEatScore.x, this.ghostEatScore.y);
    }

    // 4. Vidas Restantes no Canto Inferior Esquerdo (Linha 34)
    ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < Math.max(0, lives - 1); i++) {
      const lifeX = 16 + i * 14;
      const lifeY = 34.5 * TILE_SIZE;
      ctx.beginPath();
      ctx.arc(lifeX, lifeY, 5, 0.25 * Math.PI, 1.75 * Math.PI);
      ctx.lineTo(lifeX, lifeY);
      ctx.fill();
    }

    // 4.1 Indicador de Teleporte de Emergência no Centro Inferior
    if (teleportCooldown !== undefined) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (teleportCooldown <= 0) {
        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 8px "Chakra Petch", "Segoe UI", sans-serif';
        ctx.fillText('🌀 ESPAÇO: PRONTO', 112, 34.5 * TILE_SIZE);
      } else {
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 8px "Chakra Petch", "Segoe UI", sans-serif';
        ctx.fillText(`🌀 ESPAÇO: ${Math.ceil(teleportCooldown)}s`, 112, 34.5 * TILE_SIZE);
      }
      ctx.restore();
    }

    // 5. Frutas do Nível no Canto Inferior Direito
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '10px sans-serif';
    const maxFruitsToShow = Math.min(level, 7);
    for (let i = 0; i < maxFruitsToShow; i++) {
      const fruitConfig = fruitManager.getFruitForLevel(i + 1);
      const fruitX = 208 - i * 14;
      const fruitY = 34.5 * TILE_SIZE;
      ctx.fillText(fruitConfig.icon, fruitX, fruitY);
    }

    ctx.restore();
  }
}
