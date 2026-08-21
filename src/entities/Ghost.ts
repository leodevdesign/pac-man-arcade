import { Entity } from './Entity.ts';
import {
  Direction,
  DIRECTION,
  OPPOSITE_DIRECTION,
  GhostMode,
  GhostName,
  GHOST_COLORS,
  TILE_SIZE,
  BASE_SPEED,
} from '../core/Constants.ts';
import { GHOST_HOUSE_EXIT_TILE } from '../map/MazeData.ts';
import { Maze } from '../map/Maze.ts';
import { Pacman } from './Pacman.ts';

export interface TilePos {
  x: number;
  y: number;
}

export abstract class Ghost extends Entity {
  public name: GhostName;
  public mode: GhostMode = GhostMode.IN_HOUSE;
  public previousMode: GhostMode = GhostMode.SCATTER;
  public scatterTile: TilePos;
  public targetTile: TilePos = { x: 0, y: 0 };
  public isFrightenedFlashing: boolean = false;

  // Estados dos Power-ups
  public stunTimer: number = 0;
  public freezeTimer: number = 0;

  // Customização de Tema Visual
  public customColor?: string;
  public customFrightenedColor?: string;
  public customFlashingColor?: string;

  protected spawnTile: TilePos;
  protected inHouse: boolean = true;
  protected houseExitTimer: number = 0;
  protected houseBounceDir: number = -1;
  private skirtFrame: number = 0;
  private skirtTimer: number = 0;
  private lastDecidedTile: string = '';

  constructor(
    maze: Maze,
    name: GhostName,
    spawnTile: TilePos,
    scatterTile: TilePos,
    inHouse: boolean = true,
    exitDelayMs: number = 0
  ) {
    super(maze, spawnTile.x * TILE_SIZE, spawnTile.y * TILE_SIZE + TILE_SIZE / 2);
    this.name = name;
    this.spawnTile = spawnTile;
    this.scatterTile = scatterTile;
    this.inHouse = inHouse;
    this.houseExitTimer = exitDelayMs;
    this.mode = inHouse ? GhostMode.IN_HOUSE : GhostMode.SCATTER;
    this.speed = BASE_SPEED * 0.75;
    this.direction = inHouse ? DIRECTION.UP : DIRECTION.LEFT;
  }

  public reset(exitDelayMs: number = 0) {
    this.x = this.spawnTile.x * TILE_SIZE;
    this.y = this.spawnTile.y * TILE_SIZE + TILE_SIZE / 2;
    this.inHouse = this.name !== GhostName.BLINKY;
    this.mode = this.inHouse ? GhostMode.IN_HOUSE : GhostMode.SCATTER;
    this.previousMode = GhostMode.SCATTER;
    this.houseExitTimer = exitDelayMs;
    this.direction = this.inHouse ? DIRECTION.UP : DIRECTION.LEFT;
    this.lastDecidedTile = '';
    this.stunTimer = 0;
    this.freezeTimer = 0;
  }

  public abstract calculateChaseTarget(pacman: Pacman, blinky?: Ghost): TilePos;

  public setMode(newMode: GhostMode, forceReverse: boolean = true) {
    if (this.mode === GhostMode.EATEN || this.mode === GhostMode.IN_HOUSE) {
      this.previousMode = newMode;
      return;
    }

    if (newMode !== this.mode) {
      if (forceReverse && this.direction !== DIRECTION.NONE) {
        this.direction = OPPOSITE_DIRECTION[this.direction.name] || this.direction;
      }
      this.previousMode = this.mode;
      this.mode = newMode;
    }
  }

  public applyStun(durationMs: number) {
    if (this.mode !== GhostMode.EATEN) {
      this.stunTimer = durationMs;
    }
  }

  public applyFreeze(durationMs: number) {
    if (this.mode !== GhostMode.EATEN) {
      this.freezeTimer = durationMs;
    }
  }

  public update(dt: number) {
    // 1. Congelamento / Atordoamento por Power-ups
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      return; // Pausa movimentação enquanto congelado
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return; // Pausa movimentação enquanto atordoado
    }

    this.skirtTimer += dt;
    if (this.skirtTimer > 100) {
      this.skirtTimer = 0;
      this.skirtFrame = (this.skirtFrame + 1) % 2;
    }

    // 2. Estado dentro da casa
    if (this.mode === GhostMode.IN_HOUSE) {
      this.updateInHouse(dt);
      return;
    }

    // 3. Ajuste de velocidade
    this.updateSpeed();

    // 4. Movimento e Decisão de Curvas no Grid
    this.moveAndTurn();

