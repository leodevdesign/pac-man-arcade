import {
  PowerUpType,
  POWER_UP_CONFIGS,
  PowerUpConfig,
  TILE_SIZE,
} from '../core/Constants.ts';
import { PelletManager } from '../map/PelletManager.ts';
import { SoundSynthesizer } from '../audio/SoundSynthesizer.ts';
import { HUD } from '../ui/HUD.ts';
import { EconomyService } from '../services/EconomyService.ts';

export interface ActivePowerUpState {
  hasShield: boolean;
  shieldCharges: number;
  magnetTimer: number;
  freezeTimer: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  active: boolean;
}

export class PowerUpManager {
  private activeItem: {
    config: PowerUpConfig;
    x: number;
    y: number;
    timer: number;
  } | null = null;

  private spawnCooldown: number = 20000; // Primeiro spawn em 20s
  private floatOffset: number = 0;
  private floatSpeed: number = 0.005;

  // Estados ativos no jogador
  public hasShield: boolean = false;
  public shieldCharges: number = 0;
  public magnetTimer: number = 0;
  public freezeTimer: number = 0;

  public shockwave: Shockwave = {
    x: 0,
    y: 0,
    radius: 0,
    maxRadius: 75,
    color: '#FF3D00',
    active: false,
  };

  // Callbacks para sincronização com o jogo
  public onEnergizerTriggered: (() => void) | null = null;
  public onPelletEaten: ((points: number) => void) | null = null;

  constructor() {
    this.reset();
  }

  public reset() {
    this.activeItem = null;
    this.spawnCooldown = 20000;
    this.hasShield = false;
    this.shieldCharges = 0;
    this.magnetTimer = 0;
    this.freezeTimer = 0;
    this.shockwave.active = false;
  }

  public getActiveState(): ActivePowerUpState {
    return {
      hasShield: this.hasShield,
      shieldCharges: this.shieldCharges,
      magnetTimer: this.magnetTimer,
      freezeTimer: this.freezeTimer,
    };
  }

  public isGhostsFrozen(): boolean {
    return this.freezeTimer > 0;
  }

  public update(
    dt: number,
    pacmanX: number,
    pacmanY: number,
    pelletManager: PelletManager,
    hud: HUD,
    sound: SoundSynthesizer,
    economyService?: EconomyService
  ) {
    // 1. Temporizador de Spawn de Novos Itens
    if (!this.activeItem) {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0) {
        this.spawnRandomPowerUp();
      }
    } else {
      this.activeItem.timer -= dt;
      this.floatOffset = Math.sin(performance.now() * this.floatSpeed) * 2.5;

      if (this.activeItem.timer <= 0) {
        this.activeItem = null;
        this.spawnCooldown = 22000 + Math.random() * 8000;
      }
    }

