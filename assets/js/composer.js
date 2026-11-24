import { Rng, normalizeSeed } from "./seed.js";
import {
  SCALES,
  SCALE_LABELS,
  chordMidi,
  chordPitchClasses,
  fitVoicing,
  scaleDegree
} from "./theory.js";
import { NOTE_NAMES, clamp } from "./util.js";
import { getPreset, makeTitle } from "./presets.js";

export const PART_ORDER = ["pad", "bass", "arp", "melody", "drums"];

export const PART_LABELS = {
  pad: "Pad",
  bass: "Bass",
  arp: "Arp",
  melody: "Melody",
  drums: "Drums"
};

export const PART_COLORS = {
  pad: "#8f79c6",
  bass: "#2f6c91",
  arp: "#2f7a63",
  melody: "#a24e32",
  drums: "#a86b1f"
};

const DRUM_TYPES = ["kick", "snare", "hat", "clap", "perc", "tom", "crash"];

const MELODY_RHYTHMS = [
  [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
  [0, 1, 1.5, 2.5, 3],
  [0, 0.75, 1.5, 2, 3, 3.5],
  [0, 0.5, 1.5, 2, 3],
  [0, 1, 2, 2.5, 3, 3.5],
  [0, 0.5, 1, 2, 2.5, 3],
  [0, 1.5, 2.5, 3],
  [0, 1, 2, 3]
];

export function normalizeBars(bars) {
  const value = Number(bars);
  if (!Number.isFinite(value)) return 32;
  return clamp(Math.round(value / 4) * 4, 8, 128);
}

export function planSections(totalBars) {
  const bars = normalizeBars(totalBars);
  if (bars <= 8) {
    const half = bars / 2;
    return [
      { name: "A", bars: half, intensity: intensityFor("A") },
      { name: "B", bars: half, intensity: intensityFor("B") }
    ];
  }

  const intro = bars >= 16 ? 4 : 2;
  const outro = bars >= 16 ? 4 : 2;
  let middle = bars - intro - outro;
  const names = ["A", "B", "A2", "B2", "A3", "B3"];
  const chunk = middle >= 16 && middle % 8 === 0 ? 8 : 4;
  const sections = [];
  let index = 0;

  while (middle > 0) {
    const length = Math.min(chunk, middle);
    const name = names[index % names.length];
    sections.push({ name, bars: length, intensity: intensityFor(name) });
    middle -= length;
    index += 1;
  }

  return [
    { name: "Intro", bars: intro, intensity: intensityFor("Intro") },
    ...sections,
    { name: "Outro", bars: outro, intensity: intensityFor("Outro") }
  ];
}

function intensityFor(name) {
  switch (name) {
    case "Intro":
      return 0.32;
    case "A":
      return 0.56;
    case "B":
      return 0.86;
    case "A2":
      return 0.68;
    case "B2":
      return 0.9;
    case "A3":
      return 0.72;
    case "B3":
      return 0.92;
    case "Outro":
      return 0.28;
    default:
      return 0.6;
  }
}

export function buildArrangement(options = {}) {
  const {
    seed = "softwave",
    presetId = "lofi",
    key = 0,
    scale = null,
    tempo = null,
    bars = 32,
    prompt = "",
    variation = 0
  } = options;

  const preset = getPreset(presetId);
  const barsFinal = normalizeBars(bars);
  const tempoFinal = clamp(Math.round(tempo ?? preset.tempo), 40, 200);
  const scaleFinal = SCALES[scale] ? scale : preset.scale;
  const keyFinal = ((Math.round(Number(key) || 0) % 12) + 12) % 12;
  const beatsPerBar = 4;
  const totalBeats = barsFinal * beatsPerBar;
  const secondsPerBeat = 60 / tempoFinal;

  const rng = new Rng(`${normalizeSeed(seed)}:${variation}`);
  const sections = planSections(barsFinal).map((section) => ({
    ...section,
    intensity: clamp(section.intensity + rng.float(-0.04, 0.04), 0.15, 1)
  }));

  const parts = { pad: [], bass: [], arp: [], melody: [], drums: [] };
  const progression = preset.progression;
  const chordAt = (globalBar) => progression[globalBar % progression.length];

  composePad(parts.pad, sections, preset, keyFinal, scaleFinal, beatsPerBar, rng.fork("pad"));
  composeBass(parts.bass, sections, preset, keyFinal, scaleFinal, beatsPerBar, chordAt, rng.fork("bass"));
  composeArp(parts.arp, sections, preset, keyFinal, scaleFinal, beatsPerBar, chordAt, rng.fork("arp"));
  composeMelody(parts.melody, sections, preset, keyFinal, scaleFinal, beatsPerBar, chordAt, rng.fork("melody"));
  composeDrums(parts.drums, sections, preset, beatsPerBar, rng.fork("drums"));

  for (const name of PART_ORDER) {
    parts[name].sort((a, b) => {
      if (a.beat !== b.beat) return a.beat - b.beat;
      if (name === "drums") return (a.type || "").localeCompare(b.type || "");
      return (a.midi || 0) - (b.midi || 0);
    });
  }

  return {
    title: makeTitle(prompt, rng.fork("title")),
    seed: String(seed),
    variation,
    prompt,
    presetId: preset.id,
    presetName: preset.name,
    preset,
    key: keyFinal,
    keyName: NOTE_NAMES[keyFinal],
    scale: scaleFinal,
    scaleName: SCALE_LABELS[scaleFinal] || scaleFinal,
    tempo: tempoFinal,
    bars: barsFinal,
    beatsPerBar,
    totalBeats,
    duration: totalBeats * secondsPerBeat,
    secondsPerBeat,
    swing: preset.swing,
    sections,
    parts,
    mix: defaultMix(preset)
  };
}

function defaultMix(preset) {
  const mix = {};
  for (const part of PART_ORDER) {
    mix[part] = {
      volume: preset.levels?.[part] ?? 0.5,
      muted: false,
      solo: false
    };
  }
  return mix;
}

function composePad(part, sections, preset, key, scale, beatsPerBar, rng) {
  let cursor = 0;
  for (const section of sections) {
    const rootMidi = key + 12 * (preset.pad.octave + 1);
    for (let i = 0; i < section.bars; i += 1) {
      const globalBar = cursor + i;
      const degree = preset.progression[globalBar % preset.progression.length];
      const chord = fitVoicing(chordMidi(rootMidi, scale, degree, preset.chordSize), 45, 79);
      const beat = globalBar * beatsPerBar;
      const dur = beatsPerBar * 0.96;
      const velocity = 0.5 + section.intensity * 0.24;
      for (const midi of chord) {
        part.push({ part: "pad", beat, dur, midi, velocity });
      }
      if (section.intensity >= 0.82) {
        for (const midi of chord.slice(0, 2)) {
          part.push({ part: "pad", beat, dur, midi: midi + 12, velocity: velocity * 0.45 });
        }
      }
    }
    cursor += section.bars;
  }
}

function composeBass(part, sections, preset, key, scale, beatsPerBar, chordAt, rng) {
  let cursor = 0;
  for (const section of sections) {
    if (section.intensity < 0.42) {
      cursor += section.bars;
      continue;
    }
    for (let i = 0; i < section.bars; i += 1) {
      const globalBar = cursor + i;
      const degree = chordAt(globalBar);
      const base = key + 12 * (preset.bass.octave + 1);
      const chord = chordMidi(base, scale, degree, 3);
      const root = fitSingle(chord[0], 28, 52);
      const fifth = fitSingle(chord[2], 28, 52);
      const positions = [];
      for (let step = 0; step < 16; step += 1) {
        if (preset.bassPattern[step] !== ".") positions.push(step);
      }
      for (let index = 0; index < positions.length; index += 1) {
        const step = positions[index];
        const nextStep = positions[index + 1] ?? 16;
        const char = preset.bassPattern[step];
        let midi = root;
        if (char === "F") midi = fifth;
        else if (char === "O") midi = root + 12;
        else if (char === "L") midi = root - 12;
        midi = clamp(midi, 24, 60);
        const beat = globalBar * beatsPerBar + step * 0.25;
        const gap = (nextStep - step) * 0.25;
        const dur = Math.max(0.12, gap * preset.bass.gate);
        const velocity = (0.62 + section.intensity * 0.2) * rng.float(0.94, 1.04);
        part.push({
          part: "bass",
          beat: applySwing(beat, preset.swing),
          dur,
          midi,
          velocity: clamp(velocity, 0.1, 1)
        });
      }
    }
    cursor += section.bars;
  }
}

function composeArp(part, sections, preset, key, scale, beatsPerBar, chordAt, rng) {
  let cursor = 0;
  for (const section of sections) {
    if (section.intensity < preset.arp.minIntensity) {
      cursor += section.bars;
      continue;
    }
    const rootMidi = key + 12 * (preset.arp.octave + 1);
    for (let i = 0; i < section.bars; i += 1) {
      const globalBar = cursor + i;
      const degree = chordAt(globalBar);
      const chord = chordMidi(rootMidi, scale, degree, 4);
      const tones = [...chord];
      if (tones.length < 4) tones.push(tones[0] + 12);
      const steps = preset.arp.steps;
      const stepBeats = beatsPerBar / steps;
      for (let index = 0; index < steps; index += 1) {
        const toneIndex = preset.arp.order[index % preset.arp.order.length];
        const octave = Math.floor(toneIndex / tones.length);
        const midi = clamp(tones[toneIndex % tones.length] + octave * 12, 55, 96);
        const beat = globalBar * beatsPerBar + index * stepBeats;
        const velocity = (index % 2 === 0 ? 0.66 : 0.52) + section.intensity * 0.18;
        part.push({
          part: "arp",
          beat: applySwing(beat, preset.swing),
          dur: stepBeats * preset.arp.gate,
          midi,
          velocity: clamp(velocity * rng.float(0.92, 1.05), 0.1, 1)
        });
      }
    }
    cursor += section.bars;
  }
}

function composeMelody(part, sections, preset, key, scale, beatsPerBar, chordAt, rng) {
  let cursor = 0;
  for (const section of sections) {
    if (section.intensity < preset.melody.minIntensity) {
      cursor += section.bars;
      continue;
    }

    const base = melodyBase(key, preset.melody.octave);
    const phraseBars = 2;
    let motif = null;
    let previousStep = rng.int(0, 6);

    for (let phrase = 0; phrase * phraseBars < section.bars; phrase += 1) {
      const barsHere = Math.min(phraseBars, section.bars - phrase * phraseBars);
      const startBar = cursor + phrase * phraseBars;
      const chords = [];
      for (let b = 0; b < barsHere; b += 1) {
        chords.push(chordAt(startBar + b));
      }

      let phraseNotes;
      if (motif && phrase % 2 === 1) {
        phraseNotes = varyPhrase(rng, motif, chords, scale, barsHere);
      } else {
        phraseNotes = makePhrase(rng, chords, scale, preset.melody, barsHere, previousStep);
        motif = phraseNotes;
      }

      for (const note of phraseNotes) {
        const midi = clamp(base + scaleDegree(0, scale, note.step), 60, 91);
        part.push({
          part: "melody",
          beat: startBar * beatsPerBar + note.beat,
          dur: Math.max(0.18, note.dur * preset.melody.gate),
          midi,
          velocity: clamp(note.vel, 0.1, 1)
        });
        previousStep = note.step;
      }
    }
    cursor += section.bars;
  }
}

function composeDrums(part, sections, preset, beatsPerBar, rng) {
  let cursor = 0;
  for (const section of sections) {
    if (section.intensity < preset.drums.minIntensity) {
      cursor += section.bars;
      continue;
    }

    for (let i = 0; i < section.bars; i += 1) {
      const globalBar = cursor + i;
      for (const type of DRUM_TYPES) {
        const pattern = preset.drums[type];
        if (typeof pattern !== "string" || !pattern) continue;
        for (let step = 0; step < 16; step += 1) {
          const char = pattern[step];
          if (!char || char === ".") continue;
          const accent = char === "X";
          const baseBeat = globalBar * beatsPerBar + step * 0.25;
          const beat = applySwing(baseBeat, preset.swing) + rng.float(-0.006, 0.006);
          const velocity =
            (accent ? 1 : 0.78) *
            (0.84 + section.intensity * 0.16) *
            rng.float(0.9, 1.06);
          part.push({
            part: "drums",
            beat: Math.max(0, beat),
            type,
            velocity: clamp(velocity, 0.1, 1)
          });
        }
      }

      if (i === 0 && section.intensity >= 0.84) {
        part.push({
          part: "drums",
          beat: globalBar * beatsPerBar,
          type: "crash",
          velocity: 0.6
        });
      }

      const isFill = i % 4 === 3 || i === section.bars - 1;
      if (isFill && section.intensity >= 0.7) {
        const count = section.intensity > 0.86 ? 3 : 2;
        for (let k = 0; k < count; k += 1) {
          const step = 13 + k;
          part.push({
            part: "drums",
            beat: globalBar * beatsPerBar + step * 0.25 + rng.float(-0.008, 0.008),
            type: k % 2 === 0 ? "snare" : "tom",
            velocity: clamp(0.48 + k * 0.14, 0.1, 1)
          });
        }
      }
    }
    cursor += section.bars;
  }
}

function makePhrase(rng, chordDegrees, scale, melody, barsHere, startStep) {
  const notes = [];
  let step = startStep;

  for (let bar = 0; bar < barsHere; bar += 1) {
    const rhythm = pickRhythm(rng, melody.density);
    let onsets = rhythm.filter((beat) => beat % 2 === 0 || !rng.chance(melody.rest));
    if (!onsets.length) onsets = [0];
    onsets.sort((a, b) => a - b);

    for (let i = 0; i < onsets.length; i += 1) {
      const beat = onsets[i];
      const strong = beat % 2 === 0;
      const previous = step;
      step += rng.pick(strong ? [-2, -1, 1, 2] : [-1, 1, 1, 0]);
      step = clamp(step, -3, 11);
      if (strong) step = snapToChord(rng, step, chordDegrees[bar], scale);
      if (step === previous && rng.chance(0.7)) {
        const alternative = snapToChord(rng, previous + rng.pick([-1, 1]), chordDegrees[bar], scale);
        if (alternative !== previous) step = alternative;
      }
      const next = onsets[i + 1] ?? 4;
      const dur = Math.max(0.25, (next - beat) * 0.95);
      notes.push({
        beat: bar * 4 + beat,
        step,
        dur,
        vel: clamp((strong ? 0.9 : 0.7) + rng.float(-0.05, 0.05), 0.1, 1)
      });
    }
  }

  return notes;
}

function varyPhrase(rng, motif, chordDegrees, scale, barsHere) {
  const maxBeat = barsHere * 4;
  return motif
    .filter((note) => note.beat < maxBeat)
    .map((note) => {
      let step = note.step;
      if (rng.chance(0.35)) step += rng.pick([-1, 1]);
      step = clamp(step, -3, 11);
      if (note.beat % 2 === 0) {
        const bar = Math.min(chordDegrees.length - 1, Math.floor(note.beat / 4));
        step = snapToChord(rng, step, chordDegrees[bar], scale);
      }
      return { ...note, step };
    });
}

function snapToChord(rng, step, chordDegree, scale) {
  const chordClasses = chordPitchClasses(0, scale, chordDegree, 4);
  const candidates = [];
  for (let delta = -2; delta <= 2; delta += 1) {
    const candidate = step + delta;
    const pitch = ((scaleDegree(0, scale, candidate) % 12) + 12) % 12;
    if (chordClasses.has(pitch)) {
      candidates.push({ step: candidate, distance: Math.abs(delta) });
    }
  }
  if (!candidates.length) return step;
  candidates.sort((a, b) => a.distance - b.distance);
  const bestDistance = candidates[0].distance;
  const best = candidates.filter((candidate) => candidate.distance === bestDistance);
  return rng.pick(best).step;
}

function pickRhythm(rng, density) {
  const target = clamp(Math.round(3 + density * 5), 3, 8);
  const weighted = MELODY_RHYTHMS.map((rhythm) => ({
    value: rhythm,
    weight: 1 / (1 + Math.abs(rhythm.length - target))
  }));
  const rhythm = rng.weighted(weighted);
  return (rhythm || MELODY_RHYTHMS[0]).slice();
}

function melodyBase(key, octave) {
  let base = key + 12 * (octave + 1);
  while (base > 76) base -= 12;
  while (base < 60) base += 12;
  return base;
}

function fitSingle(midi, low, high) {
  let note = midi;
  while (note < low) note += 12;
  while (note > high) note -= 12;
  return note;
}

function applySwing(beat, swing) {
  if (!swing) return beat;
  const fraction = beat % 1;
  if (Math.abs(fraction - 0.5) < 1e-6) return beat + swing * 0.5;
  return beat;
}

export function flatten(arrangement) {
  const events = [];
  for (const name of ["pad", "bass", "arp", "melody"]) {
    for (const note of arrangement.parts[name]) {
      events.push({
        part: name,
        beat: note.beat,
        dur: note.dur,
        midi: note.midi,
        velocity: note.velocity
      });
    }
  }
  for (const hit of arrangement.parts.drums) {
    events.push({
      part: "drums",
      beat: hit.beat,
      dur: 0.12,
      type: hit.type,
      velocity: hit.velocity
    });
  }
  events.sort((a, b) => {
    if (a.beat !== b.beat) return a.beat - b.beat;
    return PART_ORDER.indexOf(a.part) - PART_ORDER.indexOf(b.part);
  });
  return events;
}

export function countNotes(arrangement) {
  return PART_ORDER.reduce((sum, part) => sum + arrangement.parts[part].length, 0);
}
