import { Ghost } from '../entities/Ghost.ts';
import { GHOST_COLORS, TILE_SIZE, GhostName } from '../core/Constants.ts';

export class DebugOverlay {
  public render(
    ctx: CanvasRenderingContext2D,
    ghosts: Ghost[],
    pacmanTile: { x: number; y: number },
    remainingDots: number,
    fps: number
  ) {
    ctx.save();

    // 1. Desenha linhas de mira e alvos de cada fantasma
    ghosts.forEach((ghost) => {
      const color = GHOST_COLORS[ghost.name as GhostName] || '#FFFFFF';
      const targetPxX = ghost.targetTile.x * TILE_SIZE + TILE_SIZE / 2;
      const targetPxY = ghost.targetTile.y * TILE_SIZE + TILE_SIZE / 2;

      // Linha pontilhada até o alvo
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(ghost.x, ghost.y);
      ctx.lineTo(targetPxX, targetPxY);
      ctx.stroke();

      // Quadrado de alvo
      ctx.fillStyle = color;
      ctx.fillRect(targetPxX - 2, targetPxY - 2, 4, 4);
    });

    ctx.setLineDash([]);

    // 2. Painel de Status no Topo do Debug
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(4, 25, 216, 50);

    ctx.fillStyle = '#00FF00';
    ctx.font = '7px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`FPS: ${fps.toFixed(1)} | DOTS: ${remainingDots} | PAC: (${pacmanTile.x},${pacmanTile.y})`, 8, 34);

    ghosts.forEach((g, idx) => {
      const color = GHOST_COLORS[g.name as GhostName] || '#FFFFFF';
      ctx.fillStyle = color;
      const modeStr = `${g.name[0]}: ${g.mode} -> (${g.targetTile.x},${g.targetTile.y})`;
      ctx.fillText(modeStr, 8, 44 + idx * 7.5);
    });

    ctx.restore();
  }
}
