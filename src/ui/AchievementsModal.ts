import { AchievementManager, ProgressiveAchievement } from '../services/AchievementManager.ts';

export class AchievementsModal {
  private modalEl: HTMLElement | null = null;
  private achievementManager: AchievementManager;
  private currentFilter: string = 'todos';

  constructor(achievementManager: AchievementManager) {
    this.achievementManager = achievementManager;
    this.modalEl = document.getElementById('achievementsModal');
    this.setupListeners();
  }

  public open() {
    this.modalEl?.classList.add('open');
    this.render();
  }

  public close() {
    this.modalEl?.classList.remove('open');
  }

  private setupListeners() {
    document.getElementById('btnCloseAchievements')?.addEventListener('click', () => this.close());
  }

  public render() {
    const listEl = document.getElementById('achievementsList');
    if (!listEl) return;

    const list = this.achievementManager.getAchievements();
    const { unlocked, total } = this.achievementManager.getTotalStars();

    const progressEl = document.getElementById('achievementsProgress');
    if (progressEl) {
      progressEl.innerHTML = `⭐ ${unlocked} / ${total} Estrelas`;
    }

    const filtered =
      this.currentFilter === 'todos'
        ? list
        : list.filter((a) => a.category === this.currentFilter);

    listEl.innerHTML = `
      <div class="achievement-filters">
        <button class="ach-filter-btn ${this.currentFilter === 'todos' ? 'active' : ''}" data-filter="todos">Todas (50)</button>
        <button class="ach-filter-btn ${this.currentFilter === 'pastilhas' ? 'active' : ''}" data-filter="pastilhas">🟡 Pastilhas</button>
        <button class="ach-filter-btn ${this.currentFilter === 'fantasmas' ? 'active' : ''}" data-filter="fantasmas">👻 Fantasmas</button>
        <button class="ach-filter-btn ${this.currentFilter === 'frutas' ? 'active' : ''}" data-filter="frutas">🍒 Frutas</button>
        <button class="ach-filter-btn ${this.currentFilter === 'sobrevivencia' ? 'active' : ''}" data-filter="sobrevivencia">🛡️ Sobrevivência</button>
        <button class="ach-filter-btn ${this.currentFilter === 'pontos' ? 'active' : ''}" data-filter="pontos">🏅 Pontuação</button>
        <button class="ach-filter-btn ${this.currentFilter === 'economia' ? 'active' : ''}" data-filter="economia">🪙 Economia</button>
        <button class="ach-filter-btn ${this.currentFilter === 'powerups' ? 'active' : ''}" data-filter="powerups">⚡ Power-ups</button>
        <button class="ach-filter-btn ${this.currentFilter === 'modos' ? 'active' : ''}" data-filter="modos">🎮 Modos</button>
      </div>

      <div class="achievements-card-grid"></div>
    `;

    // Listeners dos Filtros
    listEl.querySelectorAll('.ach-filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.currentFilter = target.dataset.filter || 'todos';
        this.render();
      });
    });

    const gridEl = listEl.querySelector('.achievements-card-grid');
    if (!gridEl) return;

    filtered.forEach((ach) => {
      const card = this.createSpaciousCard(ach);
      gridEl.appendChild(card);
    });
  }

  /**
   * Card Grande, Espaçoso e 100% Legível
   */
  private createSpaciousCard(ach: ProgressiveAchievement): HTMLElement {
    const card = document.createElement('div');
    const unlockedCount = ach.tiers.filter((t) => t.unlocked).length;
    const isCompleted = unlockedCount === 3;

    // Próxima meta ativa
    const currentTierIdx = ach.tiers.findIndex((t) => !t.unlocked);
    const activeTier = currentTierIdx === -1 ? ach.tiers[2] : ach.tiers[currentTierIdx];
    const currentTierNumber = currentTierIdx === -1 ? 3 : currentTierIdx + 1;

    const progressPercent = Math.min(100, Math.round((ach.currentValue / activeTier.target) * 100));

    // Estrelas grandes e brilhantes
    const starBadges = `
      <span class="ach-big-star ${unlockedCount >= 1 ? 'gold' : 'dim'}">★</span>
      <span class="ach-big-star ${unlockedCount >= 2 ? 'gold' : 'dim'}">★</span>
      <span class="ach-big-star ${unlockedCount >= 3 ? 'gold' : 'dim'}">★</span>
    `;

    card.className = `ach-card-spacious ${unlockedCount > 0 ? 'card-active' : ''} ${isCompleted ? 'card-mastered' : ''}`;
    card.innerHTML = `
      <div class="ach-card-top">
        <div class="ach-card-icon-title">
          <span class="ach-card-emoji">${ach.icon}</span>
          <div class="ach-card-text-header">
            <h3 class="ach-card-name">${ach.title}</h3>
            <span class="ach-card-cat-label">${ach.category.toUpperCase()}</span>
          </div>
        </div>
        <div class="ach-card-stars-box">${starBadges}</div>
      </div>

      <div class="ach-card-middle">
        ${
          isCompleted
            ? `<div class="ach-mission-complete">🏆 CONQUISTA MAXIMIZADA! (${activeTier.target.toLocaleString()} ${ach.unit})</div>`
            : `
              <div class="ach-mission-current">
                <span class="ach-tier-tag">NÍVEL ${currentTierNumber}</span>
                <span class="ach-mission-goal">${ach.description}: <strong>${activeTier.target.toLocaleString()} ${ach.unit}</strong></span>
              </div>
            `
        }
      </div>

      <div class="ach-card-bottom">
        <div class="ach-bar-track">
          <div class="ach-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="ach-bar-details">
          <span class="ach-bar-numbers">${ach.currentValue.toLocaleString()} / ${activeTier.target.toLocaleString()} ${ach.unit}</span>
          <span class="ach-reward-tag">${isCompleted ? '⭐ 100%' : `+${activeTier.rewardCoins} 🪙`}</span>
        </div>
      </div>
    `;

    return card;
  }
}
