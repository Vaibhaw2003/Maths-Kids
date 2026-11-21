import { LanguageCode } from '../types/game';

class AudioService {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private voiceEnabled = true;
  private musicStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public syncSettings(sound: boolean, music: boolean, voice: boolean) {
    this.soundEnabled = sound;
    this.voiceEnabled = voice;
    if (music !== this.musicEnabled) {
      this.musicEnabled = music;
      if (music) {
        this.startMusic();
      } else {
        this.stopMusic();
      }
    }
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.14,
    delaySec = 0
  ) {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  public playClick() {
    this.playTone(540, 0.07, 'triangle', 0.08);
  }

  public playCorrect() {
    this.playTone(523.25, 0.12, 'triangle', 0.14, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.14, 0.09);
    this.playTone(783.99, 0.22, 'triangle', 0.16, 0.18);
  }

  public playGentleTryAgain() {
    // Gentle warm marimba nudge — never harsh or punishing
    this.playTone(349.23, 0.14, 'sine', 0.1, 0);
    this.playTone(311.13, 0.2, 'sine', 0.09, 0.12);
  }

  public playCelebration() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.25, 'triangle', 0.15, idx * 0.11);
    });
    this.playTone(1046.5, 0.45, 'sine', 0.14, 0.46);
  }

  public startMusic() {
    if (typeof window === 'undefined' || this.musicInterval !== null) return;
    const melody = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 392.0, 440.0];
    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;
      const freq = melody[this.musicStep % melody.length];
      this.musicStep += 1;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }, 620);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public speak(text: string, lang: LanguageCode, force = false) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!this.voiceEnabled && !force) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utter.rate = 0.92;
      utter.pitch = 1.08;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors on unsupported headless browsers
    }
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }
}

export const audioService = new AudioService();
