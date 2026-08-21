import { Ghost, TilePos } from './Ghost.ts';
import { GhostName, DIRECTION } from '../core/Constants.ts';
import { GHOST_SPAWN_TILES, SCATTER_TILES } from '../map/MazeData.ts';
import { Maze } from '../map/Maze.ts';
import { Pacman } from './Pacman.ts';

export class Inky extends Ghost {
  constructor(maze: Maze) {
    super(
      maze,
      GhostName.INKY,
      GHOST_SPAWN_TILES.INKY,
      SCATTER_TILES.INKY,
      true,
      3000 // Sai 3 segundos após o início
    );
  }

  public calculateChaseTarget(pacman: Pacman, blinky?: Ghost): TilePos {
    // 1. Ponto intermediário: 2 tiles à frente do Pac-Man
    let pivotX = pacman.tileX + pacman.direction.x * 2;
    let pivotY = pacman.tileY + pacman.direction.y * 2;

    // Bug histórico ao olhar para cima
    if (pacman.direction.name === DIRECTION.UP.name) {
      pivotX -= 2;
    }

    const blinkyTileX = blinky ? blinky.tileX : this.tileX;
    const blinkyTileY = blinky ? blinky.tileY : this.tileY;

    // 2. Traça o vetor do Blinky até o ponto intermediário e dobra
    const vecX = pivotX - blinkyTileX;
    const vecY = pivotY - blinkyTileY;

    return {
      x: blinkyTileX + vecX * 2,
      y: blinkyTileY + vecY * 2,
    };
  }
}
