import {
  EconomyService,
  UPGRADE_DEFINITIONS,
  SKIN_DEFINITIONS,
  MultiLevelUpgrades,
} from '../services/EconomyService.ts';
import { PacmanSkin } from '../core/Constants.ts';
import { ThemeManager } from './ThemeManager.ts';

export class ShopModal {
  private modalEl: HTMLElement | null = null;
  private economyService: EconomyService;
  private themeManager: ThemeManager;
  private currentTab: 'upgrades' | 'skins' = 'upgrades';
  private selectedSkinCategory: string = 'all';
  private onSkinEquippedCallbacks: ((skin: PacmanSkin) => void)[] = [];

  constructor(economyService: EconomyService, themeManager: ThemeManager) {
    this.economyService = economyService;
    this.themeManager = themeManager;
    this.modalEl = document.getElementById('shopModal');
    this.setupListeners();
  }

  public onSkinEquipped(cb: (skin: PacmanSkin) => void) {
    this.onSkinEquippedCallbacks.push(cb);
  }

  public open() {
    this.modalEl?.classList.add('open');
    this.render();
  }

  public close() {
    this.modalEl?.classList.remove('open');
  }

  private setupListeners() {
    document.getElementById('btnCloseShop')?.addEventListener('click', () => this.close());
  }

