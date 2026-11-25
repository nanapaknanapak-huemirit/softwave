# 02 — Music design

## Palette

Eighteen presets each define a tempo, scale, chord progression, instrument envelope, drum grid, bass pattern and mix levels. They are grouped so the list stays navigable, and they are deliberately distinct at first listen.

### Subgenres / Micro-genres

| Preset | Tempo | Scale | Progression | Character |
| --- | --- | --- | --- | --- |
| Lo-fi | 76 | Dorian | i–IV–vii–IV | Dusty seventh chords, swing, soft drums |
| Chill | 96 | Major | I–V–vi–IV | Warm groove, light percussion |
| Synthwave | 108 | Minor | i–VI–III–VII | Saw bass, sixteenth arpeggio, gated claps |
| City Pop | 104 | Major | I–vi–IV–V | Glossy sunset funk, moving bass |
| Downtempo | 82 | Dorian | i–VI–iv–V | Mellow after-hours sway |
| Trip-hop | 88 | Minor | i–VI–III–VII | Smoky, heavy backbeat |
| Vaporwave | 68 | Lydian | I–IV–V–I | Hazy mall nostalgia, detuned pads |

### Atmospheres / Mood aesthetics

| Preset | Tempo | Scale | Progression | Character |
| --- | --- | --- | --- | --- |
| Ambient | 56 | Lydian | I–IV–V–I | Long pads, huge reverb, sparse events |
| Cinematic | 84 | Minor | i–VI–III–VII | Patient build, tom fills, wide screen |
| Uplifting | 120 | Major | I–V–vi–IV | Bright arps, four-on-the-floor |
| Dreamy | 70 | Lydian | I–V–IV–VI | Floating, weightless air |
| Melancholic | 72 | Minor | i–iv–VI–III | Bittersweet, bare, unhurried |
| Suspense | 60 | Harmonic minor | i–ii°–VI–i | Tense low drone, sparse hits |

### Functional music

| Preset | Tempo | Scale | Progression | Character |
| --- | --- | --- | --- | --- |
| Focus | 90 | Dorian | i–iv–V–VI | Neutral, non-distracting motion |
| Sleep | 50 | Lydian | I–IV–I–V | Drowsy, almost no percussion |
| Meditation | 48 | Major | I–V–I–IV | Still, near-beatless drone |
| Workout | 128 | Minor | i–VI–III–VII | Driving four-on-the-floor |
| Gaming | 140 | Mixolydian | I–IV–v–VI | Kinetic chiptune-flavoured arps |

Scale, key, tempo and length can override the preset. `auto` keeps the preset's scale.

## Harmony

- `theory.js` holds seven-note scales: major, natural minor, Dorian, Mixolydian, Lydian and harmonic minor.
- Chords are stacked scale thirds; voicings are shifted by octaves until they sit inside a target register.
- The pad plays one chord per bar, with an upper duplicate pair in high-intensity sections.
- Bass follows a 16-step root/fifth/octave pattern and is constrained to a low register.
- The melody prefers chord tones on strong beats and steps diatonically elsewhere.

## Melody and motif

- Each instrumental phrase is two bars long.
- A phrase is stored as a motif; odd phrases repeat it with small mutations.
- Chord tones anchor strong beats; weak beats are freer.
- Rests and note density are controlled by the preset's `melody` settings.

## Lyrics melody guide

- Lyrics mode is a melody guide, not a vocal synthesizer. The existing melody lane becomes the guide so playback, mixing, WAV and MIDI keep working.
- `lyrics.js` splits the text into non-empty lines and estimates syllables with a vowel-group heuristic. Hyphenated words are summed; the UI shows the live line and syllable count.
- Each lyric line gets a two-bar phrase. When the arrangement has too many lines for two bars each, the planner falls back to one bar per line and reports the extra lines that do not fit.
- Phrases start after the intro and finish before the outro, so the guide sits inside the arrangement.
- One note is placed per syllable on a quantized grid. Word-initial syllables and strong beats are more likely to land on chord tones; weak syllables move diatonically.
- Even lines generate a fresh contour and odd lines mutate the previous motif, which keeps the guide singable without sounding random.
- The lyric RNG is a fork seeded from the preset and a hash of the words, so different lyrics or presets produce different melodies while the same inputs and seed stay reproducible.
- Originality is structural: there is no melody corpus, no lookup, no sampling and no network call. The arrangement exposes an eight-character melody fingerprint derived from the seed, lyrics and melodic intervals. This guarantees algorithmic generation; it is not a legal guarantee against coincidental similarity, and the user remains responsible for final clearance.
- Syllable counting is approximate for irregular English words. The hint is a guide, not a pronunciation dictionary.

## Rhythm

- Drums use 16-step patterns with `x` (normal) and `X` (accent) hits.
- Swing offsets eighth-note offbeats for presets such as lo-fi, chill, trip-hop and city pop.
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
