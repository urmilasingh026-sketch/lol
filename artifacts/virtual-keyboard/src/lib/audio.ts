// Ultra-Premium Web Audio API Synthesizer — 23+ Professional Instruments + Full Effects Chain

const KEY_TO_PIANO_FREQ: Record<string, number> = {
  KeyA: 130.81, KeyS: 146.83, KeyD: 164.81, KeyF: 174.61, KeyG: 196.00,
  KeyH: 220.00, KeyJ: 246.94, KeyK: 261.63, KeyL: 293.66,
  KeyZ: 311.13, KeyX: 329.63, KeyC: 349.23, KeyV: 392.00,
  KeyB: 440.00, KeyN: 493.88, KeyM: 523.25,
  KeyQ: 587.33, KeyW: 659.26, KeyE: 698.46, KeyR: 783.99,
  KeyT: 830.61, KeyY: 880.00, KeyU: 987.77, KeyI: 1046.50,
  KeyO: 1174.66, KeyP: 1318.51,
};

const DIGIT_TO_GUITAR_FREQ: Record<string, number> = {
  Digit1: 82.41, Digit2: 110.00, Digit3: 146.83, Digit4: 196.00,
  Digit5: 246.94, Digit6: 329.63, Digit7: 440.00, Digit8: 587.33,
  Digit9: 659.26, Digit0: 783.99,
};

// Shift + Digit (! @ # $ % ^ & * ( )) → flute frequencies (higher register)
const SHIFTED_DIGIT_FLUTE_FREQ: Record<string, number> = {
  Digit1: 698.46,   // !
  Digit2: 783.99,   // @
  Digit3: 880.00,   // #
  Digit4: 987.77,   // $
  Digit5: 1046.50,  // %
  Digit6: 1174.66,  // ^
  Digit7: 1318.51,  // &
  Digit8: 1396.91,  // *
  Digit9: 1568.00,  // (
  Digit0: 1760.00,  // )
};

const SYMBOL_TO_FLUTE_FREQ: Record<string, number> = {
  Minus: 523.25, Equal: 587.33, BracketLeft: 659.26, BracketRight: 698.46,
  Backslash: 783.99, Semicolon: 880.00, Quote: 987.77,
  Comma: 1046.50, Period: 1174.66, Slash: 1318.51, Backquote: 1396.91,
};

const DRUM_FREQS: Record<string, { base: number; type: string; isNoise?: boolean }> = {
  F1: { base: 60, type: 'kick' },
  F2: { base: 1800, type: 'snare', isNoise: true },
  F3: { base: 3200, type: 'hihat_closed', isNoise: true },
  F4: { base: 3200, type: 'hihat_open', isNoise: true },
  F5: { base: 150, type: 'tom_high' },
  F6: { base: 110, type: 'tom_mid' },
  F7: { base: 60, type: 'tom_low' },
  F8: { base: 900, type: 'crash', isNoise: true },
  F9: { base: 800, type: 'ride', isNoise: true },
  F10: { base: 540, type: 'cowbell' },
  F11: { base: 400, type: 'perc_fx', isNoise: true },
  F12: { base: 700, type: 'fill_fx', isNoise: true },
};

const NUMPAD_FREQS: Record<string, number> = {
  Numpad0: 700, Numpad1: 730, Numpad2: 760, Numpad3: 790, Numpad4: 820,
  Numpad5: 850, Numpad6: 880, Numpad7: 910, Numpad8: 940, Numpad9: 970,
  NumpadDivide: 1000, NumpadMultiply: 1100, NumpadSubtract: 800,
  NumpadDecimal: 650,
};

const ARROW_SYNTH: Record<string, { freq: number; filterFreq: number }> = {
  ArrowUp: { freq: 220, filterFreq: 3000 },
  ArrowDown: { freq: 110, filterFreq: 500 },
  ArrowLeft: { freq: 165, filterFreq: 1000 },
  ArrowRight: { freq: 330, filterFreq: 2000 },
};

const PAD_FREQS: Record<string, number> = {
  ControlLeft: 65.41, ControlRight: 73.42,
  AltLeft: 82.41, AltRight: 98.00,
};

// Sound category modifiers — shape the character of each instrument
interface SoundMods {
  filterMult: number;   // multiply default filter frequencies
  attackMult: number;   // multiply attack time
  releaseMult: number;  // multiply release time
  gainMult: number;     // multiply output gain
  detune: number;       // cents of detuning
  harmonicMix: number;  // extra harmonic brightness (0=warm, 1=bright)
  waveType: OscillatorType; // fundamental oscillator shape
}

