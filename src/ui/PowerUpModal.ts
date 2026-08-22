import { EconomyService, UPGRADE_DEFINITIONS, MultiLevelUpgrades } from '../services/EconomyService.ts';
import { SoundSynthesizer } from '../audio/SoundSynthesizer.ts';

const POWERUP_KEYS: (keyof MultiLevelUpgrades)[] = [
  'superMagnet',
  'bombDuration',
  'shieldCharges',
  'freezeDuration',
  'boostedFruits',
];

export class PowerUpModal {
  private economyService: EconomyService;
  private sound: SoundSynthesizer | null = null;
  private modalEl: HTMLElement | null = null;
  private closeBtnEl: HTMLElement | null = null;

  constructor(economyService: EconomyService) {
    this.economyService = economyService;
    this.createModalDOM();
    this.initEvents();
  }

  public setSound(sound: SoundSynthesizer) {
    this.sound = sound;
  }

  private createModalDOM() {
    let existing = document.getElementById('powerUpModal');
    if (existing) {
      this.modalEl = existing;
      this.closeBtnEl = document.getElementById('btnClosePowerUpModal');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'powerUpModal';
    modal.className = 'arcade-modal-overlay hidden';
    modal.innerHTML = `
      <div class="arcade-modal-box powerup-modal-box">
        <div class="arcade-modal-header">
          <h2 class="arcade-modal-title">⚡ ARSENAL DE POWER-UPS</h2>
          <button class="arcade-modal-close" id="btnClosePowerUpModal">✕</button>
        </div>

        <div class="powerup-modal-body">
          <p class="powerup-modal-intro">
            Estes são os itens especiais que surgem dinamicamente no labirinto. Aprimore o poder de cada um para dominar as partidas:
          </p>

          <div class="powerup-grid" id="powerUpModalGrid"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.closeBtnEl = document.getElementById('btnClosePowerUpModal');
  }

  private initEvents() {
    this.closeBtnEl?.addEventListener('click', () => this.hide());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hide();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.hide();
      }
    });

    this.economyService.onCoinsChanged(() => {
      if (this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.render();
      }
    });
  }

  public show() {
    this.render();
    this.modalEl?.classList.remove('hidden');
    this.modalEl?.classList.add('open');
  }

  public hide() {
    this.modalEl?.classList.remove('open');
    this.modalEl?.classList.add('hidden');
  }

  public render() {
    const grid = document.getElementById('powerUpModalGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const currentCoins = this.economyService.getCoins();
    const defs = UPGRADE_DEFINITIONS.filter((def) => POWERUP_KEYS.includes(def.key));

    defs.forEach((def) => {
      const currentLvl = this.economyService.getUpgradeLevel(def.key);
      const isMax = currentLvl >= def.maxLevel;
      const cost = this.economyService.getUpgradePrice(def.key);
      const canBuy = !isMax && currentCoins >= cost;
      const progressPercent = Math.min(100, Math.floor((currentLvl / def.maxLevel) * 100));

      const card = document.createElement('div');
      card.className = `shop-card ${isMax ? 'mastered' : ''}`;
      card.innerHTML = `
        <div class="shop-card-header">
          <div class="shop-card-icon">${def.icon}</div>
          <div class="shop-card-title-box">
            <div class="shop-card-title">${def.title}</div>
            <div class="shop-card-level-badge">Nível ${currentLvl} / ${def.maxLevel}</div>
          </div>
        </div>

        <p class="shop-card-desc">${def.desc}</p>

        <div class="shop-card-effect">
          Efeito: <strong>${def.getEffectLabel(currentLvl)}</strong>
        </div>

        <div class="shop-progress-bar">
          <div class="shop-progress-fill" style="width: ${progressPercent}%"></div>
        </div>

        <button class="shop-action-btn ${
          isMax ? 'btn-max' : canBuy ? 'btn-buy' : 'btn-disabled'
        }" ${isMax || !canBuy ? 'disabled' : ''} data-upgrade-key="${def.key}">
          ${
            isMax
              ? '⭐ MÁXIMO'
              : `UPGRADE: 🪙 ${cost.toLocaleString()} MOEDAS`
          }
        </button>
      `;

      const btn = card.querySelector('button');
      if (btn && canBuy) {
        btn.addEventListener('click', () => {
          if (this.economyService.buyUpgrade(def.key)) {
            this.sound?.playEatFruit();
            this.render();
          }
        });
      }

      grid.appendChild(card);
    });
  }
}
