import { clamp } from "./util.js";

export function makeImpulseResponse(ctx, seconds = 2.5, decay = 2.5) {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const impulse = ctx.createBuffer(2, length, rate);
  let state = 0x2545f491;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export function buildMix(ctx, preset, destination = ctx.destination) {
  const nodes = [];
  const track = (node) => {
    nodes.push(node);
    return node;
  };

  const master = track(ctx.createGain());
  master.gain.value = 0.85;

  const compressor = track(ctx.createDynamicsCompressor());
  compressor.threshold.value = -16;
  compressor.knee.value = 20;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.24;

  const highpass = track(ctx.createBiquadFilter());
  highpass.type = "highpass";
  highpass.frequency.value = 28;

  const dry = track(ctx.createGain());
  dry.gain.value = 1;

  dry.connect(highpass);
  highpass.connect(compressor);
  compressor.connect(master);
  master.connect(destination);

  const reverb = track(ctx.createConvolver());
  reverb.buffer = makeImpulseResponse(ctx, preset.reverb.seconds, preset.reverb.decay);
  const reverbSend = track(ctx.createGain());
  reverbSend.gain.value = preset.reverb.mix;
  const reverbReturn = track(ctx.createGain());
  reverbReturn.gain.value = 0.9;
  reverbSend.connect(reverb);
  reverb.connect(reverbReturn);
  reverbReturn.connect(compressor);

  const delay = track(ctx.createDelay(2));
  delay.delayTime.value = Math.max(0.02, preset.delay.time);
  const feedback = track(ctx.createGain());
  feedback.gain.value = clamp(preset.delay.feedback, 0, 0.85);
  const delaySend = track(ctx.createGain());
  delaySend.gain.value = preset.delay.mix;
  const delayReturn = track(ctx.createGain());
  delayReturn.gain.value = 0.9;
  delaySend.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(delayReturn);
  delayReturn.connect(compressor);

  const parts = {};
  for (const name of ["pad", "bass", "arp", "melody", "drums"]) {
    const gain = track(ctx.createGain());
    gain.gain.value = 1;
    gain.connect(dry);

    const reverbAmount = name === "drums" ? 0 : name === "bass" ? 0.2 : name === "pad" ? 0.7 : 0.5;
    if (reverbAmount > 0) {
      const send = track(ctx.createGain());
      send.gain.value = reverbAmount;
      gain.connect(send);
      send.connect(reverbSend);
    }

    const delayAmount = name === "drums" || name === "bass" ? 0 : name === "pad" ? 0.25 : 0.45;
    if (delayAmount > 0) {
      const send = track(ctx.createGain());
      send.gain.value = delayAmount;
      gain.connect(send);
      send.connect(delaySend);
    }

    parts[name] = gain;
  }

  return {
    master,
    compressor,
    parts,
    reverb,
    delay,
    reverbSend,
    delaySend,
    setMasterVolume(value) {
      master.gain.setTargetAtTime(clamp(value, 0, 1), ctx.currentTime, 0.02);
    },
    dispose() {
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          /* already detached */
        }
      }
    }
  };
}

export function applyMix(mixState, parts, { immediate = false } = {}) {
  if (!mixState || !parts) return;
  const anySolo = Object.values(mixState).some((state) => state && state.solo);
  for (const [name, state] of Object.entries(mixState)) {
    const gain = parts[name];
    if (!gain || !state) continue;
    const audible = !state.muted && (!anySolo || state.solo);
    const value = audible ? clamp(state.volume, 0, 1) : 0;
    const param = gain.gain;
    const now = gain.context.currentTime;
    param.cancelScheduledValues(now);
    if (immediate) {
      param.setValueAtTime(value, now);
    } else {
      param.setTargetAtTime(value, now, 0.02);
    }
  }
}
