const DRUM_STEPS = 16;

export const PRESETS = {
  lofi: {
    id: "lofi",
    name: "Lo-fi",
    tagline: "Dusty chords, slow swing",
    blurb: "Soft seventh chords, brushed drums and a sleepy melody.",
    tempo: 76,
    scale: "dorian",
    chordSize: 4,
    swing: 0.16,
    progression: [0, 3, 6, 3],
    accent: "#a86b1f",
    pad: { wave: "triangle", cutoff: 1300, attack: 0.5, decay: 0.8, sustain: 0.6, release: 1.4, level: 0.55, detune: 7, octave: 4 },
    bass: { wave: "sine", cutoff: 500, attack: 0.02, decay: 0.25, sustain: 0.5, release: 0.3, level: 0.6, octave: 2, gate: 0.6 },
    lead: { wave: "triangle", cutoff: 2200, attack: 0.03, decay: 0.2, sustain: 0.5, release: 0.35, level: 0.42, octave: 5 },
    arp: { steps: 8, order: [0, 1, 2, 3, 2, 1], wave: "sine", cutoff: 3000, level: 0.2, gate: 0.7, minIntensity: 0.6, octave: 5 },
    melody: { density: 0.42, rest: 0.35, octave: 5, minIntensity: 0.5, gate: 0.9 },
    drums: {
      kick: "x.......x.......",
      snare: "....x.......x...",
      hat: "..x...x...x...x.",
      perc: "......x.......x.",
      clap: "",
      minIntensity: 0.58
    },
    bassPattern: "R...R...F...R...",
    reverb: { seconds: 2.4, decay: 2.2, mix: 0.3 },
    delay: { time: 0.28, feedback: 0.22, mix: 0.12 },
    levels: { pad: 0.62, bass: 0.6, arp: 0.22, melody: 0.42, drums: 0.5 }
  },
  ambient: {
    id: "ambient",
    name: "Ambient",
    tagline: "Long pads, wide space",
    blurb: "Slow drifting chords with plenty of air and reverb.",
    tempo: 56,
    scale: "lydian",
    chordSize: 4,
    swing: 0,
    progression: [0, 3, 4, 0],
    accent: "#6b4fa0",
    pad: { wave: "sawtooth", cutoff: 900, attack: 2.4, decay: 2, sustain: 0.8, release: 3, level: 0.5, detune: 12, octave: 4 },
    bass: { wave: "sine", cutoff: 300, attack: 0.8, decay: 1.5, sustain: 0.7, release: 2, level: 0.4, octave: 1, gate: 1.5 },
    lead: { wave: "sine", cutoff: 1600, attack: 0.4, decay: 1, sustain: 0.6, release: 1.5, level: 0.3, octave: 5 },
    arp: { steps: 8, order: [0, 2, 3, 1, 2, 3], wave: "sine", cutoff: 2400, level: 0.12, gate: 0.9, minIntensity: 0.7, octave: 5 },
    melody: { density: 0.24, rest: 0.52, octave: 5, minIntensity: 0.65, gate: 1.2 },
    drums: {
      kick: "x...............",
      snare: "",
      hat: "",
      perc: "........x.......",
      clap: "",
      minIntensity: 0.8
    },
    bassPattern: "R.......F.......",
    reverb: { seconds: 4.5, decay: 3.4, mix: 0.5 },
    delay: { time: 0.6, feedback: 0.35, mix: 0.22 },
    levels: { pad: 0.7, bass: 0.35, arp: 0.14, melody: 0.3, drums: 0.18 }
  },
  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    tagline: "Slow build, wide screen",
    blurb: "Minor strings, patient drums and a rising sense of scale.",
    tempo: 84,
    scale: "minor",
    chordSize: 3,
    swing: 0,
    progression: [0, 5, 2, 6],
    accent: "#2f6c91",
    pad: { wave: "sawtooth", cutoff: 1100, attack: 0.8, decay: 1, sustain: 0.7, release: 2, level: 0.5, detune: 10, octave: 4 },
    bass: { wave: "triangle", cutoff: 350, attack: 0.05, decay: 0.5, sustain: 0.6, release: 0.8, level: 0.65, octave: 1, gate: 1.2 },
    lead: { wave: "sawtooth", cutoff: 2600, attack: 0.1, decay: 0.4, sustain: 0.6, release: 0.8, level: 0.35, octave: 5 },
    arp: { steps: 8, order: [0, 1, 2, 1, 0, 1, 2, 3], wave: "triangle", cutoff: 2200, level: 0.15, gate: 0.8, minIntensity: 0.7, octave: 5 },
    melody: { density: 0.34, rest: 0.4, octave: 5, minIntensity: 0.55, gate: 1 },
    drums: {
      kick: "x.......x...x...",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.x.",
      tom: "..............x.",
      minIntensity: 0.6
    },
    bassPattern: "R.......R...R...",
    reverb: { seconds: 3.2, decay: 2.8, mix: 0.35 },
    delay: { time: 0.36, feedback: 0.2, mix: 0.1 },
    levels: { pad: 0.6, bass: 0.65, arp: 0.16, melody: 0.38, drums: 0.5 }
  },
  synthwave: {
    id: "synthwave",
    name: "Synthwave",
    tagline: "Neon arps, gated drums",
    blurb: "A retro pulse of saw bass, sixteenth-note arps and wide pads.",
    tempo: 108,
    scale: "minor",
    chordSize: 4,
    swing: 0,
    progression: [0, 5, 2, 6],
    accent: "#a53e5c",
    pad: { wave: "sawtooth", cutoff: 1600, attack: 0.25, decay: 0.6, sustain: 0.6, release: 0.8, level: 0.42, detune: 14, octave: 4 },
    bass: { wave: "sawtooth", cutoff: 700, attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.2, level: 0.6, octave: 1, gate: 0.45 },
    lead: { wave: "square", cutoff: 3200, attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.3, level: 0.35, octave: 5 },
    arp: { steps: 16, order: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 2, 1], wave: "sawtooth", cutoff: 3000, level: 0.2, gate: 0.55, minIntensity: 0.55, octave: 5 },
    melody: { density: 0.4, rest: 0.35, octave: 5, minIntensity: 0.6, gate: 0.8 },
    drums: {
      kick: "x...x...x...x...",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.x.",
      clap: "....x.......x...",
      minIntensity: 0.6
    },
    bassPattern: "R.R.R.R.R.R.R.R.",
    reverb: { seconds: 2, decay: 2, mix: 0.22 },
    delay: { time: 0.25, feedback: 0.3, mix: 0.18 },
    levels: { pad: 0.5, bass: 0.62, arp: 0.22, melody: 0.34, drums: 0.55 }
  },
  chill: {
    id: "chill",
    name: "Chill",
    tagline: "Easy major groove",
    blurb: "Warm major chords, light percussion and a gentle hook.",
    tempo: 96,
    scale: "major",
    chordSize: 4,
    swing: 0.1,
    progression: [0, 4, 5, 3],
    accent: "#2f7a63",
    pad: { wave: "triangle", cutoff: 1500, attack: 0.35, decay: 0.6, sustain: 0.6, release: 0.9, level: 0.5, detune: 8, octave: 4 },
    bass: { wave: "sine", cutoff: 450, attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.25, level: 0.55, octave: 2, gate: 0.7 },
    lead: { wave: "triangle", cutoff: 2600, attack: 0.02, decay: 0.18, sustain: 0.45, release: 0.3, level: 0.4, octave: 5 },
    arp: { steps: 8, order: [0, 2, 1, 3, 2, 1], wave: "sine", cutoff: 3200, level: 0.22, gate: 0.7, minIntensity: 0.55, octave: 5 },
    melody: { density: 0.45, rest: 0.3, octave: 5, minIntensity: 0.5, gate: 0.9 },
    drums: {
      kick: "x.......x.......",
      snare: "....x.......x...",
      hat: "..x...x...x...x.",
      perc: "......x.......x.",
      minIntensity: 0.6
    },
    bassPattern: "R...R...F...R...",
    reverb: { seconds: 2.2, decay: 2, mix: 0.26 },
    delay: { time: 0.3, feedback: 0.2, mix: 0.12 },
    levels: { pad: 0.55, bass: 0.55, arp: 0.24, melody: 0.42, drums: 0.5 }
  },
  uplifting: {
    id: "uplifting",
    name: "Uplifting",
    tagline: "Bright, forward motion",
    blurb: "A major-key lift with a busy arp and a steady four-on-the-floor.",
    tempo: 120,
    scale: "major",
    chordSize: 3,
    swing: 0,
    progression: [0, 4, 5, 3],
    accent: "#9a6a12",
    pad: { wave: "sawtooth", cutoff: 2000, attack: 0.2, decay: 0.4, sustain: 0.6, release: 0.6, level: 0.42, detune: 10, octave: 4 },
    bass: { wave: "sawtooth", cutoff: 600, attack: 0.01, decay: 0.12, sustain: 0.5, release: 0.15, level: 0.58, octave: 1, gate: 0.5 },
    lead: { wave: "square", cutoff: 3400, attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.2, level: 0.4, octave: 5 },
    arp: { steps: 16, order: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 2, 1], wave: "square", cutoff: 3600, level: 0.2, gate: 0.5, minIntensity: 0.55, octave: 5 },
    melody: { density: 0.5, rest: 0.25, octave: 5, minIntensity: 0.5, gate: 0.8 },
    drums: {
      kick: "x...x...x...x...",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.x.",
      clap: "....x.......x...",
      minIntensity: 0.6
    },
    bassPattern: "R.R.R.R.R.R.R.R.",
    reverb: { seconds: 1.8, decay: 1.8, mix: 0.2 },
    delay: { time: 0.25, feedback: 0.25, mix: 0.14 },
    levels: { pad: 0.5, bass: 0.58, arp: 0.22, melody: 0.4, drums: 0.55 }
  }
};

