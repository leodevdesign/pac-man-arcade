import { Entity } from './Entity.ts';
import {
  Direction,
  DIRECTION,
  OPPOSITE_DIRECTION,
  TILE_SIZE,
  BASE_SPEED,
  PacmanSkin,
} from '../core/Constants.ts';
import { PACMAN_SPAWN_TILE } from '../map/MazeData.ts';
import { Maze } from '../map/Maze.ts';

export class Pacman extends Entity {
  public lives: number = 3;
  private mouthAngle: number = 0.2;
  private mouthSpeed: number = 0.02;
  private mouthOpening: boolean = true;
  public isDying: boolean = false;
  public deathProgress: number = 0;
  private freezeFrames: number = 0;

  // Customização Visual e Skins
  public skin: PacmanSkin = PacmanSkin.CLASSIC;
  public customColor: string = '#FFFF00';
  public isMsPacman: boolean = false;

  // Power-up visual states
  public hasShield: boolean = false;
  public hasMagnet: boolean = false;

  constructor(
    maze: Maze,
    startTile: { x: number; y: number } = PACMAN_SPAWN_TILE,
    isMsPacman: boolean = false
  ) {
    const spawnX = startTile.x * TILE_SIZE;
    const spawnY = startTile.y * TILE_SIZE + TILE_SIZE / 2;
    super(maze, spawnX, spawnY);
    this.speed = BASE_SPEED;
    this.isMsPacman = isMsPacman;
    if (isMsPacman) this.skin = PacmanSkin.MS_PACMAN;
    this.resetPosition(startTile);
  }

  public resetPosition(startTile: { x: number; y: number } = PACMAN_SPAWN_TILE) {
    this.x = startTile.x * TILE_SIZE;
    this.y = startTile.y * TILE_SIZE + TILE_SIZE / 2;
    this.direction = DIRECTION.NONE;
    this.isDying = false;
    this.deathProgress = 0;
    this.mouthAngle = 0.2;
    this.freezeFrames = 0;
    this.hasShield = false;
    this.hasMagnet = false;
  }

  public setFreezeFrames(frames: number) {
    this.freezeFrames = frames;
  }

  public updateWithInput(desiredDir: Direction) {
    if (this.isDying) {
      this.deathProgress += 0.02;
      return;
    }

    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      return;
    }

    // 1. Inversão instantânea de direção (180 graus)
    if (
      desiredDir !== DIRECTION.NONE &&
      OPPOSITE_DIRECTION[this.direction.name]?.name === desiredDir.name
    ) {
      this.direction = desiredDir;
    }

    // 2. Pré-curva (Cornering buffer) nas interseções
    if (desiredDir !== DIRECTION.NONE && desiredDir !== this.direction) {
      if (this.canTurn(desiredDir)) {
        this.direction = desiredDir;
        if (desiredDir.x !== 0) {
          this.y = this.tileCenterY;
        } else if (desiredDir.y !== 0) {
          this.x = this.tileCenterX;
        }
      }
    }

    // 3. Movimentação na direção atual
    if (this.direction !== DIRECTION.NONE) {
      if (this.canMoveInDirection(this.direction)) {
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
        this.animateMouth();
      } else {
        if (this.direction.x !== 0) this.x = this.tileCenterX;
        if (this.direction.y !== 0) this.y = this.tileCenterY;
      }
    }

