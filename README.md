# Softwave

A local, private instrumental sketch studio. Type a mood, press **Generate**, and Softwave composes a short track with chords, bass, arpeggio, melody and drums — then plays it in the browser and exports WAV or MIDI. Switch to **Lyrics melody** to write your own lyrics in a structured songwriter, then turn them into a syllable-aligned, original guide melody.

**Live site:** https://nanapaknanapak-huemirit.github.io/softwave/

Softwave is **not** a neural clone of a hosted music service. It is a seeded algorithmic composer plus a small Web Audio synth kit. That keeps it instant, free, reproducible and completely on-device.

## Status

`beta` — scaffold, composition engine, Web Audio playback, arrangement timeline, mixer, persistence, sharing, the lyric songwriter, the lyrics melody guide and WAV/MIDI export are implemented. Unit tests, the static check and the production build pass. Browser audio and visual rendering still need a human pass; see `05-review/review.md`.

## Preset palette

Eighteen presets are grouped into three categories:

- **Subgenres / Micro-genres** — Lo-fi, Chill, Synthwave, City Pop, Downtempo, Trip-hop, Vaporwave.
- **Atmospheres / Mood aesthetics** — Ambient, Cinematic, Uplifting, Dreamy, Melancholic, Suspense.
- **Functional music** — Focus, Sleep, Meditation, Workout, Gaming.

## Lyrics melody guide

Lyrics mode does not synthesize a singer. It composes an original guide melody in the existing melody lane:

- One note per syllable, with word-initial syllables and strong beats favouring chord tones.
- Two bars per line, falling back to one bar per line when the arrangement is crowded.
- A separate RNG fork derived from the lyrics, so different words produce different melodies and the same inputs stay reproducible.
- An eight-character melody fingerprint for provenance.

Originality is structural: no melody corpus, no lookup, no sampling and no network call. This guarantees algorithmic generation, not legal clearance against coincidental similarity; the user remains responsible for final clearance.

## Songwriter

Lyrics mode includes a small songwriter for composing your own original words on-device:

- Sections (Intro, Verse, Chorus, Bridge, Outro) that you can add, reorder, retype and remove.
- One input per line with a live syllable count and a rhyme key.
- Rhyme hints from a small, hand-written English word bank; click a chip to swap the last word.
- Named drafts saved in `localStorage` under `softwave:lyrics-drafts:v1`, plus a **Raw text** toggle for pasting plain lyrics.
- The songwriter serialises to the same plain-text format the melody guide already reads, so share links and exports keep working.

No text is generated for you, no corpus is sampled and nothing leaves the page. Rhyme hints are suggestions, not a pronunciation dictionary.

## Quick start

Requires Node.js 22 (no npm packages are installed).

```bash
node scripts/serve.mjs
# open http://127.0.0.1:8080/
```

Or with npm scripts:

```bash
npm test        # node --test tests/*.test.mjs
npm run check   # static integrity checks
npm run build   # copy deployable files to _site/
npm run icons   # regenerate PNG icons and the OG image
```

The app is plain ES modules and static files. Opening `index.html` directly also works in most browsers, but serving it is recommended so the service worker can register.

## How it works

1. **Prompt + preset + controls** become a seed and a set of arrangement options.
2. **`composer.js`** plans sections (intro / A / B / A′ / outro), chooses chord progressions, writes a motif-based melody, bass pattern, arpeggio and 16-step drums.
3. **`lyrics.js`** parses lyric lines and syllables and builds a quantized rhythm for the guide melody.
4. **`theory.js`** supplies scales, chord spelling, voice leading and pitch helpers.
5. **`instruments.js` + `effects.js`** render the parts with subtractive synths, noise drums, reverb, delay and a compressor.
6. **`engine.js`** schedules events with a 25 ms lookahead transport; **`render.js`** replays the same graph in an `OfflineAudioContext` for export.
7. **`export.js`** writes a 16-bit stereo WAV or a Type-1 MIDI file.

The same seed, prompt, preset, lyrics and variation always produce the same notes. The share link stores those values in the URL fragment; nothing is sent to a server.

## Controls

| Action | Control |
| --- | --- |
| Generate | button, `G` |
| Reroll variation | button, `R` |
| Play / pause | play button, `Space` |
| Stop | stop button |
| Loop | loop button, `L` |
| Seek | timeline slider, `←` / `→` (hold `Shift` for 4 beats) |
| Export | WAV / MIDI buttons, `W` / `M` |
| Composition mode | Instrumental / Lyrics melody toggle |
| Shortcuts | header button or footer link |

Keyboard shortcuts pause while you are typing in the prompt, lyrics, seed or a slider.

## Project layout

```
softwave/
├── index.html                 app shell
├── manifest.webmanifest       installable PWA metadata
├── sw.js                      offline shell cache
├── assets/
│   ├── css/theme.css          tokens, base controls, modal, toasts
│   ├── css/studio.css         layout and studio components
│   ├── favicon.svg
│   ├── icons/                 generated PNG icons + OG image
│   └── js/                    app, state, ui, composer, lyrics, songwriter, rhymes, synth, engine, export
├── scripts/                   serve, check, build, icon generation
├── tests/                     Node test runner suites
├── 01-concept/                brief and scope
├── 02-music-design/           harmony, rhythm and instrument decisions
├── 03-arrangement/            section and lane plan
├── 04-documentation/          production report
├── 05-review/                 review notes and open items
└── versions/                  version notes
```

## Privacy

- No accounts, uploads, analytics, API keys or third-party scripts.
- Tracks and lyric melodies are generated deterministically in the page.
- Settings, mix, the last prompt and lyrics live in `localStorage` under `softwave:v1`.
- Named lyric drafts live in `localStorage` under `softwave:lyrics-drafts:v1`.
- The service worker caches the app shell locally.
- The static check rejects runtime network APIs in `assets/js`.

## Verification

```bash
npm test
npm run check
npm run build
```

`npm run check` validates local references, duplicate ids, module imports, manifest icons, the service-worker shell, required docs and package scripts, and rejects runtime network APIs. The WAV/MIDI encoders, composer, lyrics parser, songwriter model, rhyme bank and preset palette are covered by unit tests.

## License

MIT — see `LICENSE`.
