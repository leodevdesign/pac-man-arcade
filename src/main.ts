import { Game } from './core/Game.ts';
import { GameMode, ThemeType, PacmanSkin } from './core/Constants.ts';
import { TileType } from './map/MazeData.ts';
import { MAP_PRESETS, MapConfig } from './map/MapRegistry.ts';
import { ProceduralGenerator } from './map/ProceduralGenerator.ts';
import { MapEditor } from './map/MapEditor.ts';
import { ShopModal } from './ui/ShopModal.ts';
import { AchievementsModal } from './ui/AchievementsModal.ts';
import { LeaderboardModal } from './ui/LeaderboardModal.ts';
import { CustomSelect } from './ui/CustomSelect.ts';
import { SaveService } from './services/SaveService.ts';
import { UpdaterUI } from './ui/UpdaterUI.ts';
import { ProfileCard } from './ui/ProfileCard.ts';
import { ChestModal } from './ui/ChestModal.ts';
import { GhostGuideModal } from './ui/GhostGuideModal.ts';
import { PowerUpModal } from './ui/PowerUpModal.ts';

window.addEventListener('DOMContentLoaded', async () => {
  await SaveService.init();

  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas #gameCanvas não foi encontrado no DOM.');
    return;
  }

  new UpdaterUI();
  const game = new Game(canvas);

  // 1. Perfil, Baú e Modais
  const profileCard = new ProfileCard(game.profileService);
  new ChestModal(game.profileService, game.economyService, game.sound);
  const shopModal = new ShopModal(game.economyService, game.themeManager);
  const ghostGuideModal = new GhostGuideModal();
  const powerUpModal = new PowerUpModal(game.economyService);
  powerUpModal.setSound(game.sound);

  shopModal.onSkinEquipped((skin) => {
    game.setPacmanSkin(skin);
    profileCard.setSkin(skin);
    const skinSelect = document.getElementById('skinSelect') as HTMLSelectElement;
    if (skinSelect) skinSelect.value = skin;
  });

  const achievementsModal = new AchievementsModal(game.achievementManager);
  const leaderboardModal = new LeaderboardModal(game.leaderboardService);

  // Atualização em tempo real do contador de moedas no cabeçalho
  const headerCoinsCounter = document.getElementById('headerCoinsCounter');
  const updateCoinsHeader = (coins: number) => {
    if (headerCoinsCounter) headerCoinsCounter.innerText = `${coins} 🪙`;
  };
  game.economyService.onCoinsChanged(updateCoinsHeader);
  updateCoinsHeader(game.economyService.getCoins());

  // Botões de Abertura dos Modais
  document.getElementById('btnOpenShop')?.addEventListener('click', () => shopModal.open());
  document.getElementById('btnOpenAchievements')?.addEventListener('click', () => achievementsModal.open());
  document.getElementById('btnOpenLeaderboard')?.addEventListener('click', () => leaderboardModal.open());
  document.getElementById('btnOpenGhostsGuide')?.addEventListener('click', () => ghostGuideModal.show());
  document.getElementById('btnOpenPowerUpsGuide')?.addEventListener('click', () => powerUpModal.show());

  // Controlador de Acordeom Inteligente dos 4 Cards da Direita (Máx 3 Abertos)
  const openCardsHistory: string[] = ['cardQuickActions', 'cardGhosts', 'cardPowerUps'];
  const MAX_OPEN_CARDS = 3;

  const updateCardDOMState = (cardId: string, isOpen: boolean) => {
    const card = document.getElementById(cardId);
    if (!card) return;
    const arrow = card.querySelector('.accordion-arrow');
    if (isOpen) {
      card.classList.add('open');
      if (arrow) arrow.textContent = '▲';
    } else {
      card.classList.remove('open');
      if (arrow) arrow.textContent = '▼';
    }
  };

  document.querySelectorAll('.accordion-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      const cardId = (e.currentTarget as HTMLElement).dataset.card;
      if (!cardId) return;

      const card = document.getElementById(cardId);
      if (!card) return;

      const isOpen = card.classList.contains('open');

      if (isOpen) {
        // Fecha o card clicado
        updateCardDOMState(cardId, false);
        const idx = openCardsHistory.indexOf(cardId);
        if (idx !== -1) openCardsHistory.splice(idx, 1);
      } else {
        // Abre o card clicado com limite de 3
        if (openCardsHistory.length >= MAX_OPEN_CARDS) {
          const oldestCardId = openCardsHistory.shift();
          if (oldestCardId) updateCardDOMState(oldestCardId, false);
        }
        updateCardDOMState(cardId, true);
        openCardsHistory.push(cardId);
      }
    });
  });

  // Callback de Game Over para inserção de iniciais
  game.onGameOverCallback = (score, level, mode) => {
    leaderboardModal.promptSaveScore(score, level, mode);
  };

  // 2. Barra de Ações Rápidas
  const btnPause = document.getElementById('btnPause');
  btnPause?.addEventListener('click', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }));
  });

  const btnMute = document.getElementById('btnMute');
  btnMute?.addEventListener('click', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM' }));
    const isMuted = btnMute.innerText.includes('Mudo');
    btnMute.innerText = isMuted ? '🔊 Efeitos Som [M]' : '🔇 Mudo Total [M]';
  });

  const btnSiren = document.getElementById('btnSiren');
  const toggleSirenAction = () => {
    const isEnabled = game.sound.toggleSiren();
    if (btnSiren) {
      btnSiren.innerText = isEnabled ? '🚨 Sirene: ON [S]' : '🔇 Sirene: OFF [S]';
      btnSiren.classList.toggle('active', isEnabled);
    }
  };
  btnSiren?.addEventListener('click', toggleSirenAction);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyS' && document.activeElement?.tagName !== 'INPUT') {
      toggleSirenAction();
    }
  });

  const btnDebug = document.getElementById('btnDebug');
  btnDebug?.addEventListener('click', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' }));
    btnDebug.classList.toggle('active');
  });

  const btnCrt = document.getElementById('btnCrt');
  const canvasWrapper = document.getElementById('canvasWrapper');
  btnCrt?.addEventListener('click', () => {
    if (canvasWrapper) {
      canvasWrapper.classList.toggle('scanlines-on');
      btnCrt.classList.toggle('active', canvasWrapper.classList.contains('scanlines-on'));
    }
  });

  const btnFullscreen = document.getElementById('btnFullscreen');
  btnFullscreen?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      btnFullscreen.innerText = '🗗 Sair Cheia';
    } else {
      document.exitFullscreen().catch(() => {});
      btnFullscreen.innerText = '⛶ Tela Cheia';
    }
  });

  // 3. Seletor de Modos de Jogo, Mapas, Temas e Skins Customizados
  new CustomSelect('modeSelect', (val) => {
    game.setGameMode(val as GameMode);
  });

  const customMapSelect = new CustomSelect('mapSelect', (val) => {
    if (val === 'random_rotation') {
      game.setRandomMazeMode(true);
    } else {
      const preset = MAP_PRESETS.find((p) => p.id === val);
      if (preset) {
        game.loadMap(preset, false);
      }
    }
  });

  new CustomSelect('themeSelect', (val) => {
    game.setTheme(val as ThemeType);
  });

  const customSkinSelect = new CustomSelect('skinSelect', (val) => {
    const selectedSkin = val as PacmanSkin;
    if (game.economyService.isSkinUnlocked(selectedSkin)) {
      game.setPacmanSkin(selectedSkin);
      profileCard.setSkin(selectedSkin);
    } else {
      alert('Essa skin ainda está bloqueada! Desbloqueie na Lojinha de Upgrades com moedas.');
      shopModal.open();
      customSkinSelect.setValue(game.themeManager.getSkin());
    }
  });

  // Mantém os selects sincronizados ao equipar skins via lojinha
  shopModal.onSkinEquipped((skin) => {
    game.setPacmanSkin(skin);
    customSkinSelect.setValue(skin);
  });

  // 4. Gerador Procedural
  const nativeMapSelect = document.getElementById('mapSelect') as HTMLSelectElement;
  const btnProcedural = document.getElementById('btnProcedural');
  btnProcedural?.addEventListener('click', () => {
    const randomMap = ProceduralGenerator.generate();
    if (nativeMapSelect) {
      const opt = document.createElement('option');
      opt.value = randomMap.id;
      opt.innerText = randomMap.name;
      opt.selected = true;
      nativeMapSelect.appendChild(opt);
      customMapSelect.render();
      customMapSelect.setValue(randomMap.id);
    }
    game.loadMap(randomMap);
  });

  // 5. Editor de Labirintos
  const editorCanvas = document.getElementById('editorCanvas') as HTMLCanvasElement;
  const editorModal = document.getElementById('editorModal');
  const btnOpenEditor = document.getElementById('btnOpenEditor');
  const btnCloseEditor = document.getElementById('btnCloseEditor');

  let mapEditor: MapEditor | null = null;
  if (editorCanvas) {
    mapEditor = new MapEditor(editorCanvas);
    mapEditor.setOnPlay((config: MapConfig) => {
      editorModal?.classList.remove('open');
      if (nativeMapSelect) {
        const opt = document.createElement('option');
        opt.value = config.id;
        opt.innerText = config.name;
        opt.selected = true;
        nativeMapSelect.appendChild(opt);
        customMapSelect.render();
        customMapSelect.setValue(config.id);
      }
      game.loadMap(config);
    });
  }

  btnOpenEditor?.addEventListener('click', () => {
    editorModal?.classList.add('open');
    mapEditor?.render();
  });

  btnCloseEditor?.addEventListener('click', () => {
    editorModal?.classList.remove('open');
  });

  // Ferramentas do Editor
  const tools = [
    { id: 'toolWall', type: TileType.WALL },
    { id: 'toolDot', type: TileType.DOT },
    { id: 'toolEnergizer', type: TileType.ENERGIZER },
    { id: 'toolErase', type: TileType.EMPTY },
    { id: 'toolTunnel', type: TileType.WARP_TUNNEL },
  ];

  tools.forEach(({ id, type }) => {
    const btn = document.getElementById(id);
    btn?.addEventListener('click', () => {
      tools.forEach((t) => document.getElementById(t.id)?.classList.remove('active'));
      btn.classList.add('active');
      mapEditor?.setTool(type);
    });
  });

  const btnToggleSymmetry = document.getElementById('btnToggleSymmetry');
  btnToggleSymmetry?.addEventListener('click', () => {
    if (mapEditor && btnToggleSymmetry) {
      const active = mapEditor.toggleSymmetry();
      btnToggleSymmetry.innerText = `⚖️ Simetria: ${active ? 'LIGADA' : 'DESLIGADA'}`;
      mapEditor.render();
    }
  });

  document.getElementById('btnClearMap')?.addEventListener('click', () => {
    if (confirm('Deseja limpar todo o mapa?')) {
      mapEditor?.clearAll();
    }
  });

  document.getElementById('btnDefaultMap')?.addEventListener('click', () => {
    mapEditor?.resetToDefault();
  });

  document.getElementById('btnPlayCustom')?.addEventListener('click', () => {
    mapEditor?.playCurrentMap();
  });

  document.getElementById('btnExportJson')?.addEventListener('click', () => {
    if (!mapEditor) return;
    const json = mapEditor.exportJson();
    navigator.clipboard.writeText(json).then(() => {
      alert('JSON do mapa copiado para a área de transferência!');
    }).catch(() => {
      prompt('Copie o JSON do mapa abaixo:', json);
    });
  });

  document.getElementById('btnImportJson')?.addEventListener('click', () => {
    if (!mapEditor) return;
    const json = prompt('Cole o JSON da matriz do mapa:');
    if (json) {
      const success = mapEditor.importJson(json);
      if (success) alert('Mapa importado com sucesso!');
      else alert('Erro ao importar JSON. Verifique o formato da matriz 28x36.');
    }
  });

  // Inicia o Game Loop
  game.start();
});
