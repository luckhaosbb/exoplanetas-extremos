// Web Audio API Synthesizer for sci-fi ambient hums and scanner sound FX

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.isEnabled = false;
    this.ambientOsc = null;
    this.ambientGain = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.initContext();
    this.isEnabled = !this.isEnabled;

    if (this.isEnabled) {
      this.startAmbientDrone();
      this.playScanBeep();
    } else {
      this.stopAmbientDrone();
    }

    return this.isEnabled;
  }

  startAmbientDrone() {
    if (!this.ctx || !this.isEnabled) return;
    this.stopAmbientDrone();

    try {
      this.ambientOsc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sawtooth';
      osc2.type = 'sine';

      this.ambientOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // Low deep space sub-bass
      osc2.frequency.setValueAtTime(90, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Gentle ambient volume

      this.ambientOsc.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start();
      osc2.start();
      this._osc2 = osc2;
    } catch (e) {
      console.warn('Audio playback notice:', e);
    }
  }

  stopAmbientDrone() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        if (this._osc2) this._osc2.stop();
      } catch (e) {}
      this.ambientOsc = null;
    }
  }

  playScanBeep() {
    if (!this.ctx || !this.isEnabled) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  playHazardAlert() {
    if (!this.ctx || !this.isEnabled) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }
}

export const soundManager = new SoundEffects();
