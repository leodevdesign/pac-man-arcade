import { Direction, DIRECTION } from './Constants.ts';

export class InputManager {
  private queuedDirectionP1: Direction = DIRECTION.NONE;
  private queuedDirectionP2: Direction = DIRECTION.NONE;
  private debugToggle: boolean = false;
  private onPauseCallback: (() => void) | null = null;
  private onMuteCallback: (() => void) | null = null;
  private onStartCallback: (() => void) | null = null;

  // Touch handling
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  constructor() {
    this.setupKeyboardListeners();
    this.setupTouchListeners();
  }

  public setOnPause(cb: () => void) { this.onPauseCallback = cb; }
  public setOnMute(cb: () => void) { this.onMuteCallback = cb; }
  public setOnStart(cb: () => void) { this.onStartCallback = cb; }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Evita rolagem da página
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // 1. Jogador 1 (Setas)
      switch (e.code) {
        case 'ArrowUp':
          this.queuedDirectionP1 = DIRECTION.UP;
          if (this.onStartCallback) this.onStartCallback();
          break;
        case 'ArrowDown':
          this.queuedDirectionP1 = DIRECTION.DOWN;
          if (this.onStartCallback) this.onStartCallback();
          break;
        case 'ArrowLeft':
          this.queuedDirectionP1 = DIRECTION.LEFT;
          if (this.onStartCallback) this.onStartCallback();
          break;
        case 'ArrowRight':
          this.queuedDirectionP1 = DIRECTION.RIGHT;
          if (this.onStartCallback) this.onStartCallback();
          break;

        // 2. Jogador 2 (WASD)
        case 'KeyW':
          this.queuedDirectionP2 = DIRECTION.UP;
          if (this.onStartCallback) this.onStartCallback();
          break;
        case 'KeyS':
          this.queuedDirectionP2 = DIRECTION.DOWN;
          if (this.onStartCallback) this.onStartCallback();
          break;
        case 'KeyA':
          this.queuedDirectionP2 = DIRECTION.LEFT;
          if (this.onStartCallback) this.onStartCallback();
          break;
        case 'KeyD':
          this.queuedDirectionP2 = DIRECTION.RIGHT;
          if (this.onStartCallback) this.onStartCallback();
          break;

        // Ações Globais
        case 'KeyP':
        case 'Escape':
          if (this.onPauseCallback) this.onPauseCallback();
          break;
        case 'KeyM':
          if (this.onMuteCallback) this.onMuteCallback();
          break;
        case 'KeyH':
        case 'F2':
        case 'Backquote':
          this.debugToggle = !this.debugToggle;
          break;
      }
    });
  }

  private setupTouchListeners() {
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        if (this.onStartCallback) this.onStartCallback();
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.touchStartY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > 20) {
          if (absX > absY) {
            this.queuedDirectionP1 = deltaX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
          } else {
            this.queuedDirectionP1 = deltaY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
          }
        }
      }
    }, { passive: false });
  }

  public setDirection(dir: Direction) {
    this.queuedDirectionP1 = dir;
    if (this.onStartCallback) this.onStartCallback();
  }

  public getQueuedDirectionP1(): Direction {
    return this.queuedDirectionP1;
  }

  public getQueuedDirectionP2(): Direction {
    return this.queuedDirectionP2;
  }

  public getQueuedDirection(): Direction {
    return this.queuedDirectionP1;
  }

  public setQueuedDirection(dir: Direction) {
    this.queuedDirectionP1 = dir;
  }

  public isDebugActive(): boolean {
    return this.debugToggle;
  }

  public toggleDebug(): boolean {
    this.debugToggle = !this.debugToggle;
    return this.debugToggle;
  }

  public reset() {
    this.queuedDirectionP1 = DIRECTION.NONE;
    this.queuedDirectionP2 = DIRECTION.NONE;
  }
}
