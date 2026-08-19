// Web Audio API Procedural Minecraft Sound Synthesizer
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.8;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
  }

  playBlockBreak() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Noise-like crunch burst
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140 + Math.random() * 80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  playBlockPlace() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.4 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  playHitHurt() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Classic Minecraft "Oof" / hit sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.5 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playToggleClick(enabled) {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(enabled ? 880 : 440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(enabled ? 1200 : 300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  playStep() {
    if (!this.enabled) return;
    this.init();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100 + Math.random() * 40, ctx.currentTime);
    gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }
}
