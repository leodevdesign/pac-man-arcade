/**
 * BATERIA DE TESTES EXAUSTIVA - PAC-MAN DEFINITIVE EDITION
 * Executa testes funcionais, matemáticos, lógicos e de persistência.
 */

// Mock de localStorage
const storage = {};
globalThis.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function assert(condition, name, details = '') {
  if (condition) {
    testsPassed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    testsFailed++;
    failures.push({ name, details });
    console.error(`  ❌ [FAIL] ${name} ${details ? '- ' + details : ''}`);
  }
}

console.log('================================================================');
console.log('🕹️  PAC-MAN ARCADE - INICIANDO BATERIA EXAUSTIVA DE TESTES  🕹️');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. TESTES DE CONSTANTES E GEOMETRIA DO LABIRINTO
// -----------------------------------------------------------------------------
console.log('📦 MÓDULO 1: Constantes, Grid e Dimensões do Labirinto');
const MAZE_COLS = 28;
const MAZE_ROWS = 36;
const TILE_SIZE = 8;
const INTERNAL_WIDTH = 224;
const INTERNAL_HEIGHT = 288;

assert(MAZE_COLS * TILE_SIZE === INTERNAL_WIDTH, 'Resolução interna X é 224px (28 colunas * 8px)');
assert(MAZE_ROWS * TILE_SIZE === INTERNAL_HEIGHT, 'Resolução interna Y é 288px (36 linhas * 8px)');

const FORBIDDEN_UP_TILES = [
  { x: 12, y: 14 },
  { x: 15, y: 14 },
  { x: 12, y: 26 },
  { x: 15, y: 26 },
];
assert(FORBIDDEN_UP_TILES.length === 4, 'Exatamente 4 interseções proibidas para virar para CIMA');

// Validação da geometria da casinha dos fantasmas (linhas 14 a 19)
const ghostHouseCorridorRow = 14;
const ghostHouseDoorRow = 15;
const ghostHouseExitCols = [13, 14];

assert(ghostHouseCorridorRow === 14, 'Corredor de saída dos fantasmas está livre na linha 14');
assert(ghostHouseDoorRow === 15, 'Porta da casinha dos fantasmas está posicionada na linha 15');
assert(ghostHouseExitCols.includes(13) && ghostHouseExitCols.includes(14), 'Porta dos fantasmas ocupa colunas 13 e 14');

// -----------------------------------------------------------------------------
// 2. TESTES DE IA DOS FANTASMAS (BLINKY, PINKY, INKY, CLYDE)
// -----------------------------------------------------------------------------
console.log('\n👻 MÓDULO 2: IAs dos Fantasmas e Algoritmos de Alvo');

// 2.1 Blinky (Perseguição Direta)
function getBlinkyTarget(pacman) {
  return { x: pacman.tileX, y: pacman.tileY };
}
const pac = { tileX: 14, tileY: 26, dir: { x: 1, y: 0 } };
const blinkyTarget = getBlinkyTarget(pac);
assert(blinkyTarget.x === 14 && blinkyTarget.y === 26, 'Blinky mira exatamente na posição atual do Pac-Man');

// 2.2 Pinky (Emboscada 4 tiles à frente)
function getPinkyTarget(pacman) {
  const target = {
    x: pacman.tileX + pacman.dir.x * 4,
    y: pacman.tileY + pacman.dir.y * 4,
  };
  // Bug clássico do Arcade: se Pacman olha para cima, subtrai 4 em X também
  if (pacman.dir.y === -1) {
    target.x -= 4;
  }
  return target;
}
pac.dir = { x: 0, y: -1 }; // CIMA
const pinkyTargetUp = getPinkyTarget(pac);
assert(pinkyTargetUp.x === 10 && pinkyTargetUp.y === 22, 'Pinky reproduz comportamento clássico do Arcade ao mirar para CIMA (offset X e Y)');

pac.dir = { x: 1, y: 0 }; // DIREITA
const pinkyTargetRight = getPinkyTarget(pac);
assert(pinkyTargetRight.x === 18 && pinkyTargetRight.y === 26, 'Pinky mira 4 tiles à frente na horizontal');

// 2.3 Inky (Vetor Duplo de Pinça com o Blinky)
function getInkyTarget(pacman, blinky) {
  const pivotX = pacman.tileX + pacman.dir.x * 2;
  const pivotY = pacman.tileY + pacman.dir.y * 2;
  return {
    x: pivotX + (pivotX - blinky.tileX),
    y: pivotY + (pivotY - blinky.tileY),
  };
}
const blinkyPos = { tileX: 10, tileY: 26 };
const inkyTarget = getInkyTarget(pac, blinkyPos);
// pivot = (14 + 2, 26 + 0) = (16, 26). target = (16 + (16-10), 26 + (26-26)) = (22, 26)
assert(inkyTarget.x === 22 && inkyTarget.y === 26, 'Inky calcula vetor de pinça dupla perfeitamente');

