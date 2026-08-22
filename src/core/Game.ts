import {
  GameState,
  GhostMode,
  INTERNAL_WIDTH,
  INTERNAL_HEIGHT,
  SCATTER_CHASE_TIMINGS,
  SCORES,
  BASE_SPEED,
  PowerUpType,
  GameMode,
  ThemeType,
  PacmanSkin,
} from './Constants.ts';
import { Maze } from '../map/Maze.ts';
import { PelletManager } from '../map/PelletManager.ts';
import { Pacman } from '../entities/Pacman.ts';
import { Blinky } from '../entities/Blinky.ts';
import { Pinky } from '../entities/Pinky.ts';
import { Inky } from '../entities/Inky.ts';
import { Clyde } from '../entities/Clyde.ts';
import { Ghost } from '../entities/Ghost.ts';
import { FruitManager } from '../items/FruitManager.ts';
import { PowerUpManager } from '../items/PowerUpManager.ts';
import { HUD } from '../ui/HUD.ts';
import { DebugOverlay } from '../ui/DebugOverlay.ts';
import { InputManager } from './InputManager.ts';
import { SoundSynthesizer } from '../audio/SoundSynthesizer.ts';
import { MapConfig, MAP_PRESETS } from '../map/MapRegistry.ts';
import { PacmanAI } from '../ai/PacmanAI.ts';
import { ThemeManager, ThemeConfig } from '../ui/ThemeManager.ts';
import { EconomyService } from '../services/EconomyService.ts';
import { ProfileService } from '../services/ProfileService.ts';
import { AchievementManager } from '../services/AchievementManager.ts';
import { LeaderboardService } from '../services/LeaderboardService.ts';
import { MatrixRainEffect } from '../ui/MatrixRainEffect.ts';

export class Game {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  private maze: Maze;
  private pelletManager: PelletManager;
  private pacman: Pacman;
  private pacman2: Pacman; // Ms. Pac-Man para o Modo Co-op (2P)
  private blinky: Blinky;
  private pinky: Pinky;
  private inky: Inky;
  private clyde: Clyde;
  private ghosts: Ghost[];

  private fruitManager: FruitManager;
  private powerUpManager: PowerUpManager;
  private hud: HUD;
  private debugOverlay: DebugOverlay;
  private input: InputManager;
  public sound: SoundSynthesizer;
  public themeManager: ThemeManager;
  public economyService: EconomyService;
  public profileService: ProfileService;
  public achievementManager: AchievementManager;
  public leaderboardService: LeaderboardService;
  private matrixRain: MatrixRainEffect;
  private attractOverlayEl: HTMLElement | null = null;
  private teleportCooldownTimer: number = 0;

  public state: GameState = GameState.ATTRACT;
  public level: number = 1;
  public currentMapConfig: MapConfig = MAP_PRESETS[0];
  public gameMode: GameMode = GameMode.CLASSIC;

  private stateTimer: number = 0;
  private isGamePaused: boolean = false;

  // Timers de Modos dos Fantasmas
  private modeScheduleIndex: number = 0;
  private modeTimer: number = 0;
  private frightenedTimer: number = 0;
  private frightenedDuration: number = 6000;
  private ghostEatCombo: number = 0;
  private deathsThisLevel: number = 0;
  private fruitsEatenSession: number = 0;

  // Callbacks
  public onGameOverCallback: ((score: number, level: number, mode: string) => void) | null = null;

  // Render Scale HD
  private renderScale: number = 3;

  // Labirintos Aleatórios
  private isRandomMazeMode: boolean = true;
  private randomizedPool: MapConfig[] = [];
  private poolIndex: number = 0;

  // FPS tracking
  private lastFrameTime: number = 0;
  private fps: number = 60;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const dpr = Math.max(2, Math.min(4, Math.round(window.devicePixelRatio || 2)));
    this.renderScale = dpr * 2; // Buffer HD 4x / 6x
    this.canvas.width = INTERNAL_WIDTH * this.renderScale;
    this.canvas.height = INTERNAL_HEIGHT * this.renderScale;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Não foi possível obter o contexto 2D do Canvas');
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.themeManager = new ThemeManager();
    this.economyService = new EconomyService();
    this.profileService = new ProfileService();
    this.achievementManager = new AchievementManager();
    this.leaderboardService = new LeaderboardService();

    this.initRandomPool();
    this.currentMapConfig = MAP_PRESETS[0];
    this.maze = new Maze(this.currentMapConfig);
    this.pelletManager = new PelletManager();
    this.pacman = new Pacman(this.maze);
    this.pacman2 = new Pacman(this.maze, { x: 14.5, y: 26 }, true);

    this.blinky = new Blinky(this.maze);
    this.pinky = new Pinky(this.maze);
    this.inky = new Inky(this.maze);
    this.clyde = new Clyde(this.maze);
    this.ghosts = [this.blinky, this.pinky, this.inky, this.clyde];

