/**
 * Sintetizador Procedural de Áudio Web Audio API para Pac-Man
 * 100% autônomo com suporte a controle independente de Sirene e Efeitos
 */
export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  public isSirenEnabled: boolean = false; // Desligado por padrão para evitar zunido indesejado
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private wakaToggle: boolean = false;

  constructor() {}

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.sirenGain) {
      this.sirenGain.gain.value = 0;
    }
    return this.isMuted;
  }

  public toggleSiren(): boolean {
    this.isSirenEnabled = !this.isSirenEnabled;
    if (!this.isSirenEnabled) {
      this.stopSiren();
    }
    return this.isSirenEnabled;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playWaka() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = this.wakaToggle ? 450 : 320;
    const endFreq = this.wakaToggle ? 320 : 520;
    this.wakaToggle = !this.wakaToggle;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playEatEnergizer() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playEatGhost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playEatFruit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    });
  }

  public playDeathSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const frequencies = [
      800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100,
    ];

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.06);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    });

    const finalNow = this.ctx.currentTime + frequencies.length * 0.07 + 0.05;
    const finalOsc = this.ctx.createOscillator();
    const finalGain = this.ctx.createGain();
    finalOsc.type = 'sine';
    finalOsc.frequency.setValueAtTime(100, finalNow);
    finalGain.gain.setValueAtTime(0.3, finalNow);
    finalGain.gain.exponentialRampToValueAtTime(0.01, finalNow + 0.15);
    finalOsc.connect(finalGain);
    finalGain.connect(this.ctx.destination);
    finalOsc.start(finalNow);
    finalOsc.stop(finalNow + 0.16);
  }

  public playIntroTheme(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted) {
        setTimeout(resolve, 4000);
        return;
      }
      this.initContext();
      if (!this.ctx) {
        setTimeout(resolve, 4000);
        return;
      }

      const notes: [number, number][] = [
        [493.88, 0.13], [987.77, 0.13], [739.99, 0.13], [622.25, 0.13],
        [987.77, 0.09], [739.99, 0.18], [622.25, 0.26],
        [523.25, 0.13], [1046.5, 0.13], [783.99, 0.13], [659.25, 0.13],
        [1046.5, 0.09], [783.99, 0.18], [659.25, 0.26],
        [493.88, 0.13], [987.77, 0.13], [739.99, 0.13], [622.25, 0.13],
        [987.77, 0.09], [739.99, 0.18], [622.25, 0.26],
        [622.25, 0.06], [659.25, 0.06], [698.46, 0.06],
        [698.46, 0.06], [739.99, 0.06], [783.99, 0.06],
        [783.99, 0.06], [830.61, 0.06], [880.0, 0.06], [987.77, 0.26],
      ];

      let elapsed = 0;
      notes.forEach(([freq, dur]) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + elapsed;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur * 0.95);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
        elapsed += dur;
      });

      setTimeout(resolve, elapsed * 1000 + 200);
    });
  }

  public playExtraLife() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    });
  }

  public playBombExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);
  }

  public playMagnetSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playShieldEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playFreezeChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [1046.5, 1318.51, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  public startSiren(frightened: boolean = false, speedLevel: number = 1) {
    if (!this.isSirenEnabled || this.isMuted) {
      this.stopSiren();
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    if (!this.sirenOsc) {
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.sirenOsc.type = 'sine'; // Senoide suave em vez de triângulo estridente
      this.sirenGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);
      this.sirenOsc.start();
    }

    const baseFreq = frightened ? 140 : 200 + speedLevel * 20;
    const now = this.ctx.currentTime;
    this.sirenOsc.frequency.setValueAtTime(baseFreq, now);
  }

  public stopSiren() {
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {}
      this.sirenOsc = null;
      this.sirenGain = null;
    }
  }
}
