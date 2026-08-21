export interface HighScoreEntry {
  rank?: number;
  initials: string;
  score: number;
  level: number;
  date: string;
  gameMode: string;
}

export class LeaderboardService {
  private static STORAGE_KEY = 'pacman_leaderboard_v1';
  private entries: HighScoreEntry[] = [];

  constructor() {
    this.load();
  }

  public getTopScores(): HighScoreEntry[] {
    return this.entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  public isHighScore(score: number): boolean {
    if (score <= 0) return false;
    if (this.entries.length < 10) return true;
    return score > this.entries[this.entries.length - 1].score;
  }

  public addScore(initials: string, score: number, level: number, gameMode: string = 'Clássico') {
    const formattedInitials = (initials || 'PAC').toUpperCase().slice(0, 3);
    const newEntry: HighScoreEntry = {
      initials: formattedInitials,
      score,
      level,
      date: new Date().toLocaleDateString(),
      gameMode,
    };

    this.entries.push(newEntry);
    this.entries.sort((a, b) => b.score - a.score);
    if (this.entries.length > 10) {
      this.entries = this.entries.slice(0, 10);
    }
    this.save();
  }

  private save() {
    localStorage.setItem(LeaderboardService.STORAGE_KEY, JSON.stringify(this.entries));
  }

  private load() {
    const saved = localStorage.getItem(LeaderboardService.STORAGE_KEY);
    if (saved) {
      try {
        this.entries = JSON.parse(saved);
      } catch {
        this.setDefaultScores();
      }
    } else {
      this.setDefaultScores();
    }
  }

  private setDefaultScores() {
    this.entries = [
      { initials: 'PAC', score: 10000, level: 5, date: '1980', gameMode: 'Clássico' },
      { initials: 'MID', score: 8500, level: 4, date: '1980', gameMode: 'Clássico' },
      { initials: 'NAM', score: 6200, level: 3, date: '1980', gameMode: 'Clássico' },
      { initials: 'TOR', score: 4500, level: 2, date: '1980', gameMode: 'Clássico' },
      { initials: 'IWK', score: 3000, level: 2, date: '1980', gameMode: 'Clássico' },
    ];
    this.save();
  }
}
