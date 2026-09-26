// Ambient Sound Synthesizer via Web Audio API (zero external assets, 100% offline & reliable)

export type AmbientSoundType = 'none' | 'rain' | 'whitenoise' | 'campfire' | 'cafe';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'none';
  private nodes: (AudioNode | number)[] = [];
  private isRunning = false;
  private gainNode: GainNode | null = null;
  private volume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public play(type: AmbientSoundType) {
    if (type === this.currentType && this.isRunning) return;
    this.stop();

    if (type === 'none') {
      this.currentType = 'none';
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      if (type === 'whitenoise') {
        this.playPinkNoise();
      } else if (type === 'rain') {
        this.playRainSound();
      } else if (type === 'campfire') {
        this.playCampfireSound();
      } else if (type === 'cafe') {
        this.playCafeAmbience();
      }

      this.currentType = type;
      this.isRunning = true;
    } catch (e) {
      console.warn('Audio synthesis not supported or failed to start:', e);
    }
  }

  public stop() {
    this.nodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch {}
      }
    });
    this.nodes = [];
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
    this.currentType = 'none';
    this.isRunning = false;
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  private playPinkNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.connect(this.gainNode);
    whiteNoise.start();
    this.nodes.push(whiteNoise);
  }

  private playRainSound() {
    if (!this.ctx || !this.gainNode) return;
    // Layer 1: Filtered pink noise (rumble + raindrops)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(this.gainNode);
    source.start();
    this.nodes.push(source, filter);

    // Layer 2: high drops filter
    const highFilter = this.ctx.createBiquadFilter();
    highFilter.type = 'bandpass';
    highFilter.frequency.setValueAtTime(3200, this.ctx.currentTime);
    highFilter.Q.setValueAtTime(3, this.ctx.currentTime);

    const source2 = this.ctx.createBufferSource();
    source2.buffer = noiseBuffer;
    source2.loop = true;
    source2.connect(highFilter);
    highFilter.connect(this.gainNode);
    source2.start();
    this.nodes.push(source2, highFilter);
  }

  private playCampfireSound() {
    if (!this.ctx || !this.gainNode) return;
    // Low fire roar
    this.playPinkNoise();

    // Crackle pops
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.gainNode) return;
      if (Math.random() > 0.4) {
        const osc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100 + Math.random() * 800, this.ctx.currentTime);
        popGain.gain.setValueAtTime(0.04 + Math.random() * 0.05, this.ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
        osc.connect(popGain);
        popGain.connect(this.gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }
    }, 120);

    this.nodes.push(interval);
  }

  private playCafeAmbience() {
    if (!this.ctx || !this.gainNode) return;
    // Gentle warm low hum
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    oscGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(this.gainNode);
    osc.start();
    this.nodes.push(osc, oscGain);

    // Warm diffused soft chatter noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.04;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(this.gainNode);
    source.start();
    this.nodes.push(source, filter);
  }
}

export const ambientSound = new SoundSynthesizer();
