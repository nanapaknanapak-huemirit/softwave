const DRUM_STEPS = 16;

export const PRESETS = {
  lofi: {
    id: "lofi",
    name: "Lo-fi",
    category: "subgenre",
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
    category: "atmosphere",
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
    category: "atmosphere",
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
    category: "subgenre",
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
    category: "subgenre",
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
    category: "atmosphere",
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
  },
  citypop: {
    id: "citypop",
    name: "City Pop",
    category: "subgenre",
    tagline: "Glossy sunset funk",
    blurb: "Bright major chords, a moving bass line and a nostalgic cruise groove.",
    tempo: 104,
    scale: "major",
    chordSize: 4,
    swing: 0.04,
    progression: [0, 5, 3, 4],
    accent: "#c2567a",
    pad: { wave: "sawtooth", cutoff: 2200, attack: 0.18, decay: 0.5, sustain: 0.6, release: 0.7, level: 0.44, detune: 9, octave: 4 },
    bass: { wave: "sawtooth", cutoff: 800, attack: 0.01, decay: 0.16, sustain: 0.55, release: 0.2, level: 0.62, octave: 2, gate: 0.55 },
    lead: { wave: "triangle", cutoff: 3000, attack: 0.02, decay: 0.18, sustain: 0.5, release: 0.3, level: 0.38, octave: 5 },
    arp: { steps: 16, order: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 2, 1], wave: "square", cutoff: 3400, level: 0.16, gate: 0.5, minIntensity: 0.6, octave: 5 },
    melody: { density: 0.48, rest: 0.28, octave: 5, minIntensity: 0.52, gate: 0.85 },
    drums: {
      kick: "x...x...x...x...",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.x.",
      clap: "....x.......x...",
      perc: "..x...x...x...x.",
      minIntensity: 0.6
    },
    bassPattern: "R.R.R...F.R.R...",
    reverb: { seconds: 1.8, decay: 1.8, mix: 0.22 },
    delay: { time: 0.24, feedback: 0.22, mix: 0.14 },
    levels: { pad: 0.46, bass: 0.62, arp: 0.18, melody: 0.4, drums: 0.55 }
  },
  downtempo: {
    id: "downtempo",
    name: "Downtempo",
    category: "subgenre",
    tagline: "Mellow after-hours groove",
    blurb: "Lazy beats, soft keys and a patient low-end sway.",
    tempo: 82,
    scale: "dorian",
    chordSize: 4,
    swing: 0.08,
    progression: [0, 5, 3, 4],
    accent: "#5b7c8f",
    pad: { wave: "triangle", cutoff: 1200, attack: 0.8, decay: 1.2, sustain: 0.65, release: 1.8, level: 0.5, detune: 8, octave: 4 },
    bass: { wave: "sine", cutoff: 380, attack: 0.04, decay: 0.4, sustain: 0.55, release: 0.5, level: 0.55, octave: 2, gate: 0.8 },
    lead: { wave: "sine", cutoff: 2200, attack: 0.08, decay: 0.4, sustain: 0.55, release: 0.8, level: 0.34, octave: 5 },
    arp: { steps: 8, order: [0, 2, 1, 3, 2, 1], wave: "sine", cutoff: 2600, level: 0.14, gate: 0.8, minIntensity: 0.65, octave: 5 },
    melody: { density: 0.34, rest: 0.42, octave: 5, minIntensity: 0.55, gate: 1 },
    drums: {
      kick: "x.......x.......",
      snare: "....x.......x...",
      hat: "..x...x...x...x.",
      perc: "......x.......x.",
      minIntensity: 0.6
    },
    bassPattern: "R.......F...R...",
    reverb: { seconds: 2.8, decay: 2.6, mix: 0.32 },
    delay: { time: 0.34, feedback: 0.22, mix: 0.14 },
    levels: { pad: 0.58, bass: 0.55, arp: 0.16, melody: 0.38, drums: 0.48 }
  },
  triphop: {
    id: "triphop",
    name: "Trip-hop",
    category: "subgenre",
    tagline: "Smoky, heavy backbeat",
    blurb: "Dusty minor chords, a slow swagger and a weighty drum pocket.",
    tempo: 88,
    scale: "minor",
    chordSize: 3,
    swing: 0.12,
    progression: [0, 5, 2, 6],
    accent: "#6b5a4a",
    pad: { wave: "sawtooth", cutoff: 900, attack: 0.6, decay: 1.2, sustain: 0.65, release: 1.6, level: 0.48, detune: 12, octave: 4 },
    bass: { wave: "sine", cutoff: 320, attack: 0.03, decay: 0.5, sustain: 0.6, release: 0.6, level: 0.62, octave: 1, gate: 0.9 },
    lead: { wave: "triangle", cutoff: 2000, attack: 0.05, decay: 0.35, sustain: 0.55, release: 0.7, level: 0.32, octave: 5 },
    arp: { steps: 8, order: [0, 2, 3, 1], wave: "sine", cutoff: 2200, level: 0.1, gate: 0.85, minIntensity: 0.72, octave: 5 },
    melody: { density: 0.3, rest: 0.45, octave: 5, minIntensity: 0.6, gate: 1 },
    drums: {
      kick: "x.....x...x.....",
      snare: "....x.......x...",
      hat: "..x...x...x...x.",
      perc: "x.....x.....x...",
      clap: "....x.......x...",
      minIntensity: 0.55
    },
    bassPattern: "R...R.......F...",
    reverb: { seconds: 3, decay: 2.6, mix: 0.38 },
    delay: { time: 0.4, feedback: 0.3, mix: 0.18 },
    levels: { pad: 0.56, bass: 0.62, arp: 0.14, melody: 0.34, drums: 0.52 }
  },
  vaporwave: {
    id: "vaporwave",
    name: "Vaporwave",
    category: "subgenre",
    tagline: "Hazy mall nostalgia",
    blurb: "Slow detuned chords, cassette air and a dreamy half-time pulse.",
    tempo: 68,
    scale: "lydian",
    chordSize: 4,
    swing: 0,
    progression: [0, 3, 4, 0],
    accent: "#b06a9c",
    pad: { wave: "sawtooth", cutoff: 1000, attack: 1.6, decay: 1.8, sustain: 0.8, release: 2.6, level: 0.5, detune: 16, octave: 4 },
    bass: { wave: "sine", cutoff: 300, attack: 0.3, decay: 1.2, sustain: 0.7, release: 1.6, level: 0.42, octave: 1, gate: 1.3 },
    lead: { wave: "sine", cutoff: 1800, attack: 0.3, decay: 0.8, sustain: 0.6, release: 1.2, level: 0.28, octave: 5 },
    arp: { steps: 8, order: [0, 2, 3, 1, 2, 3], wave: "sine", cutoff: 2400, level: 0.12, gate: 0.9, minIntensity: 0.75, octave: 5 },
    melody: { density: 0.25, rest: 0.5, octave: 5, minIntensity: 0.7, gate: 1.1 },
    drums: {
      kick: "x...............",
      snare: "........x.......",
      hat: "",
      clap: "",
      perc: "....x.......x...",
      minIntensity: 0.75
    },
    bassPattern: "R.......F.......",
    reverb: { seconds: 4.2, decay: 3.2, mix: 0.48 },
    delay: { time: 0.5, feedback: 0.35, mix: 0.2 },
    levels: { pad: 0.68, bass: 0.38, arp: 0.12, melody: 0.3, drums: 0.22 }
  },
  dreamy: {
    id: "dreamy",
    name: "Dreamy",
    category: "atmosphere",
    tagline: "Floating, weightless air",
    blurb: "Wide soft chords, slow motion and a melody that drifts like mist.",
    tempo: 70,
    scale: "lydian",
    chordSize: 4,
    swing: 0,
    progression: [0, 4, 3, 5],
    accent: "#8a7ac4",
    pad: { wave: "sawtooth", cutoff: 1100, attack: 1.8, decay: 1.6, sustain: 0.75, release: 2.4, level: 0.52, detune: 13, octave: 4 },
    bass: { wave: "sine", cutoff: 320, attack: 0.4, decay: 1.2, sustain: 0.7, release: 1.8, level: 0.4, octave: 1, gate: 1.4 },
    lead: { wave: "sine", cutoff: 1900, attack: 0.25, decay: 0.9, sustain: 0.6, release: 1.4, level: 0.3, octave: 5 },
    arp: { steps: 8, order: [0, 2, 3, 1, 2, 3], wave: "sine", cutoff: 2600, level: 0.13, gate: 0.9, minIntensity: 0.72, octave: 5 },
    melody: { density: 0.28, rest: 0.48, octave: 5, minIntensity: 0.62, gate: 1.2 },
    drums: {
      kick: "x...............",
      snare: "",
      hat: "",
      perc: "........x.......",
      minIntensity: 0.78
    },
    bassPattern: "R.......F.......",
    reverb: { seconds: 4, decay: 3.2, mix: 0.46 },
    delay: { time: 0.55, feedback: 0.34, mix: 0.2 },
    levels: { pad: 0.66, bass: 0.36, arp: 0.13, melody: 0.32, drums: 0.2 }
  },
  melancholic: {
    id: "melancholic",
    name: "Melancholic",
    category: "atmosphere",
    tagline: "Bittersweet and bare",
    blurb: "Minor chords, a lonely lead and a soft, unhurried pulse.",
    tempo: 72,
    scale: "minor",
    chordSize: 4,
    swing: 0.04,
    progression: [0, 3, 5, 2],
    accent: "#5f6a8a",
    pad: { wave: "triangle", cutoff: 1000, attack: 1.2, decay: 1.4, sustain: 0.68, release: 2.2, level: 0.5, detune: 9, octave: 4 },
    bass: { wave: "sine", cutoff: 300, attack: 0.2, decay: 0.9, sustain: 0.65, release: 1.4, level: 0.45, octave: 1, gate: 1.2 },
    lead: { wave: "triangle", cutoff: 2000, attack: 0.12, decay: 0.5, sustain: 0.58, release: 1.2, level: 0.32, octave: 5 },
    arp: { steps: 8, order: [0, 2, 1, 3], wave: "sine", cutoff: 2400, level: 0.12, gate: 0.9, minIntensity: 0.72, octave: 5 },
    melody: { density: 0.3, rest: 0.46, octave: 5, minIntensity: 0.6, gate: 1.1 },
    drums: {
      kick: "x.......x.......",
      snare: "....x.......x...",
      hat: "..x...x...x...x.",
      perc: "",
      minIntensity: 0.7
    },
    bassPattern: "R.......F...R...",
    reverb: { seconds: 3.4, decay: 2.9, mix: 0.4 },
    delay: { time: 0.46, feedback: 0.3, mix: 0.18 },
    levels: { pad: 0.6, bass: 0.45, arp: 0.13, melody: 0.36, drums: 0.34 }
  },
  suspense: {
    id: "suspense",
    name: "Suspense",
    category: "atmosphere",
    tagline: "Tense, cinematic shadow",
    blurb: "A low harmonic-minor drone, sparse hits and a creeping sense of dread.",
    tempo: 60,
    scale: "harmonicMinor",
    chordSize: 3,
    swing: 0,
    progression: [0, 1, 5, 0],
    accent: "#42505f",
    pad: { wave: "sawtooth", cutoff: 700, attack: 1.4, decay: 1.6, sustain: 0.8, release: 2.8, level: 0.48, detune: 14, octave: 4 },
    bass: { wave: "sine", cutoff: 260, attack: 0.3, decay: 1, sustain: 0.7, release: 1.8, level: 0.5, octave: 1, gate: 1.5 },
    lead: { wave: "sine", cutoff: 1700, attack: 0.2, decay: 0.7, sustain: 0.55, release: 1.4, level: 0.26, octave: 5 },
    arp: { steps: 8, order: [0, 2, 1, 3], wave: "triangle", cutoff: 2000, level: 0.1, gate: 0.9, minIntensity: 0.8, octave: 5 },
    melody: { density: 0.2, rest: 0.58, octave: 5, minIntensity: 0.72, gate: 1.3 },
    drums: {
      kick: "x.......x.......",
      snare: "",
      hat: "",
      perc: "....x.......x...",
      tom: "..............x.",
      minIntensity: 0.72
    },
    bassPattern: "R.......F.......",
    reverb: { seconds: 4.6, decay: 3.4, mix: 0.52 },
    delay: { time: 0.6, feedback: 0.38, mix: 0.22 },
    levels: { pad: 0.62, bass: 0.4, arp: 0.1, melody: 0.28, drums: 0.26 }
  },
  focus: {
    id: "focus",
    name: "Focus",
    category: "functional",
    tagline: "Steady, non-distracting",
    blurb: "A neutral groove with soft motion that stays out of the way.",
    tempo: 90,
    scale: "dorian",
    chordSize: 3,
    swing: 0.04,
    progression: [0, 3, 4, 5],
    accent: "#3f7f74",
    pad: { wave: "triangle", cutoff: 1400, attack: 0.5, decay: 0.8, sustain: 0.65, release: 1.2, level: 0.46, detune: 7, octave: 4 },
    bass: { wave: "sine", cutoff: 420, attack: 0.02, decay: 0.25, sustain: 0.55, release: 0.3, level: 0.5, octave: 2, gate: 0.7 },
    lead: { wave: "triangle", cutoff: 2400, attack: 0.03, decay: 0.2, sustain: 0.5, release: 0.35, level: 0.3, octave: 5 },
    arp: { steps: 8, order: [0, 2, 1, 3, 2, 1], wave: "sine", cutoff: 3000, level: 0.2, gate: 0.7, minIntensity: 0.55, octave: 5 },
    melody: { density: 0.32, rest: 0.5, octave: 5, minIntensity: 0.7, gate: 0.9 },
    drums: {
      kick: "x.......x.......",
      snare: "....x.......x...",
      hat: "..x...x...x...x.",
      perc: "......x.......x.",
      minIntensity: 0.62
    },
    bassPattern: "R...R...F...R...",
    reverb: { seconds: 2.2, decay: 2, mix: 0.28 },
    delay: { time: 0.3, feedback: 0.2, mix: 0.1 },
    levels: { pad: 0.52, bass: 0.5, arp: 0.2, melody: 0.26, drums: 0.38 }
  },
  sleep: {
    id: "sleep",
    name: "Sleep",
    category: "functional",
    tagline: "Drowsy and weightless",
    blurb: "Very slow chords, almost no percussion and a long, soft tail.",
    tempo: 50,
    scale: "lydian",
    chordSize: 4,
    swing: 0,
    progression: [0, 3, 0, 4],
    accent: "#6f7fa8",
    pad: { wave: "sine", cutoff: 800, attack: 2.8, decay: 2.4, sustain: 0.8, release: 3.6, level: 0.5, detune: 8, octave: 4 },
    bass: { wave: "sine", cutoff: 260, attack: 1, decay: 1.8, sustain: 0.75, release: 2.4, level: 0.36, octave: 1, gate: 1.8 },
    lead: { wave: "sine", cutoff: 1500, attack: 0.6, decay: 1.2, sustain: 0.6, release: 2, level: 0.24, octave: 5 },
    arp: { steps: 8, order: [0, 2, 1, 3], wave: "sine", cutoff: 2200, level: 0.08, gate: 0.95, minIntensity: 0.88, octave: 5 },
    melody: { density: 0.16, rest: 0.62, octave: 5, minIntensity: 0.8, gate: 1.4 },
    drums: {
      kick: "x...............",
      snare: "",
      hat: "",
      perc: "",
      minIntensity: 0.9
    },
    bassPattern: "R...............",
    reverb: { seconds: 5, decay: 3.8, mix: 0.55 },
    delay: { time: 0.7, feedback: 0.4, mix: 0.24 },
    levels: { pad: 0.7, bass: 0.28, arp: 0.08, melody: 0.26, drums: 0.12 }
  },
  meditation: {
    id: "meditation",
    name: "Meditation",
    category: "functional",
    tagline: "Still and spacious",
    blurb: "A near-beatless drone with soft bells and room to breathe.",
    tempo: 48,
    scale: "major",
    chordSize: 3,
    swing: 0,
    progression: [0, 4, 0, 3],
    accent: "#4f8a7a",
    pad: { wave: "sine", cutoff: 700, attack: 3.2, decay: 2.8, sustain: 0.82, release: 4, level: 0.52, detune: 6, octave: 4 },
    bass: { wave: "sine", cutoff: 240, attack: 1.2, decay: 2, sustain: 0.78, release: 2.8, level: 0.32, octave: 1, gate: 2 },
    lead: { wave: "sine", cutoff: 1400, attack: 0.8, decay: 1.4, sustain: 0.62, release: 2.2, level: 0.22, octave: 5 },
    arp: { steps: 8, order: [0, 2, 1, 3], wave: "sine", cutoff: 2000, level: 0.07, gate: 0.95, minIntensity: 0.9, octave: 5 },
    melody: { density: 0.12, rest: 0.7, octave: 5, minIntensity: 0.85, gate: 1.5 },
    drums: {
      kick: "",
      snare: "",
      hat: "",
      perc: "........x.......",
      minIntensity: 0.9
    },
    bassPattern: "R.......F.......",
    reverb: { seconds: 5.5, decay: 4, mix: 0.6 },
    delay: { time: 0.8, feedback: 0.45, mix: 0.26 },
    levels: { pad: 0.72, bass: 0.26, arp: 0.07, melody: 0.24, drums: 0.08 }
  },
  workout: {
    id: "workout",
    name: "Workout",
    category: "functional",
    tagline: "Driving and physical",
    blurb: "A four-on-the-floor pulse, pushing bass and a short, punchy mix.",
    tempo: 128,
    scale: "minor",
    chordSize: 3,
    swing: 0,
    progression: [0, 5, 2, 6],
    accent: "#c05a2e",
    pad: { wave: "sawtooth", cutoff: 1800, attack: 0.15, decay: 0.4, sustain: 0.6, release: 0.5, level: 0.4, detune: 10, octave: 4 },
    bass: { wave: "sawtooth", cutoff: 650, attack: 0.01, decay: 0.12, sustain: 0.5, release: 0.15, level: 0.62, octave: 1, gate: 0.45 },
    lead: { wave: "square", cutoff: 3200, attack: 0.01, decay: 0.15, sustain: 0.5, release: 0.2, level: 0.38, octave: 5 },
    arp: { steps: 16, order: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 2, 1], wave: "sawtooth", cutoff: 3000, level: 0.2, gate: 0.5, minIntensity: 0.5, octave: 5 },
    melody: { density: 0.46, rest: 0.3, octave: 5, minIntensity: 0.55, gate: 0.8 },
    drums: {
      kick: "x...x...x...x...",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.x.",
      clap: "....x.......x...",
      perc: "..x...x...x...x.",
      minIntensity: 0.55
    },
    bassPattern: "R.R.R.R.R.R.R.R.",
    reverb: { seconds: 1.6, decay: 1.6, mix: 0.18 },
    delay: { time: 0.22, feedback: 0.24, mix: 0.12 },
    levels: { pad: 0.44, bass: 0.64, arp: 0.2, melody: 0.36, drums: 0.6 }
  },
  gaming: {
    id: "gaming",
    name: "Gaming",
    category: "functional",
    tagline: "Kinetic and playful",
    blurb: "Chiptune-flavoured arps, a driving pulse and bright digital edges.",
    tempo: 140,
    scale: "mixolydian",
    chordSize: 3,
    swing: 0,
    progression: [0, 3, 4, 5],
    accent: "#3f9a6a",
    pad: { wave: "square", cutoff: 2000, attack: 0.1, decay: 0.3, sustain: 0.55, release: 0.35, level: 0.34, detune: 8, octave: 4 },
    bass: { wave: "square", cutoff: 700, attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.12, level: 0.55, octave: 1, gate: 0.4 },
    lead: { wave: "square", cutoff: 3600, attack: 0.01, decay: 0.12, sustain: 0.5, release: 0.18, level: 0.4, octave: 5 },
    arp: { steps: 16, order: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 1], wave: "square", cutoff: 3800, level: 0.22, gate: 0.45, minIntensity: 0.5, octave: 5 },
    melody: { density: 0.5, rest: 0.26, octave: 5, minIntensity: 0.5, gate: 0.75 },
    drums: {
      kick: "x...x...x...x...",
      snare: "....x.......x...",
      hat: "x.x.x.x.x.x.x.x.",
      perc: "......x.......x.",
      minIntensity: 0.55
    },
    bassPattern: "R.R.R.R.R.R.R.R.",
    reverb: { seconds: 1.4, decay: 1.4, mix: 0.16 },
    delay: { time: 0.18, feedback: 0.28, mix: 0.16 },
    levels: { pad: 0.38, bass: 0.56, arp: 0.24, melody: 0.4, drums: 0.58 }
  }
};

