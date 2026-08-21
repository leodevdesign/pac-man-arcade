import { Ghost, TilePos } from './Ghost.ts';
import { GhostName, DIRECTION } from '../core/Constants.ts';
import { GHOST_SPAWN_TILES, SCATTER_TILES } from '../map/MazeData.ts';
import { Maze } from '../map/Maze.ts';
import { Pacman } from './Pacman.ts';

export class Pinky extends Ghost {
  constructor(maze: Maze) {
    super(
      maze,
      GhostName.PINKY,
      GHOST_SPAWN_TILES.PINKY,
      SCATTER_TILES.PINKY,
      true,
      1000 // Sai 1 segundo após o início
    );
  }

  public calculateChaseTarget(pacman: Pacman): TilePos {
    // Pinky mira 4 tiles à frente da direção atual do Pac-Man
    let targetX = pacman.tileX + pacman.direction.x * 4;
    let targetY = pacman.tileY + pacman.direction.y * 4;

    // Bug autêntico do arcade original de 1980: Se Pac-Man estiver olhando para CIMA,
    // o vetor também desloca 4 tiles para a ESQUERDA por causa de um overflow na CPU Z80
    if (pacman.direction.name === DIRECTION.UP.name) {
      targetX -= 4;
    }

    return { x: targetX, y: targetY };
  }
}
