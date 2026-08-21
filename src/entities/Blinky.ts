import { Ghost, TilePos } from './Ghost.ts';
import { GhostName, BASE_SPEED } from '../core/Constants.ts';
import { GHOST_SPAWN_TILES, SCATTER_TILES } from '../map/MazeData.ts';
import { Maze } from '../map/Maze.ts';
import { Pacman } from './Pacman.ts';

export class Blinky extends Ghost {
  public elroyLevel: number = 0; // 0 = Normal, 1 = Elroy 1 (+5%), 2 = Elroy 2 (+10%)

  constructor(maze: Maze) {
    super(
      maze,
      GhostName.BLINKY,
      GHOST_SPAWN_TILES.BLINKY,
      SCATTER_TILES.BLINKY,
      false, // Blinky começa fora da casa
      0
    );
  }

  public updateElroy(remainingDots: number) {
    if (remainingDots <= 10) {
      this.elroyLevel = 2;
      this.speed = BASE_SPEED * 0.85;
    } else if (remainingDots <= 20) {
      this.elroyLevel = 1;
      this.speed = BASE_SPEED * 0.80;
    } else {
      this.elroyLevel = 0;
    }
  }

  public calculateChaseTarget(pacman: Pacman): TilePos {
    // Blinky persegue diretamente a posição atual do Pac-Man
    return {
      x: pacman.tileX,
      y: pacman.tileY,
    };
  }
}