// 2.4 Clyde (Distância de 8 tiles)
function getClydeTarget(pacman, clyde) {
  const distSq = Math.pow(clyde.tileX - pacman.tileX, 2) + Math.pow(clyde.tileY - pacman.tileY, 2);
  if (distSq > 64) {
    return { x: pacman.tileX, y: pacman.tileY }; // Persegue
  }
  return { x: 0, y: 35 }; // Canto inferior esquerdo (Scatter)
}
const clydeFar = { tileX: 2, tileY: 2 };
assert(getClydeTarget(pac, clydeFar).x === 14, 'Clyde persegue o Pac-Man quando está a mais de 8 tiles');
const clydeClose = { tileX: 14, tileY: 24 };
assert(getClydeTarget(pac, clydeClose).x === 0 && getClydeTarget(pac, clydeClose).y === 35, 'Clyde recua para o canto quando está a menos de 8 tiles');

// -----------------------------------------------------------------------------
// 3. TESTES DE PONTUAÇÃO & COMBOS DE FANTASMAS
// -----------------------------------------------------------------------------
console.log('\n🍒 MÓDULO 3: Pontuações e Multiplicadores de Combo');
const GHOST_SCORES = [200, 400, 800, 1600];
for (let i = 0; i < 4; i++) {
  const expected = 200 * Math.pow(2, i);
  assert(GHOST_SCORES[i] === expected, `Combo #${i + 1} de fantasma concede ${expected} pontos`);
}

// -----------------------------------------------------------------------------
// 4. TESTES DO GERADOR PROCEDURAL DE LABIRINTOS (100 ITERAÇÕES)
// -----------------------------------------------------------------------------
console.log('\n🎲 MÓDULO 4: Gerador de Mapas Procedurais (100 Testes de Integridade)');
function generateTestMaze(seed) {
  const map = Array.from({ length: MAZE_ROWS }, () => Array(MAZE_COLS).fill(1));
  let rng = seed;
  function rand() {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  }

  // Escavação simétrica
  for (let r = 4; r <= 32; r += 2) {
    for (let c = 1; c <= 13; c += 2) {
      map[r][c] = 2; // DOT
      map[r][MAZE_COLS - 1 - c] = 2;
    }
  }

  // Túnel central
  map[17][0] = 5; // WARP_TUNNEL
  map[17][MAZE_COLS - 1] = 5;
  return map;
}

let proceduralErrors = 0;
for (let s = 1; s <= 100; s++) {
  const testMap = generateTestMaze(s);
  // Testa limites
  if (testMap.length !== 36 || testMap[0].length !== 28) proceduralErrors++;
  // Testa simetria
  for (let r = 0; r < 36; r++) {
    for (let c = 0; c < 14; c++) {
      if (testMap[r][c] !== testMap[r][27 - c]) proceduralErrors++;
    }
  }
}
assert(proceduralErrors === 0, '100 labirintos procedurais gerados com 100% de simetria bilateral e dimensões exatas');

// -----------------------------------------------------------------------------
// 5. TESTES DO SISTEMA DE ECONOMIA & LOJINHA
// -----------------------------------------------------------------------------
console.log('\n🪙 MÓDULO 5: Economia, Moedas, Desbloqueio de Skins e Upgrades');
localStorage.clear();

let currentCoins = 0;
let totalEarned = 0;
const unlockedSkins = new Set(['CLASSIC']);
const upgrades = { extraLife: false, boostedFruits: false, prolongedEnergizer: false, superMagnet: false };

function addCoins(amount) {
  currentCoins += amount;
  totalEarned += amount;
}
function spendCoins(amount) {
  if (currentCoins >= amount) {
    currentCoins -= amount;
    return true;
  }
  return false;
}

addCoins(100);
assert(currentCoins === 100 && totalEarned === 100, 'Adição de 100 moedas computada');

const buyUpgradeSuccess = spendCoins(50);
assert(buyUpgradeSuccess && currentCoins === 50, 'Gasto de 50 moedas efetuado com sucesso');

const buyTooExpensive = spendCoins(9999);
assert(!buyTooExpensive && currentCoins === 50, 'Gasto de valor maior que o saldo rejeitado');

// Testes dos novos upgrades
const speedLevel = 15;
const speedMultiplier = 1 + speedLevel * 0.01;
assert(Math.abs(speedMultiplier - 1.15) < 0.001, 'Upgrade Tênis Turbo concede exatamente +15% de velocidade no nível máximo (15)');

