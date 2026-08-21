import { Ghost, TilePos } from './Ghost.ts';
import { GhostName } from '../core/Constants.ts';
import { GHOST_SPAWN_TILES, SCATTER_TILES } from '../map/MazeData.ts';
import { Maze } from '../map/Maze.ts';
import { Pacman } from './Pacman.ts';

export class Clyde extends Ghost {
  constructor(maze: Maze) {
    super(
      maze,
      GhostName.CLYDE,
      GHOST_SPAWN_TILES.CLYDE,
      SCATTER_TILES.CLYDE,
      true,
      5000 // Sai 5 segundos após o início
    );
  }

  public calculateChaseTarget(pacman: Pacman): TilePos {
    // Calcula a distância euclidiana em tiles até o Pac-Man
    const dx = this.tileX - pacman.tileX;
    const dy = this.tileY - pacman.tileY;
    const distanceTiles = Math.sqrt(dx * dx + dy * dy);

    // Se estiver a 8 tiles ou mais de distância, persegue o Pac-Man diretamente
    if (distanceTiles >= 8) {
      return {
        x: pacman.tileX,
        y: pacman.tileY,
      };
    }

    // Se estiver a menos de 8 tiles, foge para o seu canto de Scatter (canto inferior esquerdo)
    return this.scatterTile;
  }
}
