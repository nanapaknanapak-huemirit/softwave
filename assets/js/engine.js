import { flatten } from "./composer.js";
import { applyMix, buildMix } from "./effects.js";
import { Kit } from "./instruments.js";
import { clamp } from "./util.js";

const MASTER_LEVEL = 0.85;

export class Transport {
  constructor() {
    this.ctx = null;
    this.arrangement = null;
    this.kit = null;
    this.mix = null;
    this.events = [];
    this.playing = false;
    this.loop = true;
    this.pausedBeat = 0;
    this.startBeat = 0;
    this.startTime = 0;
    this.iteration = 0;
    this.nextIndex = 0;
    this.timer = 0;
    this.restoreTimer = 0;
    this.registry = [];
    this.lookahead = 0.2;
    this.intervalMs = 25;
    this.onEnd = null;
  }

  ensureContext() {
    if (this.ctx) return this.ctx;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Web Audio is not available in this browser.");
    this.ctx = new Context({ latencyHint: "interactive" });
    return this.ctx;
  }

  async load(arrangement) {
    this.stop();
    this.ensureContext();
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {
        /* resume requires a gesture on some browsers */
      });
    }
    if (this.mix) this.mix.dispose();
    this.arrangement = arrangement;
    this.events = flatten(arrangement);
    this.kit = new Kit(this.ctx, arrangement.preset, arrangement.secondsPerBeat);
    this.mix = buildMix(this.ctx, arrangement.preset);
    applyMix(arrangement.mix, this.mix.parts, { immediate: true });
    this.pausedBeat = 0;
    this.loop = true;
  }

  async play(fromBeat = this.pausedBeat) {
    if (!this.arrangement) return;
    this.ensureContext();
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
    }
    if (this.playing) return;

    const total = this.arrangement.totalBeats;
    let beat = clamp(Number(fromBeat) || 0, 0, total - 0.0001);
    if (beat >= total) beat = 0;

    this.startBeat = beat;
    this.startTime = this.ctx.currentTime + 0.12;
    this.iteration = 0;
    this.nextIndex = this.events.findIndex((event) => event.beat >= beat - 1e-9);
    if (this.nextIndex < 0) this.nextIndex = this.events.length;
    this.playing = true;

    if (this.mix) {
      const now = this.ctx.currentTime;
      this.mix.master.gain.cancelScheduledValues(now);
      this.mix.master.gain.setValueAtTime(MASTER_LEVEL, now);
    }

    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), this.intervalMs);
    this.tick();
  }

  pause() {
    const beat = this.currentBeat();
    this.stop();
    this.pausedBeat = beat;
  }

  stop() {
    this.playing = false;
    clearInterval(this.timer);
    this.timer = 0;
    this.stopSources();
    this.pausedBeat = 0;
    this.fadeOutMaster();
  }

  stopSources() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const sources = this.registry.slice();
    this.registry.length = 0;
    for (const source of sources) {
      try {
        source.stop(now + 0.05);
      } catch {
        /* source already stopped */
      }
      setTimeout(() => {
        try {
          source.disconnect();
        } catch {
          /* already detached */
        }
      }, 100);
    }
  }

  fadeOutMaster() {
    if (!this.ctx || !this.mix) return;
    const now = this.ctx.currentTime;
    const gain = this.mix.master.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(0, gain.value), now);
    gain.linearRampToValueAtTime(0.0001, now + 0.03);
    clearTimeout(this.restoreTimer);
    this.restoreTimer = setTimeout(() => {
      if (!this.mix || !this.ctx) return;
      const time = this.ctx.currentTime;
      const master = this.mix.master.gain;
      master.cancelScheduledValues(time);
      master.setValueAtTime(0.0001, time);
      master.linearRampToValueAtTime(MASTER_LEVEL, time + 0.05);
    }, 80);
  }

  tick() {
    if (!this.playing || !this.ctx || !this.arrangement) return;
    const spb = this.arrangement.secondsPerBeat;
    const loopBeats = this.arrangement.totalBeats;
    const now = this.ctx.currentTime;
    const horizon = now + this.lookahead;
    let guard = 0;

    while (guard < 20000) {
      guard += 1;
      if (this.nextIndex >= this.events.length) {
        const iterationEnd =
          this.startTime + (this.iteration * loopBeats + loopBeats - this.startBeat) * spb;
        if (this.loop) {
          if (iterationEnd > horizon) break;
          this.iteration += 1;
          this.nextIndex = 0;
          continue;
        }
        if (now >= iterationEnd) {
          this.stop();
          if (typeof this.onEnd === "function") this.onEnd();
        }
        break;
      }

      const event = this.events[this.nextIndex];
      const absoluteBeat = this.iteration * loopBeats + event.beat;
      const time = this.startTime + (absoluteBeat - this.startBeat) * spb;
      if (time > horizon) break;

      if (time >= now - 0.03) {
        this.kit.play(
          event,
          Math.max(time, now),
          this.mix.parts[event.part],
          this.registry
        );
      }
      this.nextIndex += 1;
    }
  }

  currentBeat() {
    if (!this.playing || !this.ctx || !this.arrangement) return this.pausedBeat;
    const spb = this.arrangement.secondsPerBeat;
    const loopBeats = this.arrangement.totalBeats;
    const elapsed = this.ctx.currentTime - this.startTime;
    if (elapsed <= 0) return this.startBeat;
    let beat = this.startBeat + elapsed / spb;
    if (this.loop) beat = ((beat % loopBeats) + loopBeats) % loopBeats;
    return clamp(beat, 0, loopBeats);
  }

  position() {
    if (!this.arrangement) return { beat: 0, seconds: 0, totalSeconds: 0, playing: false };
    const beat = this.currentBeat();
    return {
      beat,
      seconds: beat * this.arrangement.secondsPerBeat,
      totalSeconds: this.arrangement.duration,
      playing: this.playing
    };
  }

  seek(beat) {
    if (!this.arrangement) return;
    const target = clamp(Number(beat) || 0, 0, this.arrangement.totalBeats - 0.0001);
    const wasPlaying = this.playing;
    this.stop();
    this.pausedBeat = target;
    if (wasPlaying) this.play(target);
  }

  toggle() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  setLoop(value) {
    this.loop = Boolean(value);
  }

  setMix(mixState) {
    if (this.mix) applyMix(mixState, this.mix.parts);
  }

  dispose() {
    this.stop();
    clearTimeout(this.restoreTimer);
    if (this.mix) this.mix.dispose();
    this.mix = null;
    this.kit = null;
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        /* ignore */
      }
      this.ctx = null;
    }
  }
}
