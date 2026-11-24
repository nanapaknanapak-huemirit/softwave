import { NOTE_NAMES, clamp } from "./util.js";

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11]
};

export const SCALE_LABELS = {
  major: "Major",
  minor: "Minor",
  dorian: "Dorian",
  mixolydian: "Mixolydian",
  lydian: "Lydian",
  harmonicMinor: "Harmonic minor"
};

export const SCALE_IDS = Object.keys(SCALES);

export const KEY_NAMES = NOTE_NAMES;

export function scaleDegree(root, scaleName, degree) {
  const scale = SCALES[scaleName] || SCALES.major;
  const size = scale.length;
  const octave = Math.floor(degree / size);
  const index = ((degree % size) + size) % size;
  return root + octave * 12 + scale[index];
}

export function chordMidi(rootMidi, scaleName, degree, size = 3) {
  const notes = [];
  for (let i = 0; i < size; i += 1) {
    notes.push(scaleDegree(rootMidi, scaleName, degree + i * 2));
  }
  return notes;
}

export function fitVoicing(notes, low = 48, high = 76) {
  let out = notes.slice().sort((a, b) => a - b);
  if (!out.length) return out;
  let guard = 0;
  while (out[0] < low && guard < 12) {
    out = out.map((note) => note + 12);
    guard += 1;
  }
  guard = 0;
  while (out[out.length - 1] > high && guard < 12) {
    out = out.map((note) => note - 12);
    guard += 1;
  }
  return out.map((note) => clamp(note, low, high));
}

export function scalePitches(rootMidi, scaleName, octaves = 2) {
  const scale = SCALES[scaleName] || SCALES.major;
  const notes = [];
  for (let octave = 0; octave < octaves; octave += 1) {
    for (const step of scale) {
      notes.push(rootMidi + octave * 12 + step);
    }
  }
  return notes;
}

export function nearestScalePitch(midi, rootMidi, scaleName) {
  const pitches = scalePitches(rootMidi - 12, scaleName, 5);
  let best = pitches[0];
  let bestDistance = Infinity;
  for (const pitch of pitches) {
    const distance = Math.abs(pitch - midi);
    if (distance < bestDistance) {
      best = pitch;
      bestDistance = distance;
    }
  }
  return best;
}

export function pitchClass(midi) {
  return ((Math.round(midi) % 12) + 12) % 12;
}

export function chordPitchClasses(rootMidi, scaleName, degree, size = 4) {
  return new Set(chordMidi(rootMidi, scaleName, degree, size).map(pitchClass));
}

export function isChordTone(midi, chordClasses) {
  return chordClasses.has(pitchClass(midi));
}

export function scaleStepForPitch(pitch, root, scaleName) {
  const scale = SCALES[scaleName] || SCALES.major;
  const interval = ((pitch - root) % 12 + 12) % 12;
  let best = 0;
  let bestDistance = Infinity;
  for (let step = 0; step < scale.length * 2; step += 1) {
    const candidate = scale[step % scale.length] + Math.floor(step / scale.length) * 12;
    const distance = Math.abs(candidate - interval);
    if (distance < bestDistance) {
      best = step;
      bestDistance = distance;
    }
  }
  return best;
}
