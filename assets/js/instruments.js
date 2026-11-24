import { clamp, midiToFreq } from "./util.js";

function applyAmp(param, time, peak, env, hold) {
  const attack = Math.max(0.005, env.attack ?? 0.01);
  const decay = Math.max(0.005, env.decay ?? 0.1);
  const sustain = clamp(env.sustain ?? 0.6, 0.0001, 1);
  const release = Math.max(0.01, env.release ?? 0.2);
  const sustainLevel = Math.max(0.0001, peak * sustain);
  const sustainStart = time + attack + decay;
  const holdEnd = time + Math.max(hold, attack + decay);
  param.setValueAtTime(0.0001, time);
  param.linearRampToValueAtTime(Math.max(0.0001, peak), time + attack);
  param.linearRampToValueAtTime(sustainLevel, sustainStart);
  param.setValueAtTime(sustainLevel, holdEnd);
  param.exponentialRampToValueAtTime(0.0001, holdEnd + release);
  return holdEnd + release;
}

function finish(registry, sources, nodes) {
  for (const source of sources) {
    registry.push(source);
    source.addEventListener(
      "ended",
      () => {
        const index = registry.indexOf(source);
        if (index >= 0) registry.splice(index, 1);
        try {
          source.disconnect();
        } catch {
          /* already detached */
        }
      },
      { once: true }
    );
  }
  const last = sources[sources.length - 1];
  if (last) {
    last.addEventListener(
      "ended",
      () => {
        for (const node of nodes) {
          try {
            node.disconnect();
          } catch {
            /* already detached */
          }
        }
      },
      { once: true }
    );
  }
}

function makeNoiseBuffer(ctx) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * 2));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let state = 0x9e3779b9;
  for (let i = 0; i < length; i += 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    data[i] = (state / 4294967296) * 2 - 1;
  }
  return buffer;
}

export class Kit {
  constructor(ctx, preset, secondsPerBeat) {
    this.ctx = ctx;
    this.preset = preset;
    this.secondsPerBeat = secondsPerBeat;
    this.noiseBuffer = makeNoiseBuffer(ctx);
  }

  play(event, time, destination, registry = []) {
    if (!destination) return;
    switch (event.part) {
      case "pad":
        return this.pad(event, time, destination, registry);
      case "bass":
        return this.bass(event, time, destination, registry);
      case "arp":
        return this.pluck(event, time, destination, registry);
      case "melody":
        return this.lead(event, time, destination, registry);
      case "drums":
        return this.drum(event.type, time, event.velocity, destination, registry);
      default:
        return undefined;
    }
  }

  pad(event, time, destination, registry) {
    const ctx = this.ctx;
    const params = this.preset.pad;
    const freq = midiToFreq(event.midi);
    const hold = Math.max(0.15, event.dur * this.secondsPerBeat);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(params.cutoff, time);
    filter.Q.setValueAtTime(0.7, time);

    const gain = ctx.createGain();
    const sources = [];
    for (const detune of [-params.detune, 0, params.detune]) {
      const osc = ctx.createOscillator();
      osc.type = params.wave;
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(detune, time);
      osc.connect(filter);
      osc.start(time);
      sources.push(osc);
    }

    filter.connect(gain);
    gain.connect(destination);
    const peak = clamp(event.velocity * params.level * 0.42, 0.0001, 1);
    const end = applyAmp(gain.gain, time, peak, params, hold);
    for (const osc of sources) osc.stop(end + 0.02);
    finish(registry, sources, [filter, gain]);
  }

  bass(event, time, destination, registry) {
    const ctx = this.ctx;
    const params = this.preset.bass;
    const freq = midiToFreq(event.midi);
    const hold = Math.max(0.08, event.dur * this.secondsPerBeat);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(params.cutoff, time);
    filter.Q.setValueAtTime(0.9, time);

    const gain = ctx.createGain();
    const sources = [];

    const body = ctx.createOscillator();
    body.type = params.wave;
    body.frequency.setValueAtTime(freq, time);
    body.connect(filter);
    body.start(time);
    sources.push(body);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(freq, time);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.5, time);
    sub.connect(subGain);
    subGain.connect(filter);
    sub.start(time);
    sources.push(sub);

