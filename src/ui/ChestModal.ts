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
    // Não abre mais o modal durante a jogatina: apenas armazena os baús silenciosamente!
    document.getElementById('btnOpenChestReward')?.addEventListener('click', () => {
      this.openManual();
    });
  }

  public openManual() {
    const data = this.profileService.getProfileData();
    if (data.unclaimedChests > 0) {
      this.renderChestView(`🎁 BAÚ DO TESOURO DISPONÍVEL!`, `Você tem ${data.unclaimedChests} baú(s) para abrir. Clique no baú ou resgate todos de uma vez:`, true, data.unclaimedChests);
    } else {
      this.renderChestView(`🎁 BAÚS DO TESOURO ARCADE`, `Você está no Nível ${data.level}. Continue jogando e suba de nível para resgatar baús repletos de moedas e temas exclusivos!`, false, 0);
    }
    this.modalEl?.classList.remove('hidden');
    this.modalEl?.classList.add('open');
  }

  public close() {
    this.modalEl?.classList.remove('open');
    this.modalEl?.classList.add('hidden');
  }

  private renderChestView(title: string, subtitle: string, canOpen: boolean, chestCount: number) {
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
          <div class="interactive-chest-container ${canOpen ? 'pulse-hover' : ''}" id="interactiveChest">
            <div class="chest-icon-glow"></div>
            <div class="chest-pixel-art" id="chestIcon">${canOpen ? '🎁' : '🔒📦'}</div>
            <div class="chest-tap-hint" id="chestTapHint">${canOpen ? (chestCount > 1 ? `👆 CLIQUE PARA ABRIR (OU VEJA ABAIXO)` : '👆 CLIQUE PARA ABRIR!') : '✨ Ganhe baús ao subir de nível!'}</div>
          </div>

          ${canOpen && chestCount > 1 ? `
            <div style="margin-top: 14px; text-align: center;">
              <button class="btn-primary btn-shop-highlight" id="btnClaimAllChests" style="padding: 10px 18px; font-size: 14px; width: 100%;">
                ⚡ ABRIR TODOS OS ${chestCount} BAÚS DE UMA VEZ
              </button>
            </div>
          ` : ''}

          <div class="chest-reward-area hidden" id="chestRewardArea"></div>
        </div>
      </div>
    `;

    document.getElementById('btnCloseChest')?.addEventListener('click', () => this.close());
    if (canOpen) {
      document.getElementById('interactiveChest')?.addEventListener('click', () => this.triggerOpenChest());
      document.getElementById('btnClaimAllChests')?.addEventListener('click', () => this.triggerOpenAllChests());
    }
  }

  private triggerOpenChest() {
    if (this.isChestOpened) return;
    this.isChestOpened = true;

    const chestIcon = document.getElementById('chestIcon');
    const tapHint = document.getElementById('chestTapHint');
    const rewardArea = document.getElementById('chestRewardArea');
    const btnClaimAll = document.getElementById('btnClaimAllChests');
    if (btnClaimAll) btnClaimAll.remove();

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
              ${this.profileService.getUnclaimedChests() > 0 ? `🎁 ABRIR PRÓXIMO BAÚ (${this.profileService.getUnclaimedChests()} restantes)` : '✨ COLETAR E CONTINUAR'}
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

  private triggerOpenAllChests() {
    if (this.isChestOpened) return;
    this.isChestOpened = true;

    const chestIcon = document.getElementById('chestIcon');
    const tapHint = document.getElementById('chestTapHint');
    const rewardArea = document.getElementById('chestRewardArea');
    const btnClaimAll = document.getElementById('btnClaimAllChests');
    if (btnClaimAll) btnClaimAll.remove();

    if (chestIcon) {
      chestIcon.innerText = '🎆👑📦💎✨';
      chestIcon.classList.add('chest-burst-anim');
    }
    if (tapHint) tapHint.remove();

    this.sound.playEatFruit();
    this.sound.playExtraLife();
    this.launchConfettiEffect();
    this.launchConfettiEffect();

    const res = this.profileService.claimAllChests();
    this.economyService.addCoins(res.totalCoins);

    setTimeout(() => {
      if (rewardArea) {
        rewardArea.innerHTML = `
          <div class="reward-box-reveal">
            <div style="font-size: 13px; color: #ffd700; font-weight: bold; margin-bottom: 4px;">🎉 TODOS OS ${res.count} BAÚS FORAM ABERTOS!</div>
            <div class="reward-coins-val" style="font-size: 26px;">+${res.totalCoins.toLocaleString()} 🪙 MOEDAS!</div>
            ${res.unlockedThemes.length > 0 ? `
              <div class="reward-unlock-tag">🔓 ${res.unlockedThemes.length} NOVO(S) DESBLOQUEIO(S):<br><strong>${res.unlockedThemes.join(', ')}</strong></div>
            ` : ''}
            <button class="btn-primary btn-claim-action" id="btnClaimAndClose">
              ✨ COLETAR E CONTINUAR
            </button>
          </div>
        `;
        rewardArea.classList.remove('hidden');

        document.getElementById('btnClaimAndClose')?.addEventListener('click', () => {
          this.close();
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
}