    this.fruitManager = new FruitManager();
    this.powerUpManager = new PowerUpManager();
    this.hud = new HUD();
    this.debugOverlay = new DebugOverlay();
    this.input = new InputManager();
    this.sound = new SoundSynthesizer();
    this.matrixRain = new MatrixRainEffect();

    this.profileService.setSound(this.sound);
    this.achievementManager.setSound(this.sound);
    this.achievementManager.onCoinsRewarded((coins) => {
      this.economyService.addCoins(coins);
    });
    this.achievementManager.onXpRewarded((xp) => {
      this.profileService.addXp(xp);
    });

    // Callbacks do PowerUpManager (Ativação de Energizers e Pastilhas puxadas pelo Ímã)
    this.powerUpManager.onEnergizerTriggered = () => {
      this.triggerEnergizer();
      this.economyService.addCoins(5);
      this.profileService.addXp(5);
      this.achievementManager.increment('energizers_eaten', 1);
      this.achievementManager.increment('dots_eaten', 1);
    };

    this.powerUpManager.onPelletEaten = () => {
      this.economyService.addCoins(1);
      this.profileService.addXp(1);
      this.achievementManager.increment('dots_eaten', 1);
      this.achievementManager.increment('waka_master', 1);
      this.achievementManager.increment('single_run_dots', 1);
    };

    this.applyTheme(this.themeManager.getTheme());
    this.applySkin(this.themeManager.getSkin());

