# 02 — Music design

## Palette

Six presets each define a tempo, scale, chord progression, instrument envelope, drum grid, bass pattern and mix levels. They are deliberately distinct at first listen.

| Preset | Tempo | Scale | Progression | Character |
| --- | --- | --- | --- | --- |
| Lo-fi | 76 | Dorian | i–IV–vii–IV | Dusty seventh chords, swing, soft drums |
| Chill | 96 | Major | I–V–vi–IV | Warm groove, light percussion |
| Ambient | 56 | Lydian | I–IV–V–I | Long pads, huge reverb, sparse events |
| Cinematic | 84 | Minor | i–VI–III–VII | Patient build, tom fills, wide screen |
| Synthwave | 108 | Minor | i–VI–III–VII | Saw bass, sixteenth arpeggio, gated claps |
| Uplifting | 120 | Major | I–V–vi–IV | Bright arps, four-on-the-floor |

Scale, key, tempo and length can override the preset. `auto` keeps the preset's scale.

## Harmony

- `theory.js` holds seven-note scales: major, natural minor, Dorian, Mixolydian, Lydian and harmonic minor.
- Chords are stacked scale thirds; voicings are shifted by octaves until they sit inside a target register.
- The pad plays one chord per bar, with an upper duplicate pair in high-intensity sections.
- Bass follows a 16-step root/fifth/octave pattern and is constrained to a low register.
- The melody prefers chord tones on strong beats and steps diatonically elsewhere.

## Melody and motif

- Each phrase is two bars long.
- A phrase is stored as a motif; odd phrases repeat it with small mutations.
- Chord tones anchor strong beats; weak beats are freer.
- Rests and note density are controlled by the preset's `melody` settings.

## Rhythm

- Drums use 16-step patterns with `x` (normal) and `X` (accent) hits.
- Swing offsets eighth-note offbeats for lo-fi and chill.
- Humanisation adds a few milliseconds of timing jitter and ±6% velocity variation.
- Fills appear at bar 4 boundaries and at section ends when intensity is high enough.
- Sections fade instruments in by intensity: bass enters before arps, drums before melody in sparse presets, and so on.

## Timbre

- Pads: three detuned oscillators through a low-pass filter.
- Bass: body oscillator plus a sine sub, filtered.
- Arp: short plucked envelope with a filter sweep.
- Lead: filtered oscillator with a slow vibrato LFO on longer notes.
- Drums: sine kick, noise snare/clap/hat/perc/crash and a pitched tom.
- Effects: convolution reverb from a generated impulse, tempo-aware delay send, high-pass, compressor and master gain.

## Why algorithmic

The goal is a musical result that is transparent, free and fast. A constrained generation system with theory-aware rules produces more reliable arrangements than unconstrained randomness, and it can be rebuilt exactly from a seed.