    filter.connect(gain);
    gain.connect(destination);
    const peak = clamp(event.velocity * params.level * 0.72, 0.0001, 1);
    const end = applyAmp(gain.gain, time, peak, params, hold);
    for (const osc of sources) osc.stop(end + 0.02);
    finish(registry, sources, [filter, gain, subGain]);
  }

  pluck(event, time, destination, registry) {
    const ctx = this.ctx;
    const params = this.preset.arp;
    const freq = midiToFreq(event.midi);
    const hold = Math.max(0.06, event.dur * this.secondsPerBeat);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.max(180, params.cutoff * 1.8), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(160, params.cutoff), time + 0.18);
    filter.Q.setValueAtTime(1.2, time);

    const gain = ctx.createGain();
    const sources = [];

    const osc = ctx.createOscillator();
    osc.type = params.wave;
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(filter);
    osc.start(time);
    sources.push(osc);

    filter.connect(gain);
    gain.connect(destination);
    const peak = clamp(event.velocity * params.level * 0.9, 0.0001, 1);
    const env = { attack: 0.006, decay: 0.16, sustain: 0.12, release: 0.22 };
    const end = applyAmp(gain.gain, time, peak, env, hold);
    osc.stop(end + 0.02);
    finish(registry, sources, [filter, gain]);
  }

  lead(event, time, destination, registry) {
    const ctx = this.ctx;
    const params = this.preset.lead;
    const freq = midiToFreq(event.midi);
    const hold = Math.max(0.1, event.dur * this.secondsPerBeat);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.max(220, params.cutoff * 1.2), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(180, params.cutoff * 0.8), time + 0.3);
    filter.Q.setValueAtTime(1, time);

    const gain = ctx.createGain();
    const sources = [];

    const osc = ctx.createOscillator();
    osc.type = params.wave;
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(filter);
    osc.start(time);
    sources.push(osc);

    let lfo = null;
    let lfoGain = null;
    if (hold > 0.35) {
      lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(5.2, time);
      lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(6, time);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start(time);
      sources.push(lfo);
    }

    filter.connect(gain);
    gain.connect(destination);
    const peak = clamp(event.velocity * params.level * 0.85, 0.0001, 1);
    const end = applyAmp(gain.gain, time, peak, params, hold);
    osc.stop(end + 0.02);
    if (lfo) lfo.stop(end + 0.02);
    finish(registry, sources, [filter, gain, lfoGain].filter(Boolean));
  }

  drum(type, time, velocity, destination, registry) {
    const level = clamp(velocity, 0.05, 1);
    switch (type) {
      case "kick":
        return this.kick(time, level, destination, registry);
      case "snare":
        return this.snare(time, level, destination, registry);
      case "hat":
        return this.hat(time, level, destination, registry);
      case "clap":
        return this.clap(time, level, destination, registry);
      case "tom":
        return this.tom(time, level, destination, registry);
      case "crash":
        return this.crash(time, level, destination, registry);
      case "perc":
      default:
        return this.perc(time, level, destination, registry);
    }
  }

  kick(time, velocity, destination, registry) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(155, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.14);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.95, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.36);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.4);
    finish(registry, [osc], [gain]);
  }

  snare(time, velocity, destination, registry) {
    const ctx = this.ctx;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1900, time);
    filter.Q.setValueAtTime(0.8, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.5, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(time);
    noise.stop(time + 0.22);

    const body = ctx.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(185, time);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, time);
    bodyGain.gain.linearRampToValueAtTime(velocity * 0.22, time + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    body.connect(bodyGain);
    bodyGain.connect(destination);
    body.start(time);
    body.stop(time + 0.14);

    finish(registry, [noise, body], [filter, gain, bodyGain]);
  }

  hat(time, velocity, destination, registry) {
    const ctx = this.ctx;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7200, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.24, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(time);
    noise.stop(time + 0.07);
    finish(registry, [noise], [filter, gain]);
  }

  clap(time, velocity, destination, registry) {
    const ctx = this.ctx;
    const sources = [];
    const nodes = [];
    for (let burst = 0; burst < 3; burst += 1) {
      const offset = burst * 0.012;
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1250, time + offset);
      filter.Q.setValueAtTime(1.4, time + offset);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time + offset);
      gain.gain.linearRampToValueAtTime(velocity * (0.3 - burst * 0.05), time + offset + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + offset + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
      noise.start(time + offset);
      noise.stop(time + offset + 0.06);
      sources.push(noise);
      nodes.push(filter, gain);
    }
    finish(registry, sources, nodes);
  }

  tom(time, velocity, destination, registry) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(230, time);
    osc.frequency.exponentialRampToValueAtTime(105, time + 0.18);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.6, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.3);
    finish(registry, [osc], [gain]);
  }

  perc(time, velocity, destination, registry) {
    const ctx = this.ctx;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1600 + velocity * 900, time);
    filter.Q.setValueAtTime(2.4, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.3, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(time);
    noise.stop(time + 0.14);
    finish(registry, [noise], [filter, gain]);
  }

  crash(time, velocity, destination, registry) {
    const ctx = this.ctx;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(4200, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.32, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(time);
    noise.stop(time + 1.5);
    finish(registry, [noise], [filter, gain]);
  }
}
