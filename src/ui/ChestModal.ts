import { ProfileService } from '../services/ProfileService.ts';
import { EconomyService } from '../services/EconomyService.ts';
import { SoundSynthesizer } from '../audio/SoundSynthesizer.ts';

export class ChestModal {
  private modalEl: HTMLElement | null = null;
  private profileService: ProfileService;
  private economyService: EconomyService;
  private sound: SoundSynthesizer;
  private isChestOpened: boolean = false;

  constructor(profileService: ProfileService, economyService: EconomyService, sound: SoundSynthesizer) {
    this.profileService = profileService;
    this.economyService = economyService;
    this.sound = sound;

    this.initModal();
    this.bindEvents();
  }

  private initModal() {
    let el = document.getElementById('chestModal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'chestModal';
      el.className = 'editor-modal hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
  }

  private bindEvents() {
    this.profileService.onLevelUp((newLevel, rewardCoins) => {
      this.openForLevelUp(newLevel, rewardCoins);
    });

    document.getElementById('btnOpenChestReward')?.addEventListener('click', () => {
      this.openManual();
    });
  }

  public openForLevelUp(newLevel: number, _rewardCoins: number) {
    this.renderChestView(`🎉 SUBIU PARA O NÍVEL ${newLevel}!`, `Você conquistou um Baú do Tesouro Arcade! Clique para abrir:`);
    this.modalEl?.classList.remove('hidden');
  }

  public openManual() {
    const data = this.profileService.getProfileData();
    if (data.unclaimedChests <= 0) return;
    this.renderChestView(`🎁 BAÚ DO TESOURO DISPONÍVEL!`, `Você tem ${data.unclaimedChests} baú(s) para abrir. Clique no baú para resgatar sua recompensa:`);
    this.modalEl?.classList.remove('hidden');
  }

  private renderChestView(title: string, subtitle: string) {
    if (!this.modalEl) return;
    this.isChestOpened = false;

    this.modalEl.innerHTML = `
      <div class="editor-modal-backdrop"></div>
      <div class="editor-content chest-modal-box">
        <div class="editor-header">
          <div class="editor-title">${title}</div>
          <button class="editor-close" id="btnCloseChest">&times;</button>
        </div>
        <div class="chest-body">
          <p class="chest-subtitle">${subtitle}</p>
          <div class="interactive-chest-container" id="interactiveChest">
            <div class="chest-icon-glow"></div>
            <div class="chest-pixel-art pulse-hover" id="chestIcon">🎁</div>
            <div class="chest-tap-hint" id="chestTapHint">👆 CLIQUE PARA ABRIR!</div>
          </div>
          <div class="chest-reward-area hidden" id="chestRewardArea"></div>
        </div>
      </div>
    `;

    document.getElementById('btnCloseChest')?.addEventListener('click', () => this.close());
    document.getElementById('interactiveChest')?.addEventListener('click', () => this.triggerOpenChest());
  }

  private triggerOpenChest() {
    if (this.isChestOpened) return;
    this.isChestOpened = true;

    const chestIcon = document.getElementById('chestIcon');
    const tapHint = document.getElementById('chestTapHint');
    const rewardArea = document.getElementById('chestRewardArea');

    if (chestIcon) {
      chestIcon.innerText = '✨📦🔓✨';
      chestIcon.classList.add('chest-burst-anim');
    }
    if (tapHint) tapHint.remove();

    this.sound.playEatFruit();
    this.sound.playExtraLife();
    this.launchConfettiEffect();

    const claimResult = this.profileService.claimChest();
    this.economyService.addCoins(claimResult.coins);

    setTimeout(() => {
      if (rewardArea) {
        rewardArea.innerHTML = `
          <div class="reward-box-reveal">
            <div class="reward-coins-val">+${claimResult.coins.toLocaleString()} 🪙 MOEDAS!</div>
            ${claimResult.newThemeUnlocked ? `<div class="reward-unlock-tag">🔓 NOVO DESBLOQUEIO: <strong>${claimResult.newThemeUnlocked}</strong></div>` : ''}
            <button class="btn-primary btn-claim-action" id="btnClaimAndClose">
              ${this.profileService.getUnclaimedChests() > 0 ? '🎁 ABRIR PRÓXIMO BAÚ' : '✨ COLETAR E CONTINUAR'}
            </button>
          </div>
        `;
        rewardArea.classList.remove('hidden');

        document.getElementById('btnClaimAndClose')?.addEventListener('click', () => {
          if (this.profileService.getUnclaimedChests() > 0) {
            this.openManual();
          } else {
            this.close();
          }
        });
      }
    }, 600);
  }

  private launchConfettiEffect() {
    const container = document.body;
    const colors = ['#fde047', '#a855f7', '#00e5ff', '#ff007f', '#00ff66', '#ff5252'];

    for (let i = 0; i < 40; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.left = `${window.innerWidth / 2 + (Math.random() * 200 - 100)}px`;
      confetti.style.top = `${window.innerHeight / 2 + (Math.random() * 100 - 50)}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.setProperty('--tx', `${(Math.random() - 0.5) * 500}px`);
      confetti.style.setProperty('--ty', `${(Math.random() - 0.5) * 400 - 200}px`);
      confetti.style.setProperty('--rot', `${Math.random() * 720}deg`);
      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 1800);
    }
  }

  public close() {
    this.modalEl?.classList.add('hidden');
  }
}
