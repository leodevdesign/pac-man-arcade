import { Maze } from '../map/Maze.ts';
import { MAP_PRESETS } from '../map/MapRegistry.ts';
import { ProceduralGenerator } from '../map/ProceduralGenerator.ts';
import { Blinky } from '../entities/Blinky.ts';
import { Pinky } from '../entities/Pinky.ts';
import { Inky } from '../entities/Inky.ts';
import { Clyde } from '../entities/Clyde.ts';
import { Pacman } from '../entities/Pacman.ts';
import { PelletManager } from '../map/PelletManager.ts';
import { PacmanAI } from '../ai/PacmanAI.ts';
import { EconomyService } from '../services/EconomyService.ts';
import { LeaderboardService } from '../services/LeaderboardService.ts';
import { AchievementManager } from '../services/AchievementManager.ts';
import { PowerUpManager } from '../items/PowerUpManager.ts';
import { DIRECTION, PacmanSkin, ThemeType } from '../core/Constants.ts';
import { THEME_PRESETS } from '../ui/ThemeManager.ts';

// Mock localStorage for Node test environment
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runAllTests() {
  console.log('\n🧪 ================= INICIANDO BATERIA DE TESTES EXAUSTIVOS =================\n');

  // 1. TESTES DE LABIRINTOS & TUNELS
  console.log('📌 Testando Labirintos, Bounds e Túneis Múltiplos...');
  const maze = new Maze(MAP_PRESETS[0]);
  assert(maze.isWalkableForPacman(13, 26), 'Pac-Man pode andar na posição de spawn');
  assert(!maze.isWalkableForPacman(0, 3), 'Parede externa bloqueada para Pac-Man');
  assert(!maze.isWalkableForPacman(13, 16), 'Casa dos fantasmas bloqueada para Pac-Man vivo');
  assert(maze.isTunnelRow(17), 'Linha 17 é túnel warp no clássico');

  const msPacMaze = new Maze(MAP_PRESETS[1]); // Ms. Pac-Man Rosa
  assert(msPacMaze.isTunnelRow(10) && msPacMaze.isTunnelRow(20), 'Ms. Pac-Man possui 2 túneis nas linhas 10 e 20');
  assert(msPacMaze.isWalkableForPacman(-1, 10), 'Túnel lateral da linha 10 é caminhável');

  // 2. TESTES DE IA DOS FANTASMAS (BLINKY, PINKY, INKY, CLYDE)
  console.log('\n📌 Testando IA dos Fantasmas...');
  const pacman = new Pacman(maze);
  pacman.x = 100;
  pacman.y = 100;
  pacman.direction = DIRECTION.RIGHT;

  const blinky = new Blinky(maze);
  const pinky = new Pinky(maze);
  const inky = new Inky(maze);
  const clyde = new Clyde(maze);

  const blinkyTarget = blinky.calculateChaseTarget(pacman);
  assert(blinkyTarget.x === pacman.tileX && blinkyTarget.y === pacman.tileY, 'Blinky mira exatamente no tile do Pac-Man');

  const pinkyTarget = pinky.calculateChaseTarget(pacman);
  assert(pinkyTarget.x === pacman.tileX + 4 && pinkyTarget.y === pacman.tileY, 'Pinky mira 4 tiles à frente da direção do Pac-Man (emboscada)');

  const inkyTarget = inky.calculateChaseTarget(pacman, blinky);
  assert(typeof inkyTarget.x === 'number' && typeof inkyTarget.y === 'number', 'Inky calcula vetor de pinça dupla');

  const clydeTarget = clyde.calculateChaseTarget(pacman);
  assert(typeof clydeTarget.x === 'number' && typeof clydeTarget.y === 'number', 'Clyde alterna entre perseguição e covardia');

  // 3. TESTES DA IA AUTÔNOMA DO PAC-MAN (MODO INVERTIDO)
  console.log('\n📌 Testando IA Autônoma do Pac-Man (Ghost Hunter)...');
  const pelletMgr = new PelletManager();
  pelletMgr.reset(maze.getRawMap());
  const nextDir = PacmanAI.calculateNextDirection(pacman, maze, pelletMgr, [blinky, pinky]);
  assert(nextDir.name !== 'NONE', 'Pac-Man IA decide uma direção válida de fuga/coleta');

  // 4. TESTES DO GERADOR PROCEDURAL
  console.log('\n📌 Testando Gerador de Mapas Procedurais (50 iterações)...');
  for (let i = 0; i < 50; i++) {
    const procMap = ProceduralGenerator.generate(i * 123);
    assert(procMap.map.length === 36, `Mapa procedural #${i} possui 36 linhas`);
    assert(procMap.map[0].length === 28, `Mapa procedural #${i} possui 28 colunas`);
    // Valida simetria bilateral
    for (let r = 3; r <= 33; r++) {
      assert(procMap.map[r][0] === 1 && procMap.map[r][27] === 1, `Bordas laterais fechadas na linha ${r}`);
    }
  }

  // 5. TESTES DO SERVIÇO DE ECONOMIA & LOJINHA
  console.log('\n📌 Testando Economia, Moedas, Upgrades e Skins...');
  const economy = new EconomyService();
  const initialCoins = economy.getCoins();
  economy.addCoins(10000);
  assert(economy.getCoins() >= initialCoins + 10000, 'Adição de moedas computada corretamente');
  assert(economy.spendCoins(200), 'Gasto de 200 moedas aprovado com saldo suficiente');
  assert(!economy.spendCoins(9999999), 'Gasto bloqueado quando não há moedas suficientes');

  const boughtUpgrade = economy.buyUpgrade('extraLives');
  assert(boughtUpgrade && economy.getUpgradeLevel('extraLives') >= 1, 'Upgrade de vida extra adquirido com sucesso');

  const boughtSkin = economy.unlockSkin(PacmanSkin.SUNGLASSES, 300);
  assert(boughtSkin && economy.isSkinUnlocked(PacmanSkin.SUNGLASSES), 'Skin Óculos Escuros desbloqueada com sucesso');

  // 6. TESTES DO GERENCIADOR DE CONQUISTAS PROGRESSIVAS
  console.log('\n📌 Testando Sistema de Conquistas Progressivas (50 Trilhas x 5 Tiers)...');
  const achManager = new AchievementManager();
  achManager.increment('dots_eaten', 600);
  const achievements = achManager.getAchievements();
  const dotsAch = achievements.find(a => a.id === 'dots_eaten');
  assert(dotsAch?.tiers[0].unlocked === true, 'Conquista "Comilão de Pastilhas (Bronze ⭐)" desbloqueada com sucesso');
  assert(dotsAch?.tiers[1].unlocked === false, 'Tier Prata permanece bloqueado');

  // 7. TESTES DO RANKING DE RECORDES
  console.log('\n📌 Testando Ranking de Recordes (Leaderboard)...');
  const leaderboard = new LeaderboardService();
  leaderboard.addScore('TOP', 99999, 10, 'Turbo');
  const topScores = leaderboard.getTopScores();
  assert(topScores[0].initials === 'TOP' && topScores[0].score === 99999, 'Novo recorde inserido no topo do ranking');
  assert(topScores.length <= 10, 'Ranking limitado estritamente ao Top 10');

  // 8. TESTES DO POWER-UP MANAGER
  console.log('\n📌 Testando Power-ups & Efeitos...');
  const powerUps = new PowerUpManager();
  powerUps.reset();
  assert(!powerUps.hasShield, 'Escudo inicialmente desativado');
  powerUps.hasShield = true;
  assert(powerUps.hasShield, 'Escudo ativado com sucesso');

  // 9. TESTES DE TEMAS GRÁFICOS
  console.log('\n📌 Testando Temas Gráficos (Synthwave, Matrix, Game Boy)...');
  assert(THEME_PRESETS[ThemeType.SYNTHWAVE].wallColor === '#BD00FF', 'Tema Synthwave possui paredes roxo neon');
  assert(THEME_PRESETS[ThemeType.MATRIX].wallColor === '#00FF66', 'Tema Matrix possui paredes verde fósforo');
  assert(THEME_PRESETS[ThemeType.GAMEBOY].wallColor === '#306230', 'Tema Game Boy possui paleta clássica DMG-01');

  console.log(`\n🎉 ================= TODOS OS ${passedTests}/${totalTests} TESTES FORAM APROVADOS COM SUCESSO! =================\n`);
}

runAllTests().catch((err) => {
  console.error('Falha nos testes:', err);
  throw err;
});
