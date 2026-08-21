import {
  Direction,
  DIRECTION,
  OPPOSITE_DIRECTION,
  GhostMode,
  MAZE_COLS,
} from '../core/Constants.ts';
import { Maze } from '../map/Maze.ts';
import { PelletManager } from '../map/PelletManager.ts';
import { Ghost } from '../entities/Ghost.ts';
import { Pacman } from '../entities/Pacman.ts';

export class PacmanAI {
  private static DANGER_RADIUS_TILES = 5;

  public static calculateNextDirection(
    pacman: Pacman,
    maze: Maze,
    pelletManager: PelletManager,
    ghosts: Ghost[]
  ): Direction {
    const startCol = pacman.tileX;
    const startRow = pacman.tileY;
    const currentDir = pacman.direction;

    const validDirections: Direction[] = [
      DIRECTION.UP,
      DIRECTION.LEFT,
      DIRECTION.DOWN,
      DIRECTION.RIGHT,
    ];

    // Filtra apenas direções caminháveis
    const walkableDirs = validDirections.filter((dir) => {
      const nc = startCol + dir.x;
      const nr = startRow + dir.y;
      return maze.isWalkableForPacman(nc, nr);
    });

    if (walkableDirs.length === 0) return currentDir;
    if (walkableDirs.length === 1) return walkableDirs[0];

    // 1. Checa Fantasmas Próximos
    const dangerousGhosts = ghosts.filter(
      (g) =>
        g.mode !== GhostMode.EATEN &&
        g.mode !== GhostMode.FRIGHTENED &&
        g.mode !== GhostMode.IN_HOUSE &&
        g.stunTimer <= 0 &&
        g.freezeTimer <= 0
    );

    const frightenedGhosts = ghosts.filter(
      (g) => g.mode === GhostMode.FRIGHTENED
    );

    // 2. Fuga de Fantasmas Perigosos
    let closestDangerousGhost: Ghost | null = null;
    let minGhostDist = Infinity;

    for (const g of dangerousGhosts) {
      const dist = Math.hypot(g.tileX - startCol, g.tileY - startRow);
      if (dist < minGhostDist) {
        minGhostDist = dist;
        closestDangerousGhost = g;
      }
    }

    if (closestDangerousGhost && minGhostDist <= this.dangerRadiusTiles()) {
      let bestDir: Direction = walkableDirs[0];
      let maxSafetyScore = -Infinity;

      for (const dir of walkableDirs) {
        const nextCol = startCol + dir.x;
        const nextRow = startRow + dir.y;
        const distToGhost = Math.hypot(
          nextCol - closestDangerousGhost.tileX,
          nextRow - closestDangerousGhost.tileY
        );

        let safetyScore = distToGhost;
        // Evita reverter a direção desnecessariamente se houver caminho aberto
        if (dir.name === OPPOSITE_DIRECTION[currentDir.name]?.name) {
          safetyScore -= 0.5;
        }

        if (safetyScore > maxSafetyScore) {
          maxSafetyScore = safetyScore;
          bestDir = dir;
        }
      }
      return bestDir;
    }

    // 3. Caça a Fantasmas Assustados (Modo Caçador)
    if (frightenedGhosts.length > 0) {
      let closestBlue: Ghost = frightenedGhosts[0];
      let minBlueDist = Infinity;
      for (const g of frightenedGhosts) {
        const dist = Math.hypot(g.tileX - startCol, g.tileY - startRow);
        if (dist < minBlueDist) {
          minBlueDist = dist;
          closestBlue = g;
        }
      }

      let bestDir: Direction = walkableDirs[0];
      let minChaseDist = Infinity;
      for (const dir of walkableDirs) {
        const nextCol = startCol + dir.x;
        const nextRow = startRow + dir.y;
        const dist = Math.hypot(nextCol - closestBlue.tileX, nextRow - closestBlue.tileY);
        if (dist < minChaseDist) {
          minChaseDist = dist;
          bestDir = dir;
        }
      }
      return bestDir;
    }

    // 4. Busca da Pastilha / Energizer mais Próximo via BFS
    const targetTile = this.findNearestPelletBFS(startCol, startRow, maze, pelletManager);
    if (targetTile) {
      let bestDir: Direction = walkableDirs[0];
      let minPelletDist = Infinity;

      for (const dir of walkableDirs) {
        const nextCol = startCol + dir.x;
        const nextRow = startRow + dir.y;
        const dist = Math.hypot(nextCol - targetTile.col, nextRow - targetTile.row);

        let score = dist;
        // Preferência por manter a linha reta
        if (dir.name === currentDir.name) score -= 0.2;

        if (score < minPelletDist) {
          minPelletDist = score;
          bestDir = dir;
        }
      }
      return bestDir;
    }

    // Fallback: mantém direção atual se puder, senão escolhe a primeira válida
    return walkableDirs.includes(currentDir) ? currentDir : walkableDirs[0];
  }

  private static dangerRadiusTiles(): number {
    return this.DANGER_RADIUS_TILES;
  }

  private static findNearestPelletBFS(
    startCol: number,
    startRow: number,
    maze: Maze,
    pelletManager: PelletManager
  ): { col: number; row: number } | null {
    const queue: { col: number; row: number }[] = [{ col: startCol, row: startRow }];
    const visited = new Set<string>();
    visited.add(`${startCol},${startRow}`);

    const directions = [
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ];

    while (queue.length > 0) {
      const curr = queue.shift()!;

      if (pelletManager.isPellet(curr.col, curr.row)) {
        return curr;
      }

      for (const d of directions) {
        const nc = curr.col + d.x;
        const nr = curr.row + d.y;
        const key = `${nc},${nr}`;

        if (
          nc >= 0 &&
          nc < MAZE_COLS &&
          nr >= 3 &&
          nr <= 33 &&
          !visited.has(key) &&
          maze.isWalkableForPacman(nc, nr)
        ) {
          visited.add(key);
          queue.push({ col: nc, row: nr });
        }
      }
    }

    return null;
  }
}
