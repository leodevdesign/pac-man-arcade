import { ProfileService } from '../services/ProfileService.ts';
import { PacmanSkin } from '../core/Constants.ts';

const SKIN_AVATARS: Record<PacmanSkin, string> = {
  [PacmanSkin.CLASSIC]: '🟡',
  [PacmanSkin.SUNGLASSES]: '🕶️',
  [PacmanSkin.GOLDEN]: '👑',
  [PacmanSkin.MS_PACMAN]: '🎀',
  [PacmanSkin.CHRISTMAS]: '🎄',
  [PacmanSkin.HALLOWEEN]: '🎃',
  [PacmanSkin.EASTER]: '🐰',
  [PacmanSkin.CYBERPUNK]: '🤖',
};

export class ProfileCard {
  private profileService: ProfileService;
  private currentSkin: PacmanSkin = PacmanSkin.CLASSIC;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
    this.init();
  }

  public setSkin(skin: PacmanSkin) {
    this.currentSkin = skin;
    this.render();
  }

  private init() {
    this.profileService.onProfileChanged(() => {
      this.render();
    });
    this.render();
  }

  public render() {
    const data = this.profileService.getProfileData();
    const titleInfo = this.profileService.getTitleInfo();
    const xpReq = this.profileService.getXpForNextLevel(data.level);
    const percent = Math.min(100, Math.floor((data.xp / xpReq) * 100));
    const masteryMult = this.profileService.getMasteryScoreMultiplier();
    const masteryBonusPct = Math.round((masteryMult - 1.0) * 100);

    const avatarIcon = document.getElementById('profileAvatarIcon');
    const avatarFrame = document.getElementById('profileAvatarFrame');
    const levelBadge = document.getElementById('profileLevelBadge');
    const titleEl = document.getElementById('profileTitle');
    const xpText = document.getElementById('profileXpText');
    const xpFill = document.getElementById('profileXpFill');
    const masteryTag = document.getElementById('profileMasteryTag');
    const chestButton = document.getElementById('btnOpenChestReward');

    if (avatarIcon) avatarIcon.innerText = SKIN_AVATARS[this.currentSkin] || '🟡';
    if (avatarFrame) {
      avatarFrame.className = `profile-avatar-frame ${titleInfo.borderClass}`;
    }
    if (levelBadge) {
      levelBadge.innerText = `LVL ${data.level}`;
      levelBadge.className = `profile-level-badge ${titleInfo.badgeClass}`;
    }
    if (titleEl) {
      titleEl.innerText = titleInfo.title;
    }
    if (xpText) {
      xpText.innerText = `${data.xp.toLocaleString()} / ${xpReq.toLocaleString()} XP (${percent}%)`;
    }
    if (xpFill) {
      xpFill.style.width = `${percent}%`;
    }
    if (masteryTag) {
      masteryTag.innerHTML = `✨ Maestria: <strong>+${masteryBonusPct}% Pontos Globais</strong>`;
    }

    if (chestButton) {
      if (data.unclaimedChests > 0) {
        chestButton.classList.remove('hidden');
        chestButton.innerHTML = `🎁 <strong>${data.unclaimedChests} Baú${data.unclaimedChests > 1 ? 's' : ''} para Abrir!</strong>`;
      } else {
        chestButton.classList.add('hidden');
      }
    }
  }
}