function getCategoryMods(category: string): SoundMods {
  switch (category) {
    // ── Realistic / Studio ────────────────────────────────────────────────────
    case 'Realistic Sounds':
      return { filterMult: 1.0, attackMult: 1.0, releaseMult: 1.0, gainMult: 1.0, detune: 0, harmonicMix: 0.5, waveType: 'triangle' };
    case 'Acoustic Sounds':
      return { filterMult: 0.85, attackMult: 0.7, releaseMult: 1.1, gainMult: 0.9, detune: 0, harmonicMix: 0.35, waveType: 'triangle' };
    case 'Orchestral Sounds':
    case 'Classical Sounds':
      return { filterMult: 0.9, attackMult: 2.2, releaseMult: 2.8, gainMult: 0.95, detune: 0, harmonicMix: 0.5, waveType: 'triangle' };
    case 'Jazz Sounds':
      return { filterMult: 0.75, attackMult: 1.3, releaseMult: 1.5, gainMult: 0.9, detune: 0, harmonicMix: 0.45, waveType: 'triangle' };
    case 'Baroque Sounds':
      return { filterMult: 1.1, attackMult: 0.5, releaseMult: 0.9, gainMult: 0.92, detune: -5, harmonicMix: 0.7, waveType: 'triangle' };
    case 'Gospel Sounds':
      return { filterMult: 0.8, attackMult: 1.8, releaseMult: 2.5, gainMult: 1.0, detune: 0, harmonicMix: 0.6, waveType: 'triangle' };
    // ── Natural / Ambient ─────────────────────────────────────────────────────
    case 'Nature Sounds':
    case 'Environmental Sounds':
      return { filterMult: 0.38, attackMult: 3.5, releaseMult: 5.0, gainMult: 0.5, detune: -5, harmonicMix: 0.15, waveType: 'sine' };
    case 'Ambient Sounds':
    case 'Atmospheric Sounds':
      return { filterMult: 0.6, attackMult: 4.0, releaseMult: 4.0, gainMult: 0.55, detune: 0, harmonicMix: 0.3, waveType: 'sine' };
    case 'Cinematic Sounds':
      return { filterMult: 0.85, attackMult: 2.5, releaseMult: 3.0, gainMult: 1.05, detune: 0, harmonicMix: 0.6, waveType: 'triangle' };
    // ── Electronic / Digital ─────────────────────────────────────────────────
    case 'Electronic / Synth Sounds':
      return { filterMult: 2.8, attackMult: 0.2, releaseMult: 0.5, gainMult: 1.1, detune: 7, harmonicMix: 0.9, waveType: 'sawtooth' };
    case 'Futuristic / Sci-fi Sounds':
      return { filterMult: 5.0, attackMult: 0.4, releaseMult: 0.8, gainMult: 1.0, detune: 24, harmonicMix: 1.0, waveType: 'sawtooth' };
    case 'Game / Arcade Sounds':
    case 'Digital / Pixel Sounds':
      return { filterMult: 3.5, attackMult: 0.08, releaseMult: 0.25, gainMult: 1.0, detune: 12, harmonicMix: 1.0, waveType: 'square' };
    case 'Retro / Vintage Sounds':
      return { filterMult: 0.55, attackMult: 1.8, releaseMult: 1.4, gainMult: 0.88, detune: -10, harmonicMix: 0.35, waveType: 'square' };
    case 'Lo-fi':
      return { filterMult: 0.45, attackMult: 1.3, releaseMult: 1.6, gainMult: 0.85, detune: -8, harmonicMix: 0.2, waveType: 'triangle' };
    case 'Chillwave / Vaporwave Sounds':
    case 'Synthwave Sounds':
    case 'Ambient Electronic':
      return { filterMult: 1.2, attackMult: 1.5, releaseMult: 2.0, gainMult: 0.85, detune: 3, harmonicMix: 0.65, waveType: 'sawtooth' };
    case 'IDM / Glitch Sounds':
    case 'Glitch / Dub Sounds':
      return { filterMult: 3.0, attackMult: 0.05, releaseMult: 0.3, gainMult: 1.05, detune: 19, harmonicMix: 1.0, waveType: 'square' };
    // ── Mood / Wellness ───────────────────────────────────────────────────────
    case 'Meditation / Healing Sounds':
    case 'Meditation Bells':
      return { filterMult: 0.35, attackMult: 5.0, releaseMult: 6.0, gainMult: 0.45, detune: -3, harmonicMix: 0.1, waveType: 'sine' };
    case 'Chill / Relax Sounds':
    case 'Ambient / Chill-hop Sounds':
      return { filterMult: 0.55, attackMult: 2.0, releaseMult: 2.5, gainMult: 0.65, detune: -2, harmonicMix: 0.25, waveType: 'sine' };
    case 'ASMR Sounds':
      return { filterMult: 0.28, attackMult: 3.0, releaseMult: 4.5, gainMult: 0.25, detune: 0, harmonicMix: 0.05, waveType: 'sine' };
    // ── Percussion / Rhythm ───────────────────────────────────────────────────
    case 'Percussion / Rhythm Sounds':
      return { filterMult: 2.0, attackMult: 0.1, releaseMult: 0.4, gainMult: 1.15, detune: 0, harmonicMix: 0.8, waveType: 'square' };
    case 'Ethnic / World Percussion':
    case 'Latin / Reggae Sounds':
    case 'Jazz Percussion':
      return { filterMult: 1.0, attackMult: 0.8, releaseMult: 1.2, gainMult: 0.95, detune: 0, harmonicMix: 0.55, waveType: 'triangle' };
    // ── Bass / Low-Frequency ──────────────────────────────────────────────────
    case 'Bass Sounds':
    case 'Dub / Reggae Bass':
      return { filterMult: 0.18, attackMult: 0.5, releaseMult: 2.0, gainMult: 1.3, detune: -12, harmonicMix: 0.15, waveType: 'sawtooth' };
    case 'Hip-Hop / Trap Sounds':
      return { filterMult: 0.45, attackMult: 0.15, releaseMult: 0.4, gainMult: 1.2, detune: 0, harmonicMix: 0.3, waveType: 'sawtooth' };
    // ── Creative / Experimental ───────────────────────────────────────────────
    case 'Experimental / Creative Sounds':
    case 'Sound Effects (FX)':
      return { filterMult: 3.0, attackMult: 0.05, releaseMult: 0.3, gainMult: 1.05, detune: 19, harmonicMix: 1.0, waveType: 'sawtooth' };
    case 'Vocal / Human Sounds':
      return { filterMult: 0.9, attackMult: 1.8, releaseMult: 2.2, gainMult: 0.8, detune: 0, harmonicMix: 0.4, waveType: 'sine' };
    // ── Traditional / Cultural ────────────────────────────────────────────────
    case 'World Music Sounds':
    case 'Traditional / Cultural Sounds':
    case 'African Sounds':
    case 'Asian Sounds':
    case 'Celtic / Irish Sounds':
      return { filterMult: 0.8, attackMult: 1.4, releaseMult: 1.8, gainMult: 0.88, detune: -4, harmonicMix: 0.5, waveType: 'triangle' };
    // ── Specialty ─────────────────────────────────────────────────────────────
    case 'Horror / Dark Sounds':
      return { filterMult: 0.25, attackMult: 2.5, releaseMult: 5.0, gainMult: 0.65, detune: -14, harmonicMix: 0.1, waveType: 'sawtooth' };
    case 'Comedy / Playful Sounds':
      return { filterMult: 2.2, attackMult: 0.15, releaseMult: 0.35, gainMult: 0.9, detune: 7, harmonicMix: 0.8, waveType: 'square' };
    case 'Western / Country Sounds':
      return { filterMult: 0.7, attackMult: 0.9, releaseMult: 1.2, gainMult: 0.9, detune: -3, harmonicMix: 0.4, waveType: 'triangle' };
    case 'Steampunk Sounds':
      return { filterMult: 0.65, attackMult: 0.9, releaseMult: 1.3, gainMult: 1.0, detune: 5, harmonicMix: 0.6, waveType: 'sawtooth' };
    default:
      return { filterMult: 1.0, attackMult: 1.0, releaseMult: 1.0, gainMult: 1.0, detune: 0, harmonicMix: 0.5, waveType: 'triangle' };
  }
}

