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
    this.modalEl = document.getElementById('powerUpModal');
    this.closeBtnEl = document.getElementById('btnClosePowerUpModal');
    this.initEvents();
  }

  public setSound(sound: SoundSynthesizer) {
    this.sound = sound;
  }

  private initEvents() {
    this.closeBtnEl?.addEventListener('click', () => this.hide());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hide();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl?.classList.contains('open')) {
        this.hide();
      }
    });

    this.economyService.onCoinsChanged(() => {
      if (this.modalEl?.classList.contains('open')) {
        this.render();
      }
    });
  }

  public show() {
    this.render();
    this.modalEl?.classList.add('open');
  }

  public hide() {
    this.modalEl?.classList.remove('open');
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
