# Softwave

A local, private instrumental sketch studio. Type a mood, press **Generate**, and Softwave composes a short track with chords, bass, arpeggio, melody and drums — then plays it in the browser and exports WAV or MIDI.

**Live site:** https://nanapaknanapak-huemirit.github.io/softwave/

Softwave is **not** a neural clone of a hosted music service. It is a seeded algorithmic composer plus a small Web Audio synth kit. That keeps it instant, free, reproducible and completely on-device.

## Status

`beta` — scaffold, composition engine, Web Audio playback, arrangement timeline, mixer, persistence, sharing and WAV/MIDI export are implemented. Unit tests, the static check and the production build pass. Browser audio and visual rendering still need a human pass; see `05-review/review.md`.

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
3. **`theory.js`** supplies scales, chord spelling, voice leading and pitch helpers.
4. **`instruments.js` + `effects.js`** render the parts with subtractive synths, noise drums, reverb, delay and a compressor.
5. **`engine.js`** schedules events with a 25 ms lookahead transport; **`render.js`** replays the same graph in an `OfflineAudioContext` for export.
6. **`export.js`** writes a 16-bit stereo WAV or a Type-1 MIDI file.

The same seed, prompt, preset and variation always produce the same notes. The share link stores those values in the URL fragment; nothing is sent to a server.

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
| Shortcuts | header button or footer link |

Keyboard shortcuts pause while you are typing in the prompt, seed or a slider.

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
│   └── js/                    app, state, ui, composer, synth, engine, export
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
- Tracks are generated deterministically in the page.
- Settings, mix and the last prompt live in `localStorage` under `softwave:v1`.
- The service worker caches the app shell locally.

## Verification

```bash
npm test
npm run check
npm run build
```

`npm run check` validates local references, duplicate ids, module imports, manifest icons, the service-worker shell, required docs and package scripts. The WAV/MIDI encoders and the composer are covered by unit tests.

## License

MIT — see `LICENSE`.
