// Web Audio API Synthesizer for AlgoViz
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  constructor() {
    // Read persisted preference; default to false for polite UX
    const saved = localStorage.getItem("algoviz-audio");
    this.enabled = saved === "true";
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    localStorage.setItem("algoviz-audio", String(enable));
    if (enable) {
      this.initCtx();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  public playTone(freq: number, durationMs: number = 40, type: OscillatorType = "sine", gainVal: number = 0.04) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio playback fails gracefully if blocked by autoplay policy
    }
  }

  public playNoteForValue(val: number, max: number = 100) {
    if (!this.enabled) return;
    // Map value to frequency between 180Hz and 880Hz
    const minFreq = 180;
    const maxFreq = 880;
    const freq = minFreq + ((val / Math.max(max, 1)) * (maxFreq - minFreq));
    this.playTone(freq, 45, "triangle", 0.035);
  }

  public playCompare(val: number, max: number = 100) {
    if (!this.enabled) return;
    const freq = 220 + ((val / Math.max(max, 1)) * 500);
    this.playTone(freq, 30, "sine", 0.025);
  }

  public playSwap(val: number, max: number = 100) {
    if (!this.enabled) return;
    const freq = 280 + ((val / Math.max(max, 1)) * 620);
    this.playTone(freq, 40, "triangle", 0.04);
  }

  public playSuccess() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 120, "sine", 0.04);
      }, idx * 60);
    });
  }

  public playTargetFound() {
    if (!this.enabled) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 100, "triangle", 0.04);
      }, idx * 50);
    });
  }

  public playVisit() {
    if (!this.enabled) return;
    this.playTone(320 + Math.random() * 80, 25, "sine", 0.015);
  }
}

export const sound = new SoundEngine();