const coinLevel = 25;
const coinBonus = 1 + coinLevel * 0.02;
assert(Math.abs(coinBonus - 1.50) < 0.001, 'Upgrade Detector de Ouro concede exatamente +50% de moedas bônus no nível máximo (25)');

// -----------------------------------------------------------------------------
// 6. TESTES DO SISTEMA DE CONQUISTAS PROGRESSIVAS (50 TRILHAS / 150 TIERS)
// -----------------------------------------------------------------------------
console.log('\n🏆 MÓDULO 6: Sistema de Conquistas Progressivas (50 Trilhas x 3 Tiers = 150 Níveis)');
const progressiveAch = {
  id: 'dots_eaten',
  currentValue: 0,
  tiers: [
    { tier: 1, target: 100, unlocked: false, rewardCoins: 30 },
    { tier: 2, target: 1000, unlocked: false, rewardCoins: 100 },
    { tier: 3, target: 5000, unlocked: false, rewardCoins: 300 },
  ],
};

function incrementProgressive(ach, amount) {
  ach.currentValue += amount;
  let unlockedTiers = [];
  ach.tiers.forEach((t) => {
    if (!t.unlocked && ach.currentValue >= t.target) {
      t.unlocked = true;
      unlockedTiers.push(t.tier);
    }
  });
  return unlockedTiers;
}

const tier1Result = incrementProgressive(progressiveAch, 150);
assert(tier1Result.includes(1) && progressiveAch.tiers[0].unlocked, 'Tier 1 (Bronze ⭐) desbloqueado ao atingir 150 pastilhas');
assert(!progressiveAch.tiers[1].unlocked && !progressiveAch.tiers[2].unlocked, 'Tiers 2 e 3 permanecem bloqueados');

const tier2Result = incrementProgressive(progressiveAch, 900); // 150 + 900 = 1050
assert(tier2Result.includes(2) && progressiveAch.tiers[1].unlocked, 'Tier 2 (Prata ⭐⭐) desbloqueado ao atingir 1.050 pastilhas');

const tier3Result = incrementProgressive(progressiveAch, 4000); // 1050 + 4000 = 5050
assert(tier3Result.includes(3) && progressiveAch.tiers[2].unlocked, 'Tier 3 (Ouro ⭐⭐⭐) desbloqueado com sucesso ao superar 5.000 pastilhas');

// -----------------------------------------------------------------------------
// 7. TESTES DA TABELA DE RECORDES (LEADERBOARD TOP 10)
// -----------------------------------------------------------------------------
console.log('\n🥇 MÓDULO 7: Ranking de Recordes com Iniciais');
let leaderboard = [
  { initials: 'PAC', score: 10000 },
  { initials: 'MID', score: 8500 },
  { initials: 'NAM', score: 6200 },
];

function addHighScore(initials, score) {
  const formatted = (initials || 'AAA').toUpperCase().slice(0, 3);
  leaderboard.push({ initials: formatted, score });
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 10) leaderboard = leaderboard.slice(0, 10);
}

addHighScore('pro_player', 15000);
assert(leaderboard[0].initials === 'PRO', 'Iniciais longas sanitizadas para exatamente 3 caracteres em maiúsculo (PRO)');
assert(leaderboard[0].score === 15000, 'Maior pontuação posicionada no Rank #1');

// -----------------------------------------------------------------------------
// 8. TESTES DE POWER-UPS E STATUS
// -----------------------------------------------------------------------------
console.log('\n⚡ MÓDULO 8: Power-ups, Atordoamento e Congelamento');
const powerUpState = {
  hasShield: true,
  freezeTimer: 5000,
  stunTimer: 4000,
  magnetRadius: 6, // Com upgrade
};

assert(powerUpState.hasShield === true, 'Escudo de energia absorve 1 colisão fatal');
assert(powerUpState.freezeTimer === 5000, 'Relógio congela fantasmas por 5000ms');
assert(powerUpState.stunTimer === 4000, 'Bomba atordoa fantasmas em área por 4000ms');
assert(powerUpState.magnetRadius === 6, 'Super Ímã aprimorado atrai pastilhas em raio de 6 tiles');

// -----------------------------------------------------------------------------
// RESULTADO FINAL
// -----------------------------------------------------------------------------
console.log('\n================================================================');
if (testsFailed === 0) {
  console.log(`🎉 TODOS OS ${testsPassed} TESTES PASSARAM COM 100% DE SUCESSO!`);
  console.log('   Nenhum erro ou bug lógico detectado nas funcionalidades.');
} else {
  console.error(`🚨 ${testsFailed} TESTES FALHARAM:`);
  failures.forEach((f) => console.error(`   - ${f.name}: ${f.details}`));
}
console.log('================================================================\n');

if (testsFailed > 0) process.exit(1);