    this.setupInputHandlers();
  }

  private setupInputHandlers() {
    this.input.setOnStart(() => {
      if (this.state === GameState.ATTRACT || this.state === GameState.GAME_OVER) {
        this.startNewGame();
      }
    });

    this.input.setOnPause(() => {
      if (this.state === GameState.PLAYING) {
        this.isGamePaused = !this.isGamePaused;
      }
    });

    this.input.setOnMute(() => {
      this.sound.toggleMute();
    });

    window.addEventListener('keydown', (e) => {
      if (
        e.code === 'Space' &&
        this.state === GameState.PLAYING &&
        !this.isGamePaused &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        this.tryEmergencyTeleport();
      }
    });
  }

  public tryEmergencyTeleport() {
    if (this.teleportCooldownTimer > 0) return;

    const pacCol = Math.floor(this.pacman.x / 8);
    const pacRow = Math.floor(this.pacman.y / 8);

    // Determina o quadrante oposto espelhado
    // Colunas: 0 a 27 (centro = 14)
    // Linhas: 3 a 33 (centro = 18)
    const isLeft = pacCol < 14;
    const isTop = pacRow < 18;

    const targetMinCol = isLeft ? 14 : 1;
    const targetMaxCol = isLeft ? 26 : 13;
    const targetMinRow = isTop ? 18 : 4;
    const targetMaxRow = isTop ? 31 : 17;

    // Busca posições livres no quadrante oposto
    let freeTiles: { x: number; y: number }[] = [];
    for (let r = targetMinRow; r <= targetMaxRow; r++) {
      for (let c = targetMinCol; c <= targetMaxCol; c++) {
        if (this.maze.isWalkableForPacman(c, r)) {
          freeTiles.push({ x: c, y: r });
        }
      }
    }

    // Fallback: se não achar no quadrante oposto, busca no mapa inteiro
    if (freeTiles.length === 0) {
      for (let r = 4; r < 32; r++) {
        for (let c = 1; c < 27; c++) {
          if (this.maze.isWalkableForPacman(c, r)) {
            freeTiles.push({ x: c, y: r });
          }
        }
      }
    }

    if (freeTiles.length === 0) return;

    // Procura o tile no quadrante oposto mais distante dos 4 fantasmas
    let bestTile = freeTiles[0];
    let maxMinDist = -1;

    for (const tile of freeTiles) {
      let minDistToGhost = Infinity;
      for (const ghost of this.ghosts) {
        const d = Math.hypot(tile.x * 8 - ghost.x, tile.y * 8 - ghost.y);
        if (d < minDistToGhost) minDistToGhost = d;
      }
      if (minDistToGhost > maxMinDist) {
        maxMinDist = minDistToGhost;
        bestTile = tile;
      }
    }

    this.pacman.x = bestTile.x * 8;
    this.pacman.y = bestTile.y * 8 + 4;
    this.teleportCooldownTimer = this.economyService.getTeleportCooldownSeconds();
    this.sound.playEatFruit();
    this.achievementManager.increment('teleport_escapes', 1);
  }

  public setTheme(themeType: ThemeType) {
    const theme = this.themeManager.setTheme(themeType);
    this.applyTheme(theme);
  }

  public setPacmanSkin(skin: PacmanSkin) {
    const activeSkin = this.themeManager.setSkin(skin);
    this.applySkin(activeSkin);
  }

  private applyTheme(theme: ThemeConfig) {
    if (theme.id === ThemeType.CLASSIC) {
      this.maze.applyColors(this.currentMapConfig.wallColor, this.currentMapConfig.doorColor, theme.bgColor);
      this.pelletManager.setColors(
        this.currentMapConfig.dotColor || theme.dotColor,
        this.currentMapConfig.energizerColor || theme.energizerColor
      );
    } else {
      this.maze.applyColors(theme.wallColor, theme.doorColor, theme.bgColor);
      this.pelletManager.setColors(theme.dotColor, theme.energizerColor);
    }

    if (theme.ghostColors) {
      this.blinky.customColor = theme.ghostColors.blinky;
      this.pinky.customColor = theme.ghostColors.pinky;
      this.inky.customColor = theme.ghostColors.inky;
      this.clyde.customColor = theme.ghostColors.clyde;
      this.ghosts.forEach((g) => {
        g.customFrightenedColor = theme.ghostColors?.frightened;
        g.customFlashingColor = theme.ghostColors?.flashing;
      });
    } else {
      this.ghosts.forEach((g) => {
        g.customColor = undefined;
        g.customFrightenedColor = undefined;
        g.customFlashingColor = undefined;
      });
    }

    if (theme.id === ThemeType.MATRIX) {
      this.pacman.customColor = '#00FF66';
      this.pacman2.customColor = '#66FF99';
    } else if (theme.id === ThemeType.GAMEBOY) {
      this.pacman.customColor = '#9bbc0f';
      this.pacman2.customColor = '#8bac0f';
    } else {
      this.pacman.customColor = '#FFFF00';
      this.pacman2.customColor = '#FFFF00';
    }
  }

  private applySkin(skin: PacmanSkin) {
    this.pacman.skin = skin;
    if (skin === PacmanSkin.MS_PACMAN) {
      this.pacman.isMsPacman = true;
    } else {
      this.pacman.isMsPacman = false;
    }
  }

  public setGameMode(mode: GameMode) {
    this.gameMode = mode;
    this.startNewGame();
  }

  private initRandomPool() {
    // Pega todos os mapas exceto o clássico 1980
    const otherMaps = MAP_PRESETS.slice(1);
    const pool = [...otherMaps];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.randomizedPool = pool;
    this.poolIndex = 0;
  }

  private pickNextMapForLevel() {
    if (!this.isRandomMazeMode) {
      this.checkMsPacmanMapProgression();
      return;
    }

    if (this.level === 1) {
      // Fase 1 SEMPRE o labirinto clássico azul de 1980
      const classicMap = MAP_PRESETS[0];
      this.currentMapConfig = classicMap;
      this.maze.loadConfig(classicMap);
      this.applyTheme(this.themeManager.getTheme());
    } else {
      // Fase 2 em diante: sorteia do pool de 10+ mapas
      if (this.randomizedPool.length === 0 || this.poolIndex >= this.randomizedPool.length) {
        this.initRandomPool();
      }
      const nextMap = this.randomizedPool[this.poolIndex];
      this.poolIndex++;
      this.currentMapConfig = nextMap;
      this.maze.loadConfig(nextMap);
      this.applyTheme(this.themeManager.getTheme());
    }
  }

  public loadMap(config: MapConfig, isRandomMode: boolean = false) {
    this.isRandomMazeMode = isRandomMode;
    this.currentMapConfig = config;
    this.maze.loadConfig(config);
    this.applyTheme(this.themeManager.getTheme());
    this.level = 1;
    this.initRandomPool();
    const initialLives = this.economyService.getStartingLives();
    this.pacman.lives = initialLives;
    this.pacman2.lives = initialLives;
    this.hud.resetScore();
    this.fruitsEatenSession = 0;
    this.startLevel();
  }

  public setRandomMazeMode(enable: boolean) {
    this.isRandomMazeMode = enable;
    this.startNewGame();
  }

  public startNewGame() {
    this.level = 1;
    this.initRandomPool();
    const initialLives = this.economyService.getStartingLives();
    this.pacman.lives = initialLives;
    this.pacman2.lives = initialLives;
    this.hud.resetScore();
    this.fruitsEatenSession = 0;
    this.startLevel();
  }

  private checkMsPacmanMapProgression() {
    // Só progride automaticamente caso o jogador avance para os níveis 3, 6, 10 durante a partida
    if (this.currentMapConfig.category === 'mspacman' && this.level > 1) {
      let nextPreset = this.currentMapConfig;
      if (this.level >= 10) nextPreset = MAP_PRESETS[4];
      else if (this.level >= 6) nextPreset = MAP_PRESETS[3];
      else if (this.level >= 3) nextPreset = MAP_PRESETS[2];

      if (this.currentMapConfig.id !== nextPreset.id) {
        this.currentMapConfig = nextPreset;
        this.maze.loadConfig(nextPreset);
        this.applyTheme(this.themeManager.getTheme());
      }
    }
  }

  private startLevel() {
    this.pickNextMapForLevel();
    this.pelletManager.reset(this.maze.getRawMap());
    this.fruitManager.resetForLevel(this.currentMapConfig.fruitSpawn);
    this.powerUpManager.reset(this.currentMapConfig.powerUpSpawn || this.currentMapConfig.fruitSpawn);
    this.deathsThisLevel = 0;
    this.teleportCooldownTimer = 0; // Habilidade pronta imediatamente!
    this.applyLevelDifficulty();
    this.resetPositions();
    this.state = GameState.READY;
    this.stateTimer = 4000;
    this.modeScheduleIndex = 0;
    this.modeTimer = 0;
    this.frightenedTimer = 0;
    this.maze.isFlashing = false;

    this.sound.stopSiren();
    this.sound.playIntroTheme().then(() => {
      if (this.state === GameState.READY) {
        this.state = GameState.PLAYING;
        this.sound.startSiren(false, this.blinky.elroyLevel);
      }
    });
  }

  private applyLevelDifficulty() {
    const speedMult = this.gameMode === GameMode.TURBO ? 1.8 : 1.0;
    const upgradeSpeed = this.economyService.getSpeedMultiplier();

    if (this.level === 1) {
      this.pacman.speed = BASE_SPEED * 0.8 * speedMult * upgradeSpeed;
      this.pacman2.speed = BASE_SPEED * 0.8 * speedMult * upgradeSpeed;
    } else if (this.level <= 4) {
      this.pacman.speed = BASE_SPEED * 0.9 * speedMult * upgradeSpeed;
      this.pacman2.speed = BASE_SPEED * 0.9 * speedMult * upgradeSpeed;
    } else {
      this.pacman.speed = BASE_SPEED * 1.0 * speedMult * upgradeSpeed;
      this.pacman2.speed = BASE_SPEED * 1.0 * speedMult * upgradeSpeed;
    }

    const baseDuration = 6000;
    this.frightenedDuration = baseDuration;

    // Atualiza a retenção da Prisão Espectral e lentidão em todos os fantasmas
    const jailDuration = this.economyService.getGhostJailDurationMs();
    const ghostSlowdown = this.economyService.getGhostSlowdownMultiplier();
    this.ghosts.forEach((ghost) => {
      ghost.jailDurationMs = jailDuration;
      ghost.speed = BASE_SPEED * 0.75 * speedMult * ghostSlowdown;
    });
  }

  private resetPositions() {
    const spawn = this.currentMapConfig.pacmanSpawn || { x: 13.5, y: 26 };
    this.pacman.resetPosition(spawn);
    this.pacman2.resetPosition({ x: spawn.x + 1, y: spawn.y });
    this.input.reset();
    this.powerUpManager.reset(this.currentMapConfig.powerUpSpawn || this.currentMapConfig.fruitSpawn);

    let pinkyDelay = 1000;
    let inkyDelay = 3000;
    let clydeDelay = 5000;

    if (this.level === 2) {
      pinkyDelay = 500;
      inkyDelay = 2000;
      clydeDelay = 3500;
    } else if (this.level >= 3) {
      pinkyDelay = 200;
      inkyDelay = 1000;
      clydeDelay = 2000;
    }

    this.blinky.reset(0);
    this.pinky.reset(pinkyDelay);
    this.inky.reset(inkyDelay);
    this.clyde.reset(clydeDelay);
  }

  public start() {
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(currentTime: number) {
    const dt = Math.min(currentTime - this.lastFrameTime, 100);
    this.lastFrameTime = currentTime;
    this.fps = 1000 / (dt || 16.6);

    if (!this.isGamePaused) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number) {
    this.hud.update(dt);
    this.fruitManager.update(dt);
    this.pelletManager.update(dt);

    switch (this.state) {
      case GameState.ATTRACT:
        break;

      case GameState.READY:
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = GameState.PLAYING;
          this.sound.startSiren(false, this.blinky.elroyLevel);
        }
        break;

      case GameState.PLAYING:
        this.updatePlaying(dt);
        break;

      case GameState.GHOST_PAUSE:
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.state = GameState.PLAYING;
        }
        break;

      case GameState.PACMAN_DYING:
        this.pacman.updateWithInput(this.input.getQueuedDirectionP1());
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.pacman.lives--;
          this.deathsThisLevel++;
          if (this.pacman.lives > 0) {
            this.resetPositions();
            this.state = GameState.READY;
            this.stateTimer = 2000;
          } else {
            this.state = GameState.GAME_OVER;
            this.hud.saveHighScore();
            this.stateTimer = 4000;
            if (this.onGameOverCallback) {
              this.onGameOverCallback(this.hud.score, this.level, this.gameMode);
            }
          }
        }
        break;

      case GameState.LEVEL_CLEAR:
        this.stateTimer -= dt;
        if (Math.floor(this.stateTimer / 200) % 2 === 0) {
          this.maze.isFlashing = true;
        } else {
          this.maze.isFlashing = false;
        }
        if (this.stateTimer <= 0) {
          // Recompensa de Conclusão de Fase: +1 VIDA EXTRA garantida a cada nível concluído!
          this.pacman.lives++;
          this.pacman2.lives++;
          this.sound.playExtraLife();

          if (this.deathsThisLevel === 0) {
            this.achievementManager.increment('untouchable_streak', 1);
          }
          if (this.pacman.lives === 1) {
            this.achievementManager.increment('last_life_clutch', 1);
          }
          this.economyService.addCoins(100); // Recompensa de conclusão de nível
          this.profileService.addXp(200); // XP por fase concluída
          this.achievementManager.increment('coins_earned_total', 100);
          this.level++;
          this.startLevel();
        }
        break;

      case GameState.GAME_OVER:
        this.stateTimer -= dt;
        break;
    }
  }

  private updatePlaying(dt: number) {
    const scoreMult = this.gameMode === GameMode.TURBO ? 2 : 1;
    const masteryMult = this.profileService.getMasteryScoreMultiplier();

    if (this.teleportCooldownTimer > 0) {
      this.teleportCooldownTimer -= dt / 1000;
    }

    // 1. Atualização dos Power-ups
    this.powerUpManager.update(
      dt,
      this.pacman.x,
      this.pacman.y,
      this.pelletManager,
      this.hud,
      this.sound,
      this.economyService
    );

    this.pacman.hasShield = this.powerUpManager.hasShield;
    this.pacman.hasMagnet = this.powerUpManager.magnetTimer > 0;

    if (this.powerUpManager.freezeTimer > 0) {
      this.ghosts.forEach((g) => g.applyFreeze(this.powerUpManager.freezeTimer));
    }

    // Coleta de Power-up flutuante
    const collectedPowerUp = this.powerUpManager.checkCollection(
      this.pacman.x,
      this.pacman.y,
      this.sound,
      this.hud,
      this.economyService
    );

    if (collectedPowerUp) {
      this.achievementManager.increment('powerups_collected_total', 1);
      if (collectedPowerUp === PowerUpType.BOMB) {
        const stunMs = this.economyService.getBombStunSeconds() * 1000;
        let stunnedCount = 0;
        this.ghosts.forEach((ghost) => {
          const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
          if (dist <= 75) {
            ghost.applyStun(stunMs);
            stunnedCount++;
          }
        });
        if (stunnedCount > 0) {
          this.achievementManager.increment('bomb_stuns', stunnedCount);
        }
      }
    }

    // 2. Modos dos Fantasmas
    if (this.gameMode === GameMode.TURBO) {
      this.ghosts.forEach((g) => {
        if (g.mode !== GhostMode.FRIGHTENED && g.mode !== GhostMode.EATEN && g.mode !== GhostMode.IN_HOUSE) {
          g.mode = GhostMode.CHASE;
        }
      });
    } else {
      this.updateGhostModes(dt);
    }

    // 3. Controle e IA do Pac-Man
    if (this.gameMode === GameMode.GHOST_HUNTER) {
      const aiDir = PacmanAI.calculateNextDirection(
        this.pacman,
        this.maze,
        this.pelletManager,
        this.ghosts
      );
      this.pacman.updateWithInput(aiDir);

      const humanDir = this.input.getQueuedDirectionP1().name !== 'NONE'
        ? this.input.getQueuedDirectionP1()
        : this.input.getQueuedDirectionP2();
      if (humanDir.name !== 'NONE') {
        this.blinky.direction = humanDir;
      }
    } else {
      this.pacman.updateWithInput(this.input.getQueuedDirectionP1());

      if (this.gameMode === GameMode.COOP_2P) {
        this.pacman2.updateWithInput(this.input.getQueuedDirectionP2());
      } else if (this.gameMode === GameMode.VERSUS_2P) {
        const p2Dir = this.input.getQueuedDirectionP2();
        if (p2Dir.name !== 'NONE') {
          this.blinky.direction = p2Dir;
        }
      }
    }

    // 4. Checagem de Pastilhas
    this.handlePelletEating(this.pacman, false, scoreMult, masteryMult);
    if (this.gameMode === GameMode.COOP_2P) {
      this.handlePelletEating(this.pacman2, true, scoreMult, masteryMult);
    }

    // 4.1 Checagem Universal de Conclusão de Fase (Física ou via Ímã de pastilhas)
    if (this.pelletManager.getRemainingCount() === 0 && this.state === GameState.PLAYING) {
      this.triggerLevelClear();
      return;
    }

    // 5. Checagem de Fruta (Pomar Fértil & Ímã de Frutas)
    this.fruitManager.checkPelletSpawns(
      this.pelletManager.getEatenCount(),
      this.level,
      this.economyService.getFertileOrchardCount()
    );

    const fruitMagnetRadius = this.economyService.getFruitMagnetRadius();
    if (fruitMagnetRadius > 0 && this.fruitManager.isFruitActive()) {
      const fruitPos = this.fruitManager.getFruitPixelPos();
      if (fruitPos) {
        const dist = Math.hypot(this.pacman.x - fruitPos.x, this.pacman.y - fruitPos.y);
        if (dist <= fruitMagnetRadius * 8) {
          this.fruitManager.pullFruitTowards(this.pacman.x, this.pacman.y);
        }
      }
    }

    const rawFruitPoints = this.fruitManager.checkPacmanCollision(this.pacman.x, this.pacman.y);
    if (rawFruitPoints > 0) {
      const fruitMult = this.economyService.getUpgrades().boostedFruits ? 1.5 : 1.0;
      const points = Math.floor(rawFruitPoints * scoreMult * fruitMult * masteryMult);
      this.hud.addScore(points);
      this.sound.playEatFruit();
      this.economyService.addCoins(50);
      this.profileService.addXp(50);
      this.fruitsEatenSession++;
      
      this.achievementManager.increment('fruits_eaten_total', 1);
      if (rawFruitPoints === 100) this.achievementManager.increment('cherry_lover', 1);
      else if (rawFruitPoints === 300) this.achievementManager.increment('strawberry_lover', 1);
      else if (rawFruitPoints === 500) this.achievementManager.increment('orange_lover', 1);
      else if (rawFruitPoints === 5000) this.achievementManager.increment('key_master', 1);
    }

    // 6. Atualização de Fantasmas
    this.ghosts.forEach((ghost) => {
      const isHumanGhost =
        (this.gameMode === GameMode.GHOST_HUNTER || this.gameMode === GameMode.VERSUS_2P) &&
        ghost === this.blinky;

      if (!isHumanGhost) {
        ghost.updateTarget(this.pacman, this.blinky);
      }
      ghost.update(dt);
    });

    // 7. Colisões
    this.checkGhostCollisions(masteryMult);
  }

  private triggerLevelClear() {
    if (this.state === GameState.LEVEL_CLEAR) return;
    this.state = GameState.LEVEL_CLEAR;
    this.stateTimer = 2200;
    this.sound.stopSiren();
    this.achievementManager.increment('level_clears', 1);
    this.achievementManager.recordMax('level_progression', this.level + 1);

    if (this.gameMode === GameMode.COOP_2P) {
      this.achievementManager.increment('coop_levels_cleared', 1);
    } else if (this.gameMode === GameMode.TURBO) {
      this.achievementManager.increment('turbo_stages_survived', 1);
    }
  }

  private handlePelletEating(pac: Pacman, isP2: boolean, scoreMult: number, masteryMult: number = 1.0) {
    const eatResult = this.pelletManager.eatPellet(pac.tileX, pac.tileY);
    if (eatResult.isPellet) {
      const earnedCoins = eatResult.isEnergizer ? 5 : 1;
      const earnedXp = eatResult.isEnergizer ? 5 : 1;
      this.economyService.addCoins(earnedCoins);
      this.profileService.addXp(earnedXp);
      this.achievementManager.increment('coins_earned_total', earnedCoins);
      this.achievementManager.recordMax('piggy_bank_saved', this.economyService.getCoins());

      this.achievementManager.increment('dots_eaten', 1);
      this.achievementManager.increment('waka_master', 1);
      this.achievementManager.increment('single_run_dots', 1);
      if (eatResult.isEnergizer) {
        this.achievementManager.increment('energizers_eaten', 1);
      }

      const points = Math.floor(eatResult.points * scoreMult * masteryMult);
      const extraLife = this.hud.addScore(points, isP2);
      this.achievementManager.increment('total_points_accumulated', points);
      this.achievementManager.recordMax('high_score_tier', this.hud.getScore());
      if (extraLife) {
        pac.lives++;
        this.sound.playExtraLife();
        this.achievementManager.increment('extra_lives_earned', 1);
      }

      if (eatResult.isEnergizer) {
        pac.setFreezeFrames(3);
        this.sound.playEatEnergizer();
        this.triggerEnergizer();
      } else {
        pac.setFreezeFrames(1);
        this.sound.playWaka();
      }

      this.blinky.updateElroy(this.pelletManager.getRemainingCount());
      this.fruitManager.checkPelletSpawns(this.pelletManager.getEatenCount(), this.level);

      if (this.pelletManager.getRemainingCount() === 0) {
        this.triggerLevelClear();
      }
    }
  }

  private updateGhostModes(dt: number) {
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= dt;
      const isFlashing =
        this.frightenedTimer <= 2000 && Math.floor(this.frightenedTimer / 200) % 2 === 0;
      this.ghosts.forEach((g) => {
        g.isFrightenedFlashing = isFlashing;
      });

      if (this.frightenedTimer <= 0) {
        this.ghosts.forEach((g) => {
          if (g.mode === GhostMode.FRIGHTENED) {
            g.setMode(g.previousMode, false);
          }
        });
        this.sound.startSiren(false, this.blinky.elroyLevel);
      }
      return;
    }

    const schedule = SCATTER_CHASE_TIMINGS[this.modeScheduleIndex];
    if (schedule && schedule.duration !== Infinity) {
      this.modeTimer += dt;
      if (this.modeTimer >= schedule.duration) {
        this.modeTimer = 0;
        this.modeScheduleIndex++;
        const nextSchedule = SCATTER_CHASE_TIMINGS[this.modeScheduleIndex];
        if (nextSchedule) {
          this.ghosts.forEach((g) => g.setMode(nextSchedule.mode, true));
        }
      }
    }
  }

  private triggerEnergizer() {
    const extraSeconds = this.economyService.getEnergizerExtraSeconds();
    this.frightenedTimer = this.frightenedDuration + extraSeconds * 1000;
    this.ghostEatCombo = 0;

    this.ghosts.forEach((ghost) => {
      if (ghost.mode !== GhostMode.EATEN && ghost.mode !== GhostMode.IN_HOUSE) {
        ghost.setMode(GhostMode.FRIGHTENED, true);
      }
    });

    this.sound.startSiren(true);
  }

  private checkGhostCollisions(masteryMult: number = 1.0) {
    for (const ghost of this.ghosts) {
      const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
      if (dist < 6.5) {
        if (ghost.mode === GhostMode.FRIGHTENED) {
          ghost.setMode(GhostMode.EATEN, false);
          const score = SCORES.GHOST[Math.min(this.ghostEatCombo, 3)];
          this.ghostEatCombo++;
          const finalScore = Math.floor(score * masteryMult);
          this.hud.addScore(finalScore);
          this.hud.showGhostScore(finalScore, ghost.x, ghost.y);
          this.sound.playEatGhost();
          this.economyService.addCoins(20);
          this.profileService.addXp(25);
          this.achievementManager.increment('coins_earned_total', 20);

          this.achievementManager.increment('ghosts_eaten_total', 1);
          const gName = ghost.name.toLowerCase();
          if (gName === 'blinky') this.achievementManager.increment('blinky_slayer', 1);
          else if (gName === 'pinky') this.achievementManager.increment('pinky_slayer', 1);
          else if (gName === 'inky') this.achievementManager.increment('inky_slayer', 1);
          else if (gName === 'clyde') this.achievementManager.increment('clyde_slayer', 1);

          if (this.ghostEatCombo === 4) {
            this.achievementManager.increment('quad_combos', 1);
            this.achievementManager.increment('ghost_combos_1600', 1);
          }

          if (ghost.freezeTimer > 0) {
            this.achievementManager.increment('freeze_kills', 1);
          }

          this.state = GameState.GHOST_PAUSE;
          this.stateTimer = 600;
          return;
        } else if (ghost.mode !== GhostMode.EATEN && ghost.mode !== GhostMode.IN_HOUSE) {
          if (this.powerUpManager.hasShield) {
            this.powerUpManager.breakShield(this.sound);
            this.achievementManager.increment('shield_deflections', 1);
            ghost.applyStun(2000);
            return;
          }

          if (ghost.stunTimer > 0 || ghost.freezeTimer > 0) {
            return;
          }

          if (this.gameMode === GameMode.GHOST_HUNTER) {
            this.hud.addScore(500);
            this.achievementManager.increment('ghost_hunter_wins', 1);
          }

          this.state = GameState.PACMAN_DYING;
          this.stateTimer = 1800;
          this.pacman.isDying = true;
          this.pacman.deathProgress = 0;
          this.sound.stopSiren();
          this.sound.playDeathSound();
          return;
        }
      }
    }
  }

  private render() {
    this.ctx.save();
    this.ctx.scale(this.renderScale, this.renderScale);

    this.ctx.fillStyle = this.maze.bgColor;
    this.ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // Chuva de código animada quando no tema Matrix
    if (this.themeManager.getTheme().id === ThemeType.MATRIX) {
      this.matrixRain.update(16.6);
      this.matrixRain.render(this.ctx);
    }

    this.maze.render(this.ctx);
    this.pelletManager.render(this.ctx);
    this.fruitManager.render(this.ctx);
    this.powerUpManager.render(this.ctx);

    if (this.state !== GameState.PACMAN_DYING && this.state !== GameState.GAME_OVER) {
      const isSlowed = this.economyService.getGhostSlowdownMultiplier() < 1.0;
      this.ghosts.forEach((ghost) => {
        if (isSlowed) {
          this.ctx.save();
          this.ctx.shadowColor = '#c084fc';
          this.ctx.shadowBlur = 6;
          ghost.render(this.ctx);
          this.ctx.restore();
        } else {
          ghost.render(this.ctx);
        }
      });
    }

    this.pacman.render(this.ctx);
    if (this.gameMode === GameMode.COOP_2P) {
      this.pacman2.render(this.ctx);
    }

    this.hud.render(
      this.ctx,
      this.pacman.lives,
      this.level,
      this.fruitManager,
      this.powerUpManager.getActiveState(),
      this.gameMode,
      this.pelletManager.getRemainingCount(),
      this.teleportCooldownTimer
    );

    if (this.state === GameState.ATTRACT) {
      this.renderAttractScreen();
    } else {
      if (this.attractOverlayEl) {
        this.attractOverlayEl.style.display = 'none';
      }
      if (this.state === GameState.READY) {
        this.ctx.save();
        ctxFormatText(
          this.ctx,
          'READY!',
          INTERNAL_WIDTH / 2,
          20 * 8,
          '#FFFF00',
          'bold 11px "Chakra Petch", "Segoe UI", Arial, sans-serif'
        );
        this.ctx.restore();
      } else if (this.state === GameState.GAME_OVER) {
        this.ctx.save();
        const overText =
          this.gameMode === GameMode.GHOST_HUNTER ? 'HUNTER WIN!' : 'GAME  OVER';
        ctxFormatText(
          this.ctx,
          overText,
          INTERNAL_WIDTH / 2,
          20 * 8,
          '#FF3333',
          'bold 12px "Chakra Petch", "Segoe UI", Arial, sans-serif'
        );
        ctxFormatText(
          this.ctx,
          'PRESS SPACE TO PLAY',
          INTERNAL_WIDTH / 2,
          23 * 8,
          '#FFFFFF',
          'bold 8.5px "Chakra Petch", "Segoe UI", Arial, sans-serif'
        );
        this.ctx.restore();
      }
    }

    if (this.isGamePaused) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      this.ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      ctxFormatText(
        this.ctx,
        'PAUSED',
        INTERNAL_WIDTH / 2,
        INTERNAL_HEIGHT / 2,
        '#FFFF00',
        'bold 13px "Chakra Petch", "Segoe UI", Arial, sans-serif'
      );
      this.ctx.restore();
    }

    if (this.input.isDebugActive()) {
      this.debugOverlay.render(
        this.ctx,
        this.ghosts,
        { x: this.pacman.tileX, y: this.pacman.tileY },
        this.pelletManager.getRemainingCount(),
        this.fps
      );
    }

    this.ctx.restore();
  }

  private renderAttractScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    this.ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    this.ctx.restore();

    if (!this.attractOverlayEl) {
      this.attractOverlayEl = document.getElementById('gameAttractOverlay');
    }

    if (this.attractOverlayEl) {
      this.attractOverlayEl.style.display = 'flex';

      let titleText = 'PAC-MAN';
      let titleColor = '#FFE600';

      if (this.gameMode === GameMode.GHOST_HUNTER) {
        titleText = '👻 GHOST HUNTER';
        titleColor = '#FF3333';
      } else if (this.gameMode === GameMode.COOP_2P) {
        titleText = '👥 PAC & MS. PAC';
        titleColor = '#FF69B4';
      } else if (this.gameMode === GameMode.TURBO) {
        titleText = '⚡ TURBO PAC ⚡';
        titleColor = '#FF5500';
      }

      this.attractOverlayEl.innerHTML = `
        <div class="overlay-main-title" style="color: ${titleColor};">${titleText}</div>
        <div class="overlay-section-label">CHARACTER / NICKNAME</div>

        <div class="overlay-ghost-table">
          <div class="overlay-ghost-row" style="color: #FF3333;">
            <span class="overlay-ghost-dot" style="background: #FF3333;"></span>
            <span class="overlay-ghost-nick">-SHADOW</span>
            <span class="overlay-ghost-name">"BLINKY"</span>
          </div>
          <div class="overlay-ghost-row" style="color: #FFB8FF;">
            <span class="overlay-ghost-dot" style="background: #FFB8FF;"></span>
            <span class="overlay-ghost-nick">-SPEEDY</span>
            <span class="overlay-ghost-name">"PINKY"</span>
          </div>
          <div class="overlay-ghost-row" style="color: #00FFFF;">
            <span class="overlay-ghost-dot" style="background: #00FFFF;"></span>
            <span class="overlay-ghost-nick">-BASHFUL</span>
            <span class="overlay-ghost-name">"INKY"</span>
          </div>
          <div class="overlay-ghost-row" style="color: #FFA726;">
            <span class="overlay-ghost-dot" style="background: #FFA726;"></span>
            <span class="overlay-ghost-nick">-POKEY</span>
            <span class="overlay-ghost-name">"CLYDE"</span>
          </div>
        </div>

        <div class="overlay-points-banner">🟡 10 PTS &nbsp;•&nbsp; ⚪ 50 PTS</div>

        <div class="overlay-start-prompt">
          <div class="overlay-start-text">PRESSIONE ESPAÇO / TOQUE</div>
          <div class="overlay-start-sub">PARA COMEÇAR</div>
        </div>

        <div class="overlay-footer-keys">
          <div>P1: SETAS &nbsp;|&nbsp; P2: WASD</div>
          <div style="color: #a5a5cc; font-size: 11px; margin-top: 3px;">M: SOM &nbsp;|&nbsp; P: PAUSA &nbsp;|&nbsp; H: DEBUG</div>
        </div>
      `;
    }
  }

  public getInputManager(): InputManager {
    return this.input;
  }
}

function ctxFormatText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font: string
) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}