type NoteEntry = {
  oscillators: OscillatorNode[];
  gain: GainNode;
  bufferSource?: AudioBufferSourceNode;
  lfo?: OscillatorNode;
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noteBus: GainNode | null = null;

  // Effects nodes
  private reverbConvolver: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWetGain: GainNode | null = null;
  private chorusDelay: DelayNode | null = null;
  private chorusLFO: OscillatorNode | null = null;
  private chorusWetGain: GainNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private distortionWetGain: GainNode | null = null;
  private compressorWetGain: GainNode | null = null;
  private compressorDryGain: GainNode | null = null;

  private activeNotes: Map<string, NoteEntry> = new Map();
  public effects = { reverb: false, delay: false, chorus: false, distortion: false, compression: false };
  private soundCategory: string = 'Realistic Sounds';
  private volume = 0.8;
  private velocityBoost = false;

  // Metronome
  private metronomeTimerId: number | null = null;
  private _metronomeBpm = 120;
  private _metronomeEnabled = false;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this._buildChain();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private _buildChain() {
    const ctx = this.ctx!;

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    // Wet (compressed) path — off by default
    this.compressorWetGain = ctx.createGain();
    this.compressorWetGain.gain.value = 0;
    this.compressor.connect(this.compressorWetGain);
    this.compressorWetGain.connect(ctx.destination);

    // Dry (bypass) path — on by default
    this.compressorDryGain = ctx.createGain();
    this.compressorDryGain.gain.value = 1;
    this.compressorDryGain.connect(ctx.destination);

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.compressor);
    this.masterGain.connect(this.compressorDryGain);

    // All note voices connect to this bus
    this.noteBus = ctx.createGain();
    this.noteBus.gain.value = 1.0;

    // Dry path (always active)
    this.noteBus.connect(this.masterGain);

    // Reverb
    this.reverbConvolver = ctx.createConvolver();
    this.reverbConvolver.buffer = this._makeReverb(2.5, 2.0);
    this.reverbWetGain = ctx.createGain();
    this.reverbWetGain.gain.value = 0;
    this.noteBus.connect(this.reverbConvolver);
    this.reverbConvolver.connect(this.reverbWetGain);
    this.reverbWetGain.connect(this.masterGain);

    // Delay
    this.delayNode = ctx.createDelay(1.5);
    this.delayNode.delayTime.value = 0.3;
    this.delayFeedback = ctx.createGain();
    this.delayFeedback.gain.value = 0.38;
    this.delayWetGain = ctx.createGain();
    this.delayWetGain.gain.value = 0;
    this.noteBus.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWetGain);
    this.delayWetGain.connect(this.masterGain);

    // Chorus
    this.chorusDelay = ctx.createDelay(0.06);
    this.chorusDelay.delayTime.value = 0.025;
    this.chorusLFO = ctx.createOscillator();
    this.chorusLFO.type = 'sine';
    this.chorusLFO.frequency.value = 0.8;
    const chorusLFOGain = ctx.createGain();
    chorusLFOGain.gain.value = 0.007;
    this.chorusLFO.connect(chorusLFOGain);
    chorusLFOGain.connect(this.chorusDelay.delayTime);
    this.chorusWetGain = ctx.createGain();
    this.chorusWetGain.gain.value = 0;
    this.noteBus.connect(this.chorusDelay);
    this.chorusDelay.connect(this.chorusWetGain);
    this.chorusWetGain.connect(this.masterGain);
    this.chorusLFO.start();

    // Distortion
    this.distortionNode = ctx.createWaveShaper();
    this.distortionNode.curve = this._makeDistortionCurve(180);
    this.distortionNode.oversample = '4x';
    this.distortionWetGain = ctx.createGain();
    this.distortionWetGain.gain.value = 0;
    this.noteBus.connect(this.distortionNode);
    this.distortionNode.connect(this.distortionWetGain);
    this.distortionWetGain.connect(this.masterGain);
  }

  private _makeReverb(duration: number, decay: number): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const length = Math.floor(sr * duration);
    const buf = this.ctx!.createBuffer(2, length, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buf;
  }

  private _makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const n = 512;
    const curve = new Float32Array(n) as Float32Array<ArrayBuffer>;
    const deg = Math.PI / 180;
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.05);
    }
  }

  setSoundCategory(category: string) {
    this.soundCategory = category;
  }

  setVelocityBoost(active: boolean) { this.velocityBoost = active; }

  toggleEffect(effect: keyof typeof this.effects, enabled: boolean) {
    this.effects[effect] = enabled;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    switch (effect) {
      case 'reverb':
        this.reverbWetGain?.gain.setTargetAtTime(enabled ? 0.38 : 0, t, 0.05);
        break;
      case 'delay':
        this.delayWetGain?.gain.setTargetAtTime(enabled ? 0.45 : 0, t, 0.05);
        break;
      case 'chorus':
        this.chorusWetGain?.gain.setTargetAtTime(enabled ? 0.42 : 0, t, 0.05);
        break;
      case 'distortion':
        this.distortionWetGain?.gain.setTargetAtTime(enabled ? 0.55 : 0, t, 0.05);
        break;
      case 'compression':
        this.compressorWetGain?.gain.setTargetAtTime(enabled ? 1 : 0, t, 0.05);
        this.compressorDryGain?.gain.setTargetAtTime(enabled ? 0 : 1, t, 0.05);
        break;
    }
  }

  setMetronome(enabled: boolean, bpm: number) {
    this._metronomeEnabled = enabled;
    this._metronomeBpm = bpm;
    if (this.metronomeTimerId !== null) {
      clearInterval(this.metronomeTimerId);
      this.metronomeTimerId = null;
    }
    if (enabled) {
      const interval = (60 / bpm) * 1000;
      this._playMetronomeTick(true);
      this.metronomeTimerId = window.setInterval(() => this._playMetronomeTick(false), interval);
    }
  }

  updateMetronomeBpm(bpm: number) {
    this._metronomeBpm = bpm;
    if (this._metronomeEnabled) {
      this.setMetronome(true, bpm);
    }
  }

  private _playMetronomeTick(isDownbeat: boolean) {
    if (!this.ctx || !this.noteBus) return;
    const t = this.ctx.currentTime;
    const freq = isDownbeat ? 1200 : 800;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isDownbeat ? 0.35 : 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  stopAll() {
    if (!this.ctx) return;
    this.activeNotes.forEach(note => {
      try {
        note.gain.gain.cancelScheduledValues(this.ctx!.currentTime);
        note.gain.gain.setValueAtTime(note.gain.gain.value, this.ctx!.currentTime);
        note.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.05);
        note.oscillators.forEach(osc => { try { osc.stop(this.ctx!.currentTime + 0.05); } catch (e) {} });
        note.lfo?.stop(this.ctx!.currentTime + 0.05);
        note.bufferSource?.stop(this.ctx!.currentTime + 0.05);
      } catch (e) {}
    });
    this.activeNotes.clear();
  }

  stopNote(noteId: string, releaseTime: number = 0.3) {
    if (!this.ctx) return;
    const note = this.activeNotes.get(noteId);
    if (!note) return;
    try {
      note.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      note.gain.gain.setValueAtTime(note.gain.gain.value, this.ctx.currentTime);
      note.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + releaseTime);
      const stopAt = this.ctx.currentTime + releaseTime + 0.05;
      note.oscillators.forEach(osc => { try { osc.stop(stopAt); } catch (e) {} });
      note.lfo?.stop(stopAt);
      note.bufferSource?.stop(stopAt);
    } catch (e) {}
    this.activeNotes.delete(noteId);
  }

  private _out(): AudioNode { return this.noteBus!; }

  private _createNoiseBuffer(duration: number): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const buf = this.ctx!.createBuffer(1, sr * duration, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  playKeyAudio(keyCode: string, velocity: number = 0.75, isShifted: boolean = false) {
    if (!this.ctx || !this.noteBus) this.init();
    if (!this.ctx || !this.noteBus) return;
    const vel = this.velocityBoost ? Math.min(1.0, velocity * 1.6) : velocity;
    const mods = getCategoryMods(this.soundCategory);

    // Shift + Digit → flute (!, @, #, $, %, ^, &, *, (, ))
    if (isShifted && SHIFTED_DIGIT_FLUTE_FREQ[keyCode] !== undefined) {
      this._playFlute(`${keyCode}_shift`, SHIFTED_DIGIT_FLUTE_FREQ[keyCode], vel, mods);
      return;
    }

    if (KEY_TO_PIANO_FREQ[keyCode] !== undefined) {
      this._playPiano(keyCode, KEY_TO_PIANO_FREQ[keyCode], vel, mods);
    } else if (DIGIT_TO_GUITAR_FREQ[keyCode] !== undefined) {
      this._playGuitar(keyCode, DIGIT_TO_GUITAR_FREQ[keyCode], vel, mods);
    } else if (DRUM_FREQS[keyCode] !== undefined) {
      this._playDrum(keyCode, DRUM_FREQS[keyCode], vel, mods);
    } else if (SYMBOL_TO_FLUTE_FREQ[keyCode] !== undefined) {
      this._playFlute(keyCode, SYMBOL_TO_FLUTE_FREQ[keyCode], vel, mods);
    } else if (keyCode === 'Space') {
      this._playBass('Space', 55, vel, mods);
    } else if (keyCode === 'Enter' || keyCode === 'NumpadEnter') {
      this._playPianoChord(vel, mods);
    } else if (ARROW_SYNTH[keyCode] !== undefined) {
      this._playSynth(keyCode, ARROW_SYNTH[keyCode].freq, ARROW_SYNTH[keyCode].filterFreq, vel, mods);
    } else if (PAD_FREQS[keyCode] !== undefined) {
      this._playPad(keyCode, PAD_FREQS[keyCode], vel, mods);
    } else if (NUMPAD_FREQS[keyCode] !== undefined) {
      this._playPercussion(keyCode, NUMPAD_FREQS[keyCode], vel, mods);
    } else if (keyCode === 'CapsLock') {
      this._playViolin(vel, mods);
    } else if (keyCode === 'Tab') {
      this._playTrumpet(vel, mods);
    } else if (keyCode === 'Delete') {
      this._playOrgan(vel, mods);
    } else if (keyCode === 'Insert') {
      this._playSaxophone(vel, mods);
    } else if (keyCode === 'Home') {
      this._playHarpsichord(vel, mods);
    } else if (keyCode === 'End') {
      this._playElectricBass(vel, mods);
    } else if (keyCode === 'PageUp') {
      this._playAccordion(vel, mods);
    } else if (keyCode === 'PageDown') {
      this._playFrenchHorn(vel, mods);
    } else if (keyCode === 'PrintScreen') {
      this._playVocoder(vel, mods);
    } else if (keyCode === 'ScrollLock') {
      this._playGlockenspiel(vel, mods);
    } else if (keyCode === 'Pause') {
      this._playTheremin(vel, mods);
    } else if (keyCode === 'NumLock') {
      this._playAcousticGuitar(vel, mods);
    } else if (keyCode === 'MetaLeft' || keyCode === 'MetaRight') {
      this._playVibraphone(vel, mods);
    } else if (keyCode === 'NumpadAdd') {
      this._playPercussion('NumpadAdd', 770, vel, mods);
    }
  }

  // ─── Piano (A-Z) ─────────────────────────────────────────────────────────────
  private _playPiano(id: string, freq: number, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.04);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.01 * mods.attackMult;
    const rel = 4.0 * mods.releaseMult;
    const g = vel * 0.7 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.78, t + Math.max(atk, 0.12));
    gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
    const f = freq * Math.pow(2, mods.detune / 1200);
    const wt = mods.waveType;
    const osc1 = this.ctx.createOscillator(); osc1.type = wt; osc1.frequency.value = f;
    const osc2 = this.ctx.createOscillator(); osc2.type = wt === 'square' ? 'square' : 'sine'; osc2.frequency.value = f * 2;
    const osc3 = this.ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = f * 3;
    const osc4 = this.ctx.createOscillator(); osc4.type = 'sine'; osc4.frequency.value = f * 4;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.28 * (0.5 + mods.harmonicMix * 0.5);
    const m3 = this.ctx.createGain(); m3.gain.value = 0.14 * mods.harmonicMix;
    const m4 = this.ctx.createGain(); m4.gain.value = 0.07 * mods.harmonicMix;
    osc1.connect(gain);
    osc2.connect(m2); m2.connect(gain);
    osc3.connect(m3); m3.connect(gain);
    osc4.connect(m4); m4.connect(gain);
    gain.connect(this._out());
    const dur = rel + 0.1;
    osc1.start(t); osc2.start(t); osc3.start(t); osc4.start(t);
    osc1.stop(t + dur); osc2.stop(t + dur); osc3.stop(t + dur); osc4.stop(t + dur);
    this.activeNotes.set(id, { oscillators: [osc1, osc2, osc3, osc4], gain });
  }

  private _playPianoChord(vel: number, mods: SoundMods) {
    const notes = [261.63, 329.63, 392.00, 523.25];
    const ids = ['chord_c', 'chord_e', 'chord_g', 'chord_c2'];
    notes.forEach((f, i) => this._playPiano(ids[i], f, vel * (0.9 - i * 0.05), mods));
  }

  // ─── Guitar (1-0) ────────────────────────────────────────────────────────────
  private _playGuitar(id: string, freq: number, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.04);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.006 * mods.attackMult;
    const rel = 1.8 * mods.releaseMult;
    const g = vel * 0.8 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.35, t + Math.max(atk, 0.06));
    gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
    const filterFreq = 3800 * mods.filterMult;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = filterFreq; filter.Q.value = 2;
    const f = freq * Math.pow(2, mods.detune / 1200);
    const guitarWave: OscillatorType = mods.waveType === 'square' ? 'square' : mods.waveType === 'sine' ? 'triangle' : 'sawtooth';
    const osc1 = this.ctx.createOscillator(); osc1.type = guitarWave; osc1.frequency.value = f;
    const osc2 = this.ctx.createOscillator(); osc2.type = guitarWave; osc2.frequency.value = f * 2;
    const osc3 = this.ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = f * 0.5;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.3 * mods.harmonicMix;
    const m3 = this.ctx.createGain(); m3.gain.value = 0.45;
    osc1.connect(filter); osc2.connect(m2); m2.connect(filter); osc3.connect(m3); m3.connect(filter);
    filter.connect(gain); gain.connect(this._out());
    osc1.start(t); osc2.start(t); osc3.start(t);
    osc1.stop(t + rel + 0.1); osc2.stop(t + rel + 0.1); osc3.stop(t + rel + 0.1);
    this.activeNotes.set(id, { oscillators: [osc1, osc2, osc3], gain });
  }

  // ─── Drums (F1-F12) ──────────────────────────────────────────────────────────
  private _playDrum(id: string, spec: { base: number; type: string }, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.01);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const gm = mods.gainMult;
    switch (spec.type) {
      case 'kick': {
        gain.gain.setValueAtTime(vel * gm, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35 * mods.releaseMult);
        const osc = this.ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.setValueAtTime(155, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        const click = this.ctx.createOscillator(); click.type = 'sine'; click.frequency.value = 800;
        const cg = this.ctx.createGain(); cg.gain.setValueAtTime(vel * 0.5 * gm, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc.connect(gain); click.connect(cg); cg.connect(gain); gain.connect(this._out());
        osc.start(t); click.start(t); osc.stop(t + 0.4); click.stop(t + 0.05);
        this.activeNotes.set(id, { oscillators: [osc, click], gain }); break;
      }
      case 'snare': {
        const nb = this._createNoiseBuffer(0.22);
        const bs = this.ctx.createBufferSource(); bs.buffer = nb;
        const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.5;
        gain.gain.setValueAtTime(vel * 0.85 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2 * mods.releaseMult);
        const body = this.ctx.createOscillator(); body.type = 'triangle'; body.frequency.value = 200;
        body.connect(gain); bs.connect(f); f.connect(gain); gain.connect(this._out());
        bs.start(t); body.start(t); body.stop(t + 0.22);
        this.activeNotes.set(id, { oscillators: [body], gain, bufferSource: bs }); break;
      }
      case 'hihat_closed': {
        const nb = this._createNoiseBuffer(0.12);
        const bs = this.ctx.createBufferSource(); bs.buffer = nb;
        const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 9000;
        gain.gain.setValueAtTime(vel * 0.6 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        bs.connect(f); f.connect(gain); gain.connect(this._out()); bs.start(t);
        this.activeNotes.set(id, { oscillators: [], gain, bufferSource: bs }); break;
      }
      case 'hihat_open': {
        const nb = this._createNoiseBuffer(0.45);
        const bs = this.ctx.createBufferSource(); bs.buffer = nb;
        const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
        gain.gain.setValueAtTime(vel * 0.7 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4 * mods.releaseMult);
        bs.connect(f); f.connect(gain); gain.connect(this._out()); bs.start(t);
        this.activeNotes.set(id, { oscillators: [], gain, bufferSource: bs }); break;
      }
      case 'tom_high': case 'tom_mid': case 'tom_low': {
        const rel = (spec.type === 'tom_high' ? 0.18 : spec.type === 'tom_mid' ? 0.22 : 0.3) * mods.releaseMult;
        gain.gain.setValueAtTime(vel * 0.9 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
        const osc = this.ctx.createOscillator(); osc.type = 'sine';
        osc.frequency.setValueAtTime(spec.base * 2.2, t); osc.frequency.exponentialRampToValueAtTime(spec.base, t + 0.06);
        osc.connect(gain); gain.connect(this._out()); osc.start(t); osc.stop(t + rel + 0.05);
        this.activeNotes.set(id, { oscillators: [osc], gain }); break;
      }
      case 'crash': {
        const nb = this._createNoiseBuffer(0.7);
        const bs = this.ctx.createBufferSource(); bs.buffer = nb;
        const f1 = this.ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 3500; f1.Q.value = 0.3;
        const f2 = this.ctx.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 5500;
        gain.gain.setValueAtTime(vel * 0.95 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9 * mods.releaseMult);
        bs.connect(f1); f1.connect(f2); f2.connect(gain); gain.connect(this._out()); bs.start(t);
        this.activeNotes.set(id, { oscillators: [], gain, bufferSource: bs }); break;
      }
      case 'ride': {
        const nb = this._createNoiseBuffer(0.4);
        const bs = this.ctx.createBufferSource(); bs.buffer = nb;
        const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 4000; f.Q.value = 1;
        const osc = this.ctx.createOscillator(); osc.frequency.value = 850; osc.type = 'sine';
        const og = this.ctx.createGain(); og.gain.value = 0.4;
        gain.gain.setValueAtTime(vel * 0.7 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        bs.connect(f); f.connect(gain); osc.connect(og); og.connect(gain); gain.connect(this._out());
        bs.start(t); osc.start(t); osc.stop(t + 0.6);
        this.activeNotes.set(id, { oscillators: [osc], gain, bufferSource: bs }); break;
      }
      case 'cowbell': {
        gain.gain.setValueAtTime(vel * 0.8 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        const o1 = this.ctx.createOscillator(); o1.type = 'square'; o1.frequency.value = 540;
        const o2 = this.ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 845;
        const m = this.ctx.createGain(); m.gain.value = 0.5;
        o1.connect(gain); o2.connect(m); m.connect(gain); gain.connect(this._out());
        o1.start(t); o2.start(t); o1.stop(t + 0.22); o2.stop(t + 0.22);
        this.activeNotes.set(id, { oscillators: [o1, o2], gain }); break;
      }
      default: {
        const nb = this._createNoiseBuffer(0.25);
        const bs = this.ctx.createBufferSource(); bs.buffer = nb;
        const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = spec.base; f.Q.value = 0.5;
        gain.gain.setValueAtTime(vel * 0.7 * gm, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        bs.connect(f); f.connect(gain); gain.connect(this._out()); bs.start(t);
        this.activeNotes.set(id, { oscillators: [], gain, bufferSource: bs });
      }
    }
  }

  // ─── Flute (symbols) ─────────────────────────────────────────────────────────
  private _playFlute(id: string, freq: number, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.1);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.03 * mods.attackMult;
    const rel = 2.8 * mods.releaseMult;
    const g = vel * 0.58 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.83, t + Math.max(atk, 0.22));
    gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
    const lfo = this.ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lg = this.ctx.createGain(); lg.gain.value = 4 * mods.filterMult; lfo.connect(lg);
    const f = freq * Math.pow(2, mods.detune / 1200);
    const fluteWave = mods.waveType === 'square' ? 'square' : mods.waveType === 'sawtooth' ? 'sawtooth' : 'sine';
    const osc1 = this.ctx.createOscillator(); osc1.type = fluteWave; osc1.frequency.value = f;
    lg.connect(osc1.frequency);
    const osc2 = this.ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = f * 2;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.22 * mods.harmonicMix;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = f * 2.5 * mods.filterMult; filter.Q.value = 1.2;
    osc1.connect(filter); osc2.connect(m2); m2.connect(filter); filter.connect(gain); gain.connect(this._out());
    lfo.start(t); osc1.start(t); osc2.start(t);
    lfo.stop(t + rel + 0.1); osc1.stop(t + rel + 0.1); osc2.stop(t + rel + 0.1);
    this.activeNotes.set(id, { oscillators: [osc1, osc2], gain, lfo });
  }

  // ─── Bass (Space) ─────────────────────────────────────────────────────────────
  private _playBass(id: string, freq: number, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.02 * mods.attackMult;
    const rel = 2.2 * mods.releaseMult;
    const g = vel * 0.85 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.8, t + Math.max(atk, 0.12));
    gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
    const filterFreq = 750 * mods.filterMult;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = filterFreq; filter.Q.value = 2;
    const f = freq * Math.pow(2, mods.detune / 1200);
    const bassWave: OscillatorType = mods.waveType === 'sine' ? 'sine' : mods.waveType === 'square' ? 'square' : 'sawtooth';
    const osc1 = this.ctx.createOscillator(); osc1.type = bassWave; osc1.frequency.value = f;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = f;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.6;
    osc1.connect(filter); osc2.connect(m2); m2.connect(filter); filter.connect(gain); gain.connect(this._out());
    osc1.start(t); osc2.start(t); osc1.stop(t + rel + 0.1); osc2.stop(t + rel + 0.1);
    this.activeNotes.set(id, { oscillators: [osc1, osc2], gain });
  }

  // ─── Synth (Arrow Keys) ───────────────────────────────────────────────────────
  private _playSynth(id: string, freq: number, filterFreq: number, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.04);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.02 * mods.attackMult;
    const rel = 1.8 * mods.releaseMult;
    const g = vel * 0.65 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g, t + Math.max(atk, 0.12));
    gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
    const ff = filterFreq * mods.filterMult;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(200, t); filter.frequency.linearRampToValueAtTime(ff, t + 0.3); filter.Q.value = 3;
    const f = freq * Math.pow(2, mods.detune / 1200);
    const osc = this.ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = f * 1.502;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.4 * mods.harmonicMix;
    osc.connect(filter); osc2.connect(m2); m2.connect(filter); filter.connect(gain); gain.connect(this._out());
    osc.start(t); osc2.start(t); osc.stop(t + rel + 0.1); osc2.stop(t + rel + 0.1);
    this.activeNotes.set(id, { oscillators: [osc, osc2], gain });
  }

  // ─── Pads (Ctrl/Alt) ─────────────────────────────────────────────────────────
  private _playPad(id: string, freq: number, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.1);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.12 * mods.attackMult;
    const rel = 4.5 * mods.releaseMult;
    const g = vel * 0.5 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.9, t + Math.max(atk, 0.55));
    gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
    const filterFreq = 900 * mods.filterMult;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = filterFreq; filter.Q.value = 1;
    const f = freq * Math.pow(2, mods.detune / 1200);
    const padWave = mods.waveType === 'sine' ? 'sine' : 'triangle';
    const o1 = this.ctx.createOscillator(); o1.type = padWave; o1.frequency.value = f;
    const o2 = this.ctx.createOscillator(); o2.type = padWave; o2.frequency.value = f * 1.008;
    const o3 = this.ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = f * 2;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.7;
    const m3 = this.ctx.createGain(); m3.gain.value = 0.3 * mods.harmonicMix;
    o1.connect(filter); o2.connect(m2); m2.connect(filter); o3.connect(m3); m3.connect(filter);
    filter.connect(gain); gain.connect(this._out());
    o1.start(t); o2.start(t); o3.start(t); o1.stop(t + rel + 0.1); o2.stop(t + rel + 0.1); o3.stop(t + rel + 0.1);
    this.activeNotes.set(id, { oscillators: [o1, o2, o3], gain });
  }

  // ─── Percussion (Numpad) ─────────────────────────────────────────────────────
  private _playPercussion(id: string, freq: number, vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    if (this.activeNotes.has(id)) this.stopNote(id, 0.01);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const g = vel * 0.82 * mods.gainMult;
    const rel = 0.18 * mods.releaseMult;
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + rel);
    const ff = freq * mods.filterMult;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = ff; filter.Q.value = 8;
    const nb = this._createNoiseBuffer(0.22);
    const bs = this.ctx.createBufferSource(); bs.buffer = nb;
    const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq * 0.5;
    osc.frequency.exponentialRampToValueAtTime(freq * 0.18, t + 0.1);
    const og = this.ctx.createGain(); og.gain.value = 0.6;
    bs.connect(filter); filter.connect(gain); osc.connect(og); og.connect(gain); gain.connect(this._out());
    bs.start(t); osc.start(t); osc.stop(t + 0.22);
    this.activeNotes.set(id, { oscillators: [osc], gain, bufferSource: bs });
  }

  // ─── Violin (CapsLock) ────────────────────────────────────────────────────────
  private _playViolin(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'CapsLock';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.04 * mods.attackMult;
    const rel = 0.35 * mods.releaseMult;
    const g = vel * 0.68 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.85, t + Math.max(atk, 0.15));
    gain.gain.exponentialRampToValueAtTime(0.001, t + 4.0 * mods.releaseMult);
    const lfo = this.ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.8;
    const lg = this.ctx.createGain(); lg.gain.value = 6; lfo.connect(lg);
    const freq = 440 * Math.pow(2, mods.detune / 1200);
    const osc = this.ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq;
    lg.connect(osc.frequency);
    const h2 = this.ctx.createOscillator(); h2.type = 'sawtooth'; h2.frequency.value = freq * 2;
    const hg = this.ctx.createGain(); hg.gain.value = 0.3 * mods.harmonicMix;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1800 * mods.filterMult; filter.Q.value = 0.8;
    osc.connect(filter); h2.connect(hg); hg.connect(filter); filter.connect(gain); gain.connect(this._out());
    lfo.start(t); osc.start(t); h2.start(t);
    lfo.stop(t + 5); osc.stop(t + 5); h2.stop(t + 5);
    this.activeNotes.set(id, { oscillators: [osc, h2], gain, lfo });
  }

  // ─── Trumpet (Tab) ───────────────────────────────────────────────────────────
  private _playTrumpet(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'Tab';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.015 * mods.attackMult;
    const rel = 0.25 * mods.releaseMult;
    const g = vel * 0.7 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.7, t + Math.max(atk, 0.05));
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5 * mods.releaseMult);
    const freq = 523.25 * Math.pow(2, mods.detune / 1200);
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1200 * mods.filterMult; filter.Q.value = 1.5;
    const osc = this.ctx.createOscillator(); osc.type = 'square'; osc.frequency.value = freq;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = freq;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.4 * mods.harmonicMix;
    osc.connect(filter); osc2.connect(m2); m2.connect(filter); filter.connect(gain); gain.connect(this._out());
    osc.start(t); osc2.start(t); osc.stop(t + 3); osc2.stop(t + 3);
    this.activeNotes.set(id, { oscillators: [osc, osc2], gain });
  }

  // ─── Organ (Delete) ──────────────────────────────────────────────────────────
  private _playOrgan(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'Delete';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const g = vel * 0.6 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + 0.01 * mods.attackMult);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.5 * mods.releaseMult);
    const freq = 196 * Math.pow(2, mods.detune / 1200);
    const oscs = [1, 2, 3, 4, 6, 8].map((mul, i) => {
      const o = this.ctx!.createOscillator(); o.type = 'sine';
      o.frequency.value = freq * mul;
      const mg = this.ctx!.createGain(); mg.gain.value = 1 / (i + 1) * (0.5 + mods.harmonicMix * 0.5);
      o.connect(mg); mg.connect(gain);
      return o;
    });
    gain.connect(this._out());
    oscs.forEach(o => { o.start(t); o.stop(t + 4); });
    this.activeNotes.set(id, { oscillators: oscs, gain });
  }

  // ─── Saxophone (Insert) ──────────────────────────────────────────────────────
  private _playSaxophone(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'Insert';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.025 * mods.attackMult;
    const g = vel * 0.7 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.8, t + Math.max(atk, 0.08));
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0 * mods.releaseMult);
    const freq = 293.66 * Math.pow(2, mods.detune / 1200);
    const filterFreq = 650 * mods.filterMult;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = filterFreq; filter.Q.value = 2;
    const lfo = this.ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 4.5;
    const lg = this.ctx.createGain(); lg.gain.value = 5; lfo.connect(lg);
    const osc = this.ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
    lg.connect(osc.frequency);
    const osc2 = this.ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 2;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.3 * mods.harmonicMix;
    osc.connect(filter); osc2.connect(m2); m2.connect(filter); filter.connect(gain); gain.connect(this._out());
    lfo.start(t); osc.start(t); osc2.start(t);
    lfo.stop(t + 4); osc.stop(t + 4); osc2.stop(t + 4);
    this.activeNotes.set(id, { oscillators: [osc, osc2], gain, lfo });
  }

  // ─── Harpsichord (Home) ──────────────────────────────────────────────────────
  private _playHarpsichord(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'Home';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.01);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const g = vel * 0.65 * mods.gainMult;
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2 * mods.releaseMult);
    const freq = 523.25 * Math.pow(2, mods.detune / 1200);
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 800 * mods.filterMult; filter.Q.value = 1.5;
    const osc = this.ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
    const h2 = this.ctx.createOscillator(); h2.type = 'triangle'; h2.frequency.value = freq * 2;
    const hg = this.ctx.createGain(); hg.gain.value = 0.5 * mods.harmonicMix;
    osc.connect(filter); h2.connect(hg); hg.connect(filter); filter.connect(gain); gain.connect(this._out());
    osc.start(t); h2.start(t); osc.stop(t + 1.5); h2.stop(t + 1.5);
    this.activeNotes.set(id, { oscillators: [osc, h2], gain });
  }

  // ─── Electric Bass (End) ─────────────────────────────────────────────────────
  private _playElectricBass(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'End';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.01 * mods.attackMult;
    const g = vel * 0.75 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.8, t + Math.max(atk, 0.05));
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5 * mods.releaseMult);
    const freq = 41.2 * Math.pow(2, mods.detune / 1200);
    const filterFreq = 600 * mods.filterMult;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = filterFreq; filter.Q.value = 2;
    const osc1 = this.ctx.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = freq;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 2;
    const m2 = this.ctx.createGain(); m2.gain.value = 0.5 * mods.harmonicMix;
    osc1.connect(filter); osc2.connect(m2); m2.connect(filter); filter.connect(gain); gain.connect(this._out());
    osc1.start(t); osc2.start(t); osc1.stop(t + 3); osc2.stop(t + 3);
    this.activeNotes.set(id, { oscillators: [osc1, osc2], gain });
  }

  // ─── Accordion (Page Up) ─────────────────────────────────────────────────────
  private _playAccordion(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'PageUp';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.03 * mods.attackMult;
    const g = vel * 0.6 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.75, t + Math.max(atk, 0.1));
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0 * mods.releaseMult);
    const freq = 220 * Math.pow(2, mods.detune / 1200);
    const oscs = [1, 1.008, 2, 3].map((mul, i) => {
      const o = this.ctx!.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'sine';
      o.frequency.value = freq * mul;
      const mg = this.ctx!.createGain(); mg.gain.value = i < 2 ? 0.5 : (0.25 * mods.harmonicMix);
      o.connect(mg); mg.connect(gain);
      return o;
    });
    gain.connect(this._out());
    oscs.forEach(o => { o.start(t); o.stop(t + 4); });
    this.activeNotes.set(id, { oscillators: oscs, gain });
  }

  // ─── French Horn (Page Down) ─────────────────────────────────────────────────
  private _playFrenchHorn(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'PageDown';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.04 * mods.attackMult;
    const g = vel * 0.65 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.75, t + Math.max(atk, 0.12));
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0 * mods.releaseMult);
    const freq = 293.66 * Math.pow(2, mods.detune / 1200);
    const filterFreq = 1000 * mods.filterMult;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = filterFreq; filter.Q.value = 1;
    const oscs = [1, 2, 3].map((mul, i) => {
      const o = this.ctx!.createOscillator(); o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = freq * mul;
      const mg = this.ctx!.createGain(); mg.gain.value = i === 0 ? 0.7 : (0.25 / i * mods.harmonicMix);
      o.connect(mg); mg.connect(filter);
      return o;
    });
    filter.connect(gain); gain.connect(this._out());
    oscs.forEach(o => { o.start(t); o.stop(t + 4); });
    this.activeNotes.set(id, { oscillators: oscs, gain });
  }

  // ─── Vocoder (Print Screen) ──────────────────────────────────────────────────
  private _playVocoder(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'PrintScreen';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.05 * mods.attackMult;
    const g = vel * 0.58 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 4.0 * mods.releaseMult);
    const freq = 350 * Math.pow(2, mods.detune / 1200);
    const lfo = this.ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5;
    const lg = this.ctx.createGain(); lg.gain.value = 8; lfo.connect(lg);
    const oscs = [1, 1.5, 2, 2.5].map((mul, i) => {
      const o = this.ctx!.createOscillator(); o.type = 'sine';
      o.frequency.value = freq * mul;
      if (i === 0) lg.connect(o.frequency);
      const f = this.ctx!.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq * mul * mods.filterMult; f.Q.value = 2;
      const mg = this.ctx!.createGain(); mg.gain.value = 0.4 / (i + 1) * mods.harmonicMix;
      o.connect(f); f.connect(mg); mg.connect(gain);
      return o;
    });
    gain.connect(this._out());
    lfo.start(t);
    oscs.forEach(o => { o.start(t); o.stop(t + 5); });
    lfo.stop(t + 5);
    this.activeNotes.set(id, { oscillators: oscs, gain, lfo });
  }

  // ─── Glockenspiel (Scroll Lock) ──────────────────────────────────────────────
  private _playGlockenspiel(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'ScrollLock';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.01);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const g = vel * 0.7 * mods.gainMult;
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8 * mods.releaseMult);
    const freq = 1567.98 * Math.pow(2, mods.detune / 1200);
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 2200 * mods.filterMult; filter.Q.value = 3;
    const oscs = [1, 2.75, 5.4].map((mul, i) => {
      const o = this.ctx!.createOscillator(); o.type = 'sine'; o.frequency.value = freq * mul;
      const mg = this.ctx!.createGain(); mg.gain.value = 1 / (i + 1) * (0.5 + mods.harmonicMix * 0.5);
      o.connect(mg); mg.connect(filter);
      return o;
    });
    filter.connect(gain); gain.connect(this._out());
    oscs.forEach(o => { o.start(t); o.stop(t + 2); });
    this.activeNotes.set(id, { oscillators: oscs, gain });
  }

  // ─── Theremin (Pause) ────────────────────────────────────────────────────────
  private _playTheremin(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'Pause';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.1);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.08 * mods.attackMult;
    const g = vel * 0.55 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 4.0 * mods.releaseMult);
    const lfo = this.ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5;
    const lg = this.ctx.createGain(); lg.gain.value = 12; lfo.connect(lg);
    const freq = 440 * Math.pow(2, mods.detune / 1200);
    const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
    lg.connect(osc.frequency);
    const h2 = this.ctx.createOscillator(); h2.type = 'sine'; h2.frequency.value = freq * 2;
    const hg = this.ctx.createGain(); hg.gain.value = 0.2 * mods.harmonicMix;
    osc.connect(gain); h2.connect(hg); hg.connect(gain); gain.connect(this._out());
    lfo.start(t); osc.start(t); h2.start(t);
    lfo.stop(t + 5); osc.stop(t + 5); h2.stop(t + 5);
    this.activeNotes.set(id, { oscillators: [osc, h2], gain, lfo });
  }

  // ─── Acoustic Guitar (NumLock) ───────────────────────────────────────────────
  private _playAcousticGuitar(vel: number, mods: SoundMods) {
    if (!this.ctx || !this.noteBus) return;
    const id = 'NumLock';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const atk = 0.012 * mods.attackMult;
    const g = vel * 0.7 * mods.gainMult;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(g, t + atk);
    gain.gain.setValueAtTime(g * 0.45, t + Math.max(atk, 0.06));
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0 * mods.releaseMult);
    const freq = 196 * Math.pow(2, mods.detune / 1200);
    const filterFreq = 700 * mods.filterMult;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = filterFreq; filter.Q.value = 1.5;
    const oscs = [1, 2, 3, 0.5].map((mul, i) => {
      const o = this.ctx!.createOscillator(); o.type = i < 2 ? 'triangle' : 'sine';
      o.frequency.value = freq * mul;
      const mg = this.ctx!.createGain(); mg.gain.value = 0.5 / (i + 1) * (i < 2 ? 1 : mods.harmonicMix);
      o.connect(mg); mg.connect(filter);
      return o;
    });
    filter.connect(gain); gain.connect(this._out());
    oscs.forEach(o => { o.start(t); o.stop(t + 2.5); });
    this.activeNotes.set(id, { oscillators: oscs, gain });
  }

  // ─── Vibraphone (Windows key) ────────────────────────────────────────────────
  private _playVibraphone(vel: number, mods: SoundMods) {
    const ctx = this.ctx; if (!ctx || !this.noteBus) return;
    const id = 'MetaLeft';
    if (this.activeNotes.has(id)) this.stopNote(id, 0.05);
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    const g = vel * 0.65 * mods.gainMult;
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5 * mods.releaseMult);
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 6.5;
    const lg = ctx.createGain(); lg.gain.value = g * 0.08; lfo.connect(lg); lg.connect(gain.gain);
    const freq = 784 * Math.pow(2, mods.detune / 1200);
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1100 * mods.filterMult; filter.Q.value = 1;
    const oscs = [1, 2, 3].map((mul, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq * mul;
      const mg = ctx.createGain(); mg.gain.value = 1 / (i + 1) * (0.5 + mods.harmonicMix * 0.5);
      o.connect(mg); mg.connect(filter);
      return o;
    });
    filter.connect(gain); gain.connect(this._out());
    lfo.start(t);
    oscs.forEach(o => { o.start(t); o.stop(t + 3); });
    lfo.stop(t + 3);
    this.activeNotes.set(id, { oscillators: oscs, gain, lfo });
  }
}

export const audioEngine = new AudioEngine();