export const PRESET_CATEGORIES = [
  { id: "subgenre", name: "Subgenres / Micro-genres" },
  { id: "atmosphere", name: "Atmospheres / Mood aesthetics" },
  { id: "functional", name: "Functional music" }
];

export const PRESET_IDS = Object.keys(PRESETS);
export const PRESET_ORDER = PRESET_CATEGORIES.flatMap((category) =>
  PRESET_IDS.filter((id) => PRESETS[id].category === category.id)
);

export function getPreset(id) {
  return PRESETS[id] || PRESETS.lofi;
}

const KEYWORDS = {
  lofi: ["lofi", "lo-fi", "study", "rain", "rainy", "dusty", "vinyl", "chillhop", "jazzhop", "coffee", "homework"],
  ambient: ["ambient", "drone", "space", "cosmic", "atmosphere", "weightless", "slow", "calm"],
  cinematic: ["cinematic", "epic", "film", "movie", "trailer", "orchestral", "dramatic", "emotional", "sad", "score"],
  synthwave: ["synthwave", "80s", "retro", "neon", "drive", "outrun", "cyber", "arcade", "night"],
  chill: ["chill", "relax", "summer", "beach", "sunny", "groove", "funk", "easy", "lounge"],
  uplifting: ["uplifting", "party", "dance", "bright", "hopeful", "morning", "celebration", "happy"],
  citypop: ["city pop", "citypop", "tokyo", "j-pop", "city lights", "sunset drive", "cruise"],
  downtempo: ["downtempo", "mellow", "slow groove", "late night", "after hours", "lazy"],
  triphop: ["trip hop", "triphop", "bristol", "smoky", "dark hip hop", "swagger"],
  vaporwave: ["vaporwave", "mall", "cassette", "90s", "aesthetic", "nostalgia"],
  dreamy: ["dreamy", "dream", "float", "floating", "ethereal", "clouds", "airy"],
  melancholic: ["melancholic", "melancholy", "lonely", "bittersweet", "somber", "blue"],
  suspense: ["suspense", "tension", "tense", "thriller", "ominous", "horror", "dark"],
  focus: ["focus", "concentration", "concentrate", "deep work", "coding", "programming", "flow", "productive"],
  sleep: ["sleep", "sleepy", "bedtime", "insomnia"],
  meditation: ["meditation", "meditate", "mindfulness", "zen", "breathe", "breathing"],
  workout: ["workout", "gym", "cardio", "exercise", "training", "running", "jogging", "pump"],
  gaming: ["gaming", "game", "video game", "chiptune", "speedrun", "boss fight"]
};

function matchesKeyword(text, word) {
  if (word.includes(" ") || word.includes("-")) return text.includes(word);
  return new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`, "i").test(text);
}

export function parsePrompt(prompt) {
  const text = String(prompt || "").toLowerCase();
  const scores = {};
  for (const [id, words] of Object.entries(KEYWORDS)) {
    scores[id] = words.reduce((sum, word) => {
      if (!matchesKeyword(text, word)) return sum;
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