  public render() {
    const contentBox = this.modalEl?.querySelector('.shop-modal-body');
    const coinsDisplay = document.getElementById('shopCoinsAmount');
    if (coinsDisplay) {
      coinsDisplay.innerText = `${this.economyService.getCoins().toLocaleString()} 🪙`;
    }

    if (!contentBox) return;

    contentBox.innerHTML = `
      <!-- Abas de Navegação da Loja -->
      <div class="shop-tabs-nav">
        <button class="shop-tab-btn ${this.currentTab === 'upgrades' ? 'active' : ''}" id="tabUpgrades">
          ⚡ Upgrades Permanentes (${UPGRADE_DEFINITIONS.length})
        </button>
        <button class="shop-tab-btn ${this.currentTab === 'skins' ? 'active' : ''}" id="tabSkins">
          🎨 Skins Temáticas (${SKIN_DEFINITIONS.length})
        </button>
      </div>

      <div class="shop-tab-content">
        ${this.currentTab === 'upgrades' ? this.renderUpgradesList() : this.renderSkinsList()}
      </div>
    `;

    // Wire Tabs
    contentBox.querySelector('#tabUpgrades')?.addEventListener('click', () => {
      this.currentTab = 'upgrades';
      this.render();
    });
    contentBox.querySelector('#tabSkins')?.addEventListener('click', () => {
      this.currentTab = 'skins';
      this.render();
    });

    // Wire Skin Filter Pills
    contentBox.querySelectorAll('.skin-category-pill').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.selectedSkinCategory = target.dataset.cat || 'all';
        this.render();
      });
    });

    // Wire Upgrades Buttons
    contentBox.querySelectorAll('.btn-buy-upgrade, .shop-action-btn:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const key = target.dataset.key as keyof MultiLevelUpgrades;
        if (key && this.economyService.buyUpgrade(key)) {
          this.render();
          const coinsDisplay = document.getElementById('shopCoinsAmount');
          if (coinsDisplay) {
            coinsDisplay.innerText = `${this.economyService.getCoins().toLocaleString()} 🪙`;
          }
          const headerCoins = document.getElementById('headerCoinsCounter');
          if (headerCoins) {
            headerCoins.innerText = `${this.economyService.getCoins().toLocaleString()} 🪙`;
          }
        }
      });
    });

    // Wire Skin Buttons
    contentBox.querySelectorAll('.btn-skin-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const skin = target.dataset.skin as PacmanSkin;
        const price = parseInt(target.dataset.price || '0', 10);

        if (this.economyService.isSkinUnlocked(skin)) {
          this.themeManager.setSkin(skin);
          const skinSelect = document.getElementById('skinSelect') as HTMLSelectElement;
          if (skinSelect) skinSelect.value = skin;
          this.onSkinEquippedCallbacks.forEach((cb) => cb(skin));
          this.render();
        } else {
          if (this.economyService.unlockSkin(skin, price)) {
            this.themeManager.setSkin(skin);
            const skinSelect = document.getElementById('skinSelect') as HTMLSelectElement;
            if (skinSelect) skinSelect.value = skin;
            this.onSkinEquippedCallbacks.forEach((cb) => cb(skin));
            this.render();
          }
        }
      });
    });
  }

  private renderUpgradesList(): string {
    const currentCoins = this.economyService.getCoins();

    return `
      <div class="shop-grid">
        ${UPGRADE_DEFINITIONS.map((def) => {
          const lvl = this.economyService.getUpgradeLevel(def.key);
          const isMax = lvl >= def.maxLevel;
          const price = this.economyService.getUpgradePrice(def.key);
          const canAfford = currentCoins >= price && !isMax;
          const progressPercent = Math.round((lvl / def.maxLevel) * 100);

          return `
            <div class="shop-card ${isMax ? 'mastered' : ''}">
              <div class="shop-card-header">
                <div class="shop-card-icon">${def.icon}</div>
                <div class="shop-card-title-box">
                  <div class="shop-card-title">${def.title}</div>
                  <div class="shop-card-level-badge">Nível ${lvl} / ${def.maxLevel}</div>
                </div>
              </div>

              <div class="shop-card-desc">${def.desc}</div>
              <div class="shop-card-effect">Efeito Atual: <strong>${def.getEffectLabel(lvl)}</strong></div>

              <div class="shop-progress-bar">
                <div class="shop-progress-fill" style="width: ${progressPercent}%"></div>
              </div>

              <button 
                class="shop-action-btn btn-buy-upgrade ${isMax ? 'btn-max' : canAfford ? 'btn-buy' : 'btn-disabled'}"
                data-key="${def.key}"
                ${isMax || !canAfford ? 'disabled' : ''}
              >
                ${isMax ? '✅ NÍVEL MÁXIMO' : `EVOLUIR (${price.toLocaleString()} 🪙)`}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private renderSkinsList(): string {
    const currentCoins = this.economyService.getCoins();
    const equippedSkin = this.themeManager.getSkin();

    const filteredSkins = this.selectedSkinCategory === 'all'
      ? SKIN_DEFINITIONS
      : SKIN_DEFINITIONS.filter((s) => s.category === this.selectedSkinCategory);

    return `
      <!-- Categorias de Skins -->
      <div class="skin-categories-filter">
        <button class="skin-category-pill ${this.selectedSkinCategory === 'all' ? 'active' : ''}" data-cat="all">Todas (${SKIN_DEFINITIONS.length})</button>
        <button class="skin-category-pill ${this.selectedSkinCategory === 'standard' ? 'active' : ''}" data-cat="standard">🟡 Padrão</button>
        <button class="skin-category-pill ${this.selectedSkinCategory === 'intermediate' ? 'active' : ''}" data-cat="intermediate">👑 Intermediário</button>
        <button class="skin-category-pill ${this.selectedSkinCategory === 'collector' ? 'active' : ''}" data-cat="collector">🎀 Colecionador</button>
        <button class="skin-category-pill ${this.selectedSkinCategory === 'seasonal' ? 'active' : ''}" data-cat="seasonal">🎉 Sazonais</button>
        <button class="skin-category-pill ${this.selectedSkinCategory === 'legendary' ? 'active' : ''}" data-cat="legendary">💎 Lendário</button>
      </div>

      <div class="shop-grid">
        ${filteredSkins.map((def) => {
          const isUnlocked = this.economyService.isSkinUnlocked(def.skin);
          const isEquipped = equippedSkin === def.skin;
          const canAfford = currentCoins >= def.price;

          let btnClass = 'btn-buy';
          let btnText = `DESBLOQUEAR (${def.price.toLocaleString()} 🪙)`;

          if (isEquipped) {
            btnClass = 'btn-equipped';
            btnText = '⭐ EQUIPADO';
          } else if (isUnlocked) {
            btnClass = 'btn-equip';
            btnText = 'EQUIPAR';
          } else if (!canAfford) {
            btnClass = 'btn-disabled';
          }

          return `
            <div class="shop-card skin-card ${isEquipped ? 'equipped' : ''}">
              <div class="shop-card-header">
                <div class="shop-card-icon" style="font-size: 1.6rem;">${def.icon}</div>
                <div class="shop-card-title-box">
                  <div class="shop-card-title">${def.name}</div>
                  <div class="shop-category-tag tag-${def.category}">${def.categoryLabel}</div>
                </div>
              </div>

              <div class="shop-card-desc">${def.desc}</div>

              <button 
                class="shop-action-btn btn-skin-action ${btnClass}"
                data-skin="${def.skin}"
                data-price="${def.price}"
                ${!isUnlocked && !canAfford ? 'disabled' : ''}
              >
                ${btnText}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}
