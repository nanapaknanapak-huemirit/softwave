import { flatten } from "./composer.js";
import { applyMix, buildMix } from "./effects.js";
import { Kit } from "./instruments.js";

export async function renderArrangement(arrangement, options = {}) {
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Offline) throw new Error("Offline audio rendering is not available in this browser.");

  const sampleRate = options.sampleRate || 44100;
  const tail = options.tail ?? 3;
  const duration = arrangement.totalBeats * arrangement.secondsPerBeat + tail;
  const ctx = new Offline(2, Math.ceil(duration * sampleRate), sampleRate);
  const mix = buildMix(ctx, arrangement.preset);
  applyMix(arrangement.mix, mix.parts, { immediate: true });
  const kit = new Kit(ctx, arrangement.preset, arrangement.secondsPerBeat);
  const registry = [];
  const start = 0.05;

  for (const event of flatten(arrangement)) {
    const time = start + event.beat * arrangement.secondsPerBeat;
    kit.play(event, time, mix.parts[event.part], registry);
  }

  const fadeIn = 0.03;
  const fadeOut = Math.min(3, duration * 0.12);
  const gain = mix.master.gain;
  gain.cancelScheduledValues(0);
  gain.setValueAtTime(0.0001, 0);
  gain.linearRampToValueAtTime(0.85, fadeIn);
  gain.setValueAtTime(0.85, Math.max(fadeIn, duration - fadeOut));
  gain.linearRampToValueAtTime(0.0001, duration);

  const buffer = await ctx.startRendering();
  mix.dispose();
  return buffer;
}