    // 2. Atualização dos Power-ups Ativos
    if (this.magnetTimer > 0) {
      this.magnetTimer -= dt;
      const radius = economyService ? economyService.getMagnetRadius() : 5;
      this.processMagnetPull(pacmanX, pacmanY, pelletManager, hud, sound, radius);
    }

    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
    }

    // 3. Atualização da Onda de Choque (Bomba)
    if (this.shockwave.active) {
      this.shockwave.radius += 3.5;
      if (this.shockwave.radius >= this.shockwave.maxRadius) {
        this.shockwave.active = false;
      }
    }
  }

  private spawnRandomPowerUp() {
    const types = [
      PowerUpType.BOMB,
      PowerUpType.MAGNET,
      PowerUpType.SHIELD,
      PowerUpType.FREEZE,
    ];
    const pickedType = types[Math.floor(Math.random() * types.length)];
    const config = POWER_UP_CONFIGS[pickedType];

    // Posição no corredor central (linha 20, col 13.5)
    this.activeItem = {
      config,
      x: 13.5 * TILE_SIZE,
      y: 20 * TILE_SIZE + TILE_SIZE / 2,
      timer: 12000, // 12 segundos para coletar
    };
  }

  /**
   * Checa se o Pac-Man encostou no Power-Up flutuante
   */
  public checkCollection(
    pacmanX: number,
    pacmanY: number,
    sound: SoundSynthesizer,
    hud: HUD,
    economyService?: EconomyService
  ): PowerUpType | null {
    if (!this.activeItem) return null;

    const dist = Math.hypot(pacmanX - this.activeItem.x, pacmanY - this.activeItem.y);
    if (dist < 8) {
      const type = this.activeItem.config.type;
      this.applyPowerUp(type, pacmanX, pacmanY, sound, hud, economyService);
      this.activeItem = null;
      this.spawnCooldown = 22000 + Math.random() * 8000;
      return type;
    }

    return null;
  }

  private applyPowerUp(
    type: PowerUpType,
    pacmanX: number,
    pacmanY: number,
    sound: SoundSynthesizer,
    hud: HUD,
    economyService?: EconomyService
  ) {
    hud.addScore(150);

    switch (type) {
      case PowerUpType.BOMB:
        this.shockwave = {
          x: pacmanX,
          y: pacmanY,
          radius: 0,
          maxRadius: 75,
          color: '#FF3D00',
          active: true,
        };
        sound.playBombExplosion();
        break;

      case PowerUpType.MAGNET:
        this.magnetTimer = POWER_UP_CONFIGS[PowerUpType.MAGNET].durationMs;
        sound.playMagnetSound();
        break;

      case PowerUpType.SHIELD:
        this.shieldCharges = economyService ? economyService.getShieldMaxCharges() : 1;
        this.hasShield = true;
        sound.playShieldEquip();
        break;

      case PowerUpType.FREEZE: {
        const freezeSecs = economyService ? economyService.getFreezeSeconds() : 5;
        this.freezeTimer = freezeSecs * 1000;
        sound.playFreezeChime();
        break;
      }
    }
  }

  /**
   * Processa a atração magnética de pastilhas próximas ao Pac-Man
   */
  private processMagnetPull(
    pacmanX: number,
    pacmanY: number,
    pelletManager: PelletManager,
    hud: HUD,
    sound: SoundSynthesizer,
    tileRadius: number
  ) {
    const pacTileX = Math.floor(pacmanX / TILE_SIZE);
    const pacTileY = Math.floor(pacmanY / TILE_SIZE);

    for (let dy = -tileRadius; dy <= tileRadius; dy++) {
      for (let dx = -tileRadius; dx <= tileRadius; dx++) {
        const tx = pacTileX + dx;
        const ty = pacTileY + dy;

        const distTiles = Math.hypot(dx, dy);
        if (distTiles <= tileRadius && Math.random() < 0.25) {
          const eatResult = pelletManager.eatPellet(tx, ty);
          if (eatResult.isPellet) {
            hud.addScore(eatResult.points);
            sound.playWaka();

            if (eatResult.isEnergizer) {
              if (this.onEnergizerTriggered) {
                this.onEnergizerTriggered();
              }
            } else {
              if (this.onPelletEaten) {
                this.onPelletEaten(eatResult.points);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Escudo absorve impacto: desconta 1 carga
   */
  public breakShield(sound: SoundSynthesizer) {
    this.shieldCharges = Math.max(0, this.shieldCharges - 1);
    if (this.shieldCharges === 0) {
      this.hasShield = false;
    }
    sound.playShieldBreak();
  }

  public render(ctx: CanvasRenderingContext2D) {
    // 1. Renderiza a Onda de Choque
    if (this.shockwave.active) {
      ctx.save();
      ctx.strokeStyle = this.shockwave.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.shockwave.x, this.shockwave.y, this.shockwave.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Renderiza o Item Flutuante Coletável
    if (this.activeItem) {
      ctx.save();
      const drawY = this.activeItem.y + this.floatOffset;
      const x = this.activeItem.x;
      const y = drawY;

      // Glow pulsante em volta do item
      const pulse = Math.sin(performance.now() * 0.008) * 2;
      ctx.shadowColor = this.activeItem.config.color;
      ctx.shadowBlur = 10 + pulse;

      ctx.fillStyle = this.activeItem.config.color;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Borda branca brilhante
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ícone central em texto pixel
      ctx.shadowBlur = 0;
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.activeItem.config.icon, x, y);

      ctx.restore();
    }
  }
}