    // 5. Verificação de retorno à casa após ser comido
    if (this.mode === GhostMode.EATEN) {
      const exitPxX = GHOST_HOUSE_EXIT_TILE.x * TILE_SIZE;
      const exitPxY = GHOST_HOUSE_EXIT_TILE.y * TILE_SIZE + TILE_SIZE / 2;
      if (Math.hypot(this.x - exitPxX, this.y - exitPxY) < 4) {
        this.mode = this.previousMode === GhostMode.FRIGHTENED ? GhostMode.CHASE : this.previousMode;
        this.direction = DIRECTION.UP;
      }
    }

    this.handleWarpTunnel();
  }

  private updateInHouse(dt: number) {
    const exitPxX = GHOST_HOUSE_EXIT_TILE.x * TILE_SIZE;
    const exitPxY = GHOST_HOUSE_EXIT_TILE.y * TILE_SIZE + TILE_SIZE / 2;

    if (this.houseExitTimer > 0) {
      this.houseExitTimer -= dt;
      const topY = 16.5 * TILE_SIZE;
      const bottomY = 17.5 * TILE_SIZE;
      this.y += this.houseBounceDir * 0.5;
      if (this.y <= topY) this.houseBounceDir = 1;
      if (this.y >= bottomY) this.houseBounceDir = -1;
    } else {
      if (Math.abs(this.x - exitPxX) > 1) {
        this.x += this.x < exitPxX ? 0.8 : -0.8;
      } else {
        this.x = exitPxX;
        if (this.y > exitPxY) {
          this.y -= 0.8;
        } else {
          this.x = exitPxX;
          this.y = exitPxY;
          this.inHouse = false;
          this.mode = this.previousMode;
          this.direction = DIRECTION.LEFT;
          this.lastDecidedTile = '';
        }
      }
    }
  }

  private updateSpeed() {
    if (this.mode === GhostMode.EATEN) {
      this.speed = BASE_SPEED * 1.6;
    } else if (this.isInTunnel()) {
      this.speed = BASE_SPEED * 0.45;
    } else if (this.mode === GhostMode.FRIGHTENED) {
      this.speed = BASE_SPEED * 0.5;
    } else {
      this.speed = BASE_SPEED * 0.75;
    }
  }

  private isInTunnel(): boolean {
    return this.maze.isTunnelRow(this.tileY) && (this.tileX <= 5 || this.tileX >= 22);
  }

  public updateTarget(pacman: Pacman, blinky?: Ghost) {
    if (this.mode === GhostMode.CHASE) {
      this.targetTile = this.calculateChaseTarget(pacman, blinky);
    } else if (this.mode === GhostMode.SCATTER) {
      this.targetTile = this.scatterTile;
    } else if (this.mode === GhostMode.EATEN) {
      this.targetTile = GHOST_HOUSE_EXIT_TILE;
    }
  }

  private moveAndTurn() {
    const currentTileKey = `${this.tileX},${this.tileY}`;
    const distToCenter = Math.hypot(this.x - this.tileCenterX, this.y - this.tileCenterY);

    if (distToCenter <= this.speed && this.lastDecidedTile !== currentTileKey) {
      this.x = this.tileCenterX;
      this.y = this.tileCenterY;
      this.makeTurnDecision();
      this.lastDecidedTile = currentTileKey;
    }

    if (this.direction !== DIRECTION.NONE) {
      const nextCol = this.tileX + this.direction.x;
      const nextRow = this.tileY + this.direction.y;
      const isBlockedAhead = !this.maze.isWalkableForGhost(nextCol, nextRow, this.mode === GhostMode.EATEN);

      if (isBlockedAhead) {
        if (
          (this.direction.x > 0 && this.x >= this.tileCenterX) ||
          (this.direction.x < 0 && this.x <= this.tileCenterX) ||
          (this.direction.y > 0 && this.y >= this.tileCenterY) ||
          (this.direction.y < 0 && this.y <= this.tileCenterY)
        ) {
          this.x = this.tileCenterX;
          this.y = this.tileCenterY;
          this.makeTurnDecision();
        }
      }

      this.x += this.direction.x * this.speed;
      this.y += this.direction.y * this.speed;
    }
  }

  private makeTurnDecision() {
    const validDirections: Direction[] = [
      DIRECTION.UP,
      DIRECTION.LEFT,
      DIRECTION.DOWN,
      DIRECTION.RIGHT,
    ];

    const opposite = OPPOSITE_DIRECTION[this.direction.name];

    if (this.mode === GhostMode.FRIGHTENED) {
      const candidates = validDirections.filter((dir) => {
        if (dir.name === opposite?.name && this.direction !== DIRECTION.NONE) return false;
        const nextCol = this.tileX + dir.x;
        const nextRow = this.tileY + dir.y;
        return this.maze.isWalkableForGhost(nextCol, nextRow, false);
      });

      if (candidates.length > 0) {
        this.direction = candidates[Math.floor(Math.random() * candidates.length)];
      }
      return;
    }

    let bestDistanceSq = Infinity;
    let chosenDirection: Direction = this.direction;
    let foundValid = false;

    for (const dir of validDirections) {
      if (dir.name === opposite?.name && this.direction !== DIRECTION.NONE) {
        continue;
      }

      const nextCol = this.tileX + dir.x;
      const nextRow = this.tileY + dir.y;

      if (!this.maze.isWalkableForGhost(nextCol, nextRow, this.mode === GhostMode.EATEN)) {
        continue;
      }

      if (dir === DIRECTION.UP && this.maze.isForbiddenUpTile(this.tileX, this.tileY)) {
        continue;
      }

      const dx = nextCol - this.targetTile.x;
      const dy = nextRow - this.targetTile.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < bestDistanceSq) {
        bestDistanceSq = distSq;
        chosenDirection = dir;
        foundValid = true;
      }
    }

    if (!foundValid && opposite) {
      const nextCol = this.tileX + opposite.x;
      const nextRow = this.tileY + opposite.y;
      if (this.maze.isWalkableForGhost(nextCol, nextRow, this.mode === GhostMode.EATEN)) {
        chosenDirection = opposite;
      }
    }

    this.direction = chosenDirection;
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.mode === GhostMode.EATEN) {
      this.drawEyes(ctx);
      ctx.restore();
      return;
    }

    // Cor do corpo
    let bodyColor: string = this.customColor || GHOST_COLORS[this.name];
    if (this.freezeTimer > 0) {
      bodyColor = '#80D8FF'; // Azul gelo
    } else if (this.mode === GhostMode.FRIGHTENED) {
      const frightColor = this.customFrightenedColor || GHOST_COLORS.FRIGHTENED;
      const flashColor = this.customFlashingColor || GHOST_COLORS.FLASHING;
      bodyColor = this.isFrightenedFlashing ? flashColor : frightColor;
    }

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -1, 6.5, Math.PI, 0, false);
    ctx.lineTo(6.5, 5);

    const waveOffset = this.skirtFrame === 0 ? 0 : 1;
    ctx.lineTo(4.5, 6.5 - waveOffset);
    ctx.lineTo(2.5, 5);
    ctx.lineTo(0, 6.5 - waveOffset);
    ctx.lineTo(-2.5, 5);
    ctx.lineTo(-4.5, 6.5 - waveOffset);
    ctx.lineTo(-6.5, 5);
    ctx.closePath();
    ctx.fill();

    // Efeito de Congelamento (Borda de Gelo)
    if (this.freezeTimer > 0) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (this.mode === GhostMode.FRIGHTENED && this.freezeTimer <= 0) {
      ctx.fillStyle = this.isFrightenedFlashing ? '#FF0000' : '#FFB8AE';
      ctx.fillRect(-3, -2, 2, 2);
      ctx.fillRect(2, -2, 2, 2);
      ctx.fillRect(-4, 2, 8, 1);
    } else {
      this.drawEyes(ctx);
    }

    // Efeito de Atordoamento (Estrelas girando sobre a cabeça)
    if (this.stunTimer > 0) {
      const angle = (performance.now() * 0.008) % (Math.PI * 2);
      ctx.fillStyle = '#FFFF00';
      for (let i = 0; i < 3; i++) {
        const starAngle = angle + (i * Math.PI * 2) / 3;
        const sx = Math.cos(starAngle) * 7;
        const sy = -8 + Math.sin(starAngle) * 2;
        ctx.fillRect(sx - 1, sy - 1, 2, 2);
      }
    }

    ctx.restore();
  }

  private drawEyes(ctx: CanvasRenderingContext2D) {
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;

    if (this.direction === DIRECTION.LEFT) eyeOffsetX = -1.5;
    else if (this.direction === DIRECTION.RIGHT) eyeOffsetX = 1.5;
    else if (this.direction === DIRECTION.UP) eyeOffsetY = -1.5;
    else if (this.direction === DIRECTION.DOWN) eyeOffsetY = 1.5;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-2.5 + eyeOffsetX * 0.5, -1 + eyeOffsetY * 0.5, 2.5, 0, Math.PI * 2);
    ctx.arc(2.5 + eyeOffsetX * 0.5, -1 + eyeOffsetY * 0.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2121DE';
    ctx.beginPath();
    ctx.arc(-2.5 + eyeOffsetX, -1 + eyeOffsetY, 1.2, 0, Math.PI * 2);
    ctx.arc(2.5 + eyeOffsetX, -1 + eyeOffsetY, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
