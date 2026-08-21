import { LeaderboardService } from '../services/LeaderboardService.ts';

export class LeaderboardModal {
  private modalEl: HTMLElement | null = null;
  private newRecordModalEl: HTMLElement | null = null;
  private leaderboardService: LeaderboardService;
  private pendingScore: { score: number; level: number; gameMode: string } | null = null;

  constructor(leaderboardService: LeaderboardService) {
    this.leaderboardService = leaderboardService;
    this.modalEl = document.getElementById('leaderboardModal');
    this.newRecordModalEl = document.getElementById('newRecordModal');
    this.setupListeners();
  }

  public open() {
    this.modalEl?.classList.add('open');
    this.render();
  }

  public close() {
    this.modalEl?.classList.remove('open');
  }

  public closeRecordModal() {
    this.newRecordModalEl?.classList.remove('open');
  }

  private setupListeners() {
    document.getElementById('btnCloseLeaderboard')?.addEventListener('click', () => this.close());
    document.getElementById('btnCloseNewRecord')?.addEventListener('click', () => this.closeRecordModal());

    const inputInitials = document.getElementById('inputInitials') as HTMLInputElement;
    inputInitials?.addEventListener('input', () => {
      inputInitials.value = inputInitials.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    });

    document.getElementById('btnSaveRecord')?.addEventListener('click', () => {
      const initials = (inputInitials?.value || 'PAC').toUpperCase().slice(0, 3);
      if (this.pendingScore) {
        this.leaderboardService.addScore(
          initials,
          this.pendingScore.score,
          this.pendingScore.level,
          this.pendingScore.gameMode
        );
        this.pendingScore = null;
      }
      this.closeRecordModal();
      this.open();
    });
  }

  public render() {
    const listEl = document.getElementById('leaderboardRows');
    if (!listEl) return;

    const scores = this.leaderboardService.getTopScores();
    listEl.innerHTML = '';

    scores.forEach((entry) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: #FFFF00;">#${entry.rank}</td>
        <td style="color: #00FFFF; font-weight: bold;">${entry.initials}</td>
        <td style="color: #FFFFFF; text-align: right;">${entry.score.toLocaleString()}</td>
        <td style="color: #FFA726; text-align: center;">Nv.${entry.level}</td>
        <td style="color: #8888b0; font-size: 0.45rem;">${entry.date}</td>
      `;
      listEl.appendChild(tr);
    });
  }

  public promptSaveScore(score: number, level: number, gameMode: string = 'Clássico') {
    if (this.leaderboardService.isHighScore(score)) {
      this.pendingScore = { score, level, gameMode };
      const scoreDisplay = document.getElementById('newRecordScoreText');
      if (scoreDisplay) {
        scoreDisplay.innerText = `${score.toLocaleString()} PONTOS`;
      }
      const inputInitials = document.getElementById('inputInitials') as HTMLInputElement;
      if (inputInitials) {
        inputInitials.value = 'AAA';
        setTimeout(() => inputInitials.focus(), 100);
      }
      this.newRecordModalEl?.classList.add('open');
    }
  }
}
