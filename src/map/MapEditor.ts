import { MAZE_COLS, MAZE_ROWS, TILE_SIZE } from '../core/Constants.ts';
import { MapConfig } from './MapRegistry.ts';
import { ORIGINAL_MAZE_MAP, TileType } from './MazeData.ts';

export class MapEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentGrid: number[][];
  private selectedTool: TileType = TileType.WALL;
  private symmetryMode: boolean = true;
  private isDrawing: boolean = false;
  private onPlayCallback: ((config: MapConfig) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = MAZE_COLS * TILE_SIZE;
    this.canvas.height = MAZE_ROWS * TILE_SIZE;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível obter contexto para o MapEditor');
    this.ctx = context;

    this.currentGrid = this.loadSavedMap() || ORIGINAL_MAZE_MAP.map((r) => [...r]);
    this.setupMouseEvents();
    this.render();
  }

  public setOnPlay(cb: (config: MapConfig) => void) {
    this.onPlayCallback = cb;
  }

  public setTool(tool: TileType) {
    this.selectedTool = tool;
  }

  public toggleSymmetry(): boolean {
    this.symmetryMode = !this.symmetryMode;
    return this.symmetryMode;
  }

  public resetToDefault() {
    this.currentGrid = ORIGINAL_MAZE_MAP.map((r) => [...r]);
    this.render();
  }

  public clearAll() {
    this.currentGrid = Array.from({ length: MAZE_ROWS }, () =>
      Array(MAZE_COLS).fill(TileType.DOT)
    );
    // Preserva HUD e bordas
    for (let c = 0; c < MAZE_COLS; c++) {
      this.currentGrid[0][c] = TileType.VOID;
      this.currentGrid[1][c] = TileType.VOID;
      this.currentGrid[2][c] = TileType.VOID;
      this.currentGrid[34][c] = TileType.VOID;
      this.currentGrid[35][c] = TileType.VOID;
      this.currentGrid[3][c] = TileType.WALL;
      this.currentGrid[33][c] = TileType.WALL;
    }
    for (let r = 3; r <= 33; r++) {
      this.currentGrid[r][0] = TileType.WALL;
      this.currentGrid[r][MAZE_COLS - 1] = TileType.WALL;
    }
    this.render();
  }

  private setupMouseEvents() {
    const handleDraw = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const col = Math.floor(clickX / TILE_SIZE);
      const row = Math.floor(clickY / TILE_SIZE);

      if (row >= 3 && row <= 33 && col >= 0 && col < MAZE_COLS) {
        this.currentGrid[row][col] = this.selectedTool;
        if (this.symmetryMode) {
          const mirroredCol = MAZE_COLS - 1 - col;
          this.currentGrid[row][mirroredCol] = this.selectedTool;
        }
        this.render();
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      handleDraw(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) handleDraw(e);
    });

    window.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });
  }

  public saveToStorage() {
    localStorage.setItem('pacman_custom_map', JSON.stringify(this.currentGrid));
  }

  private loadSavedMap(): number[][] | null {
    const saved = localStorage.getItem('pacman_custom_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  }

  public exportJson(): string {
    return JSON.stringify(this.currentGrid, null, 2);
  }

  public importJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length === MAZE_ROWS) {
        this.currentGrid = parsed;
        this.render();
        return true;
      }
    } catch {
      // Ignora erro
    }
    return false;
  }

  public getMapConfig(): MapConfig {
    this.saveToStorage();
    return {
      id: 'custom_editor_map',
      name: '🛠️ Meu Mapa Customizado',
      category: 'custom',
      wallColor: '#00FFCC',
      doorColor: '#FF00EA',
      tunnelRows: [17],
      map: this.currentGrid.map((r) => [...r]),
      pacmanSpawn: { x: 13.5, y: 26 },
      ghostHouseExit: { x: 13.5, y: 14 },
    };
  }

  public playCurrentMap() {
    const config = this.getMapConfig();
    if (this.onPlayCallback) {
      this.onPlayCallback(config);
    }
  }

  public render() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < MAZE_ROWS; r++) {
      for (let c = 0; c < MAZE_COLS; c++) {
        const tile = this.currentGrid[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === TileType.WALL) {
          this.ctx.fillStyle = '#00FFCC';
          this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        } else if (tile === TileType.DOT) {
          this.ctx.fillStyle = '#FFB8AE';
          this.ctx.fillRect(x + 3, y + 3, 2, 2);
        } else if (tile === TileType.ENERGIZER) {
          this.ctx.fillStyle = '#FFB8AE';
          this.ctx.beginPath();
          this.ctx.arc(x + 4, y + 4, 3, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === TileType.GHOST_DOOR) {
          this.ctx.fillStyle = '#FF00EA';
          this.ctx.fillRect(x, y + 3, TILE_SIZE, 2);
        } else if (tile === TileType.WARP_TUNNEL) {
          this.ctx.fillStyle = '#FFA726';
          this.ctx.fillRect(x, y + 2, TILE_SIZE, 4);
        } else if (tile === TileType.VOID) {
          this.ctx.fillStyle = '#101018';
          this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Linha guia central para simetria
    if (this.symmetryMode) {
      this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width / 2, 0);
      this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
      this.ctx.stroke();
    }
  }
}