    this.handleWarpTunnel();
  }

  public update(_dt: number) {}

  private canTurn(dir: Direction): boolean {
    const targetCol = this.tileX + dir.x;
    const targetRow = this.tileY + dir.y;

    if (!this.maze.isWalkableForPacman(targetCol, targetRow)) {
      return false;
    }

    const turnTolerance = 3.5;
    if (dir.x !== 0) {
      return Math.abs(this.y - this.tileCenterY) <= turnTolerance;
    } else {
      return Math.abs(this.x - this.tileCenterX) <= turnTolerance;
    }
  }

  private canMoveInDirection(dir: Direction): boolean {
    const nextCol = this.tileX + dir.x;
    const nextRow = this.tileY + dir.y;

    if (!this.maze.isWalkableForPacman(nextCol, nextRow)) {
      if (dir.x > 0 && this.x >= this.tileCenterX) return false;
      if (dir.x < 0 && this.x <= this.tileCenterX) return false;
      if (dir.y > 0 && this.y >= this.tileCenterY) return false;
      if (dir.y < 0 && this.y <= this.tileCenterY) return false;
    }

    return true;
  }

  private animateMouth() {
    if (this.mouthOpening) {
      this.mouthAngle += this.mouthSpeed;
      if (this.mouthAngle >= 0.28) {
        this.mouthOpening = false;
      }
    } else {
      this.mouthAngle -= this.mouthSpeed;
      if (this.mouthAngle <= 0.02) {
        this.mouthOpening = true;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Efeito Visual de Escudo de Energia
    if (this.hasShield && !this.isDying) {
      const pulse = Math.sin(performance.now() * 0.008) * 1.5;
      ctx.save();
      ctx.strokeStyle = '#00E676';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00E676';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 8.5 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 230, 118, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // Efeito Visual do Ímã
    if (this.hasMagnet && !this.isDying) {
      const spin = (performance.now() * 0.006) % (Math.PI * 2);
      ctx.save();
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 9, spin, spin + Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // Efeito de Morte
    if (this.isDying) {
      const deathAngle = Math.min(Math.PI, this.deathProgress * Math.PI);
      if (deathAngle < Math.PI) {
        ctx.fillStyle = this.skin === PacmanSkin.GOLDEN ? '#FFD54F' : this.customColor;
        ctx.beginPath();
        ctx.arc(0, 0, 6.5, -Math.PI / 2 + deathAngle, -Math.PI / 2 + Math.PI * 2 - deathAngle);
        ctx.lineTo(0, 0);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // Partículas de brilho dourado da Skin Dourada
    if (this.skin === PacmanSkin.GOLDEN) {
      const time = performance.now() * 0.005;
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 2; i++) {
        const sx = Math.cos(time + i * Math.PI) * 7.5;
        const sy = Math.sin(time + i * Math.PI) * 7.5;
        ctx.fillRect(sx - 0.5, sy - 0.5, 1, 1);
      }
    }

    // Rotação de acordo com a direção
    let rotation = 0;
    if (this.direction === DIRECTION.LEFT) rotation = Math.PI;
    else if (this.direction === DIRECTION.UP) rotation = -Math.PI / 2;
    else if (this.direction === DIRECTION.DOWN) rotation = Math.PI / 2;

    ctx.rotate(rotation);

    // Cor do corpo baseada na Skin
    if (this.skin === PacmanSkin.GOLDEN) {
      const grad = ctx.createLinearGradient(-6, -6, 6, 6);
      grad.addColorStop(0, '#FFE082');
      grad.addColorStop(0.5, '#FFD54F');
      grad.addColorStop(1, '#FF8F00');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = this.customColor;
    }

    // Desenho do Corpo Circular com Boca
    ctx.beginPath();
    const openAngle = this.direction === DIRECTION.NONE ? 0.2 : this.mouthAngle * Math.PI;
    ctx.arc(0, 0, 6.5, openAngle, Math.PI * 2 - openAngle);
    ctx.lineTo(0, 0);
    ctx.fill();

    // 1. Skin: Óculos Escuros (Thug Life 8-Bit Pixel Art com Lentes e Reflexo)
    if (this.skin === PacmanSkin.SUNGLASSES) {
      ctx.save();
      // Armação preta
      ctx.fillStyle = '#000000';
      ctx.fillRect(-1, -5.5, 7.5, 3.5);
      ctx.fillRect(-5, -4.5, 4.5, 2);

      // Lentes escuras com gradiente/chanfro
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(-0.5, -5, 3, 2.5);
      ctx.fillRect(3, -5, 3, 2.5);

      // Reflexos brancos pixel-art icônicos
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0.5, -4.5, 1, 1);
      ctx.fillRect(4, -4.5, 1, 1);
      ctx.restore();
    }

    // 2. Skin: Ms. Pac-Man (Laço Vermelho Volumoso + Batom + Cílios)
    if (this.isMsPacman || this.skin === PacmanSkin.MS_PACMAN) {
      ctx.save();
      ctx.fillStyle = '#D50000';
      ctx.beginPath();
      ctx.arc(-2, -6.5, 2.5, 0, Math.PI * 2);
      ctx.arc(2, -6.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF5252';
      ctx.beginPath();
      ctx.arc(0, -6.5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(1, -4.5);
      ctx.lineTo(2.5, -5.5);
      ctx.stroke();

      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.arc(5, 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillRect(1, 2, 1, 1);
      ctx.restore();
    }

    // 3. Skin: Natal (Gorro de Papai Noel com Pompom)
    if (this.skin === PacmanSkin.CHRISTMAS) {
      ctx.save();
      // Gorro Vermelho
      ctx.fillStyle = '#D50000';
      ctx.beginPath();
      ctx.moveTo(-5, -6);
      ctx.lineTo(1, -11);
      ctx.lineTo(4, -5);
      ctx.closePath();
      ctx.fill();

      // Barra branca do gorro
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-5.5, -6.5, 10, 2);

      // Pompom branco na ponta
      ctx.beginPath();
      ctx.arc(1, -11.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Skin: Halloween (Chapéu de Bruxa Roxo com Fivela Laranja)
    if (this.skin === PacmanSkin.HALLOWEEN) {
      ctx.save();
      // Cone do chapéu
      ctx.fillStyle = '#311B92';
      ctx.beginPath();
      ctx.moveTo(-5, -5.5);
      ctx.lineTo(0, -12);
      ctx.lineTo(4, -5.5);
      ctx.closePath();
      ctx.fill();

      // Aba larga do chapéu
      ctx.fillStyle = '#211068';
      ctx.fillRect(-7, -6, 13, 2);

      // Fivela laranja neon
      ctx.fillStyle = '#FF6D00';
      ctx.fillRect(-1.5, -7.5, 3, 2);
      ctx.restore();
    }

    // 5. Skin: Páscoa (Orelhinhas de Coelho Brancas e Rosa)
    if (this.skin === PacmanSkin.EASTER) {
      ctx.save();
      // Orelhas brancas externas
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-2.5, -9.5, 1.8, 4, -0.2, 0, Math.PI * 2);
      ctx.ellipse(2.5, -9.5, 1.8, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Interior rosa das orelhas
      ctx.fillStyle = '#FF80AB';
      ctx.beginPath();
      ctx.ellipse(-2.5, -9.5, 0.9, 2.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(2.5, -9.5, 0.9, 2.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Skin: Cyberpunk (Visor Neon Holográfico + Placas Cibernéticas)
    if (this.skin === PacmanSkin.CYBERPUNK) {
      ctx.save();
      // Visor Ciano Neon com Brilho
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 6;
      ctx.fillRect(0, -4.5, 6.5, 3);

      // Linha de dados holográfica
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(1, -3.5, 4, 1);

      // Antena Cyberpunk
      ctx.fillStyle = '#FF007F';
      ctx.fillRect(-4.5, -7, 1.5, 3);
      ctx.restore();
    }

    ctx.restore();
  }
}