export const PRESET_IDS = Object.keys(PRESETS);
export const PRESET_ORDER = ["lofi", "chill", "ambient", "cinematic", "synthwave", "uplifting"];

export function getPreset(id) {
  return PRESETS[id] || PRESETS.lofi;
}

const KEYWORDS = {
  lofi: ["lofi", "lo-fi", "study", "rain", "rainy", "sleep", "dusty", "vinyl", "chillhop", "jazzhop", "coffee", "homework"],
  ambient: ["ambient", "drone", "space", "float", "atmosphere", "ethereal", "meditation", "slow", "clouds"],
  cinematic: ["cinematic", "epic", "film", "movie", "trailer", "orchestral", "dramatic", "emotional", "sad", "score"],
  synthwave: ["synthwave", "80s", "retro", "neon", "drive", "outrun", "cyber", "arcade", "night"],
  chill: ["chill", "relax", "summer", "beach", "sunny", "groove", "funk", "easy", "lounge"],
  uplifting: ["uplifting", "energetic", "party", "dance", "bright", "hopeful", "morning", "celebration", "happy"]
};

export function parsePrompt(prompt) {
  const text = String(prompt || "").toLowerCase();
  const scores = {};
  for (const [id, words] of Object.entries(KEYWORDS)) {
    scores[id] = words.reduce((sum, word) => {
      if (!text.includes(word)) return sum;
      return sum + (word.includes(" ") || word.includes("-") ? 2 : 1);
    }, 0);
  }

  let presetId = "lofi";
  let bestScore = 0;
  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      presetId = id;
    }
  }

  let tempoDelta = 0;
  if (/\b(fast|upbeat|energetic|driving|party|dance)\b/.test(text)) tempoDelta += 14;
  if (/\b(slow|sleep|calm|gentle|soft|dreamy|quiet)\b/.test(text)) tempoDelta -= 12;

  let scale = null;
  if (/\b(sad|dark|minor|melancholy|moody)\b/.test(text)) scale = "minor";
  if (/\b(happy|bright|major|sunny|hopeful)\b/.test(text)) scale = "major";

  return { presetId, tempoDelta, scale, matched: bestScore > 0 };
}

const STOP_WORDS = new Set([
  "a", "an", "the", "to", "for", "of", "and", "with", "some", "make", "me", "my",
  "please", "music", "song", "track", "beats", "beat", "loop", "instrumental"
]);

const TITLE_ADJECTIVES = [
  "Velvet", "Paper", "Quiet", "Neon", "Amber", "Distant", "Soft", "Golden",
  "Slow", "Blue", "Midnight", "Sunday", "Silver", "Warm", "Pale", "Glass"
];

const TITLE_NOUNS = [
  "Drift", "Bloom", "Static", "Harbor", "Loop", "Haze", "Signal", "Tide",
  "Glow", "Room", "Orbit", "Rain", "Coast", "Ember", "Cloud", "Motion"
];

function capitalize(word) {
  return word ? word[0].toUpperCase() + word.slice(1) : word;
}

export function makeTitle(prompt, rng) {
  const words = String(prompt || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word));

  if (words.length >= 2) {
    return words.slice(0, 3).map(capitalize).join(" ");
  }

  return `${rng.pick(TITLE_ADJECTIVES)} ${rng.pick(TITLE_NOUNS)}`;
}

export { DRUM_STEPS };
