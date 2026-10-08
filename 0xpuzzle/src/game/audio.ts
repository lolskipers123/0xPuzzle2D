/**
 * Synthesized Web Audio API Sound Engine
 * No external audio files needed; 100% reliable, zero latency, retro chiptune aesthetics.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public musicEnabled: boolean = true;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private unlockHandler: (() => void) | null = null;
  private static readonly PREF_KEY = 'oxpuzzle_audio_v1';

  constructor() {
    // Restore the player's saved mute / music choices (defaults: sound on, music on)
    try {
      const saved = JSON.parse(localStorage.getItem(SoundEngine.PREF_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        if (typeof saved.sound === 'boolean') this.soundEnabled = saved.sound;
        if (typeof saved.music === 'boolean') this.musicEnabled = saved.music;
      }
    } catch {
      // storage unavailable: keep defaults
    }

    if (typeof window !== 'undefined') {
      // Browsers (especially iOS Safari) only allow audio after a user gesture.
      // Listen for the first few kinds of gesture and unlock on whichever comes first.
      this.unlockHandler = () => {
        this.enableAudioOnGesture();
        if (this.ctx && this.ctx.state === 'running') this.removeUnlockListeners();
      };
      for (const ev of SoundEngine.UNLOCK_EVENTS) {
        window.addEventListener(ev, this.unlockHandler, { passive: true });
      }

      // Pause audio when the page is hidden (switching apps / locking the phone)
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) {
          this.ctx.suspend().catch(() => {});
        } else {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  private static readonly UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];

  private removeUnlockListeners() {
    if (!this.unlockHandler) return;
    for (const ev of SoundEngine.UNLOCK_EVENTS) {
      window.removeEventListener(ev, this.unlockHandler);
    }
    this.unlockHandler = null;
  }

  private savePrefs() {
    try {
      localStorage.setItem(
        SoundEngine.PREF_KEY,
        JSON.stringify({ sound: this.soundEnabled, music: this.musicEnabled })
      );
    } catch {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // iOS: treat this as media playback so sound isn't muted by the ring/silent switch
        const nav = navigator as Navigator & { audioSession?: { type: string } };
        try {
          if (nav.audioSession) nav.audioSession.type = 'playback';
        } catch {
          // not supported
        }

        // iOS: playing one silent sample inside a gesture fully unlocks the context
        try {
          const buf = this.ctx.createBuffer(1, 1, 22050);
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          src.connect(this.ctx.destination);
          src.start(0);
        } catch {
          // ignore
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public enableAudioOnGesture() {
    this.initContext();
    // Start the background music as soon as audio is allowed (if the player wants it)
    if (this.ctx && this.musicEnabled && this.bgmInterval === null) {
      this.startBGM();
    }
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    this.savePrefs();
    return this.soundEnabled;
  }

  public toggleMusic(): boolean {
    this.initContext();
    this.musicEnabled = !this.musicEnabled;
    this.savePrefs();
    if (this.musicEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.musicEnabled;
  }

  // --- Sound Effects ---

  public playJump() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.12);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playDoubleJump() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.15);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playDash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    // White noise buffer for whoosh
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  public playZap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(110, t + 0.05);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 880]; // D5 -> A5

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  public playTerminalBeep() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.05); // E5
    osc.frequency.setValueAtTime(783.99, t + 0.1); // G5

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  public playBossRoar() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.35);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playCipherCorrect() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  }

  public playCipherError() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.setValueAtTime(110, t + 0.1);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  public playShieldShatter() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Glass shatter resonance
    [880, 1174, 1760, 2349].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.03;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(120, start + 0.25);

      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  public playBitFlip(isOne: boolean = true) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = isOne ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isOne ? 660 : 380, t);
    osc.frequency.exponentialRampToValueAtTime(isOne ? 880 : 300, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playHexDial() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  public playGateUnlock() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [392, 523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.07;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.22);
    });
  }

  public playLaserHum() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playVictoryFanfare() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.32);
    });
  }

  // --- Chiptune Background Music Loop ---
  private startBGM() {
    this.stopBGM();
    if (!this.musicEnabled) return;

    // Harmonic progression: C minor -> Ab major -> Bb major -> G minor
    const progression = [
      [261.63, 311.13, 392.00, 523.25], // Cm
      [207.65, 261.63, 311.13, 415.30], // Ab
      [233.08, 293.66, 349.23, 466.16], // Bb
      [196.00, 246.94, 293.66, 392.00], // Gm
    ];

    const bassNotes = [130.81, 103.83, 116.54, 98.00];

    this.bgmStep = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicEnabled || this.ctx.state !== 'running') return;

      const chordIdx = Math.floor((this.bgmStep / 8) % 4);
      const noteIdx = this.bgmStep % 4;
      const chord = progression[chordIdx];
      const freq = chord[noteIdx];
      const t = this.ctx.currentTime;

      // Arp Voice
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(freq, t);
      arpGain.gain.setValueAtTime(0.025, t);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      arpOsc.connect(arpGain);
      arpGain.connect(this.ctx.destination);
      arpOsc.start(t);
      arpOsc.stop(t + 0.15);

      // Bass note on downbeats
      if (this.bgmStep % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassNotes[chordIdx], t);
        bassGain.gain.setValueAtTime(0.04, t);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.36);
      }

      this.bgmStep = (this.bgmStep + 1) % 32;
    }, 180);
  }

  private stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const sounds = new SoundEngine();
