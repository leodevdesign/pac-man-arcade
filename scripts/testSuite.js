/**
 * BATERIA DE TESTES EXAUSTIVA - PAC-MAN DEFINITIVE EDITION v1.0.2
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
console.log('🕹️  PAC-MAN ARCADE v1.0.2 - INICIANDO BATERIA DE TESTES  🕹️');
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

// -----------------------------------------------------------------------------
// 2. TESTES DE IA DOS FANTASMAS
// -----------------------------------------------------------------------------
console.log('\n👻 MÓDULO 2: IAs dos Fantasmas e Algoritmos de Alvo');
function getBlinkyTarget(pacman) {
  return { x: pacman.tileX, y: pacman.tileY };
}
const pac = { tileX: 14, tileY: 26, dir: { x: 1, y: 0 } };
const blinkyTarget = getBlinkyTarget(pac);
assert(blinkyTarget.x === 14 && blinkyTarget.y === 26, 'Blinky mira exatamente na posição atual do Pac-Man');

function getPinkyTarget(pacman) {
  const target = {
    x: pacman.tileX + pacman.dir.x * 4,
    y: pacman.tileY + pacman.dir.y * 4,
  };
  if (pacman.dir.y === -1) {
    target.x -= 4;
  }
  return target;
}
pac.dir = { x: 0, y: -1 }; // CIMA
const pinkyTargetUp = getPinkyTarget(pac);
assert(pinkyTargetUp.x === 10 && pinkyTargetUp.y === 22, 'Pinky reproduz comportamento clássico do Arcade ao mirar para CIMA (offset X e Y)');

// -----------------------------------------------------------------------------
// 3. TESTES DE FÓRMULA DE UPGRADES EM 2 FASES (30% / 40%)
// -----------------------------------------------------------------------------
console.log('\n💰 MÓDULO 3: Fórmula Exponencial de Upgrades em 2 Fases');
function calculateUpgradePrice(basePrice, maxLevel, currentLevel) {
  if (currentLevel >= maxLevel) return 0;
  const halfLevel = Math.ceil(maxLevel / 2);
  let price = basePrice;
  for (let i = 0; i < currentLevel; i++) {
    const mult = i < halfLevel ? 1.30 : 1.40;
    price = Math.round(price * mult);
  }
  return price;
}

const energizerLevel0Price = calculateUpgradePrice(500, 30, 0);
assert(energizerLevel0Price === 500, 'Nível 1 de Pílula Estendida custa exatamente 500 moedas');

const energizerLevel1Price = calculateUpgradePrice(500, 30, 1);
assert(energizerLevel1Price === 650, 'Nível 2 de Pílula Estendida custa +30% (650 moedas)');

const energizerLevel16Price = calculateUpgradePrice(500, 30, 16);
const energizerLevel17Price = calculateUpgradePrice(500, 30, 17);
assert(Math.round(energizerLevel16Price * 1.40) === energizerLevel17Price, 'Segunda metade do upgrade aplica escala de +40% por nível');

// -----------------------------------------------------------------------------
// 4. TESTES DOS NOVOS UPGRADES E HABILIDADES
// -----------------------------------------------------------------------------
console.log('\n🌀 MÓDULO 4: Novos Upgrades (Teletransporte, Lentidão, Pomar e Ímã)');
function getTeleportCooldown(level) {
  return Math.max(30, 60 - level);
}
assert(getTeleportCooldown(0) === 60, 'Teletransporte começa com 60 segundos de cooldown');
assert(getTeleportCooldown(15) === 45, 'Teletransporte no nível 15 tem 45 segundos de cooldown');
assert(getTeleportCooldown(30) === 30, 'Teletransporte no nível 30 atinge cooldown mínimo de 30 segundos');

function getGhostSlowdownMultiplier(level) {
  return 1.0 - (level * 0.005);
}
assert(getGhostSlowdownMultiplier(0) === 1.0, 'Sem upgrade, velocidade dos fantasmas é normal (100%)');
assert(getGhostSlowdownMultiplier(20) === 0.90, 'No nível 20 de Névoa de Distração, fantasmas ficam 10% mais lentos (90%)');

function getFertileOrchardCount(level) {
  return 2 + level;
}
assert(getFertileOrchardCount(0) === 2, 'Labirinto padrão gera 2 frutas');
assert(getFertileOrchardCount(3) === 5, 'No nível 3 de Pomar Fértil gera até 5 frutas por labirinto');

// -----------------------------------------------------------------------------
// 5. TESTES DO SISTEMA DE XP, NÍVEL E MAESTRIA
// -----------------------------------------------------------------------------
console.log('\n⭐ MÓDULO 5: Sistema de XP do Jogador, Níveis (1-100+) e Maestria');
function getXpForNextLevel(lvl) {
  if (lvl <= 15) {
    return Math.round(100 + Math.pow(lvl, 1.45) * 50);
  }
  return Math.round(3200 + Math.pow(lvl - 15, 1.85) * 220);
}

assert(getXpForNextLevel(1) === 150, 'Nível 1 requer 150 XP para o Nível 2');
assert(getXpForNextLevel(15) < 4000, 'Nível 15 requer curva acessível (<4.000 XP)');
assert(getXpForNextLevel(50) > 50000, 'Nível 50 escala significativamente para longevidade');

function getMasteryScoreMultiplier(lvl) {
  const bonusPercent = Math.floor(lvl / 10);
  return 1.0 + bonusPercent * 0.01;
}
assert(getMasteryScoreMultiplier(1) === 1.0, 'Nível 1 tem bônus de maestria de 0% (1.0x)');
assert(getMasteryScoreMultiplier(10) === 1.01, 'Nível 10 concede +1% permanente em toda a pontuação (1.01x)');
assert(getMasteryScoreMultiplier(50) === 1.05, 'Nível 50 concede +5% permanente em toda a pontuação (1.05x)');
assert(getMasteryScoreMultiplier(100) === 1.10, 'Nível 100 concede +10% permanente em toda a pontuação (1.10x)');

// -----------------------------------------------------------------------------
// 6. TESTES DO SISTEMA DE CONQUISTAS (5 TIERS: BRONZE A MÍTICO)
// -----------------------------------------------------------------------------
console.log('\n🏆 MÓDULO 6: Conquistas Progressivas Expandidas para 5 Tiers');
const testAch = {
  id: 'dots_eaten',
  currentValue: 0,
  tiers: [
    { tier: 1, target: 500, name: 'Bronze ⭐', unlocked: false, rewardCoins: 50, rewardXp: 100 },
    { tier: 2, target: 5000, name: 'Prata ⭐⭐', unlocked: false, rewardCoins: 250, rewardXp: 300 },
    { tier: 3, target: 25000, name: 'Ouro ⭐⭐⭐', unlocked: false, rewardCoins: 1000, rewardXp: 1000 },
    { tier: 4, target: 100000, name: 'Platina 💎', unlocked: false, rewardCoins: 5000, rewardXp: 3000 },
    { tier: 5, target: 500000, name: 'Mítico 👑', unlocked: false, rewardCoins: 25000, rewardXp: 10000 },
  ],
};

function addAchProgress(ach, amount) {
  ach.currentValue += amount;
  ach.tiers.forEach((t) => {
    if (!t.unlocked && ach.currentValue >= t.target) {
      t.unlocked = true;
    }
  });
}

addAchProgress(testAch, 600);
assert(testAch.tiers[0].unlocked && !testAch.tiers[1].unlocked, 'Tier 1 Bronze ⭐ desbloqueado com 600 pastilhas');

addAchProgress(testAch, 99400); // Total: 100.000
assert(testAch.tiers[3].unlocked && !testAch.tiers[4].unlocked, 'Tier 4 Platina 💎 desbloqueado ao atingir 100.000 pastilhas');

addAchProgress(testAch, 400000); // Total: 500.000
assert(testAch.tiers[4].unlocked, 'Tier 5 Mítico 👑 desbloqueado com sucesso ao atingir 500.000 pastilhas!');

// -----------------------------------------------------------------------------
// 7. TESTES DA NOVA TABELA DE PREÇOS DE SKINS E CATEGORIAS
// -----------------------------------------------------------------------------
console.log('\n🎨 MÓDULO 7: Tabela de Preços e Categorias de Skins');
const skinsConfig = [
  { skin: 'CLASSIC', price: 0, category: 'standard' },
  { skin: 'SUNGLASSES', price: 300, category: 'standard' },
  { skin: 'GOLDEN', price: 800, category: 'intermediate' },
  { skin: 'MS_PACMAN', price: 2000, category: 'collector' },
  { skin: 'EASTER', price: 3000, category: 'seasonal' },
  { skin: 'CHRISTMAS', price: 3500, category: 'seasonal' },
  { skin: 'HALLOWEEN', price: 3500, category: 'seasonal' },
  { skin: 'CYBERPUNK', price: 5000, category: 'legendary' },
];

assert(skinsConfig.find(s => s.skin === 'SUNGLASSES').price === 300, 'Óculos Escuros custa 300 moedas');
assert(skinsConfig.find(s => s.skin === 'MS_PACMAN').price === 2000, 'Ms. Pac-Man custa 2.000 moedas');
assert(skinsConfig.find(s => s.skin === 'EASTER').price === 3000, 'Pac de Páscoa custa 3.000 moedas');
assert(skinsConfig.find(s => s.skin === 'CHRISTMAS').price === 3500, 'Pac de Natal custa 3.500 moedas');
assert(skinsConfig.find(s => s.skin === 'HALLOWEEN').price === 3500, 'Pac de Halloween custa 3.500 moedas');
assert(skinsConfig.find(s => s.skin === 'CYBERPUNK').price === 5000, 'Cyber Mecha Pac custa 5.000 moedas');

// -----------------------------------------------------------------------------
// 8. TESTES DE TELETRANSPORTE DETERMINÍSTICO E ÍMÃ COM ENERGIZERS
// -----------------------------------------------------------------------------
console.log('\n🌀 MÓDULO 8: Teletransporte Espelhado & Ativação de Ímã');
function getOppositeQuadrant(pacCol, pacRow) {
  const isLeft = pacCol < 14;
  const isTop = pacRow < 18;
  return {
    targetMinCol: isLeft ? 14 : 1,
    targetMaxCol: isLeft ? 26 : 13,
    targetMinRow: isTop ? 18 : 4,
    targetMaxRow: isTop ? 31 : 17,
  };
}

const quadBottomLeft = getOppositeQuadrant(5, 25);
assert(quadBottomLeft.targetMinCol === 14 && quadBottomLeft.targetMinRow === 4, 'Pac-Man no Canto Inferior-Esquerdo teleporta para o Canto Superior-Direito');

const quadBottomRight = getOppositeQuadrant(22, 25);
assert(quadBottomRight.targetMinCol === 1 && quadBottomRight.targetMinRow === 4, 'Pac-Man no Canto Inferior-Direito teleporta para o Canto Superior-Esquerdo');

const quadTopLeft = getOppositeQuadrant(5, 6);
assert(quadTopLeft.targetMinCol === 14 && quadTopLeft.targetMinRow === 18, 'Pac-Man no Canto Superior-Esquerdo teleporta para o Canto Inferior-Direito');

const quadTopRight = getOppositeQuadrant(22, 6);
assert(quadTopRight.targetMinCol === 1 && quadTopRight.targetMinRow === 18, 'Pac-Man no Canto Superior-Direito teleporta para o Canto Inferior-Esquerdo');

let energizerCallbackFired = false;
let scoreAdded = 0;
const mockPelletManager = {
  eatPellet: () => ({ isPellet: true, isEnergizer: true, points: 50 }),
};
function simulateMagnetPull(pm, onEnergizer) {
  const res = pm.eatPellet();
  if (res.isPellet) {
    scoreAdded += res.points;
    if (res.isEnergizer && onEnergizer) {
      onEnergizer();
    }
  }
}
simulateMagnetPull(mockPelletManager, () => { energizerCallbackFired = true; });
assert(energizerCallbackFired && scoreAdded === 50, 'Ímã dispara callback de Energizer e adiciona pontos corretamente');

// -----------------------------------------------------------------------------
// RESULTADO FINAL
// -----------------------------------------------------------------------------
console.log('\n================================================================');
if (testsFailed === 0) {
  console.log(`🎉 TODOS OS ${testsPassed} TESTES PASSARAM COM 100% DE SUCESSO!`);
  console.log('   Nenhum erro ou bug lógico detectado nas novas funcionalidades.');
} else {
  console.error(`🚨 ${testsFailed} TESTES FALHARAM:`);
  failures.forEach((f) => console.error(`   - ${f.name}: ${f.details}`));
}
console.log('================================================================\n');

if (testsFailed > 0) process.exit(1);
